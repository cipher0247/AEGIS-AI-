import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User, 
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp, 
  Timestamp, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

// Standardized Security Error Handling
export enum SecurityOperation {
  AUTH = 'AUTH',
  RECON = 'RECON',
  ARCHIVE = 'ARCHIVE',
  AUDIT = 'AUDIT'
}

export const handleSecurityError = (error: any, operation: SecurityOperation) => {
  console.error(`[SEC_ALARM] Operation ${operation} Failed:`, error);
  
  // Always return generic messages to UI to prevent logic leakage (Requirement 4)
  const code = error.code || '';
  
  if (code.includes('auth/invalid-credential') || code.includes('auth/user-not-found') || code.includes('auth/wrong-password')) {
    return "AUTH_FAILURE: INVALID_CREDENTIALS";
  }
  
  if (code === 'permission-denied') return "ACCESS_DENIED: MISSION_CREDENTIALS_INSUFFICIENT";
  if (error.message?.includes('verified')) return "AUTH_FAILURE: EMAIL_VERIFICATION_REQUIRED";
  if (code.includes('too-many-requests')) return "SEC_ALARM: RATE_LIMIT_EXCEEDED";
  if (error.message?.includes('LOCKED')) return "SEC_ALARM: ACCOUNT_LOCKED_PENDING_REVIEW";
  
  return "SYSTEM_ERROR: UNKNOWN_VECTOR_INTERRUPTION";
};

// Security Event Logger
export const logSecurityEvent = async (userId: string, event: string, severity: 'INFO' | 'WARN' | 'CRITICAL', metadata: any = {}) => {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId,
      event,
      severity,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.warn("Audit Log Sync Failed:", e);
  }
};

// Session Security Utils (Requirement 3)
const generateSessionToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const syncUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  const sessionToken = generateSessionToken();

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      role: "OPERATOR",
      mfaEnabled: false,
      lastLogin: serverTimestamp(),
      email: user.email,
      failedLoginAttempts: 0,
      isLocked: false,
      sessionToken
    });
  } else {
    const data = userSnap.data();
    if (data.isLocked) {
      throw new Error("SEC_ALARM: ACCOUNT_LOCKED");
    }
    await updateDoc(userRef, { 
      lastLogin: serverTimestamp(),
      sessionToken // Token Rotation (Requirement 3)
    });
  }
  return true;
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    await logSecurityEvent(result.user.uid, 'LOGIN_SUCCESS', 'INFO', { method: 'google_oauth' });
    
    if (!result.user.emailVerified) {
      await sendEmailVerification(result.user);
      throw new Error("Verification Email Sent. Please check your inbox.");
    }

    return result.user;
  } catch (error: any) {
    const msg = handleSecurityError(error, SecurityOperation.AUTH);
    throw new Error(msg);
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await syncUserProfile(result.user);
    
    if (!result.user.emailVerified) {
      await sendEmailVerification(result.user);
      throw new Error("Verification Email Sent.");
    }
    
    await logSecurityEvent(result.user.uid, 'LOGIN_SUCCESS', 'INFO', { method: 'email_password' });
    return result.user;
  } catch (error: any) {
    const msg = handleSecurityError(error, SecurityOperation.AUTH);
    throw new Error(msg);
  }
};

export const signupWithEmail = async (email: string, pass: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await syncUserProfile(result.user);
    await sendEmailVerification(result.user);
    await logSecurityEvent(result.user.uid, 'SIGNUP_SUCCESS', 'INFO');
    return result.user;
  } catch (error: any) {
    const msg = handleSecurityError(error, SecurityOperation.AUTH);
    throw new Error(msg);
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    // Generic response (Requirement 5)
    return "CREDENTIAL_RECOVERY: SEQUENCE_INITIATED_IF_ACCOUNT_EXISTS";
  } catch (error: any) {
    // Still return success-like message to hide existence
    return "CREDENTIAL_RECOVERY: SEQUENCE_INITIATED_IF_ACCOUNT_EXISTS";
  }
};

export const logout = async () => {
  if (auth.currentUser) {
    try {
      await logSecurityEvent(auth.currentUser.uid, 'LOGOUT', 'INFO');
    } catch (e) {
      console.warn("Logout log failed:", e);
    }
  }
  return signOut(auth);
};

export interface StoredReport {
  id: string;
  target: string;
  summary: any;
  fullReport: any;
  createdAt: Timestamp;
}

export const saveReport = async (userId: string, target: string, report: any) => {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      userId,
      target,
      summary: report.summary,
      fullReport: report,
      createdAt: serverTimestamp()
    });
    
    await logSecurityEvent(userId, 'REPORT_SYNTHESIS', 'INFO', { target });
    return docRef.id;
  } catch (error) {
    const msg = handleSecurityError(error, SecurityOperation.ARCHIVE);
    throw new Error(msg);
  }
};

export const getReports = async (userId: string): Promise<StoredReport[]> => {
  try {
    const q = query(
      collection(db, 'reports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StoredReport[];
  } catch (error) {
    const msg = handleSecurityError(error, SecurityOperation.ARCHIVE);
    throw new Error(msg);
  }
};

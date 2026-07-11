import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Terminal, 
  Lock, 
  Mail, 
  Key, 
  ChevronRight, 
  AlertTriangle,
  Fingerprint,
  RotateCcw,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { loginWithEmail, signupWithEmail, resetPassword, handleSecurityError, SecurityOperation } from '../lib/firebase';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const CyberAuth: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'mfa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const user = await loginWithEmail(email, password);
        if (user.emailVerified) {
          onSuccess();
        } else {
          setMode('login');
          setMessage("VERIFICATION_REQUIRED: CHECK_INBOX");
        }
      } else if (mode === 'signup') {
        await signupWithEmail(email, password);
        setMessage("REGISTRATION_SUCCESS: VERIFICATION_SENT");
        setTimeout(() => setMode('login'), 3000);
      } else if (mode === 'reset') {
        const msg = await resetPassword(email);
        setMessage(msg);
        setTimeout(() => setMode('login'), 5000);
      } else if (mode === 'mfa') {
        // Simulated MFA verification logic
        if (otp === '000000') {
           onSuccess();
        } else {
           throw new Error("SEC_ALARM: INVALID_OTP_SEQUENCE");
        }
      }
    } catch (err: any) {
      setError(err.message || "SYSTEM_FAULT: AUTH_FAILURE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-cyber-black/98 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black border border-white/10 rounded-lg p-8 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        {/* Cinematic Header */}
        <header className="text-center mb-10 relative">
          <div className="inline-block bg-cyber-accent/10 border border-cyber-accent/20 p-4 rounded-full mb-6 relative group">
             <div className="absolute inset-0 bg-cyber-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <Shield className="w-10 h-10 text-cyber-accent group-hover:animate-pulse" />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
            {mode === 'login' ? 'Auth_Sequence' : mode === 'signup' ? 'Create_Profile' : mode === 'reset' ? 'Restore_Intel' : 'MFA_Verification'}
          </h2>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[4px]">Neural Offensive Deployment Access</p>
        </header>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            {mode !== 'mfa' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Vector_Identity (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-[11px] w-4 h-4 text-white/20 group-focus-within:text-cyber-accent transition-colors" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded p-3 pl-10 text-sm font-mono text-white outline-none focus:border-cyber-accent/50 focus:bg-white/[0.05] transition-all"
                    placeholder="operator@aegis-core.net"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Cipher_Sequence (Password)</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('reset')} className="text-[8px] font-mono text-cyber-accent uppercase tracking-widest hover:underline opacity-60">Forgot?</button>
                  )}
                </div>
                <div className="relative group">
                  <Key className="absolute left-3 top-[11px] w-4 h-4 text-white/20 group-focus-within:text-cyber-accent transition-colors" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded p-3 pl-10 text-sm font-mono text-white outline-none focus:border-cyber-accent/50 focus:bg-white/[0.05] transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            )}

            {mode === 'mfa' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Neural_Token (OTP)</label>
                <div className="relative group">
                  <Fingerprint className="absolute left-3 top-[11px] w-4 h-4 text-white/20 group-focus-within:text-cyber-accent transition-colors" />
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded p-3 pl-10 text-2xl font-mono text-cyber-accent text-center tracking-[12px] outline-none focus:border-cyber-accent/50 focus:bg-white/[0.05] transition-all"
                    placeholder="000000"
                  />
                </div>
                <p className="text-[8px] font-mono text-white/20 uppercase text-center mt-2 tracking-widest">Enter authentication token from system</p>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cyber-critical/10 border border-cyber-critical/30 p-3 rounded flex items-start gap-3"
              >
                <ShieldAlert className="w-4 h-4 text-cyber-critical shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-cyber-critical uppercase leading-tight font-bold">{error}</p>
              </motion.div>
            )}

            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cyber-accent/10 border border-cyber-accent/30 p-3 rounded flex items-start gap-3"
              >
                <ShieldCheck className="w-4 h-4 text-cyber-accent shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-cyber-accent uppercase leading-tight font-bold">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[4px] hover:bg-cyber-accent transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,255,65,0.3)]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Initiate_Session' : mode === 'signup' ? 'Create_Account' : mode === 'mfa' ? 'Verify_Token' : 'Reset_Ciphers'}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          {mode === 'login' ? (
            <button onClick={() => setMode('signup')} className="text-[9px] font-mono text-white/30 hover:text-white uppercase tracking-[3px] flex items-center gap-2">
              <UserPlus className="w-3 h-3" /> New Operator? Register Profile
            </button>
          ) : (
            <button onClick={() => setMode('login')} className="text-[9px] font-mono text-white/30 hover:text-white uppercase tracking-[3px] flex items-center gap-2">
              <RotateCcw className="w-3 h-3" /> Return to Login
            </button>
          )}
          
          <button onClick={onClose} className="text-[8px] font-mono text-white/10 uppercase tracking-[6px] hover:text-cyber-critical transition-colors">
            Terminate Auth Sequence
          </button>
        </div>

        {/* Tactical Accents */}
        <div className="absolute top-0 right-0 p-1 font-mono text-[6px] text-white/5 pointer-events-none">AEGIS_SEC_CORE_V4</div>
        <div className="absolute bottom-0 left-0 p-1 font-mono text-[6px] text-white/5 pointer-events-none lowercase">encryption: aes_256_neural_link</div>
      </motion.div>
    </motion.div>
  );
};

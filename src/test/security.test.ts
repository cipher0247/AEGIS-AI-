import { describe, it, expect } from 'vitest';
import { handleSecurityError, SecurityOperation } from '../lib/firebase';

describe('handleSecurityError - Information Leakage Guard', () => {
  it('suppresses internal Firebase error codes and returns standardized messages', () => {
    const authError = { code: 'auth/user-not-found', message: 'User record not found in tenant' };
    const result = handleSecurityError(authError, SecurityOperation.AUTH);
    expect(result).toBe('AUTH_FAILURE: INVALID_CREDENTIALS');
    expect(result).not.toContain('User record not found');
  });

  it('handles permission denied without revealing database path logic', () => {
    const permError = { code: 'permission-denied', message: 'Missing or insufficient permissions.' };
    const result = handleSecurityError(permError, SecurityOperation.ARCHIVE);
    expect(result).toBe('ACCESS_DENIED: MISSION_CREDENTIALS_INSUFFICIENT');
  });

  it('handles rate limit violations safely', () => {
    const rateError = { code: 'auth/too-many-requests', message: 'Access to this account has been temporarily disabled.' };
    const result = handleSecurityError(rateError, SecurityOperation.AUTH);
    expect(result).toBe('SEC_ALARM: RATE_LIMIT_EXCEEDED');
  });
});

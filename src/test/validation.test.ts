import { describe, it, expect } from 'vitest';
import { validateScanTarget } from '../lib/validation';

describe('validateScanTarget - Target Validation & SSRF Guard', () => {
  it('accepts legitimate public domains and URLs', () => {
    const res1 = validateScanTarget('example.com');
    expect(res1.valid).toBe(true);
    expect(res1.sanitizedUrl).toBe('https://example.com');

    const res2 = validateScanTarget('https://api.github.com/v1');
    expect(res2.valid).toBe(true);
    expect(res2.sanitizedUrl).toBe('https://api.github.com/v1');

    const res3 = validateScanTarget('http://subdomain.target-domain.org:8080/test');
    expect(res3.valid).toBe(true);
    expect(res3.sanitizedUrl).toBe('http://subdomain.target-domain.org:8080/test');
  });

  it('rejects empty or excessively long inputs', () => {
    expect(validateScanTarget('').valid).toBe(false);
    expect(validateScanTarget('   ').valid).toBe(false);
    expect(validateScanTarget('a'.repeat(2500)).valid).toBe(false);
  });

  it('rejects non-HTTP/HTTPS protocols (e.g. file, ftp, gopher, javascript)', () => {
    expect(validateScanTarget('file:///etc/passwd').valid).toBe(false);
    expect(validateScanTarget('gopher://127.0.0.1:70').valid).toBe(false);
    expect(validateScanTarget('ftp://example.com').valid).toBe(false);
  });

  it('blocks localhost, loopback, and cloud metadata targets (SSRF)', () => {
    expect(validateScanTarget('localhost').valid).toBe(false);
    expect(validateScanTarget('http://127.0.0.1').valid).toBe(false);
    expect(validateScanTarget('http://127.0.0.2').valid).toBe(false);
    expect(validateScanTarget('http://0.0.0.0').valid).toBe(false);
    expect(validateScanTarget('http://169.254.169.254/latest/meta-data/').valid).toBe(false);
    expect(validateScanTarget('metadata.google.internal').valid).toBe(false);
  });

  it('blocks private RFC 1918 IPv4 and local subnets (SSRF)', () => {
    expect(validateScanTarget('10.0.0.1').valid).toBe(false);
    expect(validateScanTarget('192.168.1.1').valid).toBe(false);
    expect(validateScanTarget('172.16.0.5').valid).toBe(false);
    expect(validateScanTarget('172.31.255.255').valid).toBe(false);
  });

  it('blocks dangerous administrative and database ports', () => {
    expect(validateScanTarget('https://example.com:22').valid).toBe(false);
    expect(validateScanTarget('https://example.com:6379').valid).toBe(false);
    expect(validateScanTarget('https://example.com:3306').valid).toBe(false);
    expect(validateScanTarget('https://example.com:27017').valid).toBe(false);
  });
});

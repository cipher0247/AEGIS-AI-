/**
 * Target Validation & SSRF Guard Utilities
 * Restricts active scan targets to valid, publicly resolvable HTTP/HTTPS endpoints.
 * Blocks private, loopback, link-local, cloud metadata, and invalid protocols.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254', // AWS/GCP/Azure link-local instance metadata
  'instance-data',
]);

const BLOCKED_IP_PREFIXES = [
  '10.',          // Class A private
  '172.16.',      // Class B private
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '192.168.',     // Class C private
  '127.',         // Loopback
  '169.254.',     // Link-local
  'fc00:',        // IPv6 Unique local
  'fe80:',        // IPv6 Link-local
];

export interface ValidationResult {
  valid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

export function validateScanTarget(inputUrl: string): ValidationResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { valid: false, error: 'Target URL is required.' };
  }

  const trimmed = inputUrl.trim();
  if (trimmed.length > 2048) {
    return { valid: false, error: 'Target URL exceeds maximum length (2048 characters).' };
  }

  // Prepend https:// if protocol is omitted
  const formatted = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
    ? trimmed 
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(formatted);
  } catch {
    return { valid: false, error: 'Target URL format is invalid.' };
  }

  // Enforce http/https protocols only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are permitted for scanning.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Basic hostname formatting checks
  if (!hostname || hostname.length < 3 || !hostname.includes('.')) {
    // If not an allowed FQDN (like 'localhost' or single label)
    if (hostname !== 'localhost') {
      return { valid: false, error: 'Target must be a fully-qualified domain name or public IP.' };
    }
  }

  // SSRF: Block loopback and metadata hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, error: 'SSRF Protection: Scanning loopback, internal, or cloud metadata endpoints is prohibited.' };
  }

  // SSRF: Block internal and link-local IPv4/IPv6 ranges
  for (const prefix of BLOCKED_IP_PREFIXES) {
    if (hostname.startsWith(prefix)) {
      return { valid: false, error: 'SSRF Protection: Scanning private RFC 1918 or link-local subnets is prohibited.' };
    }
  }

  // Prevent port hijacking for internal services (e.g. redis, mongodb, cloud metadata ports)
  const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
  const DISALLOWED_PORTS = [22, 25, 110, 143, 6379, 27017, 3306, 5432, 9200, 2375, 2376];
  if (DISALLOWED_PORTS.includes(port)) {
    return { valid: false, error: `SSRF Protection: Scanning administrative port ${port} is prohibited.` };
  }

  return {
    valid: true,
    sanitizedUrl: parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname),
  };
}

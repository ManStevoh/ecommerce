const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'ftp',
  'blog',
  'shop',
  'store',
  'nexora',
  'support',
  'help',
  'status',
]);

const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export function generateSubdomain(storeName: string): string {
  const base = storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  return base || 'store';
}

export function validateSubdomainFormat(subdomain: string): {
  valid: boolean;
  reason?: string;
} {
  if (!subdomain || subdomain.length < 3) {
    return { valid: false, reason: 'Subdomain must be at least 3 characters' };
  }
  if (subdomain.length > 63) {
    return { valid: false, reason: 'Subdomain must not exceed 63 characters' };
  }
  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    return {
      valid: false,
      reason:
        'Subdomain may only contain lowercase letters, numbers, and hyphens',
    };
  }
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return { valid: false, reason: 'Subdomain is reserved' };
  }
  return { valid: true };
}

export async function ensureUniqueSubdomain(
  base: string,
  exists: (subdomain: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base;
  let suffix = 0;

  while (await exists(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
    if (candidate.length > 63) {
      candidate = `${base.slice(0, 55)}-${suffix}`;
    }
  }

  return candidate;
}

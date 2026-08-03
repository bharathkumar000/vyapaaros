const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'authorization',
  'secret',
  'apiKey',
  'clientSecret',
  'cardNumber',
  'cvv',
]);

const clone = (value) => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value == null) {
    return value;
  }
  if (Array.isArray(value)) return value.map(clone);
  if (typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SENSITIVE_KEYS.has(key) ? '[REDACTED]' : clone(val);
    }
    return out;
  }
  return value;
};

export const redact = (data) => clone(data ?? {});

export function logAudit(event, context = {}) {
  try {
    const entry = {
      ts: new Date().toISOString(),
      event,
      ...redact(context),
    };
    console.log(JSON.stringify(entry));
  } catch {
    console.log(JSON.stringify({ ts: new Date().toISOString(), event }));
  }
}

export const auditRoute = (event, request, user, extra = {}) =>
  logAudit(event, {
    ...extra,
    userId: user?.sub || user?.userId,
    username: user?.username ?? extra.username,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
  });

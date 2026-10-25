const DEFAULT_API_BASE = 'https://api.plutio.com/v1.11';

function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  if (value == null || value === '') {
    return fallback;
  }
  return value;
}

function normalizeMode(value) {
  const normalized = String(value || 'readonly').trim().toLowerCase();
  return normalized === 'full' ? 'full' : 'readonly';
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function loadConfig() {
  return {
    apiBase: getEnv('PLUTIO_API_BASE', DEFAULT_API_BASE),
    clientId: getEnv('PLUTIO_CLIENT_ID'),
    clientSecret: getEnv('PLUTIO_CLIENT_SECRET'),
    business: getEnv('PLUTIO_BUSINESS'),
    userAgent: getEnv('PLUTIO_USER_AGENT', 'plutio-mcp/0.3.0'),
    mode: normalizeMode(getEnv('PLUTIO_MCP_MODE', 'readonly')),
    maxRequestsPerHour: parsePositiveInt(getEnv('PLUTIO_MAX_REQUESTS_PER_HOUR'), 1000),
    // OAuth consent passcode. The user types it into a small consent page
    // during the OAuth flow. If unset, the OAuth flow is DISABLED (fail closed)
    // unless MCP_ALLOW_OPEN_AUTHORIZE=true is set explicitly.
    authPasscode: getEnv('MCP_AUTH_PASSCODE') || null,
    allowOpenAuthorize: String(getEnv('MCP_ALLOW_OPEN_AUTHORIZE', 'false')).toLowerCase() === 'true',
    // Static API keys (comma separated). Any of these is accepted on /mcp as
    // "Authorization: Bearer <key>" or "x-api-key: <key>". Simplest option for
    // plugins and .mcp.json configs that can send headers.
    apiKeys: String(getEnv('MCP_API_KEYS', '') || '').split(',').map((k) => k.trim()).filter((k) => k.length >= 24),
    // If true, /mcp requires a valid OAuth bearer token. Default true. Set to
    // 'false' if a layer in front (Cloudflare Access, basic auth proxy, etc.)
    // is already gating the endpoint.
    oauthEnabled: String(getEnv('MCP_OAUTH_ENABLED', 'true')).toLowerCase() !== 'false'
  };
}

function assertBaseConfig(config) {
  const missing = [];
  if (!config.clientId) missing.push('PLUTIO_CLIENT_ID');
  if (!config.clientSecret) missing.push('PLUTIO_CLIENT_SECRET');
  if (!config.business) missing.push('PLUTIO_BUSINESS');

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

module.exports = {
  DEFAULT_API_BASE,
  loadConfig,
  assertBaseConfig,
  normalizeMode
};

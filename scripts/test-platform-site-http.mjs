/**
 * Platform marketing site HTTP integration tests.
 * Run: node scripts/test-platform-site-http.mjs [--http]
 */

const API = process.env.API_URL ?? 'http://localhost:3000';
const CMS = process.env.CMS_URL ?? 'http://localhost:3013';
const RUN_HTTP = process.argv.includes('--http');

const ADMIN = {
  email: 'admin@nexora.cloud',
  password: 'Admin123!',
};

let failed = 0;

function assert(name, cond, detail = '') {
  if (!cond) {
    console.error(`  [FAIL] ${name}${detail ? ` — ${detail}` : ''}`);
    failed += 1;
  } else {
    console.log(`  [PASS] ${name}`);
  }
}

async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { status: res.status, body, ok: true };
  } catch (err) {
    return {
      status: 0,
      body: null,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function login(baseUrl) {
  const { status, body } = await request(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ADMIN),
  });
  if (status !== 200 && status !== 201) {
    throw new Error(`login failed (${status})`);
  }
  return body.accessToken ?? body.access_token;
}

async function testPublicCms(baseUrl, label) {
  console.log(`\n▶ Public CMS (${label})`);

  const home = await request(`${baseUrl}/api/v1/platform/pages/public/home`);
  assert(
    'GET public homepage',
    home.ok && home.status === 200 && home.body?.blocks?.length > 0,
    home.ok ? `status=${home.status}` : home.error,
  );

  const site = await request(`${baseUrl}/api/v1/platform/site/public`);
  assert(
    'GET public site settings',
    site.ok && site.status === 200 && site.body?.siteName,
    site.ok ? `status=${site.status}` : site.error,
  );
}

async function testAdminCms(baseUrl, label) {
  console.log(`\n▶ Admin CMS (${label})`);

  let token;
  try {
    token = await login(baseUrl);
  } catch (err) {
    assert('super-admin login', false, err.message);
    return;
  }
  assert('super-admin login', true);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const pages = await request(`${baseUrl}/api/v1/platform/pages`, { headers });
  assert(
    'GET platform pages (admin)',
    pages.ok && pages.status === 200 && Array.isArray(pages.body),
    pages.ok ? `status=${pages.status}` : pages.error,
  );

  const settings = await request(`${baseUrl}/api/v1/platform/site`, { headers });
  assert(
    'GET platform site settings (admin)',
    settings.ok && settings.status === 200 && settings.body?.siteName,
    settings.ok ? `status=${settings.status}` : settings.error,
  );

  if (!pages.ok || !Array.isArray(pages.body)) return;

  const homepage = pages.body?.find((p) => p.isHomepage);
  if (homepage) {
    const detail = await request(`${baseUrl}/api/v1/platform/pages/${homepage.id}`, {
      headers,
    });
    assert(
      'GET homepage by id',
      detail.ok && detail.status === 200 && detail.body?.blocks?.length > 0,
      detail.ok ? `status=${detail.status}` : detail.error,
    );
  } else {
    assert('homepage exists in admin list', false, 'run pnpm db:seed');
  }
}

async function testGatewayHealth() {
  console.log('\n▶ Gateway');
  const health = await request(`${API}/health`);
  assert(
    'gateway /health',
    health.ok && health.status === 200,
    health.ok ? `status=${health.status}` : health.error,
  );
}

async function main() {
  console.log('Platform site HTTP tests');

  if (!RUN_HTTP) {
    console.log('\nSkipping HTTP checks (pass --http to run against live services).');
    console.log('OK platform site HTTP harness ready');
    process.exit(0);
  }

  await testGatewayHealth();
  await testPublicCms(CMS, 'cms-service direct');
  await testAdminCms(CMS, 'cms-service direct — auth via gateway only');

  await testPublicCms(API, 'api-gateway');
  await testAdminCms(API, 'api-gateway');

  if (failed === 0) {
    console.log('\nOK all platform site HTTP checks passed');
    process.exit(0);
  }
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test, before, after } = require('node:test');
const adminUrl = process.env.PRACTICE_SUBMISSIONS_ADMIN_URL;
const fixturePath = process.env.PRACTICE_SUBMISSIONS_FIXTURE_PATH;
let browser;
before(async () => {
  if (!adminUrl || !fixturePath) return;
  const { chromium } = require(process.env.PRACTICE_SUBMISSIONS_PLAYWRIGHT_MODULE || 'playwright');
  browser = await chromium.launch({ headless: true, executablePath: process.env.PRACTICE_SUBMISSIONS_BROWSER_EXECUTABLE });
});
after(async () => { await browser?.close(); });

for (const skill of ['SPEAKING', 'WRITING']) test(`${skill}: shared table displays account email, stored submission time and detail metadata`, {
  skip: !adminUrl || !fixturePath, timeout: 120000,
}, async () => {
  const fixtures = JSON.parse(readFileSync(fixturePath, 'utf8'))[skill];
  const { items } = fixtures.list;
  assert.ok(items.length > 0);
  assert.ok(items.every(item => item.user_email && item.submitted_at));
  const context = await browser.newContext({ viewport: { width: 1700, height: 1100 } });
  try {
    const user = { user_id: 'test-admin', email: 'admin@example.test', role: 'ADMIN', full_name: 'Test Admin', status: 'ACTIVE' };
    await context.addInitScript(user => {
      localStorage.setItem('i18nextLng', 'vi');
      localStorage.setItem('lingosphere_admin_user', JSON.stringify(user));
      localStorage.setItem('lingosphere_access_token', 'fixture');
    }, user);
    const requests = [];
    await context.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      const path = url.pathname.replace(/^\/api(?:\/v1)?/, '');
      if (!['fetch', 'xhr'].includes(req.resourceType()) || path.startsWith('/src/') || path.startsWith('/node_modules/') || path.startsWith('/@')) return route.continue();
      const respond = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data }) });
      if (path.endsWith('/auth/me') || path.endsWith('/users/profile')) return respond(user);
      if (path.endsWith('/users/admin/analytics/overview')) return respond({ overview: {} });
      const base = `/practice/admin/submissions/${skill}`;
      if (path === base) {
        assert.equal(req.method(), 'GET');
        requests.push(Object.fromEntries(url.searchParams));
        const search = (url.searchParams.get('search') || '').toLowerCase();
        const status = url.searchParams.get('status') || 'ALL';
        const standard = url.searchParams.get('standard');
        const matches = items.filter(item => (!standard || (item.grading_standard || 'PRACTICAL') === standard) &&
          (status === 'ALL' || (status === 'NONE' ? !item.review : item.review?.status === status)) &&
          `${item.user_email} ${item.user_id} ${item.title}`.toLowerCase().includes(search));
        const page = Number(url.searchParams.get('page') || 1), limit = Number(url.searchParams.get('limit') || 10);
        return respond({ ...fixtures.list, total: matches.length, page, limit, items: matches.slice((page - 1) * limit, page * limit) });
      }
      if (path.startsWith(base + '/')) return respond(fixtures.details[path.split('/').pop()]);
      return respond([]);
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${adminUrl}/submissions/practice/${skill.toLowerCase()}`);
    await page.getByRole('button', { name: 'Xem & chấm bài', exact: true }).first().waitFor({ timeout: 90000 });
    assert.equal(await page.getByRole('button', { name: 'Xem & chấm bài', exact: true }).count(), items.length);
    for (const header of ['Học viên', 'Bài luyện tập', 'Điểm AI', 'Điểm hiện tại', 'Nộp bài', 'Đã kiểm tra lúc']) {
      assert.ok(await page.getByRole('columnheader', { name: header, exact: true }).count() > 0);
    }
    assert.ok(await page.getByRole('cell', { name: items[0].user_email, exact: true }).count() > 0);
    const stamp = await page.evaluate(value => new Date(value).toLocaleString('vi-VN'), items[0].submitted_at);
    assert.ok(await page.getByRole('cell', { name: stamp, exact: true }).count() > 0);
    assert.equal(await page.getByText('In consequatur Dolo', { exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Xem & chấm bài', exact: true }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.getByText(items[0].user_email, { exact: true }).waitFor();
    assert.ok((await dialog.innerText()).includes(stamp));
    await dialog.locator('.ant-modal-close').click();
    await page.getByRole('textbox', { name: 'Tìm bài luyện tập', exact: true }).fill(items[0].user_email);
    await page.waitForResponse(response => response.url().includes('/admin/submissions/') && new URL(response.url()).searchParams.get('search') === items[0].user_email);
    assert.equal(requests.at(-1).page, '1');
    assert.equal(requests.at(-1).search, items[0].user_email);
    if (process.env.PRACTICE_SUBMISSIONS_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.PRACTICE_SUBMISSIONS_SCREENSHOT_DIR}/${skill.toLowerCase()}-submissions.png`, fullPage: true });
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ skill, displayed: items.length, emails: items.filter(i => i.user_email).length, submissionTimes: items.filter(i => i.submitted_at).length }));
  } finally { await context.close(); }
});

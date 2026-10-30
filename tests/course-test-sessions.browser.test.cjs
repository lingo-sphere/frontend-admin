const assert = require('node:assert/strict');
const { test } = require('node:test');
const adminUrl = process.env.COURSE_TEST_ADMIN_URL;
const progressUrl = process.env.COURSE_TEST_PROGRESS_URL;
const courseUrl = process.env.COURSE_TEST_COURSE_URL;

test('course management displays stored test sessions, filters and opens saved answers', {
  skip: !adminUrl || !progressUrl || !courseUrl, timeout: 180000,
}, async () => {
  const { chromium } = require(process.env.COURSE_TEST_PLAYWRIGHT_MODULE || 'playwright');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.COURSE_TEST_BROWSER_EXECUTABLE });
  try {
    const courses = await (await fetch(`${courseUrl}/courses?pageSize=100`)).json();
    const stored = (await Promise.all(courses.result.map(async course => {
      const response = await fetch(`${progressUrl}/progress/teacher/courses/${course._id}/test-sessions`);
      assert.equal(response.status, 200);
      return response.json();
    }))).flat();
    assert.ok(stored.length > 0, 'Needs stored course test sessions');
    const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const user = { user_id: 'browser-test-admin', full_name: 'Test Admin', email: 'admin@example.test', role: 'ADMIN', status: 'ACTIVE' };
    await context.addInitScript(user => {
      localStorage.setItem('i18nextLng', 'vi');
      localStorage.setItem('lingosphere_admin_user', JSON.stringify(user));
      localStorage.setItem('lingosphere_access_token', 'browser-fixture');
    }, user);
    await context.route('**/*', async route => {
      const req = route.request();
      const path = new URL(req.url()).pathname.replace(/^\/api(?:\/v1)?/, '');
      if (!['fetch', 'xhr'].includes(req.resourceType()) || path.startsWith('/src/') || path.startsWith('/node_modules/') || path.startsWith('/@')) return route.continue();
      const respond = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data }) });
      if (path.endsWith('/auth/me') || path.endsWith('/users/profile')) return respond(user);
      if (path === '/courses') return respond(courses);
      if (path.startsWith('/progress/teacher/courses/') && path.includes('/test-sessions')) {
        assert.equal(req.method(), 'GET');
        const response = await fetch(`${progressUrl}${path}`);
        return route.fulfill({ status: response.status, contentType: 'application/json', body: JSON.stringify({ data: await response.json() }) });
      }
      return respond([]);
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${adminUrl}/submissions/courses`, { timeout: 90000 });
    await page.getByRole('button', { name: 'Xem bài làm', exact: true }).first().waitFor({ timeout: 90000 });
    const countCard = label => page.getByText(label, { exact: true }).locator('..');
    assert.equal(await countCard('Tổng phiên kiểm tra').locator('p').last().innerText(), String(stored.length));
    assert.equal(await countCard('Bài đã nộp').locator('p').last().innerText(), String(stored.filter(s => s.status === 'SUBMITTED').length));
    assert.equal(await countCard('Phiên hết hạn').locator('p').last().innerText(), String(stored.filter(s => s.status === 'EXPIRED').length));
    await page.getByRole('button', { name: 'Xem bài làm', exact: true }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.getByText('Bắt đầu:', { exact: false }).waitFor();
    assert.equal(await dialog.getByRole('alert').count(), 0);
    await dialog.locator('.ant-modal-close').click();
    await page.getByRole('combobox', { name: 'Loại bài kiểm tra', exact: true }).click();
    await page.locator('.ant-select-item-option').getByText('Kiểm tra cuối khóa', { exact: true }).click();
    const finalCount = stored.filter(s => s.test_type === 'final-test').length;
    assert.equal(await page.getByRole('button', { name: 'Xem bài làm', exact: true }).count(), Math.min(10, finalCount));
    if (finalCount) {
      await page.getByRole('button', { name: 'Xem bài làm', exact: true }).first().click();
      await dialog.getByText('Bắt đầu:', { exact: false }).waitFor();
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ storedSessions: stored.length, submitted: stored.filter(s => s.status === 'SUBMITTED').length, expired: stored.filter(s => s.status === 'EXPIRED').length, finalTests: finalCount }));
    await context.close();
  } finally { await browser.close(); }
});

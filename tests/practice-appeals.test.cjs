const webUrl = process.env.PRACTICE_REVIEW_WEB_URL;
const adminUrl = process.env.PRACTICE_REVIEW_ADMIN_URL;
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
let browser;
before(async () => { if (!adminUrl) return; const { chromium } = require(process.env.PRACTICE_REVIEW_PLAYWRIGHT_MODULE || 'playwright'); browser = await chromium.launch({ headless: true, executablePath: process.env.PRACTICE_REVIEW_BROWSER_EXECUTABLE }); });
after(async () => { await browser?.close(); });
const exerciseId = '111111111111111111111111';
const ids = { SPEAKING: '222222222222222222222222', WRITING: '333333333333333333333333' };
const learner = { user_id: 'learner', email: 'learner@example.test', role: 'STUDENT', full_name: 'Practice Learner', status: 'ACTIVE' };

async function fixture(skill) {
  const id = ids[skill];
  const exercise = { _id: exerciseId, id: exerciseId, title: 'Practice feedback fixture', title_vi: 'Bài luyện thử', exercise_type: skill === 'WRITING' ? 'EXPRESS_OPINION' : 'OPINION_RESPONSE', prompt_text: 'Explain your opinion about teamwork.', prompt_text_en: 'Explain your opinion about teamwork.', grading_standard: 'PRACTICAL', status: 'PUBLISHED', min_words: 0, max_words: 500, cefr_level: 'B1' };
  const state = { review: null, revision: 0, score: 80, requests: 0, decisions: 0 };
  const row = () => ({ _id: id, id, user_id: 'learner', user_name: 'Practice Learner', user_email: 'learner@example.test', exercise_id: exerciseId, exercise_type: exercise.exercise_type,
    title: exercise.title, exercise, task_snapshot: { ...exercise, task_prompt: exercise.prompt_text }, content: 'Teamwork helps people share ideas.',
    transcription: 'Teamwork helps people share ideas.', audio_url: 'data:audio/webm;base64,' + Buffer.alloc(500).toString('base64'),
    overall_score: state.score, ai_score: 80, raw_score: state.score, max_score: 100, original_ai_raw_score: 80,
    grading_standard: 'PRACTICAL', grading_version: skill === 'WRITING' ? 'writing-v2' : 'speaking-v2', status: 'COMPLETED',
    pronunciation_score: 80, fluency_score: 80, grammar_score: 80, vocabulary_score: 80, content_score: 80, coherence_score: 80,
    word_count: 6, version_number: 1, attempt_number: 1, recording_duration_seconds: 20,
    created_at: '2026-10-27T01:00:00Z', submitted_at: '2026-10-27T01:00:00Z',
    ai_evaluation: { overall_score: 80, score_reason: 'The response addresses the task.', detailed_feedback: 'The response addresses the task.', criteria_scores: {}, criteria_feedback: {}, grammar_errors: [], strengths: [], weaknesses: [], actionable_tips: [] },
    review: state.review, revision: state.revision, can_request: !state.review?.requested_at,
    skill, record_type: 'RESULT', review_history: [],
  });
  const contexts = [];
  async function context(admin) {
    const user = admin ? { ...learner, user_id: 'admin', role: 'ADMIN' } : learner;
    const ctx = await browser.newContext({ viewport: { width: 1360, height: 1000 } });
    contexts.push(ctx);
    await ctx.addInitScript(({ user, admin }) => {
      localStorage.setItem('i18nextLng', 'vi');
      localStorage.setItem(admin ? 'lingosphere_admin_user' : 'lingosphere_user_info', JSON.stringify(user));
      localStorage.setItem(admin ? 'lingosphere_access_token' : 'lingosphere_user_access_token', 'fixture');
    }, { user, admin });
    await ctx.route('**/*', async route => {
      const req = route.request(), path = new URL(req.url()).pathname;
      if (!['xhr', 'fetch'].includes(req.resourceType()) || path.includes('/_next/') || req.headers().rsc || path.startsWith('/src/') || path.startsWith('/node_modules/') || path.startsWith('/@')) return route.continue();
      const respond = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data }) });
      if (path.endsWith('/auth/me')) return respond(user);
      if (path.endsWith('/users/profile')) return respond(admin ? user : { profile: user });
      if (path.endsWith('/ai/quota')) return respond({ is_premium: false, chat: { remaining: 5, limit: 5, used: 0 } });
      if (path.endsWith('/vocabulary/search-history')) return respond({ results: [], total: 0 });
      if (path.endsWith('/users/gamification')) return respond({});
      if (path.endsWith('/admin/analytics/overview')) return respond({ overview: {} });
      if (path.endsWith('/users/admin/users')) return respond({ result: [], meta: { current: 1, pageSize: 20, pages: 1, total: 0 } });
      if (path.includes('/review-results/')) {
        if (path.endsWith('/request')) {
          state.requests++; assert.equal(req.postDataJSON().reason, 'Tôi muốn giáo viên xem lại mức độ đáp ứng đề bài.');
          state.review = { status: 'REQUESTED', reason: req.postDataJSON().reason, requested_at: new Date().toISOString() }; state.revision++;
        }
        return respond(row());
      }
      if (path.includes(`/admin/submissions/${skill}`)) {
        if (path.endsWith('/review')) {
          const body = req.postDataJSON(); assert.equal(body.expected_revision, state.revision);
          assert.equal(body.score, 0); state.score = 0; state.decisions++; state.revision++;
          state.review = { ...state.review, status: 'RESOLVED', feedback: body.feedback, reviewer_name: 'Practice Teacher', reviewed_at: new Date().toISOString() };
          return respond(row());
        }
        if (path.endsWith(`/${id}`)) return respond(row());
        return respond({ items: [row()], total: 1, pending: state.review?.status === 'REQUESTED' ? 1 : 0, page: 1, limit: 20 });
      }
      if (path.endsWith('/practice/speaking') || path.endsWith('/practice/writing') || path.endsWith('/practice/writing/exercises') || path.endsWith('/practice/speaking/exercises')) return respond([exercise]);
      if (path.endsWith('/practice/speaking/attempts/my')) return respond([row()]);
      if (path.endsWith('/practice/speaking/profile/my')) return respond({ total_attempts: 1 });
      if (path.endsWith('/practice/writing/submissions/my')) return respond({ items: [row()], total: 1, page: 1, limit: 20, score_groups: [] });
      if (path.endsWith(`/practice/writing/submissions/${id}`)) return respond(row());
      if (path.endsWith('/recommendations')) return respond([]);
      if (path.endsWith('/courses')) return respond({ result: [], meta: { current: 1, pageSize: 20, pages: 1, total: 0 } });
      return respond([]);
    });
    return ctx;
  }
  return { row, state, context, close: async () => { for (const ctx of contexts) await ctx.close(); } };
}

for (const skill of ['SPEAKING', 'WRITING']) test(`${skill}: learner appeal survives reload, teacher resolves it and learner sees the actual zero`, { timeout: 180000, skip: !webUrl || !adminUrl }, async () => {
  const f = await fixture(skill);
  try {
    const learnerContext = await f.context(false), page = await learnerContext.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const url = `${webUrl}/${skill.toLowerCase()}/result/${ids[skill]}`;
    await page.goto(url);
    await page.getByRole('button', { name: 'Yêu cầu phúc khảo điểm', exact: true }).waitFor({ timeout: 90000 });
    await page.getByRole('button', { name: 'Yêu cầu phúc khảo điểm', exact: true }).click();
    await page.getByRole('textbox', { name: 'Bạn muốn giáo viên kiểm tra lại điều gì?' }).fill('Tôi muốn giáo viên xem lại mức độ đáp ứng đề bài.');
    await page.getByRole('button', { name: 'Gửi yêu cầu phúc khảo', exact: true }).click();
    await page.getByText('Đã yêu cầu phúc khảo — Chờ giáo viên', { exact: true }).waitFor();
    await page.reload();
    await page.getByText('Đã yêu cầu phúc khảo — Chờ giáo viên', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Yêu cầu phúc khảo điểm', exact: true }).count(), 0);
    const adminContext = await f.context(true), admin = await adminContext.newPage();
    admin.on('pageerror', error => errors.push(error.message));
    await admin.goto(`${adminUrl}/submissions/practice/${skill.toLowerCase()}`);
    await admin.getByRole('button', { name: 'Xem & chấm bài' }).waitFor();
    assert.equal(await admin.getByRole('combobox', { name: /khóa học/i }).count(), 0);
    await admin.getByRole('button', { name: 'Xem & chấm bài' }).click();
    await admin.getByRole('combobox', { name: 'Quyết định phúc khảo' }).selectOption('ADJUST');
    await admin.getByRole('spinbutton', { name: 'Điểm sau phúc khảo' }).fill('0');
    await admin.getByRole('textbox', { name: 'Nhận xét phúc khảo' }).fill('Bài trả lời chưa đúng trọng tâm yêu cầu của đề.');
    await admin.getByRole('button', { name: 'Lưu quyết định', exact: true }).click();
    await admin.getByText('Đã lưu đánh giá và thông báo cho học viên', { exact: true }).waitFor();
    await page.reload();
    await page.getByText('Giáo viên đã kiểm tra bài', { exact: true }).waitFor();
    await page.getByText('Bài trả lời chưa đúng trọng tâm yêu cầu của đề.', { exact: true }).waitFor();
    if (skill === 'WRITING') assert.equal((await page.getByLabel('Điểm bài viết', { exact: true }).textContent()).trim(), '0/100');
    else assert.match(await page.getByRole('main').textContent(), /0\s*\/100/);
    assert.equal(f.state.requests, 1); assert.equal(f.state.decisions, 1); assert.deepEqual(errors, []);
  } finally { await f.close(); }
});

for (const skill of ['SPEAKING', 'WRITING']) test(`${skill}: shared admin table preserves reviewing and saving an actual zero score`, { timeout: 90000, skip: !adminUrl }, async () => {
  const f = await fixture(skill);
  try {
    const context = await f.context(true), page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${adminUrl}/submissions/practice/${skill.toLowerCase()}`);
    await page.getByRole('button', { name: 'Xem & chấm bài', exact: true }).waitFor();
    await page.getByRole('cell', { name: 'learner@example.test', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Xem & chấm bài', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox', { name: 'Quyết định phúc khảo' }).selectOption('ADJUST');
    await dialog.getByRole('spinbutton', { name: 'Điểm sau phúc khảo' }).fill('0');
    await dialog.getByRole('textbox', { name: 'Nhận xét phúc khảo' }).fill('Bài trả lời chưa đúng trọng tâm yêu cầu của đề.');
    await dialog.getByRole('button', { name: 'Lưu quyết định', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('cell', { name: '0/100', exact: true }).waitFor();
    await page.reload();
    await page.getByRole('cell', { name: '0/100', exact: true }).waitFor();
    assert.equal(f.state.decisions, 1);
    assert.equal(f.state.score, 0);
    assert.deepEqual(errors, []);
  } finally { await f.close(); }
});

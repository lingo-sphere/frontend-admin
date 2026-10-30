const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const ts = require('typescript');

const source = readFileSync(require.resolve('../src/features/progress/schemas/progress.schema.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const schemaModule = { exports: {} };
new Function('require', 'exports', compiled.outputText)(require, schemaModule.exports);
const { SkillSubmissionListSchema, SkillSubmissionItemSchema, CourseTestSessionListSchema } = schemaModule.exports;

const submission = {
  _id: 'submission-1', user_id: 'learner-1', course_id: 'course-1',
  skill: 'WRITING', status: 'AI_GRADED', ai_score: 80, final_score: 80,
  ai_feedback: { pronunciation_score: null, fluency_score: null,
    grammar_score: 80, vocabulary_score: 80, improvement_tips: [] },
};

test('a writing submission without a learner name and with inapplicable speaking scores loads', () => {
  const rows = SkillSubmissionListSchema.parse([submission]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].user_name, '');
  assert.equal(rows[0].ai_score, 80);
  assert.equal(rows[0].teacher_score, undefined);
});

test('pending and failed grades do not reject the whole list or become zero', () => {
  const rows = SkillSubmissionListSchema.parse([
    submission,
    { ...submission, _id: 'pending', status: 'PENDING', ai_score: null, final_score: null },
    { ...submission, _id: 'failed', status: 'GRADING_FAILED', ai_score: null, final_score: null },
  ]);
  assert.equal(rows.length, 3);
  assert.equal(rows[1].ai_score, null);
  assert.equal(rows[2].final_score, null);
});

test('review responses preserve actual zero scores', () => {
  const row = SkillSubmissionItemSchema.parse({ ...submission, user_name: 'Learner',
    status: 'TEACHER_REVIEWED', teacher_score: 0, final_score: 0, is_teacher_reviewed: true });
  assert.equal(row.teacher_score, 0);
  assert.equal(row.final_score, 0);
});

test('malformed grades and missing identifiers still fail validation', () => {
  assert.equal(SkillSubmissionItemSchema.safeParse({ ...submission, ai_score: 'invalid' }).success, false);
  assert.equal(SkillSubmissionItemSchema.safeParse({ ...submission, course_id: undefined }).success, false);
});

test('course test sessions load independently of skill submissions, including actual zero and ungraded scores', () => {
  const session = { _id: 'session', user_id: 'learner', course_id: 'course', test_type: 'challenge',
    status: 'SUBMITTED', started_at: '2026-10-01T00:00:00Z', score: 0, is_passed: false };
  const rows = CourseTestSessionListSchema.parse([session,
    { ...session, _id: 'expired', status: 'EXPIRED', score: null, is_passed: null }]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].score, 0);
  assert.equal(rows[1].score, null);
  assert.deepEqual(rows[0].raw_questions, []);
});

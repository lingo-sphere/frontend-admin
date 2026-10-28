const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const ts = require('typescript');
const source = readFileSync(require.resolve('../src/features/courses/helpers/course.media.helper.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const exportsObject = {};
new Function('exports', compiled.outputText)(exportsObject);
const { collectCourseMediaUrls } = exportsObject;

test('confirms question images and audio across all three test arrays, even when test_questions is empty', () => {
  const urls = collectCourseMediaUrls({
    final_test_questions: [{ image_url: 'final.jpg', audio_url: 'final.wav' }],
    modules: [{ test_questions: [], challenge_questions: [{ image_url: 'challenge.jpg' }],
      post_mini_questions: [{ image_url: 'post.jpg', media_url: 'post.wav' }],
      speaking_file_url: 'speaking.wav', lessons: [{ video_url: 'lesson.mp4' }] }],
  });
  assert.deepEqual(new Set(urls), new Set(['final.jpg', 'final.wav', 'challenge.jpg', 'post.jpg', 'post.wav', 'speaking.wav', 'lesson.mp4']));
});

test('keeps newly uploaded files, deduplicates references and ignores empty fields', () => {
  assert.deepEqual(collectCourseMediaUrls({ thumbnail_url: 'thumb.png', title: 'Not a file',
    final_test_questions: [{ image_url: 'thumb.png', audio_url: null, media_url: '' }] },
    ['thumb.png', 'new.jpg']), ['thumb.png', 'new.jpg']);
});

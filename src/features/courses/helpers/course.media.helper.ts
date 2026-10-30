// Collect every saved course asset, including separate image/audio question fields.
const mediaFields = new Set([
  'thumbnail_url', 'document_url', 'video_url', 'theory_file_url',
  'media_url', 'image_url', 'audio_url', 'test_audio_url', 'challenge_audio_url',
  'speaking_file_url', 'writing_file_url', 'final_test_audio_url',
  'final_test_speaking_file_url', 'final_test_writing_file_url',
])

export function collectCourseMediaUrls(course: unknown, uploadedUrls: string[] = []): string[] {
  const urls = new Set(uploadedUrls.filter(Boolean))
  function visit(value: unknown) {
    if (Array.isArray(value)) { value.forEach(visit); return }
    if (!value || typeof value !== 'object') return
    for (const [field, child] of Object.entries(value)) {
      if (mediaFields.has(field) && typeof child === 'string' && child.trim()) urls.add(child.trim())
      else if (child && typeof child === 'object') visit(child)
    }
  }
  visit(course)
  return [...urls]
}

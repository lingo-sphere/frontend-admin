// Trang danh sách bài nộp và quản lý phúc khảo luyện tập Speaking và Writing.

import { PracticeSubmissionsTable } from '@/features/submissions/components/practice.submissions.table'
import type { PracticeSkill } from '@/features/submissions/services/practice.review.service'

export function PracticeSpeakingSubmissionsPage() {
  return <PracticeSubmissionsPage skill="SPEAKING" />
}

export function PracticeWritingSubmissionsPage() {
  return <PracticeSubmissionsPage skill="WRITING" />
}

function PracticeSubmissionsPage({ skill }: { skill: PracticeSkill }) {
  return <PracticeSubmissionsTable key={skill} skill={skill} />
}

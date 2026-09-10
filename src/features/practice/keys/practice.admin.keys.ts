// Định nghĩa Query Keys tập trung cho module Practice trong trang quản trị Admin
export const practiceAdminKeys = {
  all: ['practice-admin'] as const,
  sets: () => [...practiceAdminKeys.all, 'sets'] as const,
  setById: (id: string) => [...practiceAdminKeys.all, 'set', id] as const,
  questions: (setId: string) => [...practiceAdminKeys.all, 'questions', setId] as const,
  listening: () => [...practiceAdminKeys.all, 'listening'] as const,
  speaking: () => [...practiceAdminKeys.all, 'speaking'] as const,
  writing: () => [...practiceAdminKeys.all, 'writing'] as const,
}

// Định nghĩa query keys quản lý lộ trình học tập Admin.
export const roadmapAdminKeys = {
  all: ['roadmaps', 'admin'] as const,
  list: (params?: { skills_focus?: string; is_published?: boolean }) =>
    [...roadmapAdminKeys.all, 'list', params] as const,
  detail: (id: string) => [...roadmapAdminKeys.all, 'detail', id] as const,
}

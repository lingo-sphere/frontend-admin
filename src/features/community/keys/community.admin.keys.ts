// Quản lý Query Key tập trung cho module quản trị phòng chat cộng đồng.
export const communityAdminKeys = {
  all: ['community-admin'] as const,
  room: () => [...communityAdminKeys.all, 'room'] as const,
  messages: (limit = 50, order = 'desc') => [...communityAdminKeys.all, 'messages', { limit, order }] as const,
  pinnedMessages: () => [...communityAdminKeys.all, 'pinned-messages'] as const,
  moderators: () => [...communityAdminKeys.all, 'moderators'] as const,
  bannedMembers: () => [...communityAdminKeys.all, 'banned-members'] as const,
}

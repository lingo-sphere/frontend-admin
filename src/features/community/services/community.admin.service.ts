// Service quản lý API phòng chat cộng đồng phía Admin.
import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type {
  AdminChatRoom,
  AdminChatMessage,
  AdminMessagesResponse,
  AdminCommunityMember,
  SetModeratorPayload,
  UpdateRoomSettingPayload,
  BanMemberPayload,
  MuteMemberPayload,
  KickMemberPayload,
} from '@/features/community/types/community.admin.types'

export const communityAdminService = {
  async getRoom(): Promise<AdminChatRoom> {
    return api.get<AdminChatRoom>(API_CONFIG.ENDPOINTS.COMMUNITY.ROOM)
  },

  async updateRoomSettings(payload: UpdateRoomSettingPayload): Promise<AdminChatRoom> {
    return api.put<AdminChatRoom>(API_CONFIG.ENDPOINTS.COMMUNITY.ROOM_SETTINGS, payload)
  },

  async getMessages(limit = 50, beforeId?: string, order: 'asc' | 'desc' = 'desc'): Promise<AdminMessagesResponse> {
    const params: Record<string, unknown> = { limit, order }
    if (beforeId) params.before_id = beforeId
    return api.get<AdminMessagesResponse>(API_CONFIG.ENDPOINTS.COMMUNITY.MESSAGES, params)
  },

  async deleteMessage(messageId: string): Promise<AdminChatMessage> {
    return api.delete<AdminChatMessage>(API_CONFIG.ENDPOINTS.COMMUNITY.DELETE_MESSAGE(messageId))
  },

  async pinMessage(messageId: string): Promise<AdminChatMessage> {
    return api.post<AdminChatMessage>(API_CONFIG.ENDPOINTS.COMMUNITY.PIN_MESSAGE(messageId))
  },

  async unpinMessage(messageId: string): Promise<AdminChatMessage> {
    return api.post<AdminChatMessage>(API_CONFIG.ENDPOINTS.COMMUNITY.UNPIN_MESSAGE(messageId))
  },

  async getPinnedMessages(): Promise<AdminChatMessage[]> {
    return api.get<AdminChatMessage[]>(API_CONFIG.ENDPOINTS.COMMUNITY.PINNED_MESSAGES)
  },

  async getModerators(): Promise<AdminCommunityMember[]> {
    return api.get<AdminCommunityMember[]>(API_CONFIG.ENDPOINTS.COMMUNITY.MODERATORS)
  },

  async setModerator(payload: SetModeratorPayload): Promise<AdminCommunityMember> {
    return api.post<AdminCommunityMember>(API_CONFIG.ENDPOINTS.COMMUNITY.MODERATORS, payload)
  },

  async removeModerator(userId: string): Promise<AdminCommunityMember> {
    return api.delete<AdminCommunityMember>(API_CONFIG.ENDPOINTS.COMMUNITY.MODERATOR_BY_ID(userId))
  },

  async getBannedMembers(): Promise<AdminCommunityMember[]> {
    return api.get<AdminCommunityMember[]>(API_CONFIG.ENDPOINTS.COMMUNITY.BANNED_MEMBERS)
  },

  async banMember(payload: BanMemberPayload): Promise<AdminCommunityMember> {
    return api.post<AdminCommunityMember>(API_CONFIG.ENDPOINTS.COMMUNITY.BAN, payload)
  },

  async muteMember(payload: MuteMemberPayload): Promise<AdminCommunityMember> {
    return api.post<AdminCommunityMember>(API_CONFIG.ENDPOINTS.COMMUNITY.MUTE, payload)
  },

  async kickMember(payload: KickMemberPayload): Promise<AdminCommunityMember> {
    return api.post<AdminCommunityMember>(API_CONFIG.ENDPOINTS.COMMUNITY.KICK, payload)
  },

  async unbanMember(userId: string): Promise<AdminCommunityMember> {
    return api.post<AdminCommunityMember>(API_CONFIG.ENDPOINTS.COMMUNITY.UNBAN(userId))
  },

  async unmuteMember(userId: string): Promise<AdminCommunityMember> {
    return api.post<AdminCommunityMember>(API_CONFIG.ENDPOINTS.COMMUNITY.UNMUTE(userId))
  },
}

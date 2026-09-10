// Định nghĩa các kiểu dữ liệu và cấu trúc phục vụ quản trị phòng chat cộng đồng phía Admin.
export interface AdminModeratorPermissions {
  can_delete_messages: boolean;
  can_mute_members: boolean;
  can_kick_members: boolean;
  can_ban_members: boolean;
  can_toggle_room_chat: boolean;
  can_pin_messages: boolean;
}

export interface AdminChatMessage {
  _id: string;
  room_code: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sender_role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  sender_badge: 'ADMIN' | 'MODERATOR' | 'PRO' | 'LEARNER';
  sender_level?: number;
  content: string;
  attachments?: string[];
  reply_to?: {
    message_id: string;
    sender_name: string;
    content: string;
  };
  is_pinned: boolean;
  is_deleted: boolean;
  deleted_by?: string;
  created_at: string;
}

export interface AdminMessagesResponse {
  messages: AdminChatMessage[];
  next_cursor?: string;
  has_more: boolean;
}

export interface AdminChatRoom {
  _id: string;
  room_code: string;
  title: string;
  is_chat_enabled: boolean;
  slow_mode_seconds: number;
  pinned_message_ids?: string[];
}

export interface AdminCommunityMember {
  _id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  badge: 'ADMIN' | 'MODERATOR' | 'PRO' | 'LEARNER';
  moderator_permissions?: AdminModeratorPermissions;
  is_banned: boolean;
  banned_reason?: string;
  banned_at?: string;
  banned_by?: string;
  muted_until?: string;
  kicked_cooldown_until?: string;
  joined_at: string;
}

export interface SetModeratorPayload {
  user_id: string;
  permissions: AdminModeratorPermissions;
}

export interface UpdateRoomSettingPayload {
  is_chat_enabled?: boolean;
  slow_mode_seconds?: number;
}

export interface BanMemberPayload {
  target_user_id: string;
  reason: string;
  user_name?: string;
  user_avatar?: string;
}

export interface MuteMemberPayload {
  target_user_id: string;
  duration_minutes: number;
  reason?: string;
  user_name?: string;
  user_avatar?: string;
}

export interface KickMemberPayload {
  target_user_id: string;
  cooldown_minutes?: number;
  reason?: string;
  user_name?: string;
  user_avatar?: string;
}

export type SanctionActionType = 'BAN' | 'MUTE' | 'KICK';


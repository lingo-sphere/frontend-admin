// Custom hook quản lý truy vấn và đột biến quản trị phòng chat cộng đồng với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { communityAdminService } from '@/features/community/services/community.admin.service'
import { communityAdminKeys } from '@/features/community/keys/community.admin.keys'
import type {
  AdminChatRoom,
  AdminMessagesResponse,
  AdminChatMessage,
  AdminCommunityMember,
  UpdateRoomSettingPayload,
} from '@/features/community/types/community.admin.types'

async function optimisticUpdateAdminMessages(
  queryClient: QueryClient,
  updater: (messages: AdminChatMessage[]) => AdminChatMessage[]
) {
  await queryClient.cancelQueries({ queryKey: communityAdminKeys.all })
  const queryCache = queryClient.getQueryCache()
  const messageQueries = queryCache.findAll({ queryKey: communityAdminKeys.messagesRoot() })
  const previousDataMap: Array<{ queryKey: readonly unknown[]; data: AdminMessagesResponse | undefined }> = []

  messageQueries.forEach((q) => {
    const prev = q.state.data as AdminMessagesResponse | undefined
    if (prev && Array.isArray(prev.messages)) {
      previousDataMap.push({ queryKey: q.queryKey, data: prev })
      queryClient.setQueryData<AdminMessagesResponse>(q.queryKey, {
        ...prev,
        messages: updater(prev.messages),
      })
    }
  })

  return { previousDataMap }
}

function rollbackAdminMessages(
  queryClient: QueryClient,
  context?: { previousDataMap?: Array<{ queryKey: readonly unknown[]; data: AdminMessagesResponse | undefined }> }
) {
  if (context?.previousDataMap) {
    context.previousDataMap.forEach(({ queryKey, data }) => {
      queryClient.setQueryData(queryKey, data)
    })
  }
}

export function useCommunityRoomQuery(enabled = true) {
  return useQuery<AdminChatRoom>({
    queryKey: communityAdminKeys.room(),
    queryFn: () => communityAdminService.getRoom(),
    enabled,
    staleTime: 0,
  })
}

export function useCommunityMessagesQuery(limit = 50, order: 'asc' | 'desc' = 'desc', enabled = true) {
  return useQuery<AdminMessagesResponse>({
    queryKey: communityAdminKeys.messages(limit, order),
    queryFn: () => communityAdminService.getMessages(limit, undefined, order),
    enabled,
    staleTime: 0,
  })
}

export function useCommunityModeratorsQuery(enabled = true) {
  return useQuery<AdminCommunityMember[]>({
    queryKey: communityAdminKeys.moderators(),
    queryFn: () => communityAdminService.getModerators(),
    enabled,
    staleTime: 0,
  })
}

export function useCommunityBannedMembersQuery(enabled = true) {
  return useQuery<AdminCommunityMember[]>({
    queryKey: communityAdminKeys.bannedMembers(),
    queryFn: () => communityAdminService.getBannedMembers(),
    enabled,
    staleTime: 0,
  })
}

export function useUpdateRoomSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateRoomSettingPayload) => communityAdminService.updateRoomSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityAdminKeys.room() })
    },
  })
}

export function useDeleteMessageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => communityAdminService.deleteMessage(messageId),
    onMutate: (messageId: string) =>
      optimisticUpdateAdminMessages(queryClient, (msgs) =>
        msgs.map((m) => (m._id === messageId ? { ...m, is_deleted: true } : m))
      ),
    onError: (_err, _id, context) => rollbackAdminMessages(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: communityAdminKeys.all })
    },
  })
}

export function usePinMessageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => communityAdminService.pinMessage(messageId),
    onMutate: (messageId: string) =>
      optimisticUpdateAdminMessages(queryClient, (msgs) =>
        msgs.map((m) => (m._id === messageId ? { ...m, is_pinned: true } : m))
      ),
    onError: (_err, _id, context) => rollbackAdminMessages(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: communityAdminKeys.all })
    },
  })
}

export function useUnpinMessageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => communityAdminService.unpinMessage(messageId),
    onMutate: (messageId: string) =>
      optimisticUpdateAdminMessages(queryClient, (msgs) =>
        msgs.map((m) => (m._id === messageId ? { ...m, is_pinned: false } : m))
      ),
    onError: (_err, _id, context) => rollbackAdminMessages(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: communityAdminKeys.all })
    },
  })
}

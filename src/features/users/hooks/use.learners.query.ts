// Custom hook quản lý truy vấn danh sách học viên và cập nhật trạng thái với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'
import { userService, type UserQueryParams } from '@/features/users/services/user.service'
import { userKeys } from '@/features/users/keys/user.keys'
import { optimisticUpdateCollection, rollbackCollection, type CollectionRollbackContext } from '@/lib/query.optimistic'
import type { User } from '@/features/users/types/learner.types'
import type { UserProfile } from '@/types/api.types'

export async function fetchLearners(queryParams: UserQueryParams): Promise<User[]> {
  const res = await userService.getAllUsers(queryParams)
  const items: UserProfile[] = Array.isArray(res) ? res : (res?.result || [])
  return items.map((u: UserProfile) => ({
    id: u.user_id,
    full_name: u.full_name,
    email: u.email,
    target_toeic_score: u.target_toeic_score || 0,
    current_estimated_score: u.current_estimated_score || 0,
    total_xp: u.total_xp || 0,
    current_streak: u.current_streak || 0,
    is_premium: Boolean(u.is_premium),
    status: u.status === 'BLOCKED' ? 'BANNED' : 'ACTIVE',
    avatar_url: u.avatar_url,
    gender: u.gender || 'OTHER',
    learning_goal_minutes_per_day: u.learning_goal_minutes_per_day || 0,
    current_plan_slug: u.current_plan_slug || (u.is_premium ? 'vip' : 'free'),
    created_at: u.created_at || '',
    level: u.level || 1,
    longest_streak: u.current_streak || 0,
    gems: u.gems || 0,
    lessons_completed: 0,
    vocabulary_reviewed: 0,
    practice_sessions: 0,
    exams_completed: 0,
  }))
}

export const learnerQueries = {
  list: (params?: UserQueryParams) => {
    const queryParams: UserQueryParams = {
      role: 'STUDENT',
      limit: 100,
      ...params,
    }
    return queryOptions({
      queryKey: userKeys.learners(queryParams),
      queryFn: () => fetchLearners(queryParams),
      placeholderData: keepPreviousData,
      staleTime: 90 * 1000,
    })
  },
}

export function useLearnersQuery(params?: UserQueryParams) {
  return useQuery(learnerQueries.list(params))
}

export function prefetchLearners(queryClient: QueryClient, params?: UserQueryParams) {
  return queryClient.prefetchQuery(learnerQueries.list(params))
}

export function useUpdateLearnerStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    unknown,
    Error,
    { userId: string; status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED'; reason?: string },
    CollectionRollbackContext<User>
  >({
    mutationFn: async ({ userId, status, reason }: { userId: string; status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED'; reason?: string }) => {
      return userService.updateUserStatus(userId, status, reason)
    },
    onMutate: ({ userId, status }) => {
      const nextMappedStatus = status === 'BLOCKED' ? 'BANNED' : 'ACTIVE'
      return optimisticUpdateCollection<User>(queryClient, userKeys.all, (learners) =>
        learners.map((u) => (u.id === userId ? { ...u, status: nextMappedStatus } : u))
      )
    },
    onError: (_err, _vars, context) => rollbackCollection<User>(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

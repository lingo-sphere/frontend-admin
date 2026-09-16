// Custom hook quản lý truy vấn danh sách học viên và cập nhật trạng thái với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'
import { userService, type UserQueryParams } from '@/features/users/services/user.service'
import { userKeys } from '@/features/users/keys/user.keys'
import { optimisticUpdateCollection, rollbackCollection, type CollectionRollbackContext } from '@/lib/query.optimistic'
import type { User } from '@/features/users/types/learner.types'
import type { UserProfile } from '@/types/api.types'

export interface PaginatedLearnersResult {
  items: User[]
  total: number
  current: number
  pageSize: number
  pages: number
}

export async function fetchLearners(queryParams: UserQueryParams): Promise<PaginatedLearnersResult> {
  const res = await userService.getAllUsers(queryParams)
  const rawItems: UserProfile[] = Array.isArray(res) ? res : (res?.result || [])
  const items = rawItems.map((u: UserProfile) => ({
    id: u.user_id,
    full_name: u.full_name,
    email: u.email,
    target_toeic_score: u.target_toeic_score ?? 0,
    current_estimated_score: u.current_estimated_score ?? 0,
    placement_test_score: u.placement_test_score ?? undefined,
    placement_listening_score: u.placement_listening_score ?? undefined,
    placement_reading_score: u.placement_reading_score ?? undefined,
    placement_tested_at: u.placement_tested_at || undefined,
    placement_skills_type: u.placement_skills_type || undefined,
    total_xp: u.total_xp ?? 0,
    current_streak: u.current_streak ?? 0,
    is_premium: Boolean(u.is_premium),
    status: (u.status === 'BLOCKED' ? 'BANNED' : 'ACTIVE') as User['status'],
    avatar_url: u.avatar_url || undefined,
    gender: ((u.gender === 'MALE' || u.gender === 'FEMALE') ? u.gender : 'OTHER') as User['gender'],
    learning_goal_minutes_per_day: u.learning_goal_minutes_per_day ?? 0,
    current_plan_slug: u.current_plan_slug || (u.is_premium ? 'vip' : 'free'),
    created_at: u.created_at || '',
    level: u.level ?? 1,
    longest_streak: u.current_streak ?? 0,
    gems: u.gems ?? 0,
    lessons_completed: 0,
    vocabulary_reviewed: 0,
    practice_sessions: 0,
    exams_completed: 0,
  }))

  const meta = Array.isArray(res)
    ? { current: queryParams.page || 1, pageSize: queryParams.limit || 10, pages: 1, total: items.length }
    : {
        current: res?.meta?.current || queryParams.page || 1,
        pageSize: res?.meta?.pageSize || queryParams.limit || 10,
        pages: res?.meta?.pages || 1,
        total: res?.meta?.total ?? items.length,
      }

  return {
    items,
    total: meta.total,
    current: meta.current,
    pageSize: meta.pageSize,
    pages: meta.pages,
  }
}

export const learnerQueries = {
  list: (params?: UserQueryParams) => {
    const queryParams: UserQueryParams = {
      role: 'STUDENT',
      page: 1,
      limit: 10,
      ...params,
    }
    return queryOptions({
      queryKey: userKeys.learners(queryParams),
      queryFn: () => fetchLearners(queryParams),
      placeholderData: keepPreviousData,
      staleTime: 0,
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

export function useResetLearnerDataMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; message: string },
    Error,
    string
  >({
    mutationFn: async (userId: string) => {
      return userService.resetLearnerData(userId)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}


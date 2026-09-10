// Custom hook quản lý truy vấn danh sách học viên và cập nhật trạng thái với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, type UserQueryParams } from '@/features/users/services/user.service'
import { userKeys } from '@/features/users/keys/user.keys'
import type { User } from '@/features/users/types/learner.types'
import type { UserProfile } from '@/types/api.types'

export function useLearnersQuery(params?: UserQueryParams) {
  const queryParams: UserQueryParams = {
    role: 'STUDENT',
    limit: 100,
    ...params,
  }

  return useQuery<User[]>({
    queryKey: userKeys.learners(queryParams),
    queryFn: async () => {
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
    },
    staleTime: 90 * 1000,
  })
}

export function useUpdateLearnerStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, status, reason }: { userId: string; status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED'; reason?: string }) => {
      return userService.updateUserStatus(userId, status, reason)
    },
    onMutate: async ({ userId, status }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all })
      const queryCache = queryClient.getQueryCache()
      const learnerQueries = queryCache.findAll({ queryKey: userKeys.all })
      const previousDataMap: Array<{ queryKey: unknown; data: User[] | undefined }> = []

      learnerQueries.forEach((q) => {
        const prev = q.state.data as User[] | undefined
        if (Array.isArray(prev)) {
          previousDataMap.push({ queryKey: q.queryKey, data: prev })
          const nextMappedStatus = status === 'BLOCKED' ? 'BANNED' : 'ACTIVE'
          queryClient.setQueryData<User[]>(
            q.queryKey,
            prev.map((u) => (u.id === userId ? { ...u, status: nextMappedStatus } : u))
          )
        }
      })

      return { previousDataMap }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey as string[], data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

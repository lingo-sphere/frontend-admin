// Custom hook quản lý truy vấn và cập nhật gói cước subscription bằng TanStack Query.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/features/users/services/user.service'
import { settingsPlansKeys } from '@/features/settings/keys/settings.plans.keys'
import type { SubscriptionPlan } from '@/types/api.types'

export function useSubscriptionPlansQuery() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: settingsPlansKeys.lists(),
    queryFn: async () => {
      const res = await userService.getSubscriptionPlans()
      return res || []
    },
    staleTime: 60 * 1000,
  })
}

export function useUpdateSubscriptionPlanMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload: Partial<SubscriptionPlan> }) =>
      userService.updateSubscriptionPlan(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsPlansKeys.all })
    },
  })
}

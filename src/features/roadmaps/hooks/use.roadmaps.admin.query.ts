// Custom hook quản lý truy vấn và đột biến lộ trình học tập Admin với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roadmapService } from '@/features/courses/services/course.service'
import { roadmapAdminKeys } from '@/features/roadmaps/keys/roadmap.admin.keys'
import type { LearningRoadmap } from '@/types/api.types'

export function useAdminRoadmapsQuery(params?: { skills_focus?: string; is_published?: boolean }, enabled = true) {
  return useQuery<LearningRoadmap[]>({
    queryKey: roadmapAdminKeys.list(params),
    queryFn: async () => {
      const res = await roadmapService.getAllRoadmaps(params)
      return Array.isArray(res) ? res : []
    },
    enabled,
    staleTime: 90 * 1000,
  })
}

export function useCreateRoadmapMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<LearningRoadmap>) => roadmapService.createRoadmap(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapAdminKeys.all })
    },
  })
}

export function useUpdateRoadmapMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LearningRoadmap> }) =>
      roadmapService.updateRoadmap(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: roadmapAdminKeys.all })
      const queryCache = queryClient.getQueryCache()
      const roadmapQueries = queryCache.findAll({ queryKey: ['roadmaps', 'admin'] })
      const previousDataMap: Array<{ queryKey: unknown; data: LearningRoadmap[] | undefined }> = []

      roadmapQueries.forEach((q) => {
        const prev = q.state.data as LearningRoadmap[] | undefined
        if (Array.isArray(prev)) {
          previousDataMap.push({ queryKey: q.queryKey, data: prev })
          queryClient.setQueryData<LearningRoadmap[]>(
            q.queryKey,
            prev.map((r) => (r._id === id ? { ...r, ...payload } : r))
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
      queryClient.invalidateQueries({ queryKey: roadmapAdminKeys.all })
    },
  })
}

export function useDeleteRoadmapMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roadmapService.deleteRoadmap(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: roadmapAdminKeys.all })
      const queryCache = queryClient.getQueryCache()
      const roadmapQueries = queryCache.findAll({ queryKey: ['roadmaps', 'admin'] })
      const previousDataMap: Array<{ queryKey: unknown; data: LearningRoadmap[] | undefined }> = []

      roadmapQueries.forEach((q) => {
        const prev = q.state.data as LearningRoadmap[] | undefined
        if (Array.isArray(prev)) {
          previousDataMap.push({ queryKey: q.queryKey, data: prev })
          queryClient.setQueryData<LearningRoadmap[]>(
            q.queryKey,
            prev.filter((r) => r._id !== id)
          )
        }
      })

      return { previousDataMap }
    },
    onError: (_err, _id, context) => {
      if (context?.previousDataMap) {
        context.previousDataMap.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey as string[], data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: roadmapAdminKeys.all })
    },
  })
}

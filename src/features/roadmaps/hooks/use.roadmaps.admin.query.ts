// Custom hook quản lý truy vấn và đột biến lộ trình học tập Admin với Optimistic Update bằng TanStack Query.
import { useQuery, useMutation, useQueryClient, keepPreviousData, queryOptions, type QueryClient } from '@tanstack/react-query'
import { roadmapService } from '@/features/courses/services/course.service'
import { roadmapAdminKeys } from '@/features/roadmaps/keys/roadmap.admin.keys'
import { optimisticUpdateCollection, rollbackCollection, type CollectionRollbackContext } from '@/lib/query.optimistic'
import type { LearningRoadmap } from '@/types/api.types'

export const adminRoadmapQueries = {
  list: (params?: { skills_focus?: string; is_published?: boolean }, enabled = true) =>
    queryOptions({
      queryKey: roadmapAdminKeys.list(params),
      queryFn: async (): Promise<LearningRoadmap[]> => {
        const res = await roadmapService.getAllRoadmaps(params)
        return (Array.isArray(res) ? res : []) as LearningRoadmap[]
      },
      enabled,
      placeholderData: keepPreviousData,
      staleTime: 90 * 1000,
    }),
}

export function useAdminRoadmapsQuery(params?: { skills_focus?: string; is_published?: boolean }, enabled = true) {
  return useQuery(adminRoadmapQueries.list(params, enabled))
}

export function prefetchAdminRoadmaps(
  queryClient: QueryClient,
  params?: { skills_focus?: string; is_published?: boolean }
) {
  return queryClient.prefetchQuery(adminRoadmapQueries.list(params))
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

  return useMutation<unknown, Error, { id: string; payload: Partial<LearningRoadmap> }, CollectionRollbackContext<LearningRoadmap>>({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LearningRoadmap> }) =>
      roadmapService.updateRoadmap(id, payload),
    onMutate: ({ id, payload }) =>
      optimisticUpdateCollection<LearningRoadmap>(queryClient, roadmapAdminKeys.all, (roadmaps) =>
        roadmaps.map((r) => (r._id === id ? { ...r, ...payload } : r))
      ),
    onError: (_err, _vars, context) => rollbackCollection<LearningRoadmap>(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: roadmapAdminKeys.all })
    },
  })
}

export function useDeleteRoadmapMutation() {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, string, CollectionRollbackContext<LearningRoadmap>>({
    mutationFn: (id: string) => roadmapService.deleteRoadmap(id),
    onMutate: (id: string) =>
      optimisticUpdateCollection<LearningRoadmap>(queryClient, roadmapAdminKeys.all, (roadmaps) =>
        roadmaps.filter((r) => r._id !== id)
      ),
    onError: (_err, _id, context) => rollbackCollection<LearningRoadmap>(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: roadmapAdminKeys.all })
    },
  })
}

// Hook để lấy và lưu bộ nhớ đệm ngữ cảnh luyện tập từ dịch vụ luyện tập.

import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  practiceService,
  type CreatePracticeContextPayload,
  type PracticeContext,
  type UpdatePracticeContextPayload,
} from '@/features/practice/services/practice.service'

export interface ContextOption {
  value: string
  label: string
  labelVi: string
  level: number
  parentId?: string
}

export interface GroupedContexts {
  level0: PracticeContext[]
  level1: PracticeContext[]
  level2: PracticeContext[]
}

export function usePracticeContexts() {
  const { data: contexts = [], isLoading, error, refetch } = useQuery<PracticeContext[]>({
    queryKey: ['practice-contexts'],
    queryFn: () => practiceService.getContexts(),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  const grouped: GroupedContexts = useMemo(() => ({
    level0: contexts.filter((c) => c.level === 0),
    level1: contexts.filter((c) => c.level === 1),
    level2: contexts.filter((c) => c.level === 2),
  }), [contexts])

  const allOptions: ContextOption[] = useMemo(() => contexts.map((c) => {
    const enLabel = c.name_en || c.name || c.code
    const viLabel = c.name_vi || enLabel
    return {
      value: c._id,
      label: enLabel,
      labelVi: viLabel,
      level: c.level,
      parentId: c.parent_id,
    }
  }), [contexts])

  const getChildren = useCallback((parentId: string): ContextOption[] => {
    return allOptions.filter((c) => c.parentId === parentId)
  }, [allOptions])

  const getContextById = useCallback((id: string): PracticeContext | undefined => {
    return contexts.find((c) => c._id === id)
  }, [contexts])

  const hierarchyOptions = useMemo(() => {
    return grouped.level0.map((l0) => {
      const level2Map = new Map<string, ContextOption[]>()
      grouped.level2
        .filter((l2) => {
          const l1Parent = grouped.level1.find((l1) => l1._id === l2.parent_id)
          return l1Parent?.parent_id === l0._id
        })
        .forEach((l2) => {
          const parentId = l2.parent_id || ''
          const enLabel = l2.name_en || l2.name || l2.code
          const viLabel = l2.name_vi || enLabel
          const item: ContextOption = {
            value: l2._id,
            label: enLabel,
            labelVi: viLabel,
            level: 2,
            parentId: l2.parent_id,
          }
          const existing = level2Map.get(parentId) || []
          existing.push(item)
          level2Map.set(parentId, existing)
        })

      const l0En = l0.name_en || l0.name || l0.code
      const l0Vi = l0.name_vi || l0En

      return {
        level0: {
          value: l0._id,
          label: l0En,
          labelVi: l0Vi,
          level: 0,
        },
        level1Options: grouped.level1
          .filter((l1) => l1.parent_id === l0._id)
          .map((l1) => {
            const l1En = l1.name_en || l1.name || l1.code
            const l1Vi = l1.name_vi || l1En
            return {
              value: l1._id,
              label: l1En,
              labelVi: l1Vi,
              level: 1,
              parentId: l1.parent_id,
            }
          }),
        level2ByParent: level2Map,
      }
    })
  }, [grouped])

  return {
    contexts,
    grouped,
    allOptions,
    hierarchyOptions,
    getChildren,
    getContextById,
    isLoading,
    error,
    refetch,
  }
}

export function usePracticeContextsAdmin(options?: { status?: string; include_disabled?: boolean }) {
  const { include_disabled = true, status } = options || {}
  const queryClient = useQueryClient()

  const query = useQuery<PracticeContext[]>({
    queryKey: ['practice-contexts-admin', { status, include_disabled }],
    queryFn: () => practiceService.getContexts({ include_disabled, status }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreatePracticeContextPayload) => practiceService.createContext(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-contexts-admin'] })
      queryClient.invalidateQueries({ queryKey: ['practice-contexts'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePracticeContextPayload }) =>
      practiceService.updateContext(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-contexts-admin'] })
      queryClient.invalidateQueries({ queryKey: ['practice-contexts'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => practiceService.deleteContext(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-contexts-admin'] })
      queryClient.invalidateQueries({ queryKey: ['practice-contexts'] })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) => practiceService.reorderContexts(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-contexts-admin'] })
      queryClient.invalidateQueries({ queryKey: ['practice-contexts'] })
    },
  })

  return {
    ...query,
    contexts: query.data || [],
    createContext: createMutation,
    updateContext: updateMutation,
    deleteContext: deleteMutation,
    reorderContexts: reorderMutation,
  }
}

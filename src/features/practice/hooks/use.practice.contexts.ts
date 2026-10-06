// Hook để lấy và lưu bộ nhớ đệm ngữ cảnh luyện tập từ dịch vụ luyện tập.

import { useQuery } from '@tanstack/react-query'
import { practiceService, type PracticeContext } from '@/features/practice/services/practice.service'

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
  const { data: contexts = [], isLoading, error } = useQuery<PracticeContext[]>({
    queryKey: ['practice-contexts'],
    queryFn: () => practiceService.getContexts(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const grouped: GroupedContexts = {
    level0: contexts.filter((c) => c.level === 0),
    level1: contexts.filter((c) => c.level === 1),
    level2: contexts.filter((c) => c.level === 2),
  }

  const allOptions: ContextOption[] = contexts.map((c) => ({
    value: c._id,
    label: c.name,
    labelVi: c.name_vi || c.name,
    level: c.level,
    parentId: c.parent_id,
  }))

  const getChildren = (parentId: string): ContextOption[] => {
    return allOptions.filter((c) => c.parentId === parentId)
  }

  const getContextById = (id: string): PracticeContext | undefined => {
    return contexts.find((c) => c._id === id)
  }

  const hierarchyOptions: Array<{
    level0: ContextOption
    level1Options: ContextOption[]
    level2ByParent: Map<string, ContextOption[]>
  }> = grouped.level0.map((l0) => {
    const level2Map = new Map<string, ContextOption[]>()
    grouped.level2
      .filter((l2) => {
        const l1Parent = grouped.level1.find((l1) => l1._id === l2.parent_id)
        return l1Parent?.parent_id === l0._id
      })
      .forEach((l2) => {
        const parentId = l2.parent_id || ''
        const item: ContextOption = {
          value: l2._id,
          label: l2.name,
          labelVi: l2.name_vi || l2.name,
          level: 2,
          parentId: l2.parent_id,
        }
        const existing = level2Map.get(parentId) || []
        existing.push(item)
        level2Map.set(parentId, existing)
      })

    return {
      level0: {
        value: l0._id,
        label: l0.name,
        labelVi: l0.name_vi || l0.name,
        level: 0,
      },
      level1Options: grouped.level1
        .filter((l1) => l1.parent_id === l0._id)
        .map((l1) => ({
          value: l1._id,
          label: l1.name,
          labelVi: l1.name_vi || l1.name,
          level: 1,
          parentId: l1.parent_id,
        })),
      level2ByParent: level2Map,
    }
  })

  return {
    contexts,
    grouped,
    allOptions,
    hierarchyOptions,
    getChildren,
    getContextById,
    isLoading,
    error,
  }
}

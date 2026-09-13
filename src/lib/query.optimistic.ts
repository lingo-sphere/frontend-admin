// Tiện ích hỗ trợ cập nhật lạc quan và hoàn tác bộ nhớ đệm danh sách TanStack Query
import type { QueryClient } from '@tanstack/react-query'

export interface CollectionRollbackContext<TItem> {
  previousDataMap: Array<{ queryKey: readonly unknown[]; data: unknown }>
}

export async function optimisticUpdateCollection<TItem>(
  queryClient: QueryClient,
  rootKey: readonly unknown[],
  updater: (items: TItem[]) => TItem[]
): Promise<CollectionRollbackContext<TItem>> {
  await queryClient.cancelQueries({ queryKey: rootKey })
  const queryCache = queryClient.getQueryCache()
  const queries = queryCache.findAll({ queryKey: rootKey })
  const previousDataMap: Array<{ queryKey: readonly unknown[]; data: unknown }> = []

  queries.forEach((q) => {
    const prev = q.state.data
    if (Array.isArray(prev)) {
      previousDataMap.push({ queryKey: q.queryKey, data: prev })
      queryClient.setQueryData<TItem[]>(q.queryKey, updater(prev))
    } else if (prev && typeof prev === 'object' && 'items' in prev && Array.isArray((prev as { items: TItem[] }).items)) {
      const paginated = prev as { items: TItem[]; [key: string]: unknown }
      previousDataMap.push({ queryKey: q.queryKey, data: paginated })
      queryClient.setQueryData(q.queryKey, {
        ...paginated,
        items: updater(paginated.items),
      })
    }
  })

  return { previousDataMap }
}

export function rollbackCollection<TItem>(
  queryClient: QueryClient,
  context?: CollectionRollbackContext<TItem>
): void {
  if (context?.previousDataMap) {
    context.previousDataMap.forEach(({ queryKey, data }) => {
      queryClient.setQueryData(queryKey, data)
    })
  }
}

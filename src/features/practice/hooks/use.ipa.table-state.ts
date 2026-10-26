import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from '@/hooks/use.debounce'
import type { IpaAdminQuery } from '../types/ipa-admin.types'

export type IpaFilters = Record<string, string[]>
export function parseIpaFilters(raw: string | null): IpaFilters {
  try {
    const result: unknown = JSON.parse(raw || '{}')
    if (!result || typeof result !== 'object' || Array.isArray(result)) return {}
    return Object.fromEntries(Object.entries(result).filter(([, value]) => Array.isArray(value) && value.every(item => typeof item === 'string')))
  } catch { return {} }
}

export function useIpaTableState() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') || ''
  const debouncedSearch = useDebounce(search, 300)
  const filters = useMemo(() => parseIpaFilters(params.get('filters')), [params])
  const page = Math.max(1, Number(params.get('page')) || 1)
  const limit = [10, 20, 50, 100].includes(Number(params.get('limit'))) ? Number(params.get('limit')) : 10
  const query: IpaAdminQuery = { page, limit, search: debouncedSearch || undefined, filters: JSON.stringify(filters), sort: params.get('sort') || 'created_at', order: params.get('order') === 'asc' ? 'asc' : 'desc', trash: params.get('trash') === 'true' ? 'true' : 'false' }
  const change = (patch: Record<string, string | undefined>) => setParams(previous => {
    const next = new URLSearchParams(previous)
    Object.entries(patch).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
    return next
  }, { replace: true })
  const setFilter = (field: string, values: string[]) => {
    const next = { ...filters }
    if (values.length) next[field] = values
    else delete next[field]
    change({ filters: JSON.stringify(next), page: '1' })
  }
  const switchTab = (tab: string) => {
    change({ tab, filters: undefined, page: '1', sort: undefined, order: undefined, trash: undefined, search: undefined })
  }
  return {
    query, filters, search, change, setFilter, switchTab,
    reset: () => change({ filters: undefined, search: undefined, sort: undefined, order: undefined, page: '1' }),
    setSearch: (value: string) => change({ search: value || undefined, page: '1' }),
    setFilters: (next: IpaFilters) => change({ filters: JSON.stringify(next), page: '1' }),
  }
}

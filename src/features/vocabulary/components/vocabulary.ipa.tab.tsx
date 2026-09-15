/**
 * @file vocabulary.ipa.tab.tsx
 * @description Tab IPA symbols - dùng DataTable chung
 */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { toast } from '@/store/toast.store'
import { DataTable } from '@/components/data.table'
import type { IpaSymbol } from '@/features/vocabulary/data/vocabulary.data'
import { getIpaColumns } from '@/features/vocabulary/components/vocabulary.ipa.columns'
import { IpaSymbolDetailModal } from '@/features/vocabulary/components/ipa.symbol.detail.modal'
import { IpaSymbolEditModal } from '@/features/vocabulary/components/ipa.symbol.edit.modal'
import {
  useVocabularyIpaSymbolsQuery,
  useUpdateIpaSymbolMutation,
} from '@/features/vocabulary/hooks/use.vocabulary.admin.query'

interface VocabularyIpaTabProps {
  onEditIpaSymbol?: (symbol: IpaSymbol) => void
}

export function VocabularyIpaTab({ onEditIpaSymbol }: VocabularyIpaTabProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [searchSymbol, setSearchSymbol] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<string | null>('symbol')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')

  // Detail modal
  const [detailSymbol, setDetailSymbol] = useState<IpaSymbol | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Edit modal
  const [editSymbol, setEditSymbol] = useState<IpaSymbol | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: symbols = [], isLoading, refetch } = useVocabularyIpaSymbolsQuery()
  const { mutateAsync: updateSymbol } = useUpdateIpaSymbolMutation()

  const filteredSymbols = useMemo(() => {
    let list = symbols
    if (searchSymbol) {
      const q = searchSymbol.toLowerCase()
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          (s.example_word || '').toLowerCase().includes(q) ||
          (s.description_en || '').toLowerCase().includes(q) ||
          (s.description_vi || '').toLowerCase().includes(q)
      )
    }
    if (filterType !== 'ALL') {
      list = list.filter((s) => s.symbol_type === filterType)
    }
    if (sortKey && sortOrder) {
      const sorted = [...list].sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[sortKey]
        const bv = (b as unknown as Record<string, unknown>)[sortKey]
        const as = av === undefined || av === null ? '' : String(av)
        const bs = bv === undefined || bv === null ? '' : String(bv)
        const cmp = as.localeCompare(bs)
        return sortOrder === 'asc' ? cmp : -cmp
      })
      return sorted
    }
    return list
  }, [symbols, searchSymbol, filterType, sortKey, sortOrder])

  const paginatedSymbols = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredSymbols.slice(start, start + pageSize)
  }, [filteredSymbols, currentPage, pageSize])

  const handleView = (s: IpaSymbol) => {
    setDetailSymbol(s)
    setIsDetailOpen(true)
  }

  const handleEdit = (s: IpaSymbol) => {
    setEditSymbol(s)
    setIsEditOpen(true)
  }

  const handleUpdateSymbol = async (id: string, data: Partial<IpaSymbol>) => {
    try {
      await updateSymbol({ id, payload: data })
      toast.success(isVi ? 'Đã cập nhật!' : 'Updated!')
      refetch()
    } catch {
      toast.error(isVi ? 'Cập nhật thất bại' : 'Update failed')
      throw new Error('Update failed')
    }
  }

  const handleResetFilters = () => {
    setSearchSymbol('')
    setFilterType('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
  }

  const columns = useMemo(
    () =>
      getIpaColumns({
        isVi,
        onViewSymbol: handleView,
        onEditSymbol: handleEdit,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVi]
  )

  const typeOptions: { value: string; label: string }[] = [
    { value: 'ALL', label: isVi ? 'Tất cả loại' : 'All types' },
    { value: 'VOWEL', label: isVi ? 'Nguyên âm' : 'Vowel' },
    { value: 'CONSONANT', label: isVi ? 'Phụ âm' : 'Consonant' },
    { value: 'DIPHTHONG', label: isVi ? 'Nguyên âm đôi' : 'Diphthong' },
  ]

  return (
    <div className="space-y-4">
      <DataTable<IpaSymbol>
        columns={columns}
        data={paginatedSymbols}
        rowKey={(s) => s.id}
        isLoading={isLoading}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortChange={(k, o) => {
          setSortKey(k)
          setSortOrder(o)
          setCurrentPage(1)
        }}
        onResetFilters={handleResetFilters}
        onRowClick={handleView}
        filterSlot={
          <>
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={searchSymbol}
                onChange={(e) => {
                  setSearchSymbol(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder={isVi ? 'Tìm kiếm ký hiệu, từ mẫu...' : 'Search symbol, example word...'}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </>
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredSymbols.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setCurrentPage(1)
          },
        }}
      />

      <IpaSymbolDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setDetailSymbol(null)
        }}
        symbol={detailSymbol}
      />

      <IpaSymbolEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setEditSymbol(null)
        }}
        symbol={editSymbol}
        onUpdate={handleUpdateSymbol}
      />
    </div>
  )
}

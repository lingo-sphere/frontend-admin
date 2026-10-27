// Component hiển thị nhật ký hoạt động người học chuẩn hóa theo thiết kế DataTable dùng chung.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X, Target, BookOpenCheck, Mic, GraduationCap } from 'lucide-react'
import type { UserActivityLog } from '@/types/api.types'
import { CustomSelect } from '@/components/custom.select'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { renderTableDate } from '@/components/table.row.actions'

interface ProgressActivityLogsTabProps {
  logs: UserActivityLog[]
  search: string
  actionFilter: string
  onSearchChange: (val: string) => void
  onActionFilterChange: (val: string) => void
}

export function ProgressActivityLogsTab({
  logs,
  search,
  actionFilter,
  onSearchChange,
  onActionFilterChange,
}: ProgressActivityLogsTabProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const actionOptions = useMemo(() => [
    { value: 'ALL', label: isVi ? 'Tất cả hành động' : 'All Actions' },
    { value: 'TOEIC_TEST', label: isVi ? 'Làm bài thi TOEIC' : 'Take TOEIC Test' },
    { value: 'VOCAB_STUDY', label: isVi ? 'Học từ vựng Flashcard' : 'Study Flashcards' },
    { value: 'AI_CHAT', label: isVi ? 'Luyện nói với AI' : 'Practice with AI' },
  ], [isVi])

  const getIcon = (type: string) => {
    switch (type) {
      case 'TOEIC_TEST':
        return Target
      case 'VOCAB_STUDY':
        return BookOpenCheck
      case 'AI_CHAT':
        return Mic
      default:
        return GraduationCap
    }
  }

  const filteredLogs = useMemo(() => {
    const list = logs.filter((log) => {
      const matchSearch =
        search === '' ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(search.toLowerCase())
      const matchAction = actionFilter === 'ALL' || log.actionType === actionFilter
      return matchSearch && matchAction
    })

    if (!sortKey || !sortOrder) return list

    return [...list].sort((a, b) => {
      let valA: string | number = ''
      let valB: string | number = ''

      if (sortKey === 'userName') {
        valA = a.userName.toLowerCase()
        valB = b.userName.toLowerCase()
      } else if (sortKey === 'actionType') {
        valA = a.actionType
        valB = b.actionType
      } else if (sortKey === 'scoreOrXP') {
        valA = a.scoreOrXP || ''
        valB = b.scoreOrXP || ''
      } else if (sortKey === 'timestamp') {
        valA = new Date(a.timestamp).getTime()
        valB = new Date(b.timestamp).getTime()
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [logs, search, actionFilter, sortKey, sortOrder])

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  const handleResetFilters = () => {
    onSearchChange('')
    onActionFilterChange('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
  }

  const columns: DataTableColumn<UserActivityLog>[] = useMemo(() => [
    {
      key: 'userName',
      title: isVi ? 'Học viên' : 'Learner',
      sortable: true,
      align: 'left',
      render: (log) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {log.userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {log.userName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{log.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'actionType',
      title: isVi ? 'Hành động' : 'Action',
      sortable: true,
      align: 'center',
      render: (log) => {
        const Icon = getIcon(log.actionType)
        return (
          <div className="inline-flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-xs text-slate-700 dark:text-slate-300">
              {isVi ? log.actionNameVi : log.actionNameEn || log.actionNameVi}
            </span>
          </div>
        )
      },
    },
    {
      key: 'scoreOrXP',
      title: isVi ? 'Điểm / XP' : 'Score / XP',
      sortable: true,
      align: 'center',
      render: (log) => (
        <span className="font-bold text-teal-600 dark:text-teal-400">
          {log.scoreOrXP || '-'}
        </span>
      ),
    },
    {
      key: 'timestamp',
      title: isVi ? 'Thời gian' : 'Timestamp',
      width: '130px',
      sortable: true,
      align: 'center',
      render: (log) => renderTableDate(log.timestamp),
    },
  ], [isVi])

  const filterSlot = (
    <>
      <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            setCurrentPage(1)
          }}
          placeholder={isVi ? 'Tìm tên học viên, email...' : 'Search by learner name, email...'}
          className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('')
              setCurrentPage(1)
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <CustomSelect
        value={actionFilter}
        onChange={(val) => {
          onActionFilterChange(val)
          setCurrentPage(1)
        }}
        options={actionOptions}
        className="w-56"
      />
    </>
  )

  return (
    <DataTable<UserActivityLog>
      columns={columns}
      data={paginatedLogs}
      rowKey={(log) => log.id}
      filterSlot={filterSlot}
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSortChange={(k, o) => {
        setSortKey(k || null)
        setSortOrder(o || null)
      }}
      onResetFilters={handleResetFilters}
      pagination={{
        currentPage,
        pageSize,
        totalItems: filteredLogs.length,
        onPageChange: setCurrentPage,
        onPageSizeChange: (size) => {
          setPageSize(size)
          setCurrentPage(1)
        },
      }}
    />
  )
}



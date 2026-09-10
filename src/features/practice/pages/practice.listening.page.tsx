/**
 * @file practice.listening.page.tsx
 * @description Trang quản trị PracticeListeningPage trong giao diện Admin
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, Search, Headphones } from 'lucide-react'
import { practiceService } from '@/features/practice/services/practice.service'
import { toast } from '@/store/toast.store'
import type { ListeningExercise } from '@/types/api.types'
import { PracticeListeningCard } from '@/features/practice/components/practice.listening.card'
import { CreateListeningModal } from '@/features/practice/components/create.listening.modal'
import { CustomSelect } from '@/components/custom.select'
import { Pagination } from '@/components/pagination'

export function PracticeListeningPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [exercises, setExercises] = useState<ListeningExercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [showAddModal, setShowAddModal] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'DICTATION' | 'MULTIPLE_CHOICE' | 'FILL_BLANK'>('DICTATION')
  const [newAudioUrl, setNewAudioUrl] = useState('')
  const [newDuration, setNewDuration] = useState(45)

  const fetchExercises = async () => {
    setIsLoading(true)
    try {
      const data = await practiceService.getAllListeningExercises()
      setExercises(Array.isArray(data) ? data : [])
    } catch {
      setExercises([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [])

  const handleDelete = (id: string) => {
    setExercises((prev) => prev.filter((e) => e._id !== id))
    toast.success('Đã xóa bài luyện nghe thành công!')
  }

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchType = filterType === 'ALL' || ex.exercise_type === filterType
      return matchSearch && matchType
    })
  }, [exercises, searchQuery, filterType])

  const totalPages = Math.ceil(filteredExercises.length / pageSize) || 1

  const paginatedExercises = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExercises.slice(start, start + pageSize)
  }, [filteredExercises, currentPage, pageSize])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newItem: ListeningExercise = {
      _id: `list_${Date.now()}`,
      title: newTitle,
      exercise_type: newType,
      audio_url: newAudioUrl,
      duration_seconds: newDuration,
      difficulty: 'INTERMEDIATE',
      transcript: '',
    }
    setExercises([newItem, ...exercises])
    toast.success('Tạo bài luyện nghe mới thành công!')
    setShowAddModal(false)
    setNewTitle('')
    setNewAudioUrl('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Headphones className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            <span>Luyện Nghe TOEIC Listening (Part 1 - 4)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý kho bài nghe, audio transcript và bài tập Dictation chép chính tả
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchExercises}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bài nghe mới</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isVi ? 'Tìm kiếm theo tiêu đề bài nghe...' : 'Search listening exercises...'}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <CustomSelect
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'ALL', label: isVi ? 'Tất cả định dạng' : 'All Formats' },
            { value: 'DICTATION', label: isVi ? 'Chép chính tả' : 'Dictation' },
            { value: 'MULTIPLE_CHOICE', label: isVi ? 'Trắc nghiệm nghe' : 'Multiple Choice' },
            { value: 'FILL_BLANK', label: isVi ? 'Điền từ còn thiếu' : 'Fill in Blank' },
          ]}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedExercises.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            {isVi ? 'Không tìm thấy bài nghe nào phù hợp' : 'No listening exercises found'}
          </div>
        ) : (
          paginatedExercises.map((item) => (
            <PracticeListeningCard
              key={item._id}
              item={item}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {filteredExercises.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[6, 9, 18, 36]}
          totalItems={filteredExercises.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      )}

      <CreateListeningModal
        isOpen={showAddModal}
        title={newTitle}
        type={newType}
        audioUrl={newAudioUrl}
        totalQuestions={newDuration}
        onTitleChange={setNewTitle}
        onTypeChange={(val) => setNewType(val as 'DICTATION' | 'MULTIPLE_CHOICE' | 'FILL_BLANK')}
        onAudioUrlChange={setNewAudioUrl}
        onTotalQuestionsChange={setNewDuration}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

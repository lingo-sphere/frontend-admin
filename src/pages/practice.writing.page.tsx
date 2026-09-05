/**
 * @file practice.writing.page.tsx
 * @description Trang quản trị PracticeWritingPage trong giao diện Admin
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, Search, PenTool } from 'lucide-react'
import { practiceService } from '@/services/practice.service'
import { toast } from '@/store/toast.store'
import type { WritingExercise } from '@/types/api.types'
import { PracticeWritingCard } from '@/components/practice/practice.writing.card'
import { CreateWritingModal } from '@/components/practice/create.writing.modal'
import { Pagination } from '@/components/common/pagination'

export function PracticeWritingPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [exercises, setExercises] = useState<WritingExercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [showAddModal, setShowAddModal] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('EMAIL_REPLY')
  const [newPrompt, setNewPrompt] = useState('')
  const [newMinWords, setNewMinWords] = useState(50)
  const [newMaxWords, setNewMaxWords] = useState(100)

  const fetchExercises = async () => {
    setIsLoading(true)
    try {
      const data = await practiceService.getAllWritingExercises()
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
    toast.success('Đã xóa đề bài luyện viết thành công!')
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newPrompt.trim()) return

    const newItem: WritingExercise = {
      _id: `wrt_${Date.now()}`,
      title: newTitle,
      topic: newType,
      prompt: newPrompt,
      min_words: newMinWords,
      difficulty: 'INTERMEDIATE',
    }
    setExercises([newItem, ...exercises])
    toast.success('Tạo đề bài luyện viết mới thành công!')
    setShowAddModal(false)
    setNewTitle('')
    setNewPrompt('')
  }

  const filteredExercises = useMemo(() => {
    return exercises.filter(
      (e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.prompt && e.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [exercises, searchQuery])

  const totalPages = Math.ceil(filteredExercises.length / pageSize) || 1

  const paginatedExercises = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExercises.slice(start, start + pageSize)
  }, [filteredExercises, currentPage, pageSize])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <PenTool className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>{isVi ? 'Quản Lý Luyện Viết & Luận TOEIC' : 'Writing & Essay Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Ngân hàng đề thi viết luận, phản hồi Email kinh doanh và chấm điểm ngữ pháp bằng AI'
              : 'Writing prompts and business email exercises with AI automated grading'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchExercises}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Thêm đề viết mới' : 'Add Writing'}</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isVi ? 'Tìm kiếm đề viết theo tiêu đề, ngữ cảnh...' : 'Search writing exercises...'}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedExercises.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            {isVi ? 'Không tìm thấy đề luyện viết nào phù hợp' : 'No writing exercises found'}
          </div>
        ) : (
          paginatedExercises.map((item) => (
            <PracticeWritingCard
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

      <CreateWritingModal
        isOpen={showAddModal}
        title={newTitle}
        type={newType}
        prompt={newPrompt}
        minWords={newMinWords}
        maxWords={newMaxWords}
        onTitleChange={setNewTitle}
        onTypeChange={setNewType}
        onPromptChange={setNewPrompt}
        onMinWordsChange={setNewMinWords}
        onMaxWordsChange={setNewMaxWords}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

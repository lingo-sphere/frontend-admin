// Trang quản trị bài tập luyện nói TOEIC trong giao diện Admin.
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, Search, Mic } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { practiceService } from '@/features/practice/services/practice.service'
import { toast } from '@/store/toast.store'
import type { SpeakingExercise } from '@/types/api.types'
import { PracticeSpeakingCard } from '@/features/practice/components/practice.speaking.card'
import { CreateSpeakingModal } from '@/features/practice/components/create.speaking.modal'
import { Pagination } from '@/components/pagination'

export function PracticeSpeakingPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [exercises, setExercises] = useState<SpeakingExercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [showAddModal, setShowAddModal] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('READ_ALOUD')
  const [newSentence, setNewSentence] = useState('')
  const [newAccuracy, setNewAccuracy] = useState(75)

  const fetchExercises = async () => {
    setIsLoading(true)
    try {
      const data = await practiceService.getAllSpeakingExercises()
      setExercises(Array.isArray(data) ? data : [])
    } catch {
      setExercises([])
    } finally {
      setIsLoading(false)
    }
  }

  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(fetchExercises)

  useEffect(() => {
    fetchExercises()
  }, [])

  const handleDelete = (id: string) => {
    setExercises((prev) => prev.filter((e) => e._id !== id))
    toast.success('Đã xóa bài luyện nói thành công!')
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newSentence.trim()) return

    const newItem: SpeakingExercise = {
      _id: `spk_${Date.now()}`,
      title: newTitle,
      prompt_text: newSentence,
      difficulty: 'INTERMEDIATE',
    }
    setExercises([newItem, ...exercises])
    toast.success('Tạo bài luyện nói mới thành công!')
    setShowAddModal(false)
    setNewTitle('')
    setNewSentence('')
  }

  const filteredExercises = useMemo(() => {
    return exercises.filter(
      (e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.prompt_text && e.prompt_text.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <Mic className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>{isVi ? 'Quản Lý Luyện Nói & Phát Âm' : 'Speaking & Pronunciation Management'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Ngân hàng bài tập luyện nói, phát âm chuẩn IPA và chấm điểm tự động bằng mô hình AI'
              : 'Speaking exercise bank with IPA pronunciation assessment powered by AI'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Thêm bài nói mới' : 'Add Speaking'}</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isVi ? 'Tìm kiếm bài luyện nói theo tiêu đề, câu văn...' : 'Search speaking exercises...'}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedExercises.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            {isVi ? 'Không tìm thấy bài luyện nói nào phù hợp' : 'No speaking exercises found'}
          </div>
        ) : (
          paginatedExercises.map((item) => (
            <PracticeSpeakingCard
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

      <CreateSpeakingModal
        isOpen={showAddModal}
        title={newTitle}
        type={newType}
        sentence={newSentence}
        accuracy={newAccuracy}
        onTitleChange={setNewTitle}
        onTypeChange={setNewType}
        onSentenceChange={setNewSentence}
        onAccuracyChange={setNewAccuracy}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

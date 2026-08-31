import { useState, useEffect } from 'react'
import { Plus, RotateCcw, Search, PenTool } from 'lucide-react'
import { practiceService } from '@/services/practice.service'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { WritingExercise } from '@/types/api.types'
import { PracticeWritingCard } from '@/components/practice/PracticeWritingCard'
import { CreateWritingModal } from '@/components/practice/CreateWritingModal'
import { INITIAL_WRITING_EXERCISES } from '@/helpers/practice.helper'

export function PracticeWritingPage() {
  const [exercises, setExercises] = useState<WritingExercise[]>(INITIAL_WRITING_EXERCISES)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
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
      if (data && data.length > 0) {
        setExercises(data)
      }
    } catch {

    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [])

  const handleDelete = () => {
    if (!deleteTargetId) return
    setExercises((prev) => prev.filter((e) => e._id !== deleteTargetId))
    toast.success('Đã xóa đề bài luyện viết')
    setDeleteTargetId(null)
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

  const filteredExercises = exercises.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <PenTool className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>Luyện Viết TOEIC Writing & Essay AI Grading</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các đề viết Email, viết đoạn văn miêu tả và hệ thống gợi ý từ vựng chuyên ngành
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
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm đề viết mới</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm đề viết theo tiêu đề, ngữ cảnh..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Không tìm thấy đề luyện viết nào phù hợp
          </div>
        ) : (
          filteredExercises.map((item) => (
            <PracticeWritingCard
              key={item._id}
              item={item}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))
        )}
      </div>

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

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa đề luyện viết?"
        message="Học viên sẽ không thể tiếp tục làm bài viết này nữa."
        confirmText="Xóa đề viết"
        cancelText="Hủy bỏ"
        variant="danger"
      />
    </div>
  )
}

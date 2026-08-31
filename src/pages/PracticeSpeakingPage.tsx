import { useState, useEffect } from 'react'
import { Plus, RotateCcw, Search, Mic } from 'lucide-react'
import { practiceService } from '@/services/practice.service'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { SpeakingExercise } from '@/types/api.types'
import { PracticeSpeakingCard } from '@/components/practice/PracticeSpeakingCard'
import { CreateSpeakingModal } from '@/components/practice/CreateSpeakingModal'
import { INITIAL_SPEAKING_EXERCISES } from '@/helpers/practice.helper'

export function PracticeSpeakingPage() {
  const [exercises, setExercises] = useState<SpeakingExercise[]>(INITIAL_SPEAKING_EXERCISES)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('READ_ALOUD')
  const [newSentence, setNewSentence] = useState('')
  const [newAccuracy, setNewAccuracy] = useState(75)

  const fetchExercises = async () => {
    setIsLoading(true)
    try {
      const data = await practiceService.getAllSpeakingExercises()
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
    toast.success('Đã xóa bài luyện nói')
    setDeleteTargetId(null)
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

  const filteredExercises = exercises.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.prompt_text && e.prompt_text.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Mic className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Luyện Phát Âm & TOEIC Speaking AI Whisper</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các đề luyện nói, câu đọc mẫu và chuẩn chấm điểm phát âm bằng AI
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
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bài nói mới</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm bài luyện nói theo tiêu đề, câu văn..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Không tìm thấy bài luyện nói nào phù hợp
          </div>
        ) : (
          filteredExercises.map((item) => (
            <PracticeSpeakingCard
              key={item._id}
              item={item}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))
        )}
      </div>

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

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bài luyện nói?"
        message="Học viên sẽ không thể tiếp tục ghi âm và chấm bài với câu luyện nói này."
        confirmText="Xóa bài nói"
        cancelText="Hủy bỏ"
        variant="danger"
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Plus, RotateCcw, Search, Headphones } from 'lucide-react'
import { practiceService } from '@/services/practice.service'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { ListeningExercise } from '@/types/api.types'
import { PracticeListeningCard } from '@/components/practice/PracticeListeningCard'
import { CreateListeningModal } from '@/components/practice/CreateListeningModal'
import { INITIAL_LISTENING_EXERCISES } from '@/helpers/practice.helper'

export function PracticeListeningPage() {
  const [exercises, setExercises] = useState<ListeningExercise[]>(INITIAL_LISTENING_EXERCISES)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'DICTATION' | 'MULTIPLE_CHOICE' | 'FILL_BLANK'>('DICTATION')
  const [newAudioUrl, setNewAudioUrl] = useState('')
  const [newDuration, setNewDuration] = useState(45)

  const fetchExercises = async () => {
    setIsLoading(true)
    try {
      const data = await practiceService.getAllListeningExercises()
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
    toast.success('Đã xóa bài luyện nghe')
    setDeleteTargetId(null)
  }

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

  const filteredExercises = exercises.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = filterType === 'ALL' || e.exercise_type === filterType
    return matchSearch && matchType
  })

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
            placeholder="Tìm kiếm theo tiêu đề bài nghe..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">Tất cả định dạng</option>
          <option value="DICTATION">Chép chính tả (Dictation)</option>
          <option value="MULTIPLE_CHOICE">Trắc nghiệm nghe (Multiple Choice)</option>
          <option value="FILL_BLANK">Điền từ còn thiếu (Fill in Blank)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Không tìm thấy bài nghe nào phù hợp
          </div>
        ) : (
          filteredExercises.map((item) => (
            <PracticeListeningCard
              key={item._id}
              item={item}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))
        )}
      </div>

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

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bài luyện nghe?"
        message="Dữ liệu bài nghe và các câu hỏi đính kèm sẽ bị xóa."
        confirmText="Xóa bài nghe"
        cancelText="Hủy bỏ"
        variant="danger"
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, Search, Award } from 'lucide-react'
import { practiceService } from '@/services/practice.service'
import { toast } from '@/store/toast-store'
import type { PracticeSet } from '@/types/api.types'
import { PracticeSetCard } from '@/components/practice/PracticeSetCard'
import { CreatePracticeSetModal } from '@/components/practice/CreatePracticeSetModal'
import { INITIAL_PRACTICE_SETS } from '@/helpers/practice.helper'
import { CustomSelect } from '@/components/common/CustomSelect'

export function PracticeExercisesPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>(INITIAL_PRACTICE_SETS)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState('GRAMMAR')
  const [newDifficulty, setNewDifficulty] = useState('INTERMEDIATE')
  const [newTotalQuestions, setNewTotalQuestions] = useState(30)
  const [newDuration, setNewDuration] = useState(30)

  const fetchSets = async () => {
    setIsLoading(true)
    try {
      const data = await practiceService.getAllPracticeSets()
      if (data && data.length > 0) {
        setPracticeSets(data)
      }
    } catch {

    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSets()
  }, [])

  const handleToggleStatus = (id: string, current: boolean) => {
    setPracticeSets((prev) =>
      prev.map((s) => (s._id === id ? { ...s, is_active: !current } : s))
    )
    toast.success('Đã cập nhật trạng thái bộ bài tập')
  }

  const handleDelete = (id: string) => {
    setPracticeSets((prev) => prev.filter((s) => s._id !== id))
    toast.success('Đã xóa bộ bài tập luyện thi')
  }

  const handleCreateSet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newSet: PracticeSet = {
      _id: `pset_${Date.now()}`,
      title: newTitle,
      description: newDesc,
      category: newCategory,
      difficulty: newDifficulty,
      total_questions: newTotalQuestions,
      duration_minutes: newDuration,
      is_active: true,
    }
    setPracticeSets([newSet, ...practiceSets])
    toast.success('Tạo bộ bài tập luyện thi mới thành công!')
    setShowAddModal(false)
    setNewTitle('')
    setNewDesc('')
  }

  const filteredSets = practiceSets.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = filterCategory === 'ALL' || s.category === filterCategory
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Award className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Ngân Hàng Bài Tập Luyện Thi (Practice Sets)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các bộ câu hỏi luyện Ngữ pháp, Từ vựng và Đọc hiểu Part 5 & 6 theo chuyên đề
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSets}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bộ bài tập mới</span>
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
            placeholder={isVi ? 'Tìm kiếm theo tiêu đề bài tập...' : 'Search practice exercises...'}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <CustomSelect
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { value: 'ALL', label: isVi ? 'Tất cả phân loại' : 'All Categories' },
            { value: 'GRAMMAR', label: isVi ? 'Ngữ pháp' : 'Grammar' },
            { value: 'VOCABULARY', label: isVi ? 'Từ vựng' : 'Vocabulary' },
            { value: 'TOEIC_READING', label: isVi ? 'Đọc hiểu TOEIC' : 'TOEIC Reading' },
          ]}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSets.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Không tìm thấy bộ bài tập nào phù hợp
          </div>
        ) : (
          filteredSets.map((set) => (
            <PracticeSetCard
              key={set._id}
              set={set}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <CreatePracticeSetModal
        isOpen={showAddModal}
        title={newTitle}
        description={newDesc}
        category={newCategory}
        difficulty={newDifficulty}
        totalQuestions={newTotalQuestions}
        duration={newDuration}
        onTitleChange={setNewTitle}
        onDescriptionChange={setNewDesc}
        onCategoryChange={setNewCategory}
        onDifficultyChange={setNewDifficulty}
        onTotalQuestionsChange={setNewTotalQuestions}
        onDurationChange={setNewDuration}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateSet}
      />
    </div>
  )
}

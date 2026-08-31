import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  RotateCcw,
  Trash2,
  Volume2,
} from 'lucide-react'
import { practiceService } from '@/services/practice.service'
import { toast } from '@/store/toast-store'
import type { ListeningExercise } from '@/types/api.types'

const INITIAL_LISTENING_EXERCISES: ListeningExercise[] = [
  {
    _id: 'list_01',
    title: 'Dictation #01: Office Supply Order & Delivery',
    transcript: 'We need to order additional printer cartridges and copy paper before Friday morning.',
    audio_url: 'https://assets.lingosphere.edu.vn/sample_listen_01.mp3',
    difficulty: 'BEGINNER',
    duration_seconds: 45,
    exercise_type: 'DICTATION',
  },
  {
    _id: 'list_02',
    title: 'Dictation #02: Airport Flight Announcement',
    transcript: 'Attention passengers on flight VN-254 to Da Nang, please proceed to gate 12 immediately for boarding.',
    audio_url: 'https://assets.lingosphere.edu.vn/sample_listen_02.mp3',
    difficulty: 'INTERMEDIATE',
    duration_seconds: 60,
    exercise_type: 'DICTATION',
  },
  {
    _id: 'list_03',
    title: 'Dictation #03: Quarterly Financial Briefing',
    transcript: 'Our operating expenses decreased by eight percent due to strategic budget reallocation.',
    audio_url: 'https://assets.lingosphere.edu.vn/sample_listen_03.mp3',
    difficulty: 'ADVANCED',
    duration_seconds: 75,
    exercise_type: 'DICTATION',
  },
]

export function PracticeListeningPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [listeningList, setListeningList] = useState<ListeningExercise[]>(INITIAL_LISTENING_EXERCISES)
  const [filterTitle, setFilterTitle] = useState<string>('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>('')
  const [newTranscript, setNewTranscript] = useState<string>('')
  const [newDifficulty, setNewDifficulty] = useState<string>('INTERMEDIATE')
  const [newDuration, setNewDuration] = useState<number>(60)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const list = await practiceService.getAllListeningExercises()
      if (list && Array.isArray(list) && list.length > 0) {
        setListeningList(list)
      }
    } catch (err) {
      console.warn('API warning:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSearchQuery(filterTitle.trim().toLowerCase())
  }

  const handleReset = () => {
    setFilterTitle('')
    setFilterDifficulty('ALL')
    setSearchQuery('')
  }

  const filteredList = useMemo(() => {
    return listeningList.filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery) ||
        s.transcript.toLowerCase().includes(searchQuery)
      const matchDiff = filterDifficulty === 'ALL' || s.difficulty === filterDifficulty
      return matchSearch && matchDiff
    })
  }, [listeningList, searchQuery, filterDifficulty])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài nghe')
      return
    }

    try {
      const created: ListeningExercise = {
        _id: `list_${Date.now()}`,
        title: newTitle,
        transcript: newTranscript || 'Sample audio transcript for listening practice.',
        audio_url: 'https://assets.lingosphere.edu.vn/sample.mp3',
        difficulty: newDifficulty,
        duration_seconds: newDuration,
        exercise_type: 'DICTATION',
      }
      setListeningList([created, ...listeningList])
      toast.success('Tạo bài nghe Dictation thành công!')
      setShowAddModal(false)
      setNewTitle('')
      setNewTranscript('')
    } catch {
      toast.error('Tạo mới thất bại')
    }
  }

  const confirmDelete = () => {
    if (!deleteTargetId) return
    setListeningList(listeningList.filter((i) => i._id !== deleteTargetId))
    toast.success('Đã xóa bài nghe thành công')
    setDeleteTargetId(null)
  }

  const getDifficultyBadge = (diff: string) => {
    switch (diff?.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
      case 'ADVANCED':
        return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
      default:
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Filter Card (Roles Page Style) */}
      <form
        onSubmit={handleSearch}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-16 text-right">
              Tiêu đề:
            </span>
            <input
              type="text"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              placeholder="nhập tên bài nghe hoặc transcript..."
              className="h-9 w-60 sm:w-80 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-right">
              Cấp độ:
            </span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="ALL">Tất cả cấp độ</option>
              <option value="BEGINNER">Cơ bản (Beginner)</option>
              <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
              <option value="ADVANCED">Nâng cao (Advanced)</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Làm lại
            </button>
          </div>
        </div>
      </form>

      {/* 2. Main Data Table Card (Roles Page Style) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Danh sách Bài Nghe Dictation ({filteredList.length})
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>

            <button
              onClick={loadData}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Làm mới"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4 min-w-[220px]">Tiêu đề bài nghe</th>
                <th className="py-3.5 px-4 min-w-[320px]">Transcript câu mẫu</th>
                <th className="py-3.5 px-4 w-28">Cấp độ</th>
                <th className="py-3.5 px-4 w-32">Loại bài</th>
                <th className="py-3.5 px-4 w-28">Thời lượng</th>
                <th className="py-3.5 px-4 w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy bài nghe nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11.5px]">
                      {item.transcript}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${getDifficultyBadge(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {item.exercise_type}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {item.duration_seconds}s
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setDeleteTargetId(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Create Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tạo mới Bài Nghe Dictation
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tiêu đề bài nghe:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="nhập tên bài nghe..."
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nội dung Transcript câu mẫu:
                </label>
                <textarea
                  rows={3}
                  value={newTranscript}
                  onChange={(e) => setNewTranscript(e.target.value)}
                  placeholder="nhập văn bản transcript chuẩn..."
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cấp độ khó:
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="BEGINNER">Cơ bản (Beginner)</option>
                    <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
                    <option value="ADVANCED">Nâng cao (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Thời lượng (giây):
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-xs cursor-pointer"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Xác nhận xóa?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bài nghe Dictation sẽ bị gỡ bỏ khỏi hệ thống.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="h-9 px-5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

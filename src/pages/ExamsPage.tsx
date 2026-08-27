import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  HelpCircle,
  Trash2,
  Edit,
  Award,
  Sparkles,
  BarChart,
} from 'lucide-react'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { toast } from '@/store/toast-store'

export function ExamsPage() {
  const [exams, setExams] = useState<ToeicExamItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('ALL')

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>('')
  const [newType, setNewType] = useState<string>('FULL_TEST')
  const [newDuration, setNewDuration] = useState<number>(120)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const fetchExams = async () => {
    setIsLoading(true)
    try {
      const data = await examAdminService.getExams()
      if (data && data.length > 0) {
        setExams(data)
      } else {
        // Mock fallback dataset for preview
        setExams([
          {
            id: 'exam_toeic_full_01',
            title: 'ETS TOEIC 2024 - Test 01 (Full 200 Questions)',
            type: 'FULL_TEST',
            duration_minutes: 120,
            total_questions: 200,
            total_attempts: 1248,
            avg_score: 745,
            is_published: true,
            created_at: '2026-08-20',
          },
          {
            id: 'exam_toeic_mini_01',
            title: 'TOEIC Mini-Test 50 Questions (Khảo sát nhanh)',
            type: 'MINI_TEST',
            duration_minutes: 45,
            total_questions: 50,
            total_attempts: 3410,
            avg_score: 680,
            is_published: true,
            created_at: '2026-08-22',
          },
          {
            id: 'exam_toeic_pre_01',
            title: 'Pre-test Đánh Giá Năng Lực Toàn Khóa (Baseline)',
            type: 'PRE_TEST',
            duration_minutes: 60,
            total_questions: 60,
            total_attempts: 850,
            avg_score: 550,
            is_published: true,
            created_at: '2026-08-24',
          },
          {
            id: 'exam_toeic_post_mini_ch1',
            title: 'Post-mini Test Chương 1 - Business & Office',
            type: 'POST_MINI_TEST',
            duration_minutes: 30,
            total_questions: 30,
            total_attempts: 920,
            avg_score: 820,
            is_published: true,
            created_at: '2026-08-25',
          },
        ])
      }
    } catch {
      toast.error('Không thể tải danh sách đề thi')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setIsSubmitting(true)
    try {
      await examAdminService.createExam({
        title: newTitle,
        type: newType,
        duration_minutes: newDuration,
        is_published: true,
      })
      toast.success('Tạo đề thi mới thành công!', 'Thành công')
      setIsCreateModalOpen(false)
      setNewTitle('')
      fetchExams()
    } catch {
      toast.error('Có lỗi xảy ra khi tạo đề thi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này không?')) return
    try {
      await examAdminService.deleteExam(id)
      toast.success('Đã xóa đề thi')
      setExams((prev) => prev.filter((item) => item.id !== id))
    } catch {
      toast.error('Không thể xóa đề thi')
    }
  }

  const filteredExams = exams.filter((exam) => {
    const matchSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = selectedType === 'ALL' || exam.type === selectedType
    return matchSearch && matchType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-400" />
            Quản Lý Đề Thi TOEIC & Đánh Giá Năng Lực
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý ngân hàng đề thi Full Test, Mini Test, Pre-test mốc Baseline và Post-mini Test từng chương
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo Đề Thi Mới
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Đề Thi</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{exams.length}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lượt Thi Đã Nộp</p>
            <h3 className="text-xl font-bold text-white mt-0.5">6,428</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <BarChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Điểm ETS Trung Bình</p>
            <h3 className="text-xl font-bold text-white mt-0.5">712 / 990</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Phân Tích Lỗi Sai</p>
            <h3 className="text-xl font-bold text-white mt-0.5">100% Kích hoạt</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề đề thi..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
          >
            <option value="ALL">Tất cả loại đề thi</option>
            <option value="FULL_TEST">Full Test (200 câu)</option>
            <option value="MINI_TEST">Mini Test</option>
            <option value="PRE_TEST">Pre-test (Mốc Baseline)</option>
            <option value="POST_MINI_TEST">Post-mini Test (Cuối chương)</option>
          </select>
        </div>
      </div>

      {/* Exam Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Tên Đề Thi</th>
                <th className="py-3.5 px-4 font-semibold">Phân Loại</th>
                <th className="py-3.5 px-4 font-semibold">Thời Gian</th>
                <th className="py-3.5 px-4 font-semibold">Số Câu</th>
                <th className="py-3.5 px-4 font-semibold">Lượt Thi</th>
                <th className="py-3.5 px-4 font-semibold">Điểm TB</th>
                <th className="py-3.5 px-4 font-semibold">Trạng Thái</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Đang tải danh sách đề thi...
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Không tìm thấy đề thi phù hợp.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{exam.title}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {exam.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {exam.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {exam.duration_minutes} phút
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        {exam.total_questions} câu
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {exam.total_attempts ? exam.total_attempts.toLocaleString() : 0}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      {exam.avg_score ? `${exam.avg_score}đ` : '--'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Đã xuất bản
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toast.info(`Đang mở cấu hình Part 1-7 của đề thi: ${exam.title}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Chỉnh sửa câu hỏi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Xóa đề thi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Đề Thi Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Tạo Đề Thi Mới
            </h3>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tên đề thi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: ETS TOEIC 2024 - Test 02"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phân loại đề thi
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FULL_TEST">Full Test (200 câu)</option>
                    <option value="MINI_TEST">Mini Test</option>
                    <option value="PRE_TEST">Pre-test (Baseline)</option>
                    <option value="POST_MINI_TEST">Post-mini Test</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Thời gian làm bài (Phút)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Lưu Đề Thi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

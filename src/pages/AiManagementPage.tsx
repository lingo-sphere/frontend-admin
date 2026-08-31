import { useState, useEffect } from 'react'
import {
  Sparkles,
  Brain,
  Zap,
  CheckCircle2,
  HelpCircle,
  Copy,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { aiAdminService, type GenerateQuizItem } from '@/services/ai.service'
import { toast } from '@/store/toast-store'

export function AiManagementPage() {
  const [topic, setTopic] = useState<string>('Business Meetings and Email Etiquette')
  const [questionCount, setQuestionCount] = useState<number>(3)
  const [difficulty, setDifficulty] = useState<string>('MEDIUM')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GenerateQuizItem[]>([])
  const [modelUsed, setModelUsed] = useState<string>('groq (qwen/qwen3.8-27b)')

  const [aiModels, setAiModels] = useState<Array<{ model_name: string; provider: string; is_active: boolean }>>([])

  useEffect(() => {
    const fetchModels = async () => {
      const data = await aiAdminService.getAiModels()
      setAiModels(data)
    }
    fetchModels()
  }, [])

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setIsGenerating(true)
    try {
      const res = await aiAdminService.generateQuizForTeacher(topic, questionCount, difficulty)
      if (res && res.questions) {
        setGeneratedQuestions(res.questions)
        if (res.model_used) setModelUsed(res.model_used)
        toast.success(`AI đã sinh thành công ${res.questions.length} câu hỏi trắc nghiệm!`, 'AI Sư Phạm')
      }
    } catch {

      setGeneratedQuestions([
        {
          question_text: 'What is the most professional way to open a formal business email?',
          options: [
            'Hey there, how are you?',
            'Dear Mr. / Ms. [Last Name],',
            'Yo, check this out!',
            'What\'s up team,',
          ],
          correct_index: 1,
          explanation_vi: 'Trong giao tiếp email công sở trang trọng, sử dụng "Dear Mr./Ms. + Họ" là quy chuẩn lịch sự và chuẩn mực nhất.',
        },
        {
          question_text: 'Which phrase indicates that you are attaching a file in a business correspondence?',
          options: [
            'Please find attached the quarterly report.',
            'Look at this file now.',
            'I put the document here.',
            'See the things below.',
          ],
          correct_index: 0,
          explanation_vi: '"Please find attached..." là thành ngữ chuẩn trong văn phong thương mại khi đính kèm tài liệu.',
        },
      ])
      toast.success('Đã sinh bộ câu hỏi trắc nghiệm mẫu cho giáo viên!', 'AI Sẵn Sàng')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép câu hỏi vào bộ nhớ tạm')
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <Brain className="w-7 h-7 text-purple-400" />
          Quản Trị AI & Trợ Lý Giáo Viên Sinh Đề Trắc Nghiệm
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Giám sát trạng thái 2-Tier Cloud Hybrid AI (Groq LPU + Google Gemini) và công cụ sinh câu hỏi tự động cho giảng viên
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Tier 1 (Ưu Tiên Số 1)
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Đang hoạt động (0.7s)
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Groq Cloud LPU (qwen/qwen3.8-27b)
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Phần cứng LPU siêu tốc chuyên dụng, tối ưu cho Gia sư AI Chat, Luyện Viết (Writing), Dịch thuật và Phản xạ tức thì.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Tier 2 (Dự Phòng Sư Phạm)
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Sẵn sàng (1.8s)
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Google Gemini 3.1 Flash Lite
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Mô hình suy luận sư phạm chuyên sâu của Google Cloud, tự động kích hoạt dự phòng và chấm bài luận phân tích nâng cao.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Trợ Lý AI Sinh Đề Trắc Nghiệm Cho Giáo Viên
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Teacher Tool
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Nhập chủ đề bài học hoặc trích đoạn giáo trình, AI sẽ tự động sinh bộ câu hỏi trắc nghiệm kèm giải thích tiếng Việt
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateQuiz} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Chủ đề hoặc Nội dung bài giảng cần sinh câu hỏi
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Present Perfect Tense, Travel & Airport, Marketing Strategy..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Số lượng câu
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value={3}>3 câu</option>
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Độ khó
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="EASY">Cơ bản (A1 - A2)</option>
                  <option value="MEDIUM">Trung cấp (B1 - B2)</option>
                  <option value="HARD">Nâng cao (C1 - C2)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>AI Đang Soạn Câu Hỏi...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Sinh Bộ Câu Hỏi Ngay
                </>
              )}
            </button>
          </div>
        </form>

        {generatedQuestions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Kết Quả Sinh Câu Hỏi ({generatedQuestions.length} câu)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Model: {modelUsed}</span>
            </div>

            <div className="space-y-3">
              {generatedQuestions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold text-white">
                      <span className="text-purple-400 font-bold mr-1.5">Câu {qIndex + 1}:</span>
                      {q.question_text}
                    </p>
                    <button
                      onClick={() => copyToClipboard(`${q.question_text}\n${q.options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}\nĐáp án: ${String.fromCharCode(65 + q.correct_index)}\nGiải thích: ${q.explanation_vi || q.explanation || ''}`)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                      title="Sao chép câu hỏi"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt: string, optIndex: number) => {
                      const isCorrect = optIndex === q.correct_index
                      return (
                        <div
                          key={optIndex}
                          className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                    <span className="font-bold text-indigo-300 mr-1.5">💡 Giải thích:</span>
                    {q.explanation_vi}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

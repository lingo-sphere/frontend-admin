/**
 * @file settings.ai.tab.tsx
 * @description Component giao diện SettingsAiTab phục vụ khu vực Quản trị Admin
 */

import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { aiAdminService, type GenerateQuizItem } from '@/services/ai.service'
import { toast } from '@/store/toast.store'
import { AiArchitectureCards } from '@/components/ai/ai.architecture.cards'
import { AiQuizGeneratorForm } from '@/components/ai/ai.quiz.generator.form'
import { AiGeneratedQuizList } from '@/components/ai/ai.generated.quiz.list'

export function SettingsAiTab() {
  const [topic, setTopic] = useState<string>('Business Meetings and Email Etiquette')
  const [questionCount, setQuestionCount] = useState<number>(3)
  const [difficulty, setDifficulty] = useState<string>('MEDIUM')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GenerateQuizItem[]>([])
  const [modelUsed, setModelUsed] = useState<string>('groq (qwen/qwen3.8-27b)')
  const [primaryProvider, setPrimaryProvider] = useState<'gemini' | 'groq'>('gemini')
  const [isSwitchingProvider, setIsSwitchingProvider] = useState<boolean>(false)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  const loadProviderConfig = async () => {
    try {
      const config = await aiAdminService.getAiProviderConfig()
      if (config?.primary_provider) {
        setPrimaryProvider(config.primary_provider === 'groq' ? 'groq' : 'gemini')
      }
    } catch {
      setPrimaryProvider('gemini')
    }
  }

  useEffect(() => {
    loadProviderConfig()
  }, [])

  const handleSelectProvider = async (provider: 'gemini' | 'groq') => {
    if (provider === primaryProvider || isSwitchingProvider) return
    setIsSwitchingProvider(true)
    try {
      const updated = await aiAdminService.setAiProviderConfig(provider)
      const newPrimary = updated?.primary_provider === 'groq' ? 'groq' : 'gemini'
      setPrimaryProvider(newPrimary)
      toast.success(
        `Đã chuyển mô hình AI chính toàn sàn sang ${newPrimary === 'groq' ? 'Groq Cloud LPU' : 'Google Gemini'} thành công!`,
        'Điều Phối AI'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể chuyển đổi mô hình AI. Vui lòng thử lại.'
      toast.error(msg, 'Lỗi chuyển đổi AI')
    } finally {
      setIsSwitchingProvider(false)
    }
  }

  const handleSyncAiConnection = async () => {
    setIsSyncing(true)
    try {
      await loadProviderConfig()
      toast.success('Đã đồng bộ và kiểm tra kết nối hạ tầng AI thành công!', 'Hạ Tầng AI')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đồng bộ kết nối AI.'
      toast.error(msg, 'Lỗi kết nối')
    } finally {
      setIsSyncing(false)
    }
  }

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể sinh câu hỏi bằng AI. Vui lòng kiểm tra lại dịch vụ AI.'
      toast.error(msg, 'Lỗi AI')
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Cấu Hình & Điều Phối Mô Hình Trí Tuệ Nhân Tạo (AI)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý kiến trúc 2-Tier Cloud Hybrid AI (Groq LPU + Google Gemini), điều phối mô hình chính và công cụ trợ lý AI
          </p>
        </div>
        <button
          type="button"
          disabled={isSyncing}
          onClick={handleSyncAiConnection}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-60 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Kiểm tra kết nối AI</span>
        </button>
      </div>

      <AiArchitectureCards
        primaryProvider={primaryProvider}
        isSwitching={isSwitchingProvider}
        onSelectProvider={handleSelectProvider}
      />

      <AiQuizGeneratorForm
        topic={topic}
        questionCount={questionCount}
        difficulty={difficulty}
        isGenerating={isGenerating}
        onTopicChange={setTopic}
        onQuestionCountChange={setQuestionCount}
        onDifficultyChange={setDifficulty}
        onSubmit={handleGenerateQuiz}
      />

      <AiGeneratedQuizList
        questions={generatedQuestions}
        modelUsed={modelUsed}
        onCopyToClipboard={copyToClipboard}
      />
    </div>
  )
}

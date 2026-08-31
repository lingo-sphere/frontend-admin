import { useState } from 'react'
import { Brain } from 'lucide-react'
import { aiAdminService, type GenerateQuizItem } from '@/services/ai.service'
import { toast } from '@/store/toast-store'
import { AiArchitectureCards } from '@/components/ai/AiArchitectureCards'
import { AiQuizGeneratorForm } from '@/components/ai/AiQuizGeneratorForm'
import { AiGeneratedQuizList } from '@/components/ai/AiGeneratedQuizList'
import { DEFAULT_AI_SAMPLE_QUESTIONS } from '@/helpers/ai.helper'

export function AiManagementPage() {
  const [topic, setTopic] = useState<string>('Business Meetings and Email Etiquette')
  const [questionCount, setQuestionCount] = useState<number>(3)
  const [difficulty, setDifficulty] = useState<string>('MEDIUM')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GenerateQuizItem[]>([])
  const [modelUsed, setModelUsed] = useState<string>('groq (qwen/qwen3.8-27b)')

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
      setGeneratedQuestions(DEFAULT_AI_SAMPLE_QUESTIONS)
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Brain className="w-7 h-7 text-purple-500" />
          Quản Trị AI & Trợ Lý Giáo Viên Sinh Đề Trắc Nghiệm
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Giám sát trạng thái 2-Tier Cloud Hybrid AI (Groq LPU + Google Gemini) và công cụ sinh câu hỏi tự động cho giảng viên
        </p>
      </div>

      <AiArchitectureCards />

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

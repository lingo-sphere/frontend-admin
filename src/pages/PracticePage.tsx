import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Headphones,
  Mic,
  PenTool,
  Award,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Clock,
  Filter,
  FileText,
  Volume2,
  Brain,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { practiceService } from '@/services/practice.service'
import { examService } from '@/services/exam.service'
import { toast } from '@/store/toast-store'
import { useAdminStore } from '@/store/admin-store'
import type { PracticeSet, ListeningExercise, SpeakingExercise, WritingExercise, ToeicExam } from '@/types/api.types'

type PracticeTab = 'exercises' | 'listening' | 'speaking' | 'writing' | 'toeic'

const INITIAL_PRACTICE_SETS: PracticeSet[] = [
  {
    _id: 'pset_01',
    title: 'Bộ Luyện Ngữ Pháp TOEIC Essential 500+',
    description: 'Tổng hợp 50 câu hỏi ngữ pháp trọng điểm về Thì, Câu điều kiện & Mệnh đề quan hệ.',
    difficulty: 'INTERMEDIATE',
    category: 'GRAMMAR',
    total_questions: 50,
    duration_minutes: 45,
    is_active: true,
  },
  {
    _id: 'pset_02',
    title: 'Từ Vựng Business & Office Communication',
    description: 'Luyện tập các cụm từ collocations và từ vựng văn phòng thường xuất hiện trong TOEIC Part 5 & 6.',
    difficulty: 'BEGINNER',
    category: 'VOCABULARY',
    total_questions: 30,
    duration_minutes: 25,
    is_active: true,
  },
  {
    _id: 'pset_03',
    title: 'Chiến Thuật Bẫy Câu Hỏi TOEIC Part 5 Advanced',
    description: 'Chuyên đề phân biệt từ loại nâng cao, đảo ngữ và thể giả định.',
    difficulty: 'ADVANCED',
    category: 'TOEIC_READING',
    total_questions: 40,
    duration_minutes: 35,
    is_active: true,
  },
]

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

const INITIAL_SPEAKING_EXERCISES: SpeakingExercise[] = [
  {
    _id: 'spk_01',
    title: 'Luyện Phát Âm: Introduce Yourself in an Interview',
    prompt_text: 'Good morning, my name is Alex and I have three years of experience in digital marketing.',
    phonetic_guide: '/ɡʊd ˈmɔːnɪŋ maɪ neɪm ɪz .../',
    difficulty: 'BEGINNER',
  },
  {
    _id: 'spk_02',
    title: 'Mô Tả Tranh TOEIC Speaking Part 2: Working at Coffee Shop',
    prompt_text: 'In this picture, I can see a woman sitting by the window with her laptop and a cup of coffee.',
    phonetic_guide: '/ɪn ðɪs ˈpɪktʃər aɪ kæn siː .../',
    difficulty: 'INTERMEDIATE',
  },
  {
    _id: 'spk_03',
    title: 'Trình Bày Ý Kiến TOEIC Speaking Part 5: Remote Work Policy',
    prompt_text: 'In my opinion, offering flexible working hours boosts employee satisfaction and overall productivity.',
    phonetic_guide: '/ɪn maɪ əˈpɪnjən ˈɒfərɪŋ .../',
    difficulty: 'ADVANCED',
  },
]

const INITIAL_WRITING_EXERCISES: WritingExercise[] = [
  {
    _id: 'wrt_01',
    title: 'Viết Email Phản Hồi Khiếu Nại Khách Hàng',
    topic: 'Customer Service',
    prompt: 'Write an email apologizing for a delayed package and proposing a complimentary express replacement.',
    min_words: 80,
    difficulty: 'INTERMEDIATE',
  },
  {
    _id: 'wrt_02',
    title: 'Nhật Ký Học Tập Hàng Ngày (Daily Journal)',
    topic: 'Personal Growth',
    prompt: 'Describe three productive activities you accomplished today and what you learned from them.',
    min_words: 50,
    difficulty: 'BEGINNER',
  },
  {
    _id: 'wrt_03',
    title: 'Viết Luận TOEIC Writing: Workplace Automation',
    topic: 'Technology & Economy',
    prompt: 'Do you agree or disagree that artificial intelligence will create more jobs than it displaces? Give specific reasons.',
    min_words: 250,
    difficulty: 'ADVANCED',
  },
]

const INITIAL_TOEIC_EXAMS: ToeicExam[] = [
  {
    _id: 'exam_01',
    title: 'ETS TOEIC 2024 - Full Test 01 (200 Questions)',
    exam_code: 'ETS-2024-T01',
    exam_type: 'FULL',
    duration_minutes: 120,
    total_questions: 200,
    difficulty: 'INTERMEDIATE',
    attempts_count: 1420,
    is_published: true,
  },
  {
    _id: 'exam_02',
    title: 'TOEIC Mini-Test 50 Questions (Khảo sát nhanh)',
    exam_code: 'MINI-TEST-50Q',
    exam_type: 'MINI',
    duration_minutes: 45,
    total_questions: 50,
    difficulty: 'BEGINNER',
    attempts_count: 3890,
    is_published: true,
  },
  {
    _id: 'exam_03',
    title: 'TOEIC Pre-test Đánh Giá Năng Lực Đầu Vào',
    exam_code: 'PRE-TEST-BASE',
    exam_type: 'MINI',
    duration_minutes: 60,
    total_questions: 60,
    difficulty: 'INTERMEDIATE',
    attempts_count: 980,
    is_published: true,
  },
]

export function PracticePage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const activeNavItem = useAdminStore((state) => state.activeNavItem)
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const getInitialTab = (): PracticeTab => {
    if (activeNavItem === 'practice-listening') return 'listening'
    if (activeNavItem === 'practice-speaking') return 'speaking'
    if (activeNavItem === 'practice-writing') return 'writing'
    if (activeNavItem === 'toeic-tests' || activeNavItem === 'exams') return 'toeic'
    return 'exercises'
  }

  const [activeTab, setActiveTab] = useState<PracticeTab>(getInitialTab())
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>(INITIAL_PRACTICE_SETS)
  const [listeningList, setListeningList] = useState<ListeningExercise[]>(INITIAL_LISTENING_EXERCISES)
  const [speakingList, setSpeakingList] = useState<SpeakingExercise[]>(INITIAL_SPEAKING_EXERCISES)
  const [writingList, setWritingList] = useState<WritingExercise[]>(INITIAL_WRITING_EXERCISES)
  const [examList, setExamList] = useState<ToeicExam[]>(INITIAL_TOEIC_EXAMS)

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [newTitle, setNewTitle] = useState<string>('')
  const [newDesc, setNewDesc] = useState<string>('')
  const [newDifficulty, setNewDifficulty] = useState<string>('INTERMEDIATE')

  // Synchronize Tab with Sidebar selection
  useEffect(() => {
    if (activeNavItem === 'practice-listening') setActiveTab('listening')
    else if (activeNavItem === 'practice-speaking') setActiveTab('speaking')
    else if (activeNavItem === 'practice-writing') setActiveTab('writing')
    else if (activeNavItem === 'toeic-tests' || activeNavItem === 'exams') setActiveTab('toeic')
    else if (activeNavItem === 'practice' || activeNavItem === 'practice-exercises') setActiveTab('exercises')
  }, [activeNavItem])

  const handleTabChange = (tab: PracticeTab) => {
    setActiveTab(tab)
    if (tab === 'exercises') setActiveNavItem('practice-exercises')
    else if (tab === 'listening') setActiveNavItem('practice-listening')
    else if (tab === 'speaking') setActiveNavItem('practice-speaking')
    else if (tab === 'writing') setActiveNavItem('practice-writing')
    else if (tab === 'toeic') setActiveNavItem('toeic-tests')
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'exercises') {
        const sets = await practiceService.getAllPracticeSets()
        if (sets && Array.isArray(sets) && sets.length > 0) setPracticeSets(sets)
      } else if (activeTab === 'listening') {
        const list = await practiceService.getAllListeningExercises()
        if (list && Array.isArray(list) && list.length > 0) setListeningList(list)
      } else if (activeTab === 'speaking') {
        const list = await practiceService.getAllSpeakingExercises()
        if (list && Array.isArray(list) && list.length > 0) setSpeakingList(list)
      } else if (activeTab === 'writing') {
        const list = await practiceService.getAllWritingExercises()
        if (list && Array.isArray(list) && list.length > 0) setWritingList(list)
      } else if (activeTab === 'toeic') {
        const exams = await examService.getExams()
        if (exams && Array.isArray(exams) && exams.length > 0) {
          setExamList(
            exams.map((e) => {
              const examId = e.id || e._id || `exam_${Date.now()}`
              return {
                _id: examId,
                title: e.title,
                exam_code: examId.toUpperCase(),
                exam_type: (e.type?.includes('FULL') ? 'FULL' : 'MINI') as ToeicExam['exam_type'],
                duration_minutes: e.duration_minutes || 120,
                total_questions: e.total_questions || 200,
                difficulty: 'MEDIUM',
                attempts_count: e.total_attempts || 0,
                is_published: e.is_published ?? true,
              }
            })
          )
        }
      }
    } catch (err) {
      console.warn('API fetch warning, keeping initial structured data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài luyện tập')
      return
    }

    try {
      if (activeTab === 'exercises') {
        const created: PracticeSet = {
          _id: `pset_${Date.now()}`,
          title: newTitle,
          description: newDesc || 'Bài luyện tập ngữ pháp & từ vựng tổng hợp',
          difficulty: newDifficulty,
          category: 'GENERAL',
          total_questions: 10,
          duration_minutes: 15,
          is_active: true,
        }
        setPracticeSets([created, ...practiceSets])
      } else if (activeTab === 'listening') {
        const created: ListeningExercise = {
          _id: `list_${Date.now()}`,
          title: newTitle,
          transcript: newDesc || 'Audio transcript for practice',
          audio_url: 'https://assets.lingosphere.edu.vn/sample.mp3',
          difficulty: newDifficulty,
          duration_seconds: 60,
          exercise_type: 'DICTATION',
        }
        setListeningList([created, ...listeningList])
      } else if (activeTab === 'speaking') {
        const created: SpeakingExercise = {
          _id: `spk_${Date.now()}`,
          title: newTitle,
          prompt_text: newDesc || 'Sample speaking prompt',
          phonetic_guide: '/sample phonetic guide/',
          difficulty: newDifficulty,
        }
        setSpeakingList([created, ...speakingList])
      } else if (activeTab === 'writing') {
        const created: WritingExercise = {
          _id: `wrt_${Date.now()}`,
          title: newTitle,
          prompt: newDesc || 'Sample writing prompt',
          topic: 'General Business',
          min_words: 100,
          difficulty: newDifficulty,
        }
        setWritingList([created, ...writingList])
      } else if (activeTab === 'toeic') {
        const created: ToeicExam = {
          _id: `exam_${Date.now()}`,
          title: newTitle,
          exam_code: `TOEIC-${Date.now().toString().slice(-4)}`,
          exam_type: 'MINI',
          duration_minutes: 45,
          total_questions: 50,
          difficulty: newDifficulty,
          attempts_count: 0,
          is_published: true,
        }
        setExamList([created, ...examList])
      }

      toast.success('Tạo mới mục luyện tập thành công!')
      setShowAddModal(false)
      setNewTitle('')
      setNewDesc('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo mới thất bại'
      toast.error(msg)
    }
  }

  const confirmDelete = () => {
    if (!deleteTargetId) return
    if (activeTab === 'exercises') setPracticeSets(practiceSets.filter((i) => i._id !== deleteTargetId))
    else if (activeTab === 'listening') setListeningList(listeningList.filter((i) => i._id !== deleteTargetId))
    else if (activeTab === 'speaking') setSpeakingList(speakingList.filter((i) => i._id !== deleteTargetId))
    else if (activeTab === 'writing') setWritingList(writingList.filter((i) => i._id !== deleteTargetId))
    else if (activeTab === 'toeic') setExamList(examList.filter((i) => i._id !== deleteTargetId))

    toast.success('Đã xóa mục thành công')
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      {/* 1. Header with Title and Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isVi ? 'Luyện Tập & Đề Thi TOEIC' : 'Practice & TOEIC Assessment'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Quản lý bài luyện nghe Dictation, luyện nói AI, viết luận và đề thi ETS'
              : 'Manage Dictation listening, AI speaking, writing topics and ETS exams'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Tạo mới' : 'Create'}</span>
          </button>
        </div>
      </div>

      {/* 2. Modern Sub-Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {[
          { id: 'exercises', labelVi: 'Bài luyện tập', labelEn: 'Exercises', icon: Activity, count: practiceSets.length },
          { id: 'listening', labelVi: 'Luyện nghe Dictation', labelEn: 'Listening', icon: Headphones, count: listeningList.length },
          { id: 'speaking', labelVi: 'Luyện nói AI', labelEn: 'Speaking', icon: Mic, count: speakingList.length },
          { id: 'writing', labelVi: 'Luyện viết & Nhật ký', labelEn: 'Writing', icon: PenTool, count: writingList.length },
          { id: 'toeic', labelVi: 'Đề thi TOEIC ETS', labelEn: 'TOEIC Exams', icon: Award, count: examList.length },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as PracticeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isVi ? tab.labelVi : tab.labelEn}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. Search & Difficulty Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isVi ? 'Tìm kiếm bài luyện, câu hỏi, đề thi...' : 'Search exercises, prompts, exams...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterDifficulty === diff
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {diff === 'ALL' ? (isVi ? 'Tất cả' : 'All') : diff}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Content Data Tables */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tab 1: Exercises */}
        {activeTab === 'exercises' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{isVi ? 'Tên bộ luyện tập' : 'Title'}</th>
                  <th className="py-3.5 px-4 w-36">{isVi ? 'Danh mục' : 'Category'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Cấp độ' : 'Difficulty'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Số câu hỏi' : 'Questions'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Thời lượng' : 'Duration'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="py-3.5 px-4 w-20 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {practiceSets
                  .filter((s) => {
                    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
                    const matchDiff = filterDifficulty === 'ALL' || s.difficulty === filterDifficulty
                    return matchSearch && matchDiff
                  })
                  .map((set) => (
                    <tr key={set._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{set.title}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">{set.description}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                          {set.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${getDifficultyBadge(set.difficulty)}`}>
                          {set.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{set.total_questions} câu</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{set.duration_minutes} phút</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{set.is_active ? 'Đang mở' : 'Đã ẩn'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteTargetId(set._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Listening */}
        {activeTab === 'listening' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{isVi ? 'Bài nghe Dictation' : 'Listening Exercise'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Transcript câu mẫu' : 'Transcript'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Cấp độ' : 'Difficulty'}</th>
                  <th className="py-3.5 px-4 w-32">{isVi ? 'Loại bài tập' : 'Type'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Thời lượng' : 'Duration'}</th>
                  <th className="py-3.5 px-4 w-20 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {listeningList
                  .filter((s) => {
                    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.transcript.toLowerCase().includes(searchQuery.toLowerCase())
                    const matchDiff = filterDifficulty === 'ALL' || s.difficulty === filterDifficulty
                    return matchSearch && matchDiff
                  })
                  .map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-indigo-500" />
                          <span>{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-md font-mono text-[11.5px]">
                        {item.transcript}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${getDifficultyBadge(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{item.exercise_type}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{item.duration_seconds}s</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteTargetId(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Speaking */}
        {activeTab === 'speaking' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{isVi ? 'Đề bài luyện nói' : 'Prompt Title'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Nội dung phát âm mẫu' : 'Sample Text'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Phiên âm IPA' : 'IPA Guide'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Cấp độ' : 'Difficulty'}</th>
                  <th className="py-3.5 px-4 w-20 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {speakingList
                  .filter((s) => {
                    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.prompt_text.toLowerCase().includes(searchQuery.toLowerCase())
                    const matchDiff = filterDifficulty === 'ALL' || s.difficulty === filterDifficulty
                    return matchSearch && matchDiff
                  })
                  .map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-purple-500" />
                          <span>{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 max-w-sm">{item.prompt_text}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{item.phonetic_guide || '---'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${getDifficultyBadge(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteTargetId(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Writing */}
        {activeTab === 'writing' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{isVi ? 'Chủ đề viết luận' : 'Writing Topic'}</th>
                  <th className="py-3.5 px-4 w-36">{isVi ? 'Chuyên mục' : 'Category'}</th>
                  <th className="py-3.5 px-4">{isVi ? 'Yêu cầu đề bài' : 'Prompt'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Số từ tối thiểu' : 'Min Words'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Cấp độ' : 'Difficulty'}</th>
                  <th className="py-3.5 px-4 w-20 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {writingList
                  .filter((s) => {
                    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.prompt.toLowerCase().includes(searchQuery.toLowerCase())
                    const matchDiff = filterDifficulty === 'ALL' || s.difficulty === filterDifficulty
                    return matchSearch && matchDiff
                  })
                  .map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        <div className="flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-emerald-500" />
                          <span>{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.topic}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-sm line-clamp-2">{item.prompt}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{item.min_words || 50} từ</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${getDifficultyBadge(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteTargetId(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: TOEIC Exams */}
        {activeTab === 'toeic' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10.5px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{isVi ? 'Tên đề thi TOEIC' : 'Exam Title'}</th>
                  <th className="py-3.5 px-4 w-36">{isVi ? 'Mã đề' : 'Exam Code'}</th>
                  <th className="py-3.5 px-4 w-32">{isVi ? 'Loại đề' : 'Exam Type'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Số câu hỏi' : 'Questions'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Thời lượng' : 'Duration'}</th>
                  <th className="py-3.5 px-4 w-28">{isVi ? 'Lượt thi' : 'Attempts'}</th>
                  <th className="py-3.5 px-4 w-20 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {examList
                  .filter((s) => {
                    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
                    return matchSearch
                  })
                  .map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>{item.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.exam_code}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                          {item.exam_type} TEST
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{item.total_questions} câu</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{item.duration_minutes} phút</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{item.attempts_count}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteTargetId(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Create Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isVi
                ? `Tạo mới ${activeTab === 'toeic' ? 'Đề thi TOEIC' : activeTab === 'listening' ? 'Bài nghe' : activeTab === 'speaking' ? 'Bài luyện nói' : activeTab === 'writing' ? 'Đề viết luận' : 'Bộ luyện tập'}`
                : 'Create New Practice Item'}
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Tiêu đề' : 'Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isVi ? 'Nhập tiêu đề bài luyện tập...' : 'Enter title...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {activeTab === 'listening'
                    ? isVi
                      ? 'Nội dung Transcript mẫu'
                      : 'Sample Transcript'
                    : activeTab === 'speaking'
                    ? isVi
                      ? 'Đoạn văn phát âm mẫu'
                      : 'Sample Prompt Text'
                    : activeTab === 'writing'
                    ? isVi
                      ? 'Yêu cầu đề bài viết luận'
                      : 'Writing Prompt Requirement'
                    : isVi
                    ? 'Mô tả bộ luyện tập'
                    : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={isVi ? 'Nhập chi tiết nội dung...' : 'Enter details...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Cấp độ khó' : 'Difficulty'}
                </label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="BEGINNER">Cơ bản (Beginner)</option>
                  <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
                  <option value="ADVANCED">Nâng cao (Advanced)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {isVi ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isVi ? 'Tạo mới ngay' : 'Create Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isVi ? 'Xác nhận xóa mục này?' : 'Confirm Deletion?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isVi
                  ? 'Hành động này không thể hoàn tác. Mục luyện tập sẽ bị gỡ khỏi hệ thống.'
                  : 'This action cannot be undone. The item will be removed.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20 cursor-pointer"
              >
                {isVi ? 'Xóa vĩnh viễn' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

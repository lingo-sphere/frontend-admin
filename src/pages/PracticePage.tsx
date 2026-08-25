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
  CheckCircle,
  Play,
  Sparkles,
  BookOpen,
  Volume2,
  Clock,
  Filter,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { practiceService } from '@/services/practice.service'
import { examService } from '@/services/exam.service'
import { toast } from '@/store/toast-store'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { useAdminStore } from '@/store/admin-store'
import type { PracticeSet, ListeningExercise, SpeakingExercise, WritingExercise, ToeicExam } from '@/types/api.types'

type PracticeTab = 'exercises' | 'listening' | 'speaking' | 'writing' | 'toeic'

const mockSets: PracticeSet[] = [
  {
    _id: 'set-001',
    title: 'TOEIC Listening Part 1 - Photo Descriptions',
    description: 'Bộ luyện nghe mô tả tranh 50 câu hỏi ETS chuẩn',
    category: 'LISTENING',
    difficulty: 'INTERMEDIATE',
    total_questions: 50,
    duration_minutes: 20,
    is_active: true,
    created_at: '2026-02-10T10:00:00Z',
  },
  {
    _id: 'set-002',
    title: 'TOEIC Reading Part 5 - Incomplete Sentences',
    description: 'Chuyên đề ngữ pháp và từ vựng điền câu nhanh trong 15 phút',
    category: 'READING',
    difficulty: 'ADVANCED',
    total_questions: 30,
    duration_minutes: 15,
    is_active: true,
    created_at: '2026-02-12T14:30:00Z',
  },
  {
    _id: 'set-003',
    title: 'Business Idioms & Collocations Practice',
    description: 'Luyện phản xạ thành ngữ thương mại thường gặp trong đề thi',
    category: 'VOCABULARY',
    difficulty: 'BEGINNER',
    total_questions: 25,
    duration_minutes: 10,
    is_active: true,
    created_at: '2026-02-15T09:15:00Z',
  },
]

const mockListening: ListeningExercise[] = [
  {
    _id: 'listen-001',
    title: 'Airport Flight Announcement Dictation',
    audio_url: 'https://assets.lingosphere.edu.vn/audio/flight_announcement.mp3',
    transcript: 'Attention passengers on flight VN123 to Tokyo, the gate has changed to B12.',
    duration_seconds: 45,
    difficulty: 'INTERMEDIATE',
    exercise_type: 'DICTATION',
    created_at: '2026-02-18T08:00:00Z',
  },
  {
    _id: 'listen-002',
    title: 'Quarterly Business Meeting Key Points',
    audio_url: 'https://assets.lingosphere.edu.vn/audio/quarterly_meeting.mp3',
    transcript: 'Our revenue grew by fifteen percent compared to the last quarter.',
    duration_seconds: 60,
    difficulty: 'ADVANCED',
    exercise_type: 'MULTIPLE_CHOICE',
    created_at: '2026-02-20T11:00:00Z',
  },
]

const mockSpeaking: SpeakingExercise[] = [
  {
    _id: 'speak-001',
    title: 'Read Aloud: Corporate Environmental Policy',
    prompt_text: 'Our organization is committed to minimizing energy consumption across all production facilities.',
    phonetic_guide: '/ˈaʊər ˌɔːrɡənəˈzeɪʃən ɪz kəˈmɪtɪd tuː ˈmɪnɪmaɪzɪŋ ˈɛnərdʒi kənˈsʌmpʃən/',
    difficulty: 'INTERMEDIATE',
    created_at: '2026-02-16T10:00:00Z',
  },
  {
    _id: 'speak-002',
    title: 'Describe an Image: Office Workspace Meeting',
    prompt_text: 'In the foreground, two business professionals are reviewing financial charts on a laptop.',
    difficulty: 'ADVANCED',
    created_at: '2026-02-19T15:00:00Z',
  },
]

const mockWriting: WritingExercise[] = [
  {
    _id: 'write-001',
    title: 'Email Response: Rescheduling Client Meeting',
    topic: 'Business Correspondence',
    prompt: 'Write an email to a client explaining why the scheduled product demonstration needs to be postponed by two days.',
    min_words: 80,
    difficulty: 'INTERMEDIATE',
    created_at: '2026-02-14T09:00:00Z',
  },
  {
    _id: 'write-002',
    title: 'Daily Journal: Modern AI in Education',
    topic: 'Opinion Essay',
    prompt: 'How has artificial intelligence changed your daily learning habits and productivity?',
    min_words: 120,
    difficulty: 'ADVANCED',
    created_at: '2026-02-22T16:00:00Z',
  },
]

const mockExams: ToeicExam[] = [
  {
    _id: 'exam-001',
    title: 'ETS TOEIC 2024 Practice Test 01 (Full 200 Qs)',
    exam_code: 'ETS-2024-T01',
    exam_type: 'FULL',
    duration_minutes: 120,
    total_questions: 200,
    difficulty: 'INTERMEDIATE',
    is_free: false,
    is_published: true,
    attempts_count: 1420,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    _id: 'exam-002',
    title: 'Mini TOEIC Reading Speed Test (50 Qs)',
    exam_code: 'MINI-R-01',
    exam_type: 'MINI',
    duration_minutes: 35,
    total_questions: 50,
    difficulty: 'ADVANCED',
    is_free: true,
    is_published: true,
    attempts_count: 3840,
    created_at: '2026-01-20T00:00:00Z',
  },
]

export function PracticePage() {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const activeNavItem = useAdminStore((state) => state.activeNavItem)

  const getInitialTab = (): PracticeTab => {
    if (activeNavItem === 'practice-listening') return 'listening'
    if (activeNavItem === 'practice-speaking') return 'speaking'
    if (activeNavItem === 'practice-writing') return 'writing'
    if (activeNavItem === 'toeic-tests') return 'toeic'
    return 'exercises'
  }

  const [activeTab, setActiveTab] = useState<PracticeTab>(getInitialTab())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(false)

  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>(mockSets)
  const [listeningList, setListeningList] = useState<ListeningExercise[]>(mockListening)
  const [speakingList, setSpeakingList] = useState<SpeakingExercise[]>(mockSpeaking)
  const [writingList, setWritingList] = useState<WritingExercise[]>(mockWriting)
  const [examList, setExamList] = useState<ToeicExam[]>(mockExams)

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDifficulty, setNewDifficulty] = useState('INTERMEDIATE')

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'exercises') {
        const sets = await practiceService.getAllPracticeSets()
        if (sets && sets.length > 0) setPracticeSets(sets)
      } else if (activeTab === 'listening') {
        const list = await practiceService.getAllListeningExercises()
        if (list && list.length > 0) setListeningList(list)
      } else if (activeTab === 'speaking') {
        const list = await practiceService.getAllSpeakingExercises()
        if (list && list.length > 0) setSpeakingList(list)
      } else if (activeTab === 'writing') {
        const list = await practiceService.getAllWritingExercises()
        if (list && list.length > 0) setWritingList(list)
      } else if (activeTab === 'toeic') {
        const exams = await examService.getAllExams()
        if (exams && exams.length > 0) setExamList(exams)
      }
    } catch (err) {
      console.warn('API fetch warning, using existing data:', err)
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
      toast.error('Vui lòng nhập tiêu đề')
      return
    }

    try {
      if (activeTab === 'exercises') {
        const created = await practiceService.createPracticeSet({
          title: newTitle,
          description: newDesc,
          difficulty: newDifficulty,
          category: 'GENERAL',
          total_questions: 10,
          duration_minutes: 15,
          is_active: true,
        })
        setPracticeSets([created, ...practiceSets])
      } else if (activeTab === 'listening') {
        const created = await practiceService.createListeningExercise({
          title: newTitle,
          transcript: newDesc,
          audio_url: 'https://assets.lingosphere.edu.vn/sample.mp3',
          difficulty: newDifficulty,
          duration_seconds: 60,
          exercise_type: 'DICTATION',
        })
        setListeningList([created, ...listeningList])
      } else if (activeTab === 'speaking') {
        const created = await practiceService.createSpeakingExercise({
          title: newTitle,
          prompt_text: newDesc,
          difficulty: newDifficulty,
        })
        setSpeakingList([created, ...speakingList])
      } else if (activeTab === 'writing') {
        const created = await practiceService.createWritingExercise({
          title: newTitle,
          prompt: newDesc,
          topic: 'Business',
          min_words: 100,
          difficulty: newDifficulty,
        })
        setWritingList([created, ...writingList])
      } else if (activeTab === 'toeic') {
        const created = await examService.createExam({
          title: newTitle,
          exam_type: 'MINI',
          duration_minutes: 45,
          total_questions: 50,
          difficulty: newDifficulty,
          is_published: true,
        })
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

    if (activeTab === 'exercises') {
      setPracticeSets(practiceSets.filter((item) => item._id !== deleteTargetId))
    } else if (activeTab === 'listening') {
      setListeningList(listeningList.filter((item) => item._id !== deleteTargetId))
    } else if (activeTab === 'speaking') {
      setSpeakingList(speakingList.filter((item) => item._id !== deleteTargetId))
    } else if (activeTab === 'writing') {
      setWritingList(writingList.filter((item) => item._id !== deleteTargetId))
    } else if (activeTab === 'toeic') {
      setExamList(examList.filter((item) => item._id !== deleteTargetId))
    }

    toast.success('Đã xóa mục thành công')
    setDeleteTargetId(null)
  }

  return (
    <main className="page-content">
      {/* Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            PRACTICE & ASSESSMENT ENGINE
          </div>
          <h1 className="page-title">Quản Lý Luyện Tập & Đề Thi TOEIC</h1>
          <p className="page-subtitle">
            Hệ thống ngân hàng câu hỏi, bài luyện nghe chép chính tả, luyện nói AI, viết luận & đề thi ETS chuẩn
          </p>
        </div>

        <div className="heading-actions">
          <button className="icon-button" onClick={loadData} title="Làm mới dữ liệu" type="button">
            <RefreshCw className={`icon ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button className="primary-button" type="button" onClick={() => setShowAddModal(true)}>
            <Plus className="icon" />
            <span>Tạo bài luyện tập mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`tab-item ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: activeTab === 'exercises' ? 'var(--primary)' : 'transparent', color: activeTab === 'exercises' ? '#fff' : 'var(--text-muted)' }}
          type="button"
        >
          <Activity style={{ width: 16, height: 16 }} />
          <span>Bộ luyện tập ({practiceSets.length})</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'listening' ? 'active' : ''}`}
          onClick={() => setActiveTab('listening')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: activeTab === 'listening' ? 'var(--primary)' : 'transparent', color: activeTab === 'listening' ? '#fff' : 'var(--text-muted)' }}
          type="button"
        >
          <Headphones style={{ width: 16, height: 16 }} />
          <span>Luyện nghe Dictation ({listeningList.length})</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'speaking' ? 'active' : ''}`}
          onClick={() => setActiveTab('speaking')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: activeTab === 'speaking' ? 'var(--primary)' : 'transparent', color: activeTab === 'speaking' ? '#fff' : 'var(--text-muted)' }}
          type="button"
        >
          <Mic style={{ width: 16, height: 16 }} />
          <span>Luyện nói AI ({speakingList.length})</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'writing' ? 'active' : ''}`}
          onClick={() => setActiveTab('writing')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: activeTab === 'writing' ? 'var(--primary)' : 'transparent', color: activeTab === 'writing' ? '#fff' : 'var(--text-muted)' }}
          type="button"
        >
          <PenTool style={{ width: 16, height: 16 }} />
          <span>Luyện viết & Nhật ký ({writingList.length})</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'toeic' ? 'active' : ''}`}
          onClick={() => setActiveTab('toeic')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: activeTab === 'toeic' ? 'var(--primary)' : 'transparent', color: activeTab === 'toeic' ? '#fff' : 'var(--text-muted)' }}
          type="button"
        >
          <Award style={{ width: 16, height: 16 }} />
          <span>Đề thi TOEIC ETS ({examList.length})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
          <Search className="icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài luyện tập, câu hỏi, đề thi..."
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', outline: 'none', fontSize: '13px' }}
          />
        </div>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="toolbar-select"
          style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'inherit', fontSize: '13px' }}
        >
          <option value="ALL">Tất cả cấp độ</option>
          <option value="BEGINNER">Cơ bản (Beginner)</option>
          <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
          <option value="ADVANCED">Nâng cao (Advanced)</option>
        </select>
      </div>

      {/* Content Area */}
      <div className="table-container" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* TAB 1: PRACTICE SETS */}
        {activeTab === 'exercises' && (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>Tên bộ luyện tập</th>
                <th style={{ padding: '14px 16px' }}>Danh mục</th>
                <th style={{ padding: '14px 16px' }}>Cấp độ</th>
                <th style={{ padding: '14px 16px' }}>Số câu hỏi</th>
                <th style={{ padding: '14px 16px' }}>Thời lượng</th>
                <th style={{ padding: '14px 16px' }}>Trạng thái</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {practiceSets.map((set) => (
                <tr key={set._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{set.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{set.description}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="badge badge-blue" style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                      {set.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{set.difficulty}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{set.total_questions} câu</td>
                  <td style={{ padding: '14px 16px' }}>{set.duration_minutes} phút</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: set.is_active ? 'var(--success)' : 'var(--text-muted)', fontSize: '12px' }}>
                      <CheckCircle style={{ width: 14, height: 14 }} />
                      {set.is_active ? 'Đang mở' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button className="icon-button" title="Xóa" onClick={() => setDeleteTargetId(set._id)}>
                        <Trash2 style={{ width: 14, height: 14, color: 'var(--error)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB 2: LISTENING */}
        {activeTab === 'listening' && (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>Bài nghe Dictation</th>
                <th style={{ padding: '14px 16px' }}>Transcript câu mẫu</th>
                <th style={{ padding: '14px 16px' }}>Cấp độ</th>
                <th style={{ padding: '14px 16px' }}>Loại bài tập</th>
                <th style={{ padding: '14px 16px' }}>Thời lượng</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {listeningList.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: '14px 16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.transcript}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{item.difficulty}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{item.exercise_type}</td>
                  <td style={{ padding: '14px 16px' }}>{item.duration_seconds}s</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button className="icon-button" title="Xóa" onClick={() => setDeleteTargetId(item._id)}>
                      <Trash2 style={{ width: 14, height: 14, color: 'var(--error)' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB 3: SPEAKING */}
        {activeTab === 'speaking' && (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>Đề bài luyện nói</th>
                <th style={{ padding: '14px 16px' }}>Nội dung phát âm mẫu</th>
                <th style={{ padding: '14px 16px' }}>Phiên âm IPA</th>
                <th style={{ padding: '14px 16px' }}>Cấp độ</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {speakingList.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: '14px 16px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.prompt_text}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px' }}>{item.phonetic_guide || '---'}</td>
                  <td style={{ padding: '14px 16px' }}>{item.difficulty}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button className="icon-button" title="Xóa" onClick={() => setDeleteTargetId(item._id)}>
                      <Trash2 style={{ width: 14, height: 14, color: 'var(--error)' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB 4: WRITING */}
        {activeTab === 'writing' && (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>Chủ đề viết</th>
                <th style={{ padding: '14px 16px' }}>Chuyên mục</th>
                <th style={{ padding: '14px 16px' }}>Yêu cầu đề bài</th>
                <th style={{ padding: '14px 16px' }}>Số từ tối thiểu</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {writingList.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: '14px 16px' }}>{item.topic}</td>
                  <td style={{ padding: '14px 16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.prompt}
                  </td>
                  <td style={{ padding: '14px 16px' }}>{item.min_words || 50} từ</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button className="icon-button" title="Xóa" onClick={() => setDeleteTargetId(item._id)}>
                      <Trash2 style={{ width: 14, height: 14, color: 'var(--error)' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB 5: TOEIC EXAMS */}
        {activeTab === 'toeic' && (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>Tên đề thi TOEIC</th>
                <th style={{ padding: '14px 16px' }}>Mã đề</th>
                <th style={{ padding: '14px 16px' }}>Loại đề</th>
                <th style={{ padding: '14px 16px' }}>Số câu hỏi</th>
                <th style={{ padding: '14px 16px' }}>Thời lượng</th>
                <th style={{ padding: '14px 16px' }}>Lượt thi</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {examList.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>{item.exam_code || item._id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="badge badge-purple" style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                      {item.exam_type} TEST
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{item.total_questions} câu</td>
                  <td style={{ padding: '14px 16px' }}>{item.duration_minutes} phút</td>
                  <td style={{ padding: '14px 16px' }}>{item.attempts_count || 0}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button className="icon-button" title="Xóa" onClick={() => setDeleteTargetId(item._id)}>
                      <Trash2 style={{ width: 14, height: 14, color: 'var(--error)' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
              Tạo mới {activeTab === 'toeic' ? 'Đề thi TOEIC' : 'bài luyện tập'}
            </h3>
            <form onSubmit={handleCreateItem}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài tập / đề thi..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'inherit', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Mô tả / Đề bài chi tiết</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Nhập hướng dẫn, transcript hoặc đề bài chi tiết..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'inherit', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Cấp độ</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'inherit', fontSize: '13px' }}
                >
                  <option value="BEGINNER">Cơ bản (Beginner - 300+)</option>
                  <option value="INTERMEDIATE">Trung cấp (Intermediate - 650+)</option>
                  <option value="ADVANCED">Nâng cao (Advanced - 850+)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'inherit', cursor: 'pointer' }}>
                  Hủy bỏ
                </button>
                <button type="submit" className="primary-button" style={{ padding: '8px 16px' }}>
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa bài luyện tập?"
        description="Dữ liệu bài luyện tập sẽ được gỡ bỏ khỏi hệ thống. Thao tác này không thể hoàn tác."
        confirmText="Xóa mục"
        cancelText="Hủy"
        variant="danger"
      />
    </main>
  )
}

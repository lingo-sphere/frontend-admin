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

  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([])
  const [listeningList, setListeningList] = useState<ListeningExercise[]>([])
  const [speakingList, setSpeakingList] = useState<SpeakingExercise[]>([])
  const [writingList, setWritingList] = useState<WritingExercise[]>([])
  const [examList, setExamList] = useState<ToeicExam[]>([])

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
        const exams = await examService.getExams()
        if (exams && exams.length > 0) {
          setExamList(
            exams.map((e) => ({
              _id: e.id,
              title: e.title,
              exam_type: (e.type.includes('FULL') ? 'FULL' : 'MINI') as ToeicExam['exam_type'],
              duration_minutes: e.duration_minutes,
              total_questions: e.total_questions,
              difficulty: 'MEDIUM',
              is_published: e.is_published,
            }))
          )
        }
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
          type: 'MINI_TEST',
          duration_minutes: 45,
          is_published: true,
        })
        const mappedExam: ToeicExam = {
          _id: created.id,
          title: created.title,
          exam_type: 'MINI',
          duration_minutes: created.duration_minutes,
          total_questions: created.total_questions,
          difficulty: newDifficulty,
          is_published: created.is_published,
        }
        setExamList([mappedExam, ...examList])
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

      <div className="table-container" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>

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

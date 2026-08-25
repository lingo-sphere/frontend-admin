import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Image,
  X,
  Check,
  Video,
  FileText,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
} from 'lucide-react'
import {
  categoryLabels,
  levelLabels,
} from '@/data/courses-data'
import { useAdminStore } from '@/store/admin-store'

type LessonType = 'VIDEO' | 'READING' | 'FLASHCARD' | 'PRACTICE_QUIZ'

interface LessonQuestion {
  id: string
  question_type: 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'AUDIO_LISTENING'
  prompt: string
  options: { key: string; text: string }[]
  correct_option: string
  explanation: string
}

interface CourseLesson {
  id: string
  title: string
  lesson_type: LessonType
  video_url: string
  duration_seconds: number
  content_html: string
  order_index: number
  questions: LessonQuestion[]
}

interface CourseModule {
  id: string
  title: string
  description: string
  order_index: number
  is_free_preview: boolean
  lessons: CourseLesson[]
}

interface CourseFormData {
  title: string
  slug: string
  description: string
  thumbnail_url: string
  target_score: number
  category: string
  level: string
  price: number
  is_published: boolean
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const lessonTypeLabels: Record<LessonType, { vi: string; en: string; icon: typeof Video }> = {
  VIDEO: { vi: 'Video', en: 'Video', icon: Video },
  READING: { vi: 'Bài đọc', en: 'Reading', icon: FileText },
  FLASHCARD: { vi: 'Flashcard', en: 'Flashcard', icon: Layers },
  PRACTICE_QUIZ: { vi: 'Bài tập', en: 'Quiz', icon: HelpCircle },
}

const questionTypeLabels: Record<string, { vi: string; en: string }> = {
  MULTIPLE_CHOICE: { vi: 'Trắc nghiệm', en: 'Multiple Choice' },
  FILL_IN_BLANK: { vi: 'Điền từ', en: 'Fill in Blank' },
  AUDIO_LISTENING: { vi: 'Nghe', en: 'Audio Listening' },
}

export function CourseFormPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    target_score: 650,
    category: 'VOCABULARY',
    level: 'BEGINNER',
    price: 0,
    is_published: false,
  })
  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: '1',
      title: '',
      description: '',
      order_index: 1,
      is_free_preview: false,
      lessons: [],
    },
  ])
  const [expandedModules, setExpandedModules] = useState<string[]>(['1'])
  const [activeSection, setActiveSection] = useState('basic')

  const sections = [
    { id: 'basic', label: isVietnamese ? 'Thông tin cơ bản' : 'Basic Info' },
    { id: 'category', label: isVietnamese ? 'Phân loại' : 'Category' },
    { id: 'content', label: isVietnamese ? 'Nội dung' : 'Content' },
    { id: 'pricing', label: isVietnamese ? 'Giá & Trạng thái' : 'Pricing & Status' },
  ]

  const targetScoreOptions = [300, 450, 500, 550, 650, 750, 850, 900]

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }))
  }

  const toggleModule = (id: string) => {
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleAddModule = () => {
    const newModule: CourseModule = {
      id: Date.now().toString(),
      title: '',
      description: '',
      order_index: modules.length + 1,
      is_free_preview: false,
      lessons: [],
    }
    setModules([...modules, newModule])
    setExpandedModules([...expandedModules, newModule.id])
  }

  const handleRemoveModule = (id: string) => {
    if (modules.length > 1) {
      setModules(modules.filter(m => m.id !== id).map((m, idx) => ({ ...m, order_index: idx + 1 })))
      setExpandedModules(expandedModules.filter(m => m !== id))
    }
  }

  const handleModuleChange = (id: string, field: keyof CourseModule, value: string | boolean) => {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const handleAddLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newLesson: CourseLesson = {
      id: Date.now().toString(),
      title: '',
      lesson_type: 'VIDEO',
      video_url: '',
      duration_seconds: 0,
      content_html: '',
      order_index: module.lessons.length + 1,
      questions: [],
    }
    setModules(modules.map(m =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
    ))
  }

  const handleRemoveLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.filter(l => l.id !== lessonId).map((l, idx) => ({ ...l, order_index: idx + 1 })),
          }
        : m
    ))
  }

  const handleLessonChange = (moduleId: string, lessonId: string, field: keyof CourseLesson, value: string | number | LessonType) => {
    setModules(modules.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l) }
        : m
    ))
  }

  const handleSave = () => {
    console.log('Saving course:', { formData, modules })
    alert(isVietnamese ? 'Đã lưu khóa học!' : 'Course saved!')
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <main className="page-content">
      
      <div className="form-header">
        <button className="back-button" onClick={() => setActiveNavItem('courses')}>
          <ChevronLeft />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </button>
        <h1 className="form-title">{isVietnamese ? 'Thêm khóa học' : 'Add Course'}</h1>
        <button className="primary-button" onClick={handleSave}>
          <Save />
          {isVietnamese ? 'Lưu' : 'Save'}
        </button>
      </div>

      <div className="form-sections-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`section-nav-btn${activeSection === section.id ? ' active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="form-content">
        
        {activeSection === 'basic' && (
          <div className="form-section">
            <h2 className="section-title">{isVietnamese ? 'Thông tin cơ bản' : 'Basic Information'}</h2>

            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? 'Tên khóa học' : 'Course Title'} <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={isVietnamese ? 'Nhập tên khóa học...' : 'Enter course title...'}
                value={formData.title}
                onChange={e => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Slug <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input slug-input"
                placeholder="course-slug"
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              />
              <span className="form-hint">URL: /courses/{formData.slug || 'course-slug'}</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? 'Mô tả' : 'Description'}
              </label>
              <textarea
                className="form-textarea"
                placeholder={isVietnamese ? 'Nhập mô tả khóa học...' : 'Enter course description...'}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? 'Ảnh thumbnail' : 'Thumbnail'}
              </label>
              <div className="thumbnail-upload">
                {formData.thumbnail_url ? (
                  <div className="thumbnail-preview">
                    <img src={formData.thumbnail_url} alt="Thumbnail" />
                    <button
                      className="thumbnail-remove"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                    >
                      <X />
                    </button>
                  </div>
                ) : (
                  <div className="thumbnail-placeholder">
                    <Image />
                    <span>{isVietnamese ? 'Chọn ảnh' : 'Select image'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'category' && (
          <div className="form-section">
            <h2 className="section-title">{isVietnamese ? 'Phân loại khóa học' : 'Course Category'}</h2>

            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? 'Danh mục' : 'Category'} <span className="required">*</span>
              </label>
              <div className="category-options">
                {Object.entries(categoryLabels).map(([key, labels]) => (
                  <button
                    key={key}
                    className={`category-option${formData.category === key ? ' selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, category: key }))}
                  >
                    <span className="category-name">{labels[isVietnamese ? 'vi' : 'en']}</span>
                    {formData.category === key && <Check className="check-icon" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? 'Cấp độ' : 'Level'} <span className="required">*</span>
              </label>
              <div className="level-options">
                {Object.entries(levelLabels).map(([key, labels]) => (
                  <button
                    key={key}
                    className={`level-option${formData.level === key ? ' selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, level: key }))}
                  >
                    {labels[isVietnamese ? 'vi' : 'en']}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? 'Điểm mục tiêu TOEIC' : 'Target TOEIC Score'}
              </label>
              <div className="score-options">
                {targetScoreOptions.map(score => (
                  <button
                    key={score}
                    className={`score-option${formData.target_score === score ? ' selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, target_score: score }))}
                  >
                    {score}+
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'content' && (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">{isVietnamese ? 'Nội dung khóa học' : 'Course Content'}</h2>
              <button className="primary-button" onClick={handleAddModule}>
                <Plus />
                {isVietnamese ? 'Thêm module' : 'Add Module'}
              </button>
            </div>

            <div className="modules-list">
              {modules.map((module, moduleIndex) => {
                const isExpanded = expandedModules.includes(module.id)
                const TypeIcon = isExpanded ? ChevronDown : ChevronRight

                return (
                  <div key={module.id} className="module-card">
                    <div className="module-header" onClick={() => toggleModule(module.id)}>
                      <button className="module-expand">
                        <TypeIcon />
                      </button>
                      <span className="module-number">{moduleIndex + 1}</span>
                      <input
                        type="text"
                        className="module-title-input"
                        placeholder={isVietnamese ? 'Tên module...' : 'Module name...'}
                        value={module.title}
                        onChange={e => {
                          e.stopPropagation()
                          handleModuleChange(module.id, 'title', e.target.value)
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                      <label className="module-toggle" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={module.is_free_preview}
                          onChange={e => handleModuleChange(module.id, 'is_free_preview', e.target.checked)}
                        />
                        <span className="toggle-label">{isVietnamese ? 'Miễn phí' : 'Free'}</span>
                      </label>
                      <button
                        className="module-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveModule(module.id)
                        }}
                        disabled={modules.length === 1}
                      >
                        <Trash2 />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="module-body">
                        <div className="module-description">
                          <textarea
                            className="module-desc-input"
                            placeholder={isVietnamese ? 'Mô tả module (tùy chọn)...' : 'Module description (optional)...'}
                            value={module.description}
                            onChange={e => handleModuleChange(module.id, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>

                        <div className="lessons-section">
                          <div className="lessons-header">
                            <span className="lessons-title">
                              {isVietnamese ? 'Bài học' : 'Lessons'} ({module.lessons.length})
                            </span>
                            <button
                              className="add-lesson-btn"
                              onClick={() => handleAddLesson(module.id)}
                            >
                              <Plus />
                              {isVietnamese ? 'Thêm bài' : 'Add Lesson'}
                            </button>
                          </div>

                          {module.lessons.length === 0 ? (
                            <div className="lessons-empty">
                              <span>{isVietnamese ? 'Chưa có bài học nào' : 'No lessons yet'}</span>
                            </div>
                          ) : (
                            <div className="lessons-list">
                              {module.lessons.map((lesson, lessonIndex) => {
                                const LessonTypeIcon = lessonTypeLabels[lesson.lesson_type].icon
                                return (
                                  <div key={lesson.id} className="lesson-item">
                                    <div className="lesson-drag">
                                      <GripVertical />
                                    </div>
                                    <span className="lesson-number">{lessonIndex + 1}</span>

                                    <select
                                      className="lesson-type-select"
                                      value={lesson.lesson_type}
                                      onChange={e => handleLessonChange(module.id, lesson.id, 'lesson_type', e.target.value as LessonType)}
                                    >
                                      {Object.entries(lessonTypeLabels).map(([type, labels]) => (
                                        <option key={type} value={type}>
                                          {labels[isVietnamese ? 'vi' : 'en']}
                                        </option>
                                      ))}
                                    </select>

                                    <input
                                      type="text"
                                      className="lesson-title-input"
                                      placeholder={isVietnamese ? 'Tên bài học...' : 'Lesson title...'}
                                      value={lesson.title}
                                      onChange={e => handleLessonChange(module.id, lesson.id, 'title', e.target.value)}
                                    />

                                    <button
                                      className="lesson-delete"
                                      onClick={() => handleRemoveLesson(module.id, lesson.id)}
                                    >
                                      <X />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="modules-summary">
              <span>
                {modules.length} {isVietnamese ? 'modules' : 'modules'} ·{' '}
                {totalLessons} {isVietnamese ? 'bài học' : 'lessons'}
              </span>
            </div>
          </div>
        )}

        {activeSection === 'pricing' && (
          <div className="form-section">
            <h2 className="section-title">{isVietnamese ? 'Giá & Trạng thái' : 'Pricing & Status'}</h2>

            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? 'Giá khóa học' : 'Course Price'}
              </label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  className="form-input price-input"
                  placeholder="0"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                />
                <span className="price-currency">đ</span>
              </div>
              <span className="form-hint">
                {formData.price === 0
                  ? (isVietnamese ? 'Khóa học miễn phí' : 'Free course')
                  : new Intl.NumberFormat('vi-VN').format(formData.price) + ' đ'
                }
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                {isVietnamese ? 'Trạng thái xuất bản' : 'Publish Status'}
              </label>
              <div className="publish-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={e => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  />
                  <span className="toggle-slider" />
                </label>
                <span className="toggle-status">
                  {formData.is_published
                    ? (isVietnamese ? 'Đã xuất bản' : 'Published')
                    : (isVietnamese ? 'Bản nháp' : 'Draft')
                  }
                </span>
              </div>
            </div>

            <div className="form-summary">
              <h3>{isVietnamese ? 'Tóm tắt' : 'Summary'}</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">{isVietnamese ? 'Tên khóa học' : 'Title'}</span>
                  <span className="summary-value">{formData.title || '-'}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{isVietnamese ? 'Danh mục' : 'Category'}</span>
                  <span className="summary-value">{categoryLabels[formData.category]?.[isVietnamese ? 'vi' : 'en']}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{isVietnamese ? 'Cấp độ' : 'Level'}</span>
                  <span className="summary-value">{levelLabels[formData.level]?.[isVietnamese ? 'vi' : 'en']}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{isVietnamese ? 'Điểm mục tiêu' : 'Target Score'}</span>
                  <span className="summary-value">{formData.target_score}+</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{isVietnamese ? 'Modules' : 'Modules'}</span>
                  <span className="summary-value">{modules.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{isVietnamese ? 'Bài học' : 'Lessons'}</span>
                  <span className="summary-value">{totalLessons}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{isVietnamese ? 'Giá' : 'Price'}</span>
                  <span className="summary-value">
                    {formData.price === 0
                      ? (isVietnamese ? 'Miễn phí' : 'Free')
                      : new Intl.NumberFormat('vi-VN').format(formData.price) + ' đ'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

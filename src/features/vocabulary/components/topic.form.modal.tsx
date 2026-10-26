import { useState, useEffect } from 'react'
import { X, Folder, Sparkles } from 'lucide-react'
import type { Topic } from '@/features/vocabulary/data/vocabulary.data'
import { useCreateTopicMutation, useUpdateTopicMutation } from '@/features/vocabulary/hooks/use.vocabulary.admin.query'
import { toast } from '@/store/toast.store'

interface TopicFormModalProps {
  isOpen: boolean
  onClose: () => void
  topic?: Topic | null
  onSuccess?: () => void
}

export function TopicFormModal({
  isOpen,
  onClose,
  topic,
  onSuccess,
}: TopicFormModalProps) {
  const isEditing = Boolean(topic?.id || topic?._id)
  const createMutation = useCreateTopicMutation()
  const updateMutation = useUpdateTopicMutation()

  const [nameVi, setNameVi] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [slug, setSlug] = useState('')
  const [cefrLevel, setCefrLevel] = useState('B1-B2')
  const [iconUrl, setIconUrl] = useState('')
  const [descriptionVi, setDescriptionVi] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [displayOrder, setDisplayOrder] = useState<number>(0)
  const [isFeatured, setIsFeatured] = useState<boolean>(false)

  useEffect(() => {
    if (topic && isOpen) {
      setNameVi(topic.name_vi || '')
      setNameEn(topic.name_en || '')
      setSlug(topic.slug || '')
      setCefrLevel(topic.cefr_level || 'B1-B2')
      setIconUrl(topic.icon_url || topic.icon || '')
      setDescriptionVi(topic.description_vi || topic.description || '')
      setDescriptionEn(topic.description_en || topic.description || '')
      setDisplayOrder(topic.display_order ?? 0)
      setIsFeatured(Boolean(topic.is_featured))
    } else if (isOpen) {
      setNameVi('')
      setNameEn('')
      setSlug('')
      setCefrLevel('B1-B2')
      setIconUrl('')
      setDescriptionVi('')
      setDescriptionEn('')
      setDisplayOrder(0)
      setIsFeatured(false)
    }
  }, [topic, isOpen])

  const handleNameEnChange = (val: string) => {
    setNameEn(val)
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(generatedSlug)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameVi.trim() || !nameEn.trim()) {
      toast.error('Vui lòng nhập tên chủ đề bằng cả tiếng Việt và tiếng Anh')
      return
    }

    const payload = {
      name_vi: nameVi.trim(),
      name_en: nameEn.trim(),
      name: nameEn.trim(),
      slug: slug.trim() || nameEn.toLowerCase().replace(/\s+/g, '-'),
      cefr_level: cefrLevel,
      icon_url: iconUrl.trim() || undefined,
      description_vi: descriptionVi.trim(),
      description_en: descriptionEn.trim(),
      description: descriptionVi.trim() || descriptionEn.trim(),
      display_order: displayOrder,
      is_featured: isFeatured,
    }

    try {
      if (isEditing && (topic?.id || topic?._id)) {
        const id = topic.id || topic._id || ''
        await updateMutation.mutateAsync({ id, payload })
        toast.success('Cập nhật chủ đề thành công!')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Tạo chủ đề mới thành công!')
      }
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      toast.error(`Thao tác thất bại: ${msg}`)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Chỉnh Sửa Chủ Đề Từ Vựng' : 'Tạo Chủ Đề Từ Vựng Mới'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEditing ? `ID: ${topic?.id || topic?._id}` : 'Nhập thông tin phân loại chủ đề từ vựng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tên chủ đề (Việt) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                placeholder="VD: Kinh doanh & Thương mại"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tên tiếng Anh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
                placeholder="VD: Business & Commerce"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Slug (Định danh)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="business-commerce"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Khung CEFR
              </label>
              <select
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="A1">A1 - Sơ cấp</option>
                <option value="A2">A2 - Tiền trung cấp</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B1-B2">B1-B2 - Trung & Trên trung cấp</option>
                <option value="B2">B2 - Trên trung cấp</option>
                <option value="C1">C1 - Cao cấp</option>
                <option value="C2">C2 - Thành thạo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Biểu tượng / Icon
              </label>
              <input
                type="text"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="Emoji hoặc link ảnh"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mô tả tiếng Việt
            </label>
            <textarea
              rows={2}
              value={descriptionVi}
              onChange={(e) => setDescriptionVi(e.target.value)}
              placeholder="Mô tả phạm vi từ vựng theo chủ đề này..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mô tả tiếng Anh
            </label>
            <textarea
              rows={2}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="English description for topic context..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Chủ đề nổi bật</div>
                <div className="text-[10px] text-slate-400">Hiển thị ưu tiên trên trang chủ và danh mục</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật chủ đề' : 'Tạo chủ đề'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

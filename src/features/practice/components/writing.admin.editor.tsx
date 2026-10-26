// Component chỉnh sửa và xuất bản bài luyện viết (Writing).

import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Collapse, Divider, Drawer, Form, Input, InputNumber, Modal, Select, Space, Spin, TreeSelect } from 'antd'
import { CustomSelect } from '@/components/custom.select'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { usePracticeText, localizedPracticeName } from '@/features/practice/hooks/use.practice.text'
import { applyPracticeFormError } from '@/features/practice/helpers/practice-form-error.helper'
import { usePracticeContexts } from '@/features/practice/hooks/use.practice.contexts'
import { writingAdminKeys, useWritingMutations } from '@/features/practice/hooks/use.writing.admin'
import { writingAdminService } from '@/features/practice/services/writing-admin.service'
import { writingPayload } from '@/features/practice/helpers/writing-admin.helper'
import { ipaError } from '@/features/practice/helpers/ipa-admin.helper'
import { ipaLevels } from '@/features/practice/types/ipa-admin.types'
import { rubricFields, writingLabels, type WritingPayload, type WritingType } from '@/features/practice/types/writing-admin.types'
import { SpeakingMediaField } from '@/features/practice/components/speaking.media.field'

export function WritingAdminEditor({ type, id, readOnly, trash, onClose }: { type: WritingType; id: string | null; readOnly: boolean; trash: boolean; onClose: () => void }) {
  const p = usePracticeText()
  const [form] = Form.useForm<WritingPayload>()
  const standard = Form.useWatch('grading_standard', form) || 'PRACTICAL'
  const maxScore = type === 'DESCRIBE_PICTURE' ? 3 : type === 'WRITE_EMAIL' ? 4 : 5
  const [modal, holder] = Modal.useModal()
  const [editing, setEditing] = useState(!readOnly)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState<{ refs: string[]; id: string } | null>(null)
  const result = useQuery({ queryKey: [...writingAdminKeys, 'detail', id, trash], queryFn: () => writingAdminService.detail(id!, trash), enabled: Boolean(id) })
  const { contexts, error: contextError } = usePracticeContexts()
  const grammar = useQuery({ queryKey: [...writingAdminKeys, 'grammar-options'], queryFn: writingAdminService.grammarOptions })
  const mutations = useWritingMutations()
  const onBusy = useCallback((delta: number) => setBusy(count => Math.max(0, count + delta)), [])
  useEffect(() => { if (!dirty && (result.data || !id)) form.setFieldsValue(writingPayload(type, result.data)) }, [result.data, dirty, form, id, type])
  const close = () => { if (busy || saving) return; if (dirty) modal.confirm({ title: p("Bỏ thay đổi chưa lưu?"), okText: p("Bỏ thay đổi"), cancelText: p("Tiếp tục sửa"), onOk: onClose }); else onClose() }
  const confirmMedia = async (item: { refs: string[]; id: string }) => {
    if (item.refs.length) {
      const files = await Promise.all(item.refs.map(ref => api.get<{ storage_key: string }>(`/media/files/${ref}`)))
      await api.post('/media/confirm', { file_urls: files.map(file => file.storage_key), content_id: item.id })
    }
    setUnconfirmed(null); toast.success(p("Đã lưu bài Writing")); onClose()
  }
  const save = async (status?: string) => {
    if (saving || busy || unconfirmed || (id && !result.data)) return
    try { await form.validateFields() } catch { return }
    const values = form.getFieldsValue(true) as WritingPayload
    const payload = writingPayload(type, { ...result.data, ...values, _id: id || '', revision: form.getFieldValue('expected_revision') ?? result.data?.revision ?? 0, status: status || values.status })
    setSaving(true); setError('')
    try {
      const saved = await mutations.save.mutateAsync({ id, payload }); setDirty(false)
      const item = { id: saved._id, refs: [...new Set([payload.prompt_image_id].filter(Boolean))] }
      try { await confirmMedia(item) } catch { setUnconfirmed(item) }
    } catch (cause) { applyPracticeFormError(form, cause); setError(ipaError(cause)) } finally { setSaving(false) }
  }
  const disabled = !editing || trash || busy > 0 || saving || Boolean(unconfirmed)
  const unavailable = disabled || Boolean(id && !result.data)
  return <Drawer open width="min(1000px, calc(100vw - 16px))" maskClosable={false} title={`${id ? editing ? p("Sửa") : p("Xem") : p("Thêm")} · ${p(writingLabels[type])}`} onClose={close} footer={<Space wrap>
    <Button disabled={busy > 0 || saving} onClick={close}>{p("Đóng")}</Button>
    {!editing && !trash && <Button type="primary" onClick={() => setEditing(true)}>{p("Chỉnh sửa")}</Button>}
    {editing && <><Button disabled={unavailable} onClick={() => { void save('DRAFT') }}>{p("Lưu nháp")}</Button><Button aria-label={p("Lưu thay đổi")} aria-busy={saving} loading={saving} disabled={unavailable} onClick={() => { void save() }}>{p("Lưu thay đổi")}</Button><Button type="primary" disabled={unavailable} onClick={() => { void save('PUBLISHED') }}>{p("Lưu & xuất bản")}</Button></>}
  </Space>}>
    {holder}
    {id && result.isPending ? <Spin /> : result.error ? <Alert type="error" title={result.error.message} action={<Button onClick={() => result.refetch()}>{p("Thử lại")}</Button>} /> : <>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {contextError && <Alert type="error" title={p("Không tải được chủ đề; hãy tải lại trước khi xuất bản")} />}
      {unconfirmed && <Alert type="warning" title={p("Bài đã lưu; ảnh upload chưa được xác nhận. Hãy thử lại để giữ ảnh lâu dài.")} action={<Button onClick={() => { void confirmMedia(unconfirmed).catch(() => toast.error(p("Chưa xác nhận được media"))) }}>{p("Thử lại")}</Button>} />}
      {id && <Alert type="info" title={p("Bài đã có lịch sử làm chỉ được sửa thông tin quản lý. Hãy tạo bài mới nếu cần đổi nội dung, đáp án hoặc tiêu chí chấm.")} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" disabled={disabled} onValuesChange={() => setDirty(true)}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="title" label={p("Tiêu đề")} rules={[{ required: true, whitespace: true, max: 300 }]}><Input /></Form.Item>
          <Form.Item name="title_vi" label={p("Tiêu đề tiếng Việt")}><Input /></Form.Item>
          <Form.Item name="context_id" label={p("Chủ đề")}><TreeSelect allowClear showSearch treeDataSimpleMode treeNodeFilterProp="title" treeData={contexts.map(context => ({ id: context._id, value: context._id, pId: context.parent_id, title: localizedPracticeName(context) }))} /></Form.Item>
          <Form.Item name="status" label={p("Trạng thái")}><CustomSelect options={[{ value: 'DRAFT', label: p("Nháp") }, { value: 'PUBLISHED', label: p("Đã xuất bản") }, { value: 'ARCHIVED', label: p("Lưu trữ") }]} /></Form.Item>
          <Form.Item name="cefr_level" label="CEFR"><CustomSelect options={ipaLevels.map(value => ({ value, label: value }))} /></Form.Item>
          <Form.Item name="difficulty_level" label={p("Độ khó")}><CustomSelect options={[{ value: 'EASY', label: p("Dễ") }, { value: 'MEDIUM', label: p("Vừa") }, { value: 'HARD', label: p("Khó") }]} /></Form.Item>
        </div>
        <Form.Item name="grading_standard" label={p("Chuẩn chấm điểm")}><CustomSelect options={[{ value: 'PRACTICAL', label: p("Giao tiếp thực tế (0–100)") }, { value: 'TOEIC', label: 'TOEIC Writing', disabled: type === 'SENTENCE_COMPLETION' }]} onChange={value => { if (value === 'TOEIC') form.setFieldValue('rubric', Object.fromEntries(rubricFields.map(field => [field, 0]))) }} /></Form.Item>
        <Form.Item name="task_requirements" label={p("Các yêu cầu cần hoàn thành")} extra={p("Mỗi yêu cầu là một ý cần phản hồi; nhập xong nhấn Enter.")}><Select mode="tags" /></Form.Item>
        <Form.Item name="grammar_knowledge_id" label={p("Kiến thức ngữ pháp (tùy chọn)")}><CustomSelect allowClear showSearch loading={grammar.isFetching} options={(grammar.data || []).map(row => ({ value: row._id, label: `${localizedPracticeName(row)} · ${row.code}` }))} /></Form.Item>
        {grammar.error && <Alert type="warning" title={p("Không tải được danh mục ngữ pháp")} action={<Button onClick={() => grammar.refetch()}>{p("Thử lại")}</Button>} />}
        <Form.Item name="description" label={p("Mô tả (Anh)")}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="description_vi" label={p("Mô tả (Việt)")}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="instruction_en" label={p("Hướng dẫn (Anh)")}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="instruction_vi" label={p("Hướng dẫn (Việt)")}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="prompt_text" label={p("Đề bài (Anh)")}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="prompt_text_vi" label={p("Đề bài (Việt)")}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="prompt_image_id" label={type === 'DESCRIBE_PICTURE' ? p("Ảnh đề bài") : p("Ảnh đề bài (tùy chọn)")}><SpeakingMediaField onChange={() => form.setFieldValue('image_description', '')} folder="practice/writing/image" kind="image" disabled={disabled} onBusy={onBusy} /></Form.Item>
        {type === 'DESCRIBE_PICTURE' && <Form.Item name="image_description" label={p("Dữ kiện ảnh đã kiểm tra (Anh)")} extra={p("Chỉ mô tả chi tiết nhìn thấy rõ, tránh suy đoán. Bộ chấm dùng dữ kiện này để kiểm tra nội dung.")}><Input.TextArea rows={4} /></Form.Item>}
        <Form.Item name="source_text" label={type === 'WRITE_EMAIL' ? p("Email nguồn (Anh)") : p("Văn bản nguồn / câu cần hoàn thành (Anh)")}><Input.TextArea rows={5} /></Form.Item>
        <Form.Item name="source_text_vi" label={type === 'WRITE_EMAIL' ? p("Email nguồn (Việt)") : p("Văn bản nguồn (Việt)")}><Input.TextArea rows={3} /></Form.Item>
        <Divider>{p("Đáp án và gợi ý")}</Divider>
        <Form.Item name="reference_answer" label={p("Đáp án mẫu")}><Input.TextArea rows={5} /></Form.Item>
        <Form.Item name="alternative_answers" label={p("Đáp án thay thế")}><Select mode="tags" tokenSeparators={[]} /></Form.Item>
        <Form.Item name="keywords" label={p("Từ khóa")}><Select mode="tags" /></Form.Item>
        <Form.Item name="target_grammar_structures" label={p("Cấu trúc ngữ pháp mục tiêu")}><Select mode="tags" /></Form.Item>
        <Collapse items={[{ key: 'pool', label: p("Bộ từ gợi ý (tùy chọn)"), forceRender: true, children: <><Form.Item name="word_pool" label={p("Bộ từ")}><Select mode="tags" /></Form.Item><Form.Item name="word_pool_instruction" label={p("Hướng dẫn bộ từ")}><Input.TextArea rows={2} /></Form.Item></> }]} />
        <Divider>{p("Giới hạn từ")}</Divider><p className="mb-3 text-sm text-slate-500">{p("0 nghĩa là không giới hạn. Tối thiểu phải nhỏ hơn hoặc bằng tối đa nếu tối đa lớn hơn 0.")}</p>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2"><Form.Item name="min_words" label={p("Số từ tối thiểu")} rules={[{ required: true }]}><InputNumber min={0} max={10000} precision={0} /></Form.Item><Form.Item name="max_words" label={p("Số từ tối đa")} dependencies={['min_words']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return value > 0 && getFieldValue('min_words') > value ? Promise.reject(new Error(p("Tối đa phải lớn hơn hoặc bằng tối thiểu"))) : Promise.resolve() } })]}><InputNumber min={0} max={10000} precision={0} /></Form.Item></div>
        <Divider>{p("Rubric chấm điểm")}</Divider>
        {standard === 'TOEIC' ? <Alert type="info" showIcon title={`${p("Điểm tổng thể theo rubric TOEIC")}: 0–${maxScore}`} description={p(type === 'DESCRIBE_PICTURE' ? 'Một câu đúng ngữ pháp, đúng ảnh và dùng đủ hai từ khóa. Không lấy trung bình điểm tiêu chí.' : type === 'WRITE_EMAIL' ? 'Đánh giá mức hoàn thành từng yêu cầu, tổ chức email và văn phong. Lỗi nhỏ không che nghĩa vẫn có thể đạt mức cao.' : 'Đánh giá quan điểm, lý do và ví dụ, tổ chức ý và khả năng sử dụng ngôn ngữ. Không tự quy đổi sang điểm toàn bài thi.')} /> : <>
          <p className="mb-3 text-sm text-slate-500">{p("Sáu tiêu chí; tổng trọng số bằng 100 hoặc để toàn bộ bằng 0 để dùng mẫu theo dạng. Tiêu chí không áp dụng được loại khỏi cách tính điểm.")}</p>
          <div className="grid grid-cols-2 gap-x-4">{rubricFields.map(field => <Form.Item key={field} name={['rubric', field]} label={{ task_achievement: p("Đáp ứng yêu cầu (%)"), vocabulary: p("Từ vựng (%)"), grammar: p("Ngữ pháp (%)"), coherence_cohesion: p("Mạch lạc & liên kết (%)"), naturalness: p("Diễn đạt tự nhiên (%)"), register: p("Văn phong phù hợp (%)") }[field]}><InputNumber min={0} max={100} disabled={disabled || (type === 'SENTENCE_COMPLETION' && ['coherence_cohesion', 'register'].includes(field))} /></Form.Item>)}</div>
        </>}

      </Form>
    </>}
  </Drawer>
}

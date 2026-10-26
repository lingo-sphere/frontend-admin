// Drawer chỉnh sửa bài tập luyện đọc (ReadingAdminEditor).

import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Collapse, Drawer, Form, Input, Modal, Select, Space, Spin, Tabs, TreeSelect } from 'antd'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { CustomSelect } from '@/components/custom.select'
import { usePracticeText, localizedPracticeName } from '@/features/practice/hooks/use.practice.text'
import { applyPracticeFormError } from '@/features/practice/helpers/practice-form-error.helper'
import { usePracticeContexts } from '@/features/practice/hooks/use.practice.contexts'
import { readingAdminKeys, useReadingMutations } from '@/features/practice/hooks/use.reading.admin'
import { readingAdminService } from '@/features/practice/services/reading-admin.service'
import { readingPayload, readingFormValues } from '@/features/practice/helpers/reading-admin.helper'
import { ipaError } from '@/features/practice/helpers/ipa-admin.helper'
import { ipaLevels } from '@/features/practice/types/ipa-admin.types'
import { readingLabels, type ReadingPayload, type ReadingType } from '@/features/practice/types/reading-admin.types'
import { ReadingMediaField } from '@/features/practice/components/reading.media.field'
import { ReadingMetadataFields } from '@/features/practice/components/reading.metadata.fields'
import { ReadingQuestionsFields } from '@/features/practice/components/reading.questions.fields'
import { ReadingPreview } from '@/features/practice/components/reading.preview'

export function ReadingAdminEditor({ type, id, readOnly, trash, onClose }: { type: ReadingType; id: string | null; readOnly: boolean; trash: boolean; onClose: () => void }) {
  const p = usePracticeText()
  const [form] = Form.useForm<ReadingPayload>()
  const [modal, holder] = Modal.useModal()
  const [editing, setEditing] = useState(!readOnly)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(0)
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState(0)
  const mediaType = Form.useWatch('media_type', { form, preserve: true })
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState<{ refs: string[]; id: string } | null>(null)
  const result = useQuery({ queryKey: [...readingAdminKeys, 'detail', id, trash], queryFn: () => readingAdminService.detail(id!, trash), enabled: Boolean(id) })
  const { contexts, error: contextError } = usePracticeContexts()
  const mutations = useReadingMutations()
  const onBusy = useCallback((delta: number) => setBusy(count => Math.max(0, count + delta)), [])
  useEffect(() => { if (!dirty && (result.data || !id)) form.setFieldsValue(readingFormValues(type, result.data)) }, [result.data, dirty, form, id, type])
  const close = () => { if (busy || saving) return; if (dirty) modal.confirm({ title: p("Bỏ thay đổi chưa lưu?"), okText: p("Bỏ thay đổi"), cancelText: p("Tiếp tục sửa"), onOk: onClose }); else onClose() }
  const confirmMedia = async (item: { refs: string[]; id: string }) => {
    if (item.refs.length) {
      const files = await Promise.all(item.refs.map(ref => api.get<{ storage_key: string }>(`/media/files/${ref}`)))
      await api.post('/media/confirm', { file_urls: files.map(file => file.storage_key), content_id: item.id })
    }
    setUnconfirmed(null); toast.success(p("Đã lưu bài Reading")); onClose()
  }
  const save = async (status?: string) => {
    if (saving || busy || unconfirmed || (id && !result.data)) return
    try { await form.validateFields() } catch { return }
    const values = form.getFieldsValue(true) as ReadingPayload
    setSaving(true); setError('')
    try {
      const payload = readingPayload(type, { ...result.data, ...values, _id: id || '', revision: form.getFieldValue('expected_revision') ?? result.data?.revision ?? 0, status: status || values.status })
      const saved = await mutations.save.mutateAsync({ id, payload }); setDirty(false)
      const item = { id: saved._id, refs: [...new Set([payload.media_id].filter(Boolean))] }
      try { await confirmMedia(item) } catch { setUnconfirmed(item) }
    } catch (cause) { applyPracticeFormError(form, cause); setError(ipaError(cause)) } finally { setSaving(false) }
  }
  const disabled = !editing || trash || busy > 0 || saving || Boolean(unconfirmed)
  const unavailable = disabled || Boolean(id && !result.data)
  return <Drawer open width="min(1440px, calc(100vw - 16px))" maskClosable={false} title={`${id ? editing ? p("Sửa") : p("Xem") : p("Thêm")} · ${p(readingLabels[type])}`} onClose={close} footer={<Space wrap>
    <Button disabled={busy > 0 || saving} onClick={close}>{p("Đóng")}</Button>
    {!editing && !trash && <Button type="primary" onClick={() => setEditing(true)}>{p("Chỉnh sửa")}</Button>}
    {editing && <><Button disabled={unavailable} onClick={() => { void save('DRAFT') }}>{p("Lưu nháp")}</Button><Button aria-label={p("Lưu thay đổi")} aria-busy={saving} loading={saving} disabled={unavailable} onClick={() => { void save() }}>{p("Lưu thay đổi")}</Button><Button type="primary" disabled={unavailable} onClick={() => { void save('PUBLISHED') }}>{p("Lưu & xuất bản")}</Button></>}
  </Space>}>
    {holder}
    {id && result.isPending ? <Spin /> : result.error ? <Alert type="error" title={result.error.message} action={<Button onClick={() => result.refetch()}>{p("Thử lại")}</Button>} /> : <>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {contextError && <Alert type="error" title={p("Không tải được chủ đề; hãy tải lại trước khi xuất bản")} />}
      {unconfirmed && <Alert type="warning" title={p("Bài đã lưu; media upload chưa được xác nhận. Hãy thử lại để giữ tệp lâu dài.")} action={<Button onClick={() => { void confirmMedia(unconfirmed).catch(() => toast.error(p("Chưa xác nhận được media"))) }}>{p("Thử lại")}</Button>} />}
      {id && <Alert type="info" title={p("Bài đã có lịch sử làm chỉ được sửa thông tin quản lý. Hãy tạo bài mới nếu cần đổi nội dung, câu hỏi hoặc đáp án.")} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" disabled={disabled} onValuesChange={() => setDirty(true)}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="title" label={p("Tiêu đề")} rules={[{ required: true, whitespace: true, max: 300 }]}><Input /></Form.Item>
          <Form.Item name="title_vi" label={p("Tiêu đề tiếng Việt")}><Input /></Form.Item>
          <Form.Item name="context_id" label={p("Chủ đề")}><TreeSelect allowClear showSearch treeDataSimpleMode treeNodeFilterProp="title" treeData={contexts.map(context => ({ id: context._id, value: context._id, pId: context.parent_id, title: localizedPracticeName(context) }))} /></Form.Item>
          <Form.Item name="status" label={p("Trạng thái")}><CustomSelect options={[{ value: 'DRAFT', label: p("Nháp") }, { value: 'PUBLISHED', label: p("Đã xuất bản") }, { value: 'ARCHIVED', label: p("Lưu trữ") }]} /></Form.Item>
          <Form.Item name="cefr_level" label="CEFR"><CustomSelect options={ipaLevels.map(value => ({ value }))} /></Form.Item>
          <Form.Item name="difficulty_level" label={p("Độ khó")}><CustomSelect options={[{ value: 'EASY', label: p("Dễ") }, { value: 'MEDIUM', label: p("Vừa") }, { value: 'HARD', label: p("Khó") }]} /></Form.Item>
        </div>
        <Form.Item name="tags" label={p("Nhãn bài đọc")}><Select mode="tags" /></Form.Item>
        <Collapse style={{ marginBottom: 16 }} items={[{ key: 'source', label: p("Tóm tắt, nguồn và media (tùy chọn)"), forceRender: true, children: <>
          <Form.Item name="content_summary" label={p("Tóm tắt")}><Input.TextArea rows={3} /></Form.Item>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2"><Form.Item name="source" label={p("Tên nguồn")}><Input /></Form.Item><Form.Item name="source_url" label={p("URL nguồn tham khảo")}><Input type="url" /></Form.Item><Form.Item name="author" label={p("Tác giả")}><Input /></Form.Item><Form.Item name="published_date" label={p("Ngày xuất bản nguồn")}><Input type="date" /></Form.Item></div>
          <Form.Item name="media_type" label={p("Loại media")}><CustomSelect allowClear options={[{ value: 'IMAGE', label: p("Ảnh") }, { value: 'VIDEO', label: 'Video' }]} onChange={() => form.setFieldValue('media_id', '')} /></Form.Item>
          {(mediaType === 'IMAGE' || mediaType === 'VIDEO') && <Form.Item name="media_id" label={p("Tệp đính kèm")}><ReadingMediaField kind={mediaType} disabled={disabled} onBusy={onBusy} /></Form.Item>}
        </> }]} />
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
          <div className="min-w-0"><Tabs defaultActiveKey="content" items={[{ key: 'content', label: p("Nội dung"), forceRender: true, children: <>
            <Form.Item name="content" htmlFor="reading-content" label={type === 'PART_6' ? p("Văn bản và marker [1]...[n]") : p("Nội dung bài đọc")}><Input.TextArea id="reading-content" rows={12} /></Form.Item>
            {type === 'PART_6' && <Button style={{ marginBottom: 16 }} onMouseDown={event => event.preventDefault()} onClick={() => { const element = document.getElementById('reading-content') as HTMLTextAreaElement | null; const text = form.getFieldValue('content') || ''; const start = element?.selectionStart ?? text.length; const end = element?.selectionEnd ?? text.length; form.setFieldValue('content', `${text.slice(0, start)}[${active + 1}]${text.slice(end)}`); setDirty(true) }}>{p("Chèn marker [")}{active + 1}{p("] tại con trỏ")}</Button>}
            <ReadingMetadataFields type={type} disabled={disabled} />
          </> }, { key: 'preview', label: p("Xem trước"), children: <ReadingPreview form={form} type={type} select={index => { const count = form.getFieldValue('questions')?.length || 0; if (index >= 0 && index < count) setActive(index) }} /> }]} /></div>
          <div className="min-w-0"><h3 className="mb-3 font-semibold">{p("Câu hỏi và đáp án")}</h3><ReadingQuestionsFields form={form} disabled={disabled} type={type} dirty={() => setDirty(true)} active={active} setActive={index => { setActive(index) }} /></div>
        </div>
      </Form>
    </>}
  </Drawer>
}

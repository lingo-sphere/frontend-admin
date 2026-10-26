import { usePracticeText, localizedPracticeName } from '../hooks/use.practice.text'
import { applyPracticeFormError } from '../helpers/practice-form-error.helper'
import { SpeakingTargetSelect } from './speaking.target.select'
import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Collapse, Divider, Drawer, Form, Input, InputNumber, Modal, Select, Space, Spin, Switch, TreeSelect } from 'antd'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { usePracticeContexts } from '../hooks/use.practice.contexts'
import { speakingAdminKeys, useSpeakingMutations } from '../hooks/use.speaking.admin'
import { speakingAdminService } from '../services/speaking-admin.service'
import { speakingPayload } from '../helpers/speaking-admin.helper'
import { ipaError } from '../helpers/ipa-admin.helper'
import { ipaLevels } from '../types/ipa-admin.types'
import { rubricFields, speakingLabels, type SpeakingPayload, type SpeakingType } from '../types/speaking-admin.types'
import { SpeakingDialogueFields } from './speaking.dialogue.fields'
import { SpeakingMediaField } from './speaking.media.field'

export function SpeakingAdminEditor({ type, id, readOnly, trash, onClose }: { type: SpeakingType; id: string | null; readOnly: boolean; trash: boolean; onClose: () => void }) {
  const p = usePracticeText()
  const [form] = Form.useForm<SpeakingPayload>()
  const [modal, holder] = Modal.useModal()
  const [editing, setEditing] = useState(!readOnly)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState<{ refs: string[]; id: string } | null>(null)
  const result = useQuery({ queryKey: [...speakingAdminKeys, 'detail', id, trash], queryFn: () => speakingAdminService.detail(id!, trash), enabled: Boolean(id) })
  const { contexts, error: contextError } = usePracticeContexts()
  const mutations = useSpeakingMutations()
  const onBusy = useCallback((delta: number) => setBusy(count => Math.max(0, count + delta)), [])
  const tiers = Form.useWatch('tiered_time_limits', { form, preserve: true })
  useEffect(() => { if (!dirty && (result.data || !id)) form.setFieldsValue(speakingPayload(type, result.data)) }, [result.data, dirty, form, id, type])
  const close = () => { if (busy || saving) return; if (dirty) modal.confirm({ title: p("Bỏ thay đổi chưa lưu?"), okText: p("Bỏ thay đổi"), cancelText: p("Tiếp tục sửa"), onOk: onClose }); else onClose() }
  const confirmMedia = async (item: { refs: string[]; id: string }) => {
    if (item.refs.length) {
      const files = await Promise.all(item.refs.map(ref => api.get<{ storage_key: string }>(`/media/files/${ref}`)))
      await api.post('/media/confirm', { file_urls: files.map(file => file.storage_key), content_id: item.id })
    }
    setUnconfirmed(null); toast.success(p("Đã lưu bài Speaking")); onClose()
  }
  const save = async (status?: string) => {
    if (saving || busy || unconfirmed || (id && !result.data)) return
    try { await form.validateFields() } catch { return }
    const values = form.getFieldsValue(true) as SpeakingPayload
    const payload = speakingPayload(type, { ...result.data, ...values, _id: id || '', revision: form.getFieldValue('expected_revision') ?? result.data?.revision ?? 0, status: status || values.status })
    setSaving(true); setError('')
    try {
      const saved = await mutations.save.mutateAsync({ id, payload }); setDirty(false)
      const item = { id: saved._id, refs: [...new Set([payload.prompt_media_id, payload.reference_media_id].filter(Boolean))] }
      try { await confirmMedia(item) } catch { setUnconfirmed(item) }
    } catch (cause) { applyPracticeFormError(form, cause); setError(ipaError(cause)) } finally { setSaving(false) }
  }
  const disabled = !editing || trash || busy > 0 || saving || Boolean(unconfirmed)
  const unavailable = disabled || Boolean(id && !result.data)
  return <Drawer open width="min(1000px, calc(100vw - 16px))" maskClosable={false} title={`${id ? editing ? p("Sửa") : p("Xem") : p("Thêm")} · ${p(speakingLabels[type])}`} onClose={close} footer={<Space wrap>
    <Button disabled={busy > 0 || saving} onClick={close}>{p("Đóng")}</Button>
    {!editing && !trash && <Button type="primary" onClick={() => setEditing(true)}>{p("Chỉnh sửa")}</Button>}
    {editing && <><Button disabled={unavailable} onClick={() => { void save('DRAFT') }}>{p("Lưu nháp")}</Button><Button aria-label={p("Lưu thay đổi")} aria-busy={saving} loading={saving} disabled={unavailable} onClick={() => { void save() }}>{p("Lưu thay đổi")}</Button><Button type="primary" disabled={unavailable} onClick={() => { void save('PUBLISHED') }}>{p("Lưu & xuất bản")}</Button></>}
  </Space>}>
    {holder}
    {id && result.isPending ? <Spin /> : result.error ? <Alert type="error" title={result.error.message} action={<Button onClick={() => result.refetch()}>{p("Thử lại")}</Button>} /> : <>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {contextError && <Alert type="error" title={p("Không tải được chủ đề; hãy tải lại trước khi xuất bản")} />}
      {unconfirmed && <Alert type="warning" title={p("Bài đã lưu; media upload chưa được xác nhận. Audio TTS đã được lưu riêng.")} action={<Button onClick={() => { void confirmMedia(unconfirmed).catch(() => toast.error(p("Chưa xác nhận được media"))) }}>{p("Thử lại")}</Button>} />}
      <Form form={form} layout="vertical" disabled={disabled} onValuesChange={() => setDirty(true)}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="title" label={p("Tiêu đề")} rules={[{ required: true, whitespace: true, max: 300 }]}><Input /></Form.Item>
          <Form.Item name="title_vi" label={p("Tiêu đề tiếng Việt")}><Input /></Form.Item>
          <Form.Item name="context_id" label={p("Chủ đề")}><TreeSelect allowClear showSearch treeDataSimpleMode treeNodeFilterProp="title" treeData={contexts.map(context => ({ id: context._id, value: context._id, pId: context.parent_id, title: localizedPracticeName(context) }))} /></Form.Item>
          <Form.Item name="status" label={p("Trạng thái")}><Select options={[{ value: 'DRAFT', label: p("Nháp") }, { value: 'PUBLISHED', label: p("Đã xuất bản") }, { value: 'ARCHIVED', label: p("Lưu trữ") }]} /></Form.Item>
          <Form.Item name="cefr_level" label="CEFR"><Select options={ipaLevels.map(value => ({ value }))} /></Form.Item>
          <Form.Item name="difficulty_level" label={p("Độ khó")}><Select options={[{ value: 'EASY', label: p("Dễ") }, { value: 'MEDIUM', label: p("Vừa") }, { value: 'HARD', label: p("Khó") }]} /></Form.Item>
        </div>
        <Form.Item name="description" label={p("Mô tả (Anh)")}><Input.TextArea rows={2} /></Form.Item><Form.Item name="description_vi" label={p("Mô tả (Việt)")}><Input.TextArea rows={2} /></Form.Item>
        <Form.Item name="prompt_text_en" label={p("Đề bài (Anh)")}><Input.TextArea rows={3} /></Form.Item><Form.Item name="prompt_text_vi" label={p("Đề bài (Việt)")}><Input.TextArea rows={2} /></Form.Item>
        {type === 'READ_ALOUD' && <><Form.Item name="source_text" label={p("Văn bản đọc to (Anh)")}><Input.TextArea rows={6} /></Form.Item><Form.Item name="source_text_vi" label={p("Bản dịch văn bản đọc")}><Input.TextArea rows={4} /></Form.Item></>}
        {type === 'DESCRIBE_PICTURE' && <Form.Item name="prompt_media_id" label={p("Ảnh đề bài")}><SpeakingMediaField kind="image" disabled={disabled} onBusy={onBusy} /></Form.Item>}
        <Form.Item name="reference_media_id" label={p("Audio mẫu (tùy chọn)")}><SpeakingMediaField kind="audio" disabled={disabled} onBusy={onBusy} /></Form.Item>
        {type === 'SHORT_DIALOGUE' && <><Divider>{p("Kịch bản & nghe thử thoại AI")}</Divider><SpeakingDialogueFields form={form} disabled={disabled} onBusy={onBusy} dirty={() => setDirty(true)} /></>}
        <Form.Item name="expected_keywords" label={p("Từ khóa mong đợi")}><Select mode="tags" /></Form.Item><Form.Item name="expected_structure" label={p("Cấu trúc/ý mong đợi")}><Select mode="tags" /></Form.Item>
        <Divider>{p("Mục tiêu kiến thức")}</Divider>
        <Form.Item name="target_lexical_item_ids" label={p("Từ vựng mục tiêu")}><SpeakingTargetSelect kind="lexical" disabled={disabled} /></Form.Item>
        <Form.Item name="target_phonetics_knowledge_ids" label={p("Ngữ âm mục tiêu")}><SpeakingTargetSelect kind="phonetics" disabled={disabled} /></Form.Item>
        <Form.Item name="target_grammar_knowledge_ids" label={p("Ngữ pháp mục tiêu")}><SpeakingTargetSelect kind="grammar" disabled={disabled} /></Form.Item>
        <Divider>{p("Thời gian")}</Divider>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2"><Form.Item name="preparation_time_seconds" label={p("Thời gian chuẩn bị (giây)")}><InputNumber min={0} max={3600} /></Form.Item><Form.Item name="response_time_seconds" label={p("Thời gian trả lời (giây)")}><InputNumber min={1} max={3600} /></Form.Item><Form.Item name="estimated_minutes" label={p("Thời lượng ước tính (phút)")}><InputNumber min={0.1} max={240} /></Form.Item></div>
        <Space style={{ marginBottom: 16 }}><Switch disabled={disabled} checked={Boolean(tiers)} onChange={enabled => { form.setFieldValue('tiered_time_limits', enabled ? Object.fromEntries(['easy', 'medium', 'hard'].map((level, index) => [level, { preparation_time_seconds: [30, 15, 0][index], response_time_seconds: 45, show_hints: index !== 2, max_record_attempts: 3 - index }])) : null); setDirty(true) }} /><span>{p("Thiết lập riêng theo độ khó")}</span></Space>
        {tiers && <Collapse items={(['easy', 'medium', 'hard'] as const).map(level => ({ key: level, label: { easy: p("Dễ"), medium: p("Vừa"), hard: p("Khó") }[level], forceRender: true, children: <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2"><Form.Item name={['tiered_time_limits', level, 'preparation_time_seconds']} label={p("Chuẩn bị (giây)")}><InputNumber min={0} max={3600} /></Form.Item><Form.Item name={['tiered_time_limits', level, 'response_time_seconds']} label={p("Trả lời (giây)")}><InputNumber min={1} max={3600} /></Form.Item><Form.Item name={['tiered_time_limits', level, 'show_hints']} label={p("Hiện gợi ý")} valuePropName="checked"><Switch /></Form.Item><Form.Item name={['tiered_time_limits', level, 'max_record_attempts']} label={p("Số lần thu âm")}><InputNumber min={1} max={10} /></Form.Item></div> }))} />}
        <Divider>{p("Rubric nội dung")}</Divider><p className="mb-3 text-sm text-slate-500">{p("Để toàn bộ bằng 0 để dùng mặc định. Cấu hình này lưu cùng nội dung; bộ chấm hiện tại vẫn áp dụng công thức riêng theo dạng bài.")}</p>
        <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">{rubricFields.map(field => <Form.Item key={field} name={['rubric', field]} label={{ pronunciation: p("Phát âm (%)"), fluency: p("Lưu loát (%)"), vocabulary: p("Từ vựng (%)"), grammar: p("Ngữ pháp (%)"), coherence: p("Mạch lạc (%)"), content: p("Nội dung (%)") }[field]}><InputNumber min={0} max={100} /></Form.Item>)}</div>
        <Form.Item name="max_score" label={p("Điểm tối đa")}><InputNumber min={1} max={100} /></Form.Item>
      </Form>
    </>}
  </Drawer>
}

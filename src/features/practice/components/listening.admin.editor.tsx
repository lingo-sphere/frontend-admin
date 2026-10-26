// Drawer chỉnh sửa bài tập luyện nghe (ListeningAdminEditor).

import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Collapse, Divider, Drawer, Form, Input, InputNumber, Modal, Space, Spin, Switch, TreeSelect } from 'antd'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { CustomSelect } from '@/components/custom.select'
import { usePracticeText, localizedPracticeName } from '@/features/practice/hooks/use.practice.text'
import { applyPracticeFormError } from '@/features/practice/helpers/practice-form-error.helper'
import { usePracticeContexts } from '@/features/practice/hooks/use.practice.contexts'
import { listeningAdminKeys, useListeningMutations } from '@/features/practice/hooks/use.listening.admin'
import { listeningAdminService } from '@/features/practice/services/listening-admin.service'
import { listeningPayload } from '@/features/practice/helpers/listening-admin.helper'
import { ipaError, mediaKeyRule } from '@/features/practice/helpers/ipa-admin.helper'
import { ipaLevels } from '@/features/practice/types/ipa-admin.types'
import { listeningLabels, listeningSubtypes, type ListeningPayload, type ListeningType } from '@/features/practice/types/listening-admin.types'
import { PracticeMediaField } from '@/features/practice/components/practice.media.field'
import { ListeningOptionsFields } from '@/features/practice/components/listening.options.fields'
import { ListeningSegmentsFields } from '@/features/practice/components/listening.segments.fields'

export function ListeningAdminEditor({ type, id, readOnly, trash, onClose }: { type: ListeningType; id: string | null; readOnly: boolean; trash: boolean; onClose: () => void }) {
  const p = usePracticeText()
  const [form] = Form.useForm<ListeningPayload>()
  const [modal, holder] = Modal.useModal()
  const [editing, setEditing] = useState(!readOnly)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState<{ keys: string[]; id: string } | null>(null)
  const result = useQuery({ queryKey: [...listeningAdminKeys, type, id, trash], queryFn: () => listeningAdminService.detail(type, id!, trash), enabled: Boolean(id) })
  const { contexts, error: contextError, isLoading: loadingContexts } = usePracticeContexts()
  const mutations = useListeningMutations(type)
  const onBusy = useCallback((delta: number) => setBusy(count => Math.max(0, count + delta)), [])
  useEffect(() => { if (!dirty && (result.data || !id)) form.setFieldsValue(listeningPayload(type, result.data)) }, [result.data, dirty, form, id, type])
  const close = () => { if (busy || saving) return; if (dirty) modal.confirm({ title: p("Bỏ thay đổi chưa lưu?"), okText: p("Bỏ thay đổi"), cancelText: p("Tiếp tục sửa"), onOk: onClose }); else onClose() }
  const confirmMedia = async (item: { keys: string[]; id: string }) => {
    if (item.keys.length) await api.post('/media/confirm', { file_urls: item.keys, content_id: item.id })
    setUnconfirmed(null); toast.success(p("Đã lưu bài nghe")); onClose()
  }
  const save = async (status?: string) => {
    if (saving || busy || unconfirmed || (id && !result.data)) return
    try { await form.validateFields() } catch { return }
    const values = form.getFieldsValue(true) as ListeningPayload
    setSaving(true); setError('')
    // Include preserved non-rendered fields and the revision captured when this form loaded.
    const payload = listeningPayload(type, { ...result.data, ...values, _id: id || '', revision: form.getFieldValue('expected_revision') ?? result.data?.revision ?? 0, status: status || values.status })
    try {
      const saved = await mutations.save.mutateAsync({ id, payload })
      setDirty(false)
      const item = { id: saved._id, keys: [...new Set([payload.audio_url, payload.image_url, ...payload.segments.map(segment => segment.audio_segment_url), ...payload.options.map(option => option.audio_url)].filter((key): key is string => Boolean(key)))] }
      try { await confirmMedia(item) } catch { setUnconfirmed(item) }
    } catch (cause) { applyPracticeFormError(form, cause); setError(ipaError(cause)) } finally { setSaving(false) }
  }
  const subtype = listeningSubtypes[type]
  const disabled = !editing || trash || busy > 0 || saving || Boolean(unconfirmed)
  return <Drawer open width="min(1000px, calc(100vw - 16px))" maskClosable={false} title={`${id ? editing ? p("Sửa") : p("Xem") : p("Thêm")} · ${p(listeningLabels[type])}`} onClose={close} footer={<Space wrap>
    <Button onClick={close} disabled={busy > 0 || saving}>{p("Đóng")}</Button>
    {!editing && !trash && <Button type="primary" onClick={() => setEditing(true)}>{p("Chỉnh sửa")}</Button>}
    {editing && <><Button disabled={disabled || Boolean(id && !result.data)} onClick={() => { void save('DRAFT') }}>{p("Lưu nháp")}</Button><Button loading={saving} disabled={disabled || Boolean(id && !result.data)} onClick={() => { void save() }}>{p("Lưu thay đổi")}</Button><Button type="primary" disabled={disabled || Boolean(id && !result.data)} onClick={() => { void save('PUBLISHED') }}>{p("Lưu & xuất bản")}</Button></>}
  </Space>}>
    {holder}
    {id && result.isPending ? <Spin /> : result.error ? <Alert type="error" title={result.error.message} action={<Button onClick={() => result.refetch()}>{p("Thử lại")}</Button>} /> : <>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {unconfirmed && <Alert type="warning" title={p("Bài đã lưu; media chưa được xác nhận lưu trữ.")} action={<Button onClick={() => { void confirmMedia(unconfirmed).catch(() => toast.error(p("Chưa xác nhận được media"))) }}>{p("Thử lại")}</Button>} />}
      {contextError && <Alert type="error" title={p("Không tải được danh sách chủ đề. Hãy tải lại trước khi xuất bản.")} />}
      <Form form={form} layout="vertical" disabled={disabled} onValuesChange={() => setDirty(true)}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="title" label={p("Tiêu đề")} rules={[{ required: true, whitespace: true, max: 300 }]}><Input /></Form.Item>
          <Form.Item name="title_vi" label={p("Tiêu đề tiếng Việt")}><Input /></Form.Item>
          <Form.Item name="context_id" label={p("Chủ đề")}><TreeSelect treeDataSimpleMode showSearch treeNodeFilterProp="title" loading={loadingContexts} allowClear treeData={contexts.map(context => ({ id: context._id, value: context._id, pId: context.parent_id, title: localizedPracticeName(context) }))} /></Form.Item>
          <Form.Item name="status" label={p("Trạng thái")}><CustomSelect options={[{ value: 'DRAFT', label: p("Nháp") }, { value: 'PUBLISHED', label: p("Đã xuất bản") }, { value: 'ARCHIVED', label: p("Lưu trữ") }]} /></Form.Item>
          <Form.Item name="cefr_level" label="CEFR"><CustomSelect options={ipaLevels.map(value => ({ value }))} /></Form.Item>
          <Form.Item name="difficulty_level" label={p("Độ khó")}><CustomSelect options={[{ value: 'EASY', label: p("Dễ") }, { value: 'MEDIUM', label: p("Vừa") }, { value: 'HARD', label: p("Khó") }]} /></Form.Item>
          {subtype.field && <Form.Item name={subtype.field} label={p(subtype.label)}><CustomSelect options={subtype.values.map(value => ({ value }))} /></Form.Item>}
          <Form.Item name="duration_seconds" label={p("Thời lượng audio (giây)")}><InputNumber min={0} max={14400} precision={2} style={{ width: '100%' }} /></Form.Item>
        </div>
        {(type === 'part1' || type === 'dictation') && <><Form.Item name="description" label={p("Mô tả (Anh)")}><Input.TextArea rows={2} /></Form.Item><Form.Item name="description_vi" label={p("Mô tả (Việt)")}><Input.TextArea rows={2} /></Form.Item></>}
        <Form.Item name="audio_url" label={p("Audio bài nghe")} rules={[mediaKeyRule]}><PracticeMediaField kind="audio" disabled={disabled} onBusy={onBusy} onChange={key => { form.setFieldsValue({ audio_url: key, media_id: '', audio_media_id: '', ...(type === 'part2' ? { settings: { ...form.getFieldValue('settings'), audio_mode: 'FULL_AUDIO' } } : {}) }); setDirty(true) }} /></Form.Item>
        {type !== 'part2' && type !== 'dictation' && <Form.Item name="image_url" label={type === 'part1' ? p("Ảnh đề bài") : p("Ảnh/biểu đồ (tùy chọn)")} rules={[mediaKeyRule]}><PracticeMediaField kind="image" disabled={disabled} onBusy={onBusy} onChange={key => { form.setFieldsValue({ image_url: key, image_media_id: '' }); setDirty(true) }} /></Form.Item>}
        <Form.Item name="transcript" label={p("Transcript (Anh)")}><Input.TextArea rows={5} /></Form.Item>
        <Form.Item name="transcript_vi" label={p("Transcript (Việt)")}><Input.TextArea rows={4} /></Form.Item>
        {(type === 'part1' || type === 'part2') && <><Divider>{p("Các lựa chọn")}</Divider><ListeningOptionsFields count={type === 'part1' ? 4 : 3} /></>}
        {type === 'part3' && <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">{[1, 2].map(index => <div key={index}><Form.Item name={`speaker_${index}`} label={p("Giọng người nói {{p0}}", { p0: index })}><CustomSelect options={[{ value: 'MALE', label: p("Nam") }, { value: 'FEMALE', label: p("Nữ") }]} /></Form.Item><Form.Item name={`speaker_${index}_name`} label={p("Tên người nói {{p0}}", { p0: index })}><Input /></Form.Item></div>)}</div>}
        {type === 'part4' && <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2"><Form.Item name="speaker_gender" label={p("Giọng người nói")}><CustomSelect options={[{ value: 'MALE', label: p("Nam") }, { value: 'FEMALE', label: p("Nữ") }]} /></Form.Item><Form.Item name="speaker_name" label={p("Tên người nói")}><Input /></Form.Item><Form.Item name="speaker_role" label={p("Vai trò người nói")}><Input /></Form.Item></div>}
        {(type === 'part3' || type === 'part4') && <><Divider>{p("Ba câu hỏi trong cùng bài")}</Divider><Collapse defaultActiveKey={['0']} items={[0, 1, 2].map(index => ({ key: String(index), label: p("Câu hỏi {{p0}}", { p0: index + 1 }), forceRender: true, children: <>
          <Form.Item name={['questions', index, 'question_text']} label={p("Câu hỏi (Anh)")}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name={['questions', index, 'question_text_vi']} label={p("Câu hỏi (Việt)")}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name={['questions', index, 'question_type']} label={p("Kiểu câu hỏi")}><CustomSelect options={(type === 'part3' ? ['MAIN_IDEA', 'DETAIL', 'INFERENCE', 'TONE', 'PRONOUN', 'NEXT_ACTION'] : ['MAIN_IDEA', 'DETAIL', 'INFERENCE', 'PURPOSE', 'TONE', 'VOCABULARY', 'PRONOUN', 'AUDIENCE']).map(value => ({ value }))} /></Form.Item>
          <ListeningOptionsFields prefix={['questions', index]} count={4} />
        </> }))} /></>}
        {(type === 'dictation' || type === 'part3') && <><Divider>{type === 'dictation' ? p("Đoạn nghe & chỗ trống") : p("Lời thoại có mốc thời gian (tùy chọn)")}</Divider><ListeningSegmentsFields form={form} disabled={disabled} dictation={type === 'dictation'} dirty={() => setDirty(true)} /></>}
        {type === 'dictation' && <><Divider>{p("Thiết lập ba mức Dictation")}</Divider><Collapse items={(['easy', 'medium', 'hard'] as const).map(level => ({ key: level, label: { easy: p("Dễ"), medium: p("Vừa"), hard: p("Khó") }[level], forceRender: true, children: <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name={['difficulty_settings', level, 'hide_ratio']} label={p("Tỷ lệ chỗ trống (0–1)")}><InputNumber min={0} max={1} step={0.1} /></Form.Item>
          <Form.Item name={['difficulty_settings', level, 'blank_types']} label={p("Loại chỗ trống")}><CustomSelect mode="multiple" options={[{ value: 'WORD', label: p("Từ") }, { value: 'PHRASE', label: p("Cụm từ") }, { value: 'SENTENCE', label: p("Câu") }]} /></Form.Item>
          <Form.Item name={['difficulty_settings', level, 'time_per_segment']} label={p("Thời gian mỗi đoạn (giây)")}><InputNumber min={1} max={3600} /></Form.Item>
          <Form.Item name={['difficulty_settings', level, 'replay_limit']} label={p("Số lần nghe lại")}><InputNumber min={0} max={100} /></Form.Item>
          <Form.Item name={['difficulty_settings', level, 'allow_replay']} label={p("Cho nghe lại")} valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name={['difficulty_settings', level, 'show_first_letter']} label={p("Gợi ý chữ đầu")} valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name={['difficulty_settings', level, 'show_length']} label={p("Gợi ý độ dài")} valuePropName="checked"><Switch /></Form.Item>
        </div> }))} /></>}
        <Divider>{p("Thiết lập")}</Divider>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          {type === 'dictation' ? <>
            <Form.Item name={['settings', 'show_transcript_after']} label={p("Hiện transcript sau khi làm")} valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name={['settings', 'show_answers_immediately']} label={p("Hiện đáp án ngay")} valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name={['settings', 'enable_hints']} label={p("Cho dùng gợi ý")} valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name={['settings', 'max_hints_per_segment']} label={p("Số gợi ý mỗi đoạn")}><InputNumber min={0} max={20} /></Form.Item>
          </> : <>
            <Form.Item name={['settings', 'allow_replay']} label={p("Cho nghe lại")} valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name={['settings', 'replay_limit']} label={p("Số lần nghe lại")}><InputNumber min={0} max={100} /></Form.Item>
            <Form.Item name={['settings', 'time_per_question']} label={p("Thời gian mỗi câu (giây)")}><InputNumber min={1} max={3600} /></Form.Item>
            {type === 'part1' && <Form.Item name={['settings', 'show_image_before']} label={p("Hiện ảnh trước audio")} valuePropName="checked"><Switch /></Form.Item>}
            {(type === 'part3' || type === 'part4') && <Form.Item name={['settings', 'show_questions_before_audio']} label={p("Hiện câu hỏi trước audio")} valuePropName="checked"><Switch /></Form.Item>}
          </>}
        </div>
      </Form>
    </>}
  </Drawer>
}

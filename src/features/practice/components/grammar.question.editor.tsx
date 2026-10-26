import { usePracticeText, localizedPracticeName } from '../hooks/use.practice.text'
import { applyPracticeFormError } from '../helpers/practice-form-error.helper'
import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Drawer, Form, Input, Modal, Select, Space, Spin, TreeSelect } from 'antd'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { usePracticeContexts } from '../hooks/use.practice.contexts'
import { grammarAdminKeys, useGrammarMutations, useGrammarTree } from '../hooks/use.grammar.admin'
import { grammarAdminService } from '../services/grammar-admin.service'
import { grammarQuestionPayload } from '../helpers/grammar-admin.helper'
import { ipaError } from '../helpers/ipa-admin.helper'
import { ipaLevels } from '../types/ipa-admin.types'
import { newGrammarData, grammarLabels, grammarTypes, grammarCategories, grammarCategoryLabels, type GrammarQuestionPayload, type GrammarType } from '../types/grammar-admin.types'
import { GrammarMediaField } from './grammar.media.field'
import { GrammarOrderingFields } from './grammar.ordering.fields'

export function GrammarQuestionEditor({ id, readOnly, trash, initialTopic, onClose }: { initialTopic?: string; id: string | null; readOnly: boolean; trash: boolean; onClose: () => void }) {
  const p = usePracticeText()
  const [form] = Form.useForm<GrammarQuestionPayload>()
  const [modal, holder] = Modal.useModal()
  const [editing, setEditing] = useState(!readOnly)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState<{ refs: string[]; id: string } | null>(null)
  const result = useQuery({ queryKey: [...grammarAdminKeys, 'question', id, trash], queryFn: () => grammarAdminService.question(id!, trash), enabled: Boolean(id) })
  const { contexts, error: contextError } = usePracticeContexts()
  const tree = useGrammarTree()
  const type = (Form.useWatch('question_type', { form, preserve: true }) || 'MULTIPLE_CHOICE') as GrammarType
  const options = (Form.useWatch(['question_data', 'options'], { form, preserve: true }) || []) as GrammarQuestionPayload['question_data']['options']
  const mutations = useGrammarMutations()
  const onBusy = useCallback((delta: number) => setBusy(count => Math.max(0, count + delta)), [])
  useEffect(() => { if (!dirty && (result.data || !id)) form.setFieldsValue(grammarQuestionPayload(result.data || { grammar_knowledge_id: initialTopic || '' })) }, [result.data, dirty, form, id, initialTopic])
  const close = () => { if (busy || saving) return; if (dirty) modal.confirm({ title: p("Bỏ thay đổi chưa lưu?"), okText: p("Bỏ thay đổi"), cancelText: p("Tiếp tục sửa"), onOk: onClose }); else onClose() }
  const confirmMedia = async (item: { refs: string[]; id: string }) => {
    if (item.refs.length) {
      const files = await Promise.all(item.refs.map(ref => api.get<{ storage_key: string }>(`/media/files/${ref}`)))
      await api.post('/media/confirm', { file_urls: files.map(file => file.storage_key), content_id: item.id })
    }
    setUnconfirmed(null); toast.success(p("Đã lưu câu hỏi Grammar")); onClose()
  }
  const save = async (status?: string) => {
    if (saving || busy || unconfirmed || (id && !result.data)) return
    try { await form.validateFields() } catch { return }
    const values = form.getFieldsValue(true) as GrammarQuestionPayload
    const payload = grammarQuestionPayload({ ...result.data, ...values, _id: id || '', revision: form.getFieldValue('expected_revision') ?? result.data?.revision ?? 0, status: status || values.status })
    setSaving(true); setError('')
    try {
      const saved = await mutations.saveQuestion.mutateAsync({ id, payload }); setDirty(false)
      const item = { id: saved._id, refs: [...new Set([payload.media_id].filter(Boolean))] }
      try { await confirmMedia(item) } catch { setUnconfirmed(item) }
    } catch (cause) { applyPracticeFormError(form, cause); setError(ipaError(cause)) } finally { setSaving(false) }
  }
  const disabled = !editing || trash || busy > 0 || saving || Boolean(unconfirmed)
  const unavailable = disabled || Boolean(id && !result.data)
  return <Drawer open width="min(1000px, calc(100vw - 16px))" maskClosable={false} title={`${id ? editing ? p("Sửa") : p("Xem") : p("Thêm")} · ${p(grammarLabels[type])}`} onClose={close} footer={<Space wrap>
    <Button disabled={busy > 0 || saving} onClick={close}>{p("Đóng")}</Button>
    {!editing && !trash && <Button type="primary" onClick={() => setEditing(true)}>{p("Chỉnh sửa")}</Button>}
    {editing && <><Button disabled={unavailable} onClick={() => { void save('DRAFT') }}>{p("Lưu nháp")}</Button><Button aria-label={p("Lưu thay đổi")} aria-busy={saving} loading={saving} disabled={unavailable} onClick={() => { void save() }}>{p("Lưu thay đổi")}</Button><Button type="primary" disabled={unavailable} onClick={() => { void save('PUBLISHED') }}>{p("Lưu & xuất bản")}</Button></>}
  </Space>}>
    {holder}
    {id && result.isPending ? <Spin /> : result.error ? <Alert type="error" title={result.error.message} action={<Button onClick={() => result.refetch()}>{p("Thử lại")}</Button>} /> : <>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {contextError && <Alert type="error" title={p("Không tải được chủ đề; hãy tải lại trước khi xuất bản")} />}
      {unconfirmed && <Alert type="warning" title={p("Câu đã lưu; media chưa được xác nhận. Hãy thử lại để giữ tệp lâu dài.")} action={<Button onClick={() => { void confirmMedia(unconfirmed).catch(() => toast.error(p("Chưa xác nhận được media"))) }}>{p("Thử lại")}</Button>} />}
      {result.data?.domain === 'VOCABULARY' && <Alert type="info" title={p("Câu này dùng chung với ngân hàng từ vựng. Thay đổi được lưu trên cùng bản dữ liệu.")} style={{ marginBottom: 16 }} />}
      {id && <Alert type="info" title={p("Bài đã có lịch sử làm chỉ được sửa thông tin quản lý. Hãy tạo bài mới nếu cần đổi nội dung, đáp án hoặc tiêu chí chấm.")} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" disabled={disabled} onValuesChange={() => setDirty(true)}>
        <Form.Item name="question_type" label={p("Dạng câu hỏi")}><Select disabled={disabled || Boolean(id)} options={grammarTypes.map(value => ({ value, label: p(grammarLabels[value]) }))} onChange={value => form.setFieldValue('question_data', newGrammarData(value))} /></Form.Item>
        <Form.Item name="grammar_knowledge_id" label={p("Chủ điểm ngữ pháp")}><TreeSelect allowClear showSearch treeDataSimpleMode treeNodeFilterProp="title" treeData={(tree.data || []).map(row => ({ id: row._id, value: row._id, pId: row.parent_id, title: `${localizedPracticeName(row)}${row.status === 'INACTIVE' ? p(" (ngừng sử dụng)") : ''}` }))} /></Form.Item>
        <Form.Item name="exercise_type" label={p("Nhãn kỹ năng (tùy chọn)")}><Select allowClear showSearch options={grammarCategories.map(value => ({ value, label: p(grammarCategoryLabels[value] || value) }))} /></Form.Item>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="question_text_en" label={p("Câu hỏi (Anh)")} rules={[{ required: true, whitespace: true, max: 10000 }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="question_text_vi" label={p("Câu hỏi (Việt)")}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="context_id" label={p("Chủ đề")}><TreeSelect allowClear showSearch treeDataSimpleMode treeNodeFilterProp="title" treeData={contexts.map(context => ({ id: context._id, value: context._id, pId: context.parent_id, title: localizedPracticeName(context) }))} /></Form.Item>
          <Form.Item name="status" label={p("Trạng thái")}><Select options={[{ value: 'DRAFT', label: p("Nháp") }, { value: 'PUBLISHED', label: p("Đã xuất bản") }, { value: 'ARCHIVED', label: p("Lưu trữ") }]} /></Form.Item>
          <Form.Item name="cefr_level" label="CEFR"><Select options={ipaLevels.map(value => ({ value }))} /></Form.Item>
          <Form.Item name="difficulty_level" label={p("Độ khó")}><Select options={[{ value: 'EASY', label: p("Dễ") }, { value: 'MEDIUM', label: p("Vừa") }, { value: 'HARD', label: p("Khó") }]} /></Form.Item>
        </div>
        <Form.Item name="instruction_en" label={p("Hướng dẫn (Anh)")}><Input.TextArea rows={2} /></Form.Item><Form.Item name="instruction_vi" label={p("Hướng dẫn (Việt)")}><Input.TextArea rows={2} /></Form.Item>
        {type === 'MULTIPLE_CHOICE' && <><Form.List name={['question_data', 'options']}>{(fields, { add, remove }) => <div className="space-y-2">{fields.map(field => <div key={field.key} className="grid grid-cols-[64px_1fr_auto] gap-2"><Form.Item name={[field.name, 'key']} label={p("Mã")}><Input /></Form.Item><Form.Item name={[field.name, 'text']} label={p("Lựa chọn {{p0}}", { p0: options[field.name]?.key || field.name + 1 })}><Input.TextArea rows={2} /></Form.Item><Button danger disabled={disabled} onClick={() => { if (options[field.name]?.key === form.getFieldValue(['question_data', 'correct_answer'])) form.setFieldValue(['question_data', 'correct_answer'], ''); remove(field.name) }}>{p("Xóa lựa chọn")}</Button></div>)}<Button disabled={disabled || fields.length >= 26} onClick={() => add({ key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(key => !options.some(option => option.key === key)) || '', text: '' })}>{p("Thêm lựa chọn")}</Button></div>}</Form.List><Form.Item name={['question_data', 'correct_answer']} label={p("Đáp án đúng")}><Select allowClear options={options.filter(option => option.key).map(option => ({ value: option.key, label: `${option.key} · ${option.text || p("(chưa có nội dung)")}` }))} /></Form.Item></>}
        {type === 'FILL_BLANK' && <><Form.Item name={['question_data', 'correct_answer']} label={p("Đáp án đúng")}><Input /></Form.Item><Form.Item name={['question_data', 'alternative_answers']} label={p("Đáp án thay thế")}><Select mode="tags" /></Form.Item></>}
        {type === 'ORDERING' && <GrammarOrderingFields key={id || 'new'} form={form} disabled={disabled} dirty={() => setDirty(true)} />}
        <Form.Item name={['question_data', 'explanation']} label={p("Giải thích (Anh)")}><Input.TextArea rows={3} /></Form.Item><Form.Item name={['question_data', 'explanation_vi']} label={p("Giải thích (Việt)")}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="media_id" label={p("Media đính kèm (tùy chọn)")}><GrammarMediaField disabled={disabled} onBusy={onBusy} /></Form.Item>
      </Form>
    </>}
  </Drawer>
}

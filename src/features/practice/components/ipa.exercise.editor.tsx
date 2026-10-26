// Drawer chỉnh sửa bài tập ngữ âm IPA (IpaExerciseEditor).

import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Divider, Drawer, Form, Input, Modal, Select, Space, Spin } from 'antd'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { CustomSelect } from '@/components/custom.select'
import { usePracticeText, localizedPracticeName } from '@/features/practice/hooks/use.practice.text'
import { applyPracticeFormError } from '@/features/practice/helpers/practice-form-error.helper'
import { usePracticeContexts } from '@/features/practice/hooks/use.practice.contexts'
import { ipaAdminKeys, useIpaMutations } from '@/features/practice/hooks/use.ipa.admin'
import { ipaAdminService } from '@/features/practice/services/ipa-admin.service'
import { ipaLevels, ipaTypeLabels, ipaTypes, type IpaExerciseRecord, type IpaExerciseType, type SaveIpaExercise } from '@/features/practice/types/ipa-admin.types'
import { exercisePayload, ipaError, mediaKeyRule } from '@/features/practice/helpers/ipa-admin.helper'
import { IpaAudioField } from '@/features/practice/components/ipa.audio.field'

export function IpaExerciseEditor({ id, type, readOnly, trash, onClose }: { id: string | null; type: IpaExerciseType; readOnly: boolean; trash: boolean; onClose: () => void }) {
  const p = usePracticeText()
  const [form] = Form.useForm<SaveIpaExercise>()
  const [modal, contextHolder] = Modal.useModal()
  const [editing, setEditing] = useState(!readOnly)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState<{ keys: string[]; id: string } | null>(null)
  const { data, isPending, error: loadError, refetch } = useQuery({ queryKey: [...ipaAdminKeys.all, 'exercise', id, trash], queryFn: () => ipaAdminService.exercise(id!, trash), enabled: Boolean(id) })
  const { contexts, isLoading: loadingContexts } = usePracticeContexts()
  const { saveExercise } = useIpaMutations()
  const selectedType = Form.useWatch('exercise_type', form) || type
  const pair = Form.useWatch('minimal_pair', form)
  const options = Form.useWatch('options', form) || []
  const onBusy = useCallback((delta: number) => setBusy(count => Math.max(0, count + delta)), [])
  useEffect(() => {
    if (!dirty && (data || !id)) form.setFieldsValue(data ? exercisePayload(data) : { exercise_type: type, title: '', status: 'DRAFT', cefr_level: 'A1', difficulty_level: 'MEDIUM', target_phonemes: [], target_words: [], options: [], minimal_pair: { word_a: '', word_b: '', ipa_a: '', ipa_b: '', phoneme_contrast: '' } })
  }, [data, dirty, form, id, type])
  const close = () => {
    if (busy || saving) return
    if (dirty) modal.confirm({ title: p("Bỏ thay đổi chưa lưu?"), okText: p("Bỏ thay đổi"), cancelText: p("Tiếp tục sửa"), onOk: onClose })
    else onClose()
  }
  const confirm = async (item: { keys: string[]; id: string }) => {
    if (item.keys.length) await api.post('/media/confirm', { file_urls: item.keys, content_id: item.id })
    setUnconfirmed(null); toast.success(p("Đã lưu bài tập IPA")); onClose()
  }
  const save = async (status?: string) => {
    if (busy || saving || unconfirmed) return
    let values: SaveIpaExercise
    try { values = await form.validateFields() } catch { return }
    setSaving(true); setError('')
    const payload = exercisePayload({ ...data, ...values, _id: id || '', revision: form.getFieldValue('expected_revision') ?? data?.revision ?? 0, status: status || values.status } as IpaExerciseRecord)
    try {
      const result = await saveExercise.mutateAsync({ id, payload })
      setDirty(false)
      const keys = [payload.audio_id, payload.minimal_pair?.audio_a, payload.minimal_pair?.audio_b].filter((key): key is string => Boolean(key))
      const item = { keys, id: result._id }
      try { await confirm(item) } catch { setUnconfirmed(item) }
    } catch (cause) { applyPracticeFormError(form, cause); setError(ipaError(cause)) } finally { setSaving(false) }
  }
  const choices: string[] = selectedType === 'MINIMAL_PAIR_LISTEN' ? [pair?.word_a, pair?.word_b].filter((value): value is string => typeof value === 'string' && Boolean(value)) : options
  return <Drawer open width="min(850px, calc(100vw - 16px))" maskClosable={false} title={id ? p("{{p0}} bài tập IPA", { p0: editing ? p("Sửa") : p("Chi tiết") }) : p("Thêm bài tập IPA")} onClose={close} footer={<Space wrap>
    <Button onClick={close} disabled={busy > 0 || saving}>{p("Đóng")}</Button>
    {!editing && !trash && <Button type="primary" onClick={() => setEditing(true)}>{p("Chỉnh sửa")}</Button>}
    {editing && <><Button disabled={busy > 0 || saving || Boolean(unconfirmed)} onClick={() => { void save('DRAFT') }}>{p("Lưu nháp")}</Button><Button loading={saving} disabled={busy > 0 || Boolean(unconfirmed)} onClick={() => { void save() }}>{p("Lưu thay đổi")}</Button><Button type="primary" disabled={busy > 0 || saving || Boolean(unconfirmed)} onClick={() => { void save('PUBLISHED') }}>{p("Lưu & xuất bản")}</Button></>}
  </Space>}>
    {contextHolder}
    {id && isPending ? <Spin /> : loadError ? <Alert type="error" title={loadError.message} action={<Button onClick={() => refetch()}>{p("Thử lại")}</Button>} /> : <>
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {unconfirmed && <Alert type="warning" title={p("Bài đã lưu, audio chưa được xác nhận lưu trữ.")} action={<Button onClick={() => { void confirm(unconfirmed).catch(() => toast.error(p("Chưa xác nhận được audio"))) }}>{p("Thử lại")}</Button>} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" disabled={!editing || trash || busy > 0 || saving || Boolean(unconfirmed)} onValuesChange={() => setDirty(true)}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="title" label={p("Tiêu đề")} rules={[{ required: true, whitespace: true, max: 300 }]}><Input /></Form.Item>
          <Form.Item name="title_vi" label={p("Tiêu đề tiếng Việt")}><Input /></Form.Item>
          <Form.Item name="exercise_type" label={p("Dạng bài")} rules={[{ required: true }]}><CustomSelect options={ipaTypes.map(value => ({ value, label: p(ipaTypeLabels[value]) }))} onChange={() => form.setFieldsValue({ correct_answer: '' })} /></Form.Item>
          <Form.Item name="status" label={p("Trạng thái")}><CustomSelect options={[{ value: 'DRAFT', label: p("Nháp") }, { value: 'PUBLISHED', label: p("Đã xuất bản") }, { value: 'ARCHIVED', label: p("Lưu trữ") }]} /></Form.Item>
          <Form.Item name="cefr_level" label="CEFR"><CustomSelect options={ipaLevels.map(value => ({ value }))} /></Form.Item>
          <Form.Item name="difficulty_level" label={p("Độ khó")}><CustomSelect options={[{ value: 'EASY', label: p("Dễ") }, { value: 'MEDIUM', label: p("Vừa") }, { value: 'HARD', label: p("Khó") }]} /></Form.Item>
          <Form.Item name="context_id" label={p("Chủ đề")}><CustomSelect allowClear showSearch optionFilterProp="label" loading={loadingContexts} options={contexts.map(context => ({ value: context._id, label: localizedPracticeName(context) }))} /></Form.Item>
          <Form.Item name="target_phonemes" label={p("Âm mục tiêu")}><Select mode="tags" tokenSeparators={[',']} placeholder={p("Nhập âm và nhấn Enter")} /></Form.Item>
          <Form.Item name="target_words" label={p("Từ mục tiêu")}><Select mode="tags" tokenSeparators={[',']} placeholder={p("Nhập từ và nhấn Enter")} /></Form.Item>
          <Form.Item name="target_ipa" label={p("Phiên âm mục tiêu")}><Input /></Form.Item>
          <Form.Item name="target_ipa_uk" label={p("Phiên âm UK")}><Input /></Form.Item>
        </div>
        <Form.Item name="prompt_text" label={p("Đề bài tiếng Anh")}><Input.TextArea rows={2} /></Form.Item>
        <Form.Item name="prompt_text_vi" label={p("Đề bài tiếng Việt")}><Input.TextArea rows={2} /></Form.Item>
        <Form.Item name="instruction" label={p("Hướng dẫn tiếng Anh")}><Input.TextArea rows={2} /></Form.Item>
        <Form.Item name="instruction_vi" label={p("Hướng dẫn tiếng Việt")}><Input.TextArea rows={2} /></Form.Item>
        {selectedType === 'MINIMAL_PAIR_LISTEN' ? <>
          <Divider>{p("Cặp từ tối thiểu")}</Divider>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">{(['a', 'b'] as const).map(side => <div key={side}>
            <Form.Item name={['minimal_pair', `word_${side}`]} label={p("Từ {{p0}}", { p0: side.toUpperCase() })}><Input /></Form.Item>
            <Form.Item name={['minimal_pair', `ipa_${side}`]} label={p("Phiên âm {{p0}}", { p0: side.toUpperCase() })}><Input /></Form.Item>
            <Form.Item name={['minimal_pair', `audio_${side}`]} label={`Audio ${side.toUpperCase()}`} rules={[mediaKeyRule]}><IpaAudioField onBusy={onBusy} /></Form.Item>
          </div>)}</div>
          <Form.Item name={['minimal_pair', 'phoneme_contrast']} label={p("Cặp âm đối chiếu")}><Input placeholder={p("/ɪ/ – /iː/")} /></Form.Item>
        </> : <Form.Item name="options" label={p("Các lựa chọn (ít nhất 2 khi xuất bản)")}><Select mode="tags" placeholder={p("Nhập lựa chọn, nhấn Enter")} /></Form.Item>}
        <Form.Item name="correct_answer" label={p("Đáp án đúng")}><CustomSelect allowClear options={choices.map(value => ({ value }))} /></Form.Item>
        <Form.Item name="audio_id" label={p("Audio mẫu (key hoặc media ID)")} rules={[mediaKeyRule]}><IpaAudioField onBusy={onBusy} /></Form.Item>
      </Form>
    </>}
  </Drawer>
}

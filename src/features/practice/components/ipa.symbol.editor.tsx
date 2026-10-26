import { usePracticeText } from '../hooks/use.practice.text'
import { applyPracticeFormError } from '../helpers/practice-form-error.helper'
import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Divider, Drawer, Form, Input, Modal, Select, Space, Spin } from 'antd'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { ipaAdminService } from '../services/ipa-admin.service'
import { ipaAdminKeys, useIpaMutations } from '../hooks/use.ipa.admin'
import { ipaAudioFields, ipaLevels, type SaveIpaSymbol } from '../types/ipa-admin.types'
import { ipaError, mediaKeyRule, symbolPayload } from '../helpers/ipa-admin.helper'
import { IpaAudioField } from './ipa.audio.field'

export function IpaSymbolEditor({ id, readOnly, onClose }: { id: string; readOnly: boolean; onClose: () => void }) {
  const p = usePracticeText()
  const [form] = Form.useForm<SaveIpaSymbol>()
  const [modal, contextHolder] = Modal.useModal()
  const [editing, setEditing] = useState(!readOnly)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unconfirmed, setUnconfirmed] = useState<string[] | null>(null)
  const { data, isPending, error: loadError, refetch } = useQuery({ queryKey: [...ipaAdminKeys.all, 'symbol', id], queryFn: () => ipaAdminService.symbol(id) })
  const { data: related } = useQuery({ queryKey: [...ipaAdminKeys.all, 'symbol-options'], queryFn: () => ipaAdminService.symbols({ page: 1, limit: 100 }) })
  const { updateSymbol } = useIpaMutations()
  const onBusy = useCallback((delta: number) => setBusy(count => Math.max(0, count + delta)), [])
  useEffect(() => { if (data && !dirty) form.setFieldsValue(symbolPayload(data)) }, [data, form, dirty])
  const close = () => {
    if (busy || saving) return
    if (dirty) modal.confirm({ title: p("Bỏ thay đổi chưa lưu?"), okText: p("Bỏ thay đổi"), cancelText: p("Tiếp tục sửa"), onOk: onClose })
    else onClose()
  }
  const confirm = async (keys: string[]) => {
    if (keys.length) await api.post('/media/confirm', { file_urls: keys, content_id: id })
    setUnconfirmed(null); toast.success(p("Đã lưu ký hiệu IPA")); onClose()
  }
  const save = async (values: SaveIpaSymbol) => {
    if (!data || busy || saving || unconfirmed) return
    setSaving(true)
    setError('')
    try {
      await updateSymbol.mutateAsync({ id, payload: { ...values, expected_revision: form.getFieldValue('expected_revision') } })
      setDirty(false)
    } catch (cause) { applyPracticeFormError(form, cause); setError(ipaError(cause)); setSaving(false); return }
    const keys = ipaAudioFields.map(field => values[field]).filter((key): key is string => Boolean(key))
    try { await confirm(keys) } catch { setUnconfirmed(keys) } finally { setSaving(false) }
  }
  return <Drawer open title={p("{{p0}} ký hiệu /{{p1}}/", { p0: editing ? p("Chỉnh sửa") : p("Chi tiết"), p1: data?.symbol || '…' })} width="min(760px, calc(100vw - 16px))" onClose={close} maskClosable={false} footer={<Space><Button onClick={close} disabled={busy > 0 || saving}>{p("Đóng")}</Button>{!editing ? <Button type="primary" onClick={() => setEditing(true)}>{p("Chỉnh sửa")}</Button> : <Button type="primary" loading={saving} disabled={busy > 0 || !data || Boolean(unconfirmed)} onClick={() => form.submit()}>{p("Lưu thay đổi")}</Button>}</Space>}>
    {contextHolder}
    {isPending ? <Spin /> : loadError ? <Alert type="error" title={loadError.message} action={<Button onClick={() => refetch()}>{p("Thử lại")}</Button>} /> : <>
      <Alert type="info" showIcon title={p("Ký hiệu /{{p0}}/ cố định, không thể thay đổi hoặc xóa.", { p0: data?.symbol })} style={{ marginBottom: 16 }} />
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
      {unconfirmed && <Alert type="warning" title={p("Đã lưu dữ liệu, nhưng audio chưa được xác nhận lưu trữ. Hãy thử lại.")} action={<Button onClick={() => { void confirm(unconfirmed).catch(() => toast.error(p("Chưa xác nhận được audio"))) }}>{p("Thử lại")}</Button>} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" disabled={!editing || saving || busy > 0 || Boolean(unconfirmed)} onValuesChange={() => setDirty(true)} onFinish={save}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="symbol_type" label={p("Loại âm")} rules={[{ required: true }]}><Select options={['VOWEL', 'CONSONANT', 'DIPHTHONG'].map(value => ({ value, label: { VOWEL: p("Nguyên âm"), CONSONANT: p("Phụ âm"), DIPHTHONG: p("Nguyên âm đôi") }[value] }))} /></Form.Item>
          <Form.Item name="status" label={p("Trạng thái")} rules={[{ required: true }]}><Select options={[{ value: 'ACTIVE', label: p("Hoạt động") }, { value: 'INACTIVE', label: p("Tạm ẩn") }]} /></Form.Item>
          <Form.Item name="example_word" label={p("Từ ví dụ")} rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
          <Form.Item name="example_word_ipa" label={p("Phiên âm từ ví dụ")} rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
          <Form.Item name="description_en" label={p("Mô tả tiếng Anh")}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="description_vi" label={p("Mô tả tiếng Việt")}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="cefr_min_level" label="CEFR" rules={[{ required: true }]}><Select options={ipaLevels.map(value => ({ value }))} /></Form.Item>
          <Form.Item name="related_symbols" label={p("Âm liên quan")}><Select mode="multiple" showSearch optionFilterProp="label" options={related?.items.filter(item => item.id !== id).map(item => ({ value: item.symbol, label: `/${item.symbol}/` }))} /></Form.Item>
        </div>
        <Divider>{p("Audio âm IPA")}</Divider>
        {ipaAudioFields.slice(0, 3).map((field, index) => <Form.Item key={field} name={field} label={[p("Audio chung"), p("Giọng Mỹ (US)"), p("Giọng Anh (UK)")][index]} rules={[mediaKeyRule]}><IpaAudioField onBusy={onBusy} /></Form.Item>)}
        <Divider>{p("Audio từ ví dụ")}</Divider>
        {ipaAudioFields.slice(3).map((field, index) => <Form.Item key={field} name={field} label={[p("Audio ví dụ chung"), p("Ví dụ giọng Mỹ (US)"), p("Ví dụ giọng Anh (UK)")][index]} rules={[mediaKeyRule]}><IpaAudioField onBusy={onBusy} /></Form.Item>)}
      </Form>
      <p className="text-xs text-slate-500">ID: {id} {p("· Phiên bản:")} {data?.revision || 0}</p>
    </>}
  </Drawer>
}

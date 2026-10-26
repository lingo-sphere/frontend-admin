// Trường danh sách đoạn nghe và phân đoạn lời thoại (ListeningSegmentsFields).

import { useRef, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Select, Space, Tag } from 'antd'
import type { FormInstance } from 'antd'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'
import { CustomSelect } from '@/components/custom.select'
import { usePracticeText } from '@/features/practice/hooks/use.practice.text'
import type { ListeningPayload, ListeningSegment } from '@/features/practice/types/listening-admin.types'

function SegmentClip({ audio, start, end }: { audio?: string; start: number; end: number }) {
  const p = usePracticeText()
  const ref = useRef<HTMLAudioElement>(null)
  return audio ? <Space><audio ref={ref} src={resolveMediaUrl(audio)} preload="none" onTimeUpdate={() => { if (ref.current && ref.current.currentTime >= end) ref.current.pause() }} /><Button onClick={() => { if (ref.current) { ref.current.currentTime = start; void ref.current.play().catch(() => toast.error(p("Chưa phát được đoạn nghe"))) } }}>{p("Nghe đoạn")} {start}–{end}s</Button></Space> : null
}

export function ListeningSegmentsFields({ form, dictation, dirty, disabled }: { form: FormInstance<ListeningPayload>; dictation: boolean; dirty: () => void; disabled: boolean }) {
  const p = usePracticeText()
  const segments = Form.useWatch('segments', { form, preserve: true }) || []
  const audio = Form.useWatch('audio_url', form)
  const [selection, setSelection] = useState<{ index: number; start: number; end: number } | null>(null)
  const addBlank = (index: number) => {
    if (!selection || selection.index !== index || selection.start === selection.end) { toast.error(p("Bôi đen từ/cụm từ trong transcript đoạn này")); return }
    const segment = form.getFieldValue(['segments', index]) as ListeningSegment
    const selected = segment.text.slice(selection.start, selection.end)
    const start = selection.start + (selected.length - selected.trimStart().length)
    const end = selection.end - (selected.length - selected.trimEnd().length)
    if (start >= end || (start > 0 && !/\s/.test(segment.text[start - 1])) || (end < segment.text.length && !/\s/.test(segment.text[end]))) { toast.error(p("Chọn trọn từ/cụm từ")); return }
    if ((segment.blanks || []).some(blank => start < blank.end_char && end > blank.start_char)) { toast.error(p("Vùng chọn trùng chỗ trống đã có")); return }
    form.setFieldValue(['segments', index, 'blanks'], [...(segment.blanks || []), { start_char: start, end_char: end, correct_answer: segment.text.slice(start, end), alternative_answers: [], blank_type: selected.trim().includes(' ') ? 'PHRASE' : 'WORD', difficulty_weight: 1, is_key_word: false }].sort((a, b) => a.start_char - b.start_char))
    setSelection(null); dirty()
  }
  return <Form.List name="segments">{(fields, { add, remove, move }) => <div className="space-y-4">
    {fields.map((field, index) => <Card key={field.key} title={p("Đoạn {{p0}}", { p0: index + 1 })} size="small" extra={<Space><Button size="small" disabled={disabled || index === 0} onClick={() => { move(index, index - 1); dirty() }}>{p("Lên")}</Button><Button size="small" disabled={disabled || index === fields.length - 1} onClick={() => { move(index, index + 1); dirty() }}>{p("Xuống")}</Button><Button disabled={disabled} size="small" danger onClick={() => { remove(index); dirty() }}>{p("Xóa đoạn")}</Button></Space>}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Form.Item name={[field.name, 'start_time']} label={p("Bắt đầu (giây)")} rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name={[field.name, 'end_time']} label={p("Kết thúc (giây)")} rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: '100%' }} /></Form.Item>
      </div>
      {!dictation && <Form.Item name={[field.name, 'speaker']} label={p("Người nói")}><CustomSelect options={[{ value: 'MALE', label: p("Nam") }, { value: 'FEMALE', label: p("Nữ") }]} /></Form.Item>}
      <Form.Item name={[field.name, 'text']} label={dictation ? p("Transcript đoạn (bôi đen từ để tạo chỗ trống)") : p("Lời thoại")} rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={3} onSelect={event => { const target = event.target as HTMLTextAreaElement; setSelection({ index, start: target.selectionStart, end: target.selectionEnd }) }} onChange={() => {
        if (segments[index]?.blanks?.length) { form.setFieldValue(['segments', index, 'blanks'], []); toast.warning(p("Transcript đổi: hãy chọn lại chỗ trống để khớp vị trí mới")) }
      }} /></Form.Item>
      <Form.Item name={[field.name, 'text_vi']} label={p("Bản dịch đoạn")}><Input.TextArea rows={2} /></Form.Item>
      <SegmentClip audio={audio} start={segments[index]?.start_time || 0} end={segments[index]?.end_time || 0} />
      {dictation && <>
        <Button disabled={disabled} style={{ margin: '12px 0' }} onClick={() => addBlank(index)}>{p("Tạo chỗ trống từ vùng chọn")}</Button>
        {(segments[index]?.blanks || []).map((blank: ListeningSegment['blanks'][number], blankIndex: number) => <div key={`${blank.start_char}-${blank.end_char}`} className="mb-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Space wrap><Tag color="blue">{blank.correct_answer}</Tag><span className="text-xs text-slate-500">{p("Vị trí")} {blank.start_char}–{blank.end_char}</span><Button disabled={disabled} size="small" danger type="text" onClick={() => { form.setFieldValue(['segments', index, 'blanks'], segments[index].blanks.filter((_: unknown, position: number) => position !== blankIndex)); dirty() }}>{p("Bỏ chỗ trống")}</Button></Space>
          <Form.Item name={[field.name, 'blanks', blankIndex, 'alternative_answers']} label={p("Đáp án thay thế")}><Select mode="tags" placeholder={p("Nhập đáp án, nhấn Enter")} /></Form.Item>
          <Form.Item name={[field.name, 'blanks', blankIndex, 'blank_type']} label={p("Loại chỗ trống")}><CustomSelect options={['WORD', 'PHRASE', 'SENTENCE'].map(value => ({ value }))} /></Form.Item>
          <Form.Item name={[field.name, 'blanks', blankIndex, 'difficulty_weight']} label={p("Trọng số độ khó")}><InputNumber min={0} max={100} /></Form.Item>
        </div>)}
        {segments[index]?.blanks?.length > 0 && <p className="text-sm text-slate-500">{p("Xem trước:")} {(() => { let text = segments[index].text; for (const blank of [...segments[index].blanks].reverse()) text = text.slice(0, blank.start_char) + '____' + text.slice(blank.end_char); return text })()}</p>}
      </>}
    </Card>)}
    <Button disabled={disabled} block type="dashed" onClick={() => { const previous = segments.at(-1)?.end_time || 0; add({ start_time: previous, end_time: previous + 5, text: '', text_vi: '', speaker: 'MALE', blanks: [] }); dirty() }}>{p("Thêm đoạn nghe")}</Button>
  </div>}</Form.List>
}

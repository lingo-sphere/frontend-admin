// Trường danh sách câu hỏi đọc hiểu (ReadingQuestionsFields).

import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, Space } from 'antd'
import type { FormInstance } from 'antd'
import { CustomSelect } from '@/components/custom.select'
import { usePracticeText, localizedPracticeName } from '@/features/practice/hooks/use.practice.text'
import { readingAdminService } from '@/features/practice/services/reading-admin.service'
import { remapReadingMarkers } from '@/features/practice/helpers/reading-admin.helper'
import { newReadingQuestion, readingSkills, type ReadingMetadata, type ReadingPayload, type ReadingQuestion, type ReadingType } from '@/features/practice/types/reading-admin.types'

export function ReadingQuestionsFields({ form, type, active, setActive, dirty, disabled }: { form: FormInstance<ReadingPayload>; type: ReadingType; active: number; setActive: (index: number) => void; dirty: () => void; disabled: boolean }) {
  const p = usePracticeText()
  const questions = (Form.useWatch('questions', { form, preserve: true }) || []) as ReadingQuestion[]
  const grammar = useQuery({ queryKey: ['reading-admin', 'grammar-options'], queryFn: readingAdminService.grammarOptions })
  return <Form.List name="questions">{(fields, { add, remove, move }) => <div className="space-y-3">
    <Space wrap>{fields.map(field => <Button key={field.key} disabled={false} type={active === field.name ? 'primary' : 'default'} aria-label={p("Chọn câu {{p0}}", { p0: field.name + 1 })} onClick={() => setActive(field.name)}>{p("Câu")} {field.name + 1}</Button>)}<Button disabled={disabled || fields.length >= 100} onClick={() => { add(newReadingQuestion(type, fields.length)); setActive(fields.length) }}>{p("Thêm câu hỏi")}</Button></Space>
    {!fields.length && <Alert type="info" title={p("Thêm câu hỏi trắc nghiệm cho bài đọc. Có thể lưu nháp khi chưa hoàn thiện.")} />}
    {fields.filter(field => field.name === active).map(field => {
      const index = field.name; const question = questions[index]
      const reorder = (to: number) => { const order = fields.map(item => item.name); const [old] = order.splice(index, 1); order.splice(to, 0, old); if (type === 'PART_6') form.setFieldValue('content', remapReadingMarkers(form.getFieldValue('content') || '', order)); move(index, to); setActive(to) }
      return <Card key={field.key} size="small" title={p("Câu {{p0}}", { p0: index + 1 })} extra={<Space wrap><Button size="small" disabled={disabled || index === 0} onClick={() => reorder(index - 1)}>{p("Lên")}</Button><Button size="small" disabled={disabled || index === fields.length - 1} onClick={() => reorder(index + 1)}>{p("Xuống")}</Button><Button size="small" danger onClick={() => { if (type === 'PART_6') form.setFieldValue('content', remapReadingMarkers(form.getFieldValue('content') || '', fields.filter(item => item.name !== index).map(item => item.name))); remove(index); setActive(Math.max(0, Math.min(index, fields.length - 2))) }}>{p("Xóa câu")}</Button></Space>}>
        <Form.Item name={[index, 'question_text_en']} label={p("Câu hỏi (Anh)")}><Input.TextArea rows={3} /></Form.Item><Form.Item name={[index, 'question_text_vi']} label={p("Câu hỏi (Việt)")}><Input.TextArea rows={2} /></Form.Item>
        <Form.Item name={[index, 'exercise_type']} label={p("Kỹ năng đọc")}><CustomSelect showSearch options={readingSkills.map(skill => ({ ...skill, label: p(skill.label) })).concat(question?.exercise_type && !readingSkills.some(skill => skill.value === question.exercise_type) ? [{ value: question.exercise_type, label: question.exercise_type }] : [])} /></Form.Item>
        <Form.Item name={[index, 'instruction_en']} label={p("Hướng dẫn câu hỏi (Anh)")}><Input.TextArea rows={2} /></Form.Item><Form.Item name={[index, 'instruction_vi']} label={p("Hướng dẫn câu hỏi (Việt)")}><Input.TextArea rows={2} /></Form.Item>
        {type === 'INFO_MATCHING' && <Button style={{ marginBottom: 12 }} onClick={() => { dirty(); const paragraphs = (form.getFieldValue(['passage_metadata', 'info_paragraphs']) || []) as ReadingMetadata['info_paragraphs']; form.setFieldValue(['questions', index, 'question_data', 'options'], paragraphs.map(row => ({ key: row.key, text: row.title || p("Đoạn {{p0}}", { p0: row.key }) }))); if (!paragraphs.some(row => row.key === form.getFieldValue(['questions', index, 'question_data', 'correct_answer']))) form.setFieldValue(['questions', index, 'question_data', 'correct_answer'], '') }}>{p("Đồng bộ lựa chọn theo các đoạn")}</Button>}
        <Form.List name={[index, 'question_data', 'options']}>{(options, actions) => <div className="space-y-2">{options.map(option => <div key={option.key} className="grid grid-cols-[64px_1fr_auto] gap-2"><Form.Item name={[option.name, 'key']} label={p("Mã")}><Input maxLength={10} /></Form.Item><Form.Item name={[option.name, 'text']} label={p("Nội dung {{p0}}", { p0: question?.question_data.options[option.name]?.key || option.name + 1 })}><Input.TextArea rows={2} /></Form.Item><Button danger aria-label={p("Xóa lựa chọn {{p0}}", { p0: option.name + 1 })} onClick={() => { if (question?.question_data.options[option.name]?.key === question?.question_data.correct_answer) form.setFieldValue(['questions', index, 'question_data', 'correct_answer'], ''); actions.remove(option.name) }}>{p("Xóa")}</Button></div>)}<Button disabled={disabled || options.length >= 26} onClick={() => { const used = question?.question_data.options.map(option => option.key) || []; actions.add({ key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(key => !used.includes(key)) || '', text: '' }) }}>{p("Thêm lựa chọn")}</Button></div>}</Form.List>
        <Form.Item name={[index, 'question_data', 'correct_answer']} label={p("Đáp án đúng")}><CustomSelect allowClear options={(question?.question_data.options || []).filter(option => option.key).map(option => ({ value: option.key, label: `${option.key} · ${option.text || p("(chưa có nội dung)")}` }))} /></Form.Item>
        <Form.Item name={[index, 'question_data', 'explanation']} label={p("Giải thích (Anh)")}><Input.TextArea rows={3} /></Form.Item><Form.Item name={[index, 'question_data', 'explanation_vi']} label={p("Giải thích (Việt)")}><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name={[index, 'grammar_knowledge_id']} label={p("Kiến thức ngữ pháp liên quan")}><CustomSelect allowClear showSearch loading={grammar.isFetching} options={(grammar.data || []).map(row => ({ value: row._id, label: localizedPracticeName(row) }))} /></Form.Item>
        {grammar.error && <Alert type="warning" title={p("Không tải được danh mục ngữ pháp")} action={<Button onClick={() => grammar.refetch()}>{p("Thử lại")}</Button>} />}
        <div className="grid grid-cols-3 gap-x-2"><Form.Item name={[index, 'line_start']} label={p("Dòng bắt đầu")}><InputNumber min={0} /></Form.Item><Form.Item name={[index, 'line_end']} label={p("Dòng kết thúc")}><InputNumber min={0} /></Form.Item><Form.Item name={[index, 'paragraph_index']} label={p("Chỉ số đoạn")}><InputNumber min={0} /></Form.Item></div>
      </Card>
    })}
  </div>}</Form.List>
}

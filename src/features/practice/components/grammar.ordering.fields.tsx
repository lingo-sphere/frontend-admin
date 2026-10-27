// Component cấu hình sắp xếp câu và từ cho bài tập ngữ pháp Grammar.
import { usePracticeText } from '@/features/practice/hooks/use.practice.text'
import { useState } from 'react'
import { Button, Form, Input, Space, Tag } from 'antd'
import type { FormInstance } from 'antd'
import type { GrammarQuestionPayload } from '@/features/practice/types/grammar-admin.types'
export function GrammarOrderingFields({ form, disabled, dirty }: { form: FormInstance<GrammarQuestionPayload>; disabled: boolean; dirty: () => void }) {
  const p = usePracticeText()
  const items = (Form.useWatch(['question_data', 'ordering_items'], { form, preserve: true }) || []) as string[]
  const order = (Form.useWatch(['question_data', 'correct_order'], { form, preserve: true }) || []) as number[]
  const [local, setLocal] = useState<number[] | null>(null)
  const selected = local ?? order
  const choose = (values: number[]) => { setLocal(values); form.setFieldValue(['question_data', 'correct_answer'], values.map(index => items[index]).join(' ')); form.setFieldValue(['question_data', 'correct_order'], values.length === items.length ? values : []); dirty() }
  const reset = () => choose([])
  return <>
    <Form.List name={['question_data', 'ordering_items']}>{(fields, { add, remove, move }) => <div className="space-y-2">{fields.map(field => <Space key={field.key} align="start" wrap><Form.Item name={field.name} label={p("Từ {{p0}}", { p0: field.name + 1 })}><Input onChange={reset} /></Form.Item><Button disabled={disabled || field.name === 0} onClick={() => { move(field.name, field.name - 1); reset() }}>{p("Lên")}</Button><Button disabled={disabled || field.name === fields.length - 1} onClick={() => { move(field.name, field.name + 1); reset() }}>{p("Xuống")}</Button><Button danger disabled={disabled} onClick={() => { remove(field.name); reset() }}>{p("Xóa từ")}</Button></Space>)}<Button disabled={disabled || fields.length >= 100} onClick={() => { add(''); reset() }}>{p("Thêm từ")}</Button></div>}</Form.List>
    <p className="my-3 text-sm text-slate-500">{p("Chọn các từ theo thứ tự đúng. Mỗi từ/ký hiệu là một mục, không chứa khoảng trắng; từ lặp được giữ riêng.")}</p>
    <Space wrap>{items.map((word, index) => <Button key={index} aria-label={p("Chọn từ {{p0}}: {{p1}}", { p0: index + 1, p1: word })} disabled={disabled || selected.includes(index)} onClick={() => choose([...selected, index])}>{word || p("(trống)")}</Button>)}</Space>
    <div className="my-3"><Space wrap>{selected.map((index, position) => <Tag key={`${index}-${position}`} closable={!disabled} onClose={() => choose(selected.filter((_, i) => i !== position))}>{items[index]}</Tag>)}</Space><Button size="small" disabled={disabled} onClick={reset}>{p("Xếp lại")}</Button></div>
    <Form.Item name={['question_data', 'correct_answer']} label={p("Đáp án chuẩn")}><Input.TextArea rows={2} onChange={() => { setLocal(null); form.setFieldValue(['question_data', 'correct_order'], []) }} /></Form.Item>
  </>
}

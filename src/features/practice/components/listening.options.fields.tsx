import { usePracticeText } from '../hooks/use.practice.text'
import { Form, Input, Select } from 'antd'
import type { NamePath } from 'antd/es/form/interface'

export function ListeningOptionsFields({ prefix = [], count }: { prefix?: (string | number)[]; count: number }) {
  const p = usePracticeText()
  return <>
    {'ABCD'.slice(0, count).split('').map((key, index) => <div key={key} className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
      <Form.Item name={[...prefix, 'options', index, 'text'] as NamePath} label={p("Đáp án {{p0}} (Anh)", { p0: key })}><Input.TextArea rows={2} /></Form.Item>
      <Form.Item name={[...prefix, 'options', index, 'text_vi'] as NamePath} label={p("Đáp án {{p0}} (Việt)", { p0: key })}><Input.TextArea rows={2} /></Form.Item>
    </div>)}
    <Form.Item name={[...prefix, 'correct_answer']} label={p("Đáp án đúng")}><Select allowClear placeholder={p("Chọn đáp án")} options={'ABCD'.slice(0, count).split('').map(value => ({ value }))} /></Form.Item>
    <Form.Item name={[...prefix, 'explanation']} label={p("Giải thích (Anh)")}><Input.TextArea rows={2} /></Form.Item>
    <Form.Item name={[...prefix, 'explanation_vi']} label={p("Giải thích (Việt)")}><Input.TextArea rows={2} /></Form.Item>
  </>
}

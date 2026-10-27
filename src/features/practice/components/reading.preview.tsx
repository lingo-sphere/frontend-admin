// Component xem trước nội dung đoạn văn bài tập đọc Reading.
import { Button, Card, Form, Tag } from 'antd'
import type { FormInstance } from 'antd'
import type { ReadingMetadata, ReadingPayload, ReadingType } from '@/features/practice/types/reading-admin.types'
export function ReadingPreview({ form, type, select }: { form: FormInstance<ReadingPayload>; type: ReadingType; select: (index: number) => void }) {
  const content = (Form.useWatch('content', { form, preserve: true }) || '') as string
  const metadata = Form.useWatch('passage_metadata', { form, preserve: true }) as ReadingMetadata | undefined
  if (type === 'REAL_WORLD_TASK') return <div className="space-y-3"><h3>{metadata?.scenario_title}</h3><p className="whitespace-pre-wrap">{metadata?.scenario_description || content}</p><ul>{metadata?.requirements?.map(row => <li key={row.id}>{row.label}</li>)}</ul>{metadata?.data_cards?.map(card => <Card key={card.id} size="small" title={card.title} extra={card.subtitle}>{(card.detail_entries || Object.entries(card.details).map(([name, value]) => ({ name, value }))).map((item, index) => <p key={index}><b>{item.name}:</b> {item.value}</p>)}{card.tags?.map(tag => <Tag key={tag}>{tag}</Tag>)}</Card>)}</div>
  if (type === 'INFO_MATCHING') return <div className="space-y-3">{metadata?.info_paragraphs?.map((row, index) => <Card key={index} size="small" title={`[${row.key}] ${row.title}`}><p className="whitespace-pre-wrap">{row.text}</p></Card>)}</div>
  return <div className="whitespace-pre-wrap leading-8">{type === 'PART_6' ? content.split(/(\[\d+\])/g).map((part, index) => /^\[\d+\]$/.test(part) ? <Button key={index} disabled={false} type="dashed" size="small" aria-label={`Marker ${part}`} onClick={() => select(Number(part.slice(1, -1)) - 1)}>{part}</Button> : part) : content}</div>
}

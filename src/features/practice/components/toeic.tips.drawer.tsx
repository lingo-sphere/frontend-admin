// Drawer chỉnh sửa chi tiết mẹo & chiến thuật làm bài TOEIC 4 kỹ năng & 7 Part.

import React, { useEffect, useState } from 'react'
import {
  Drawer,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Tabs,
  Space,
  Card,
  Popconfirm,
  Upload,
  Image,
  Tag,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import { CustomSelect } from '@/components/custom.select'
import type {
  ToeicTipItem,
  ToeicTipPayload,
} from '@/features/practice/types/grammar-handbook-admin.types'

interface Props {
  visible: boolean
  tip: ToeicTipItem | null
  onClose: () => void
  onSave: (payload: ToeicTipPayload) => Promise<void>
  onUploadImage?: (id: string, file: File) => Promise<{ image_url: string }>
  loading?: boolean
}

const SKILL_OPTIONS = [
  { value: 'LISTENING', label: 'Listening (Nghe)' },
  { value: 'READING', label: 'Reading (Đọc)' },
  { value: 'SPEAKING', label: 'Speaking (Nói)' },
  { value: 'WRITING', label: 'Writing (Viết)' },
]

const PART_OPTIONS = [
  { value: '', label: 'Không chọn Part (Toàn kỹ năng)' },
  { value: 'PART_1', label: 'Part 1: Mô tả tranh (Photographs)' },
  { value: 'PART_2', label: 'Part 2: Hỏi & Đáp (Question-Response)' },
  { value: 'PART_3', label: 'Part 3: Hội thoại (Conversations)' },
  { value: 'PART_4', label: 'Part 4: Bài nói ngắn (Short Talks)' },
  { value: 'PART_5', label: 'Part 5: Hoàn thành câu (Incomplete Sentences)' },
  { value: 'PART_6', label: 'Part 6: Hoàn thành đoạn (Text Completion)' },
  { value: 'PART_7', label: 'Part 7: Đọc hiểu văn bản (Reading Comprehension)' },
]

function getImageUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '')
  const cleanKey = url.replace(/^\/+/, '')
  return `${base}/media/stream/${cleanKey}`
}

export function ToeicTipsDrawer({
  visible,
  tip,
  onClose,
  onSave,
  onUploadImage,
  loading,
}: Props) {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('1')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')

  useEffect(() => {
    if (visible) {
      if (tip) {
        form.setFieldsValue({
          ...tip,
          traps: tip.traps || [],
          key_takeaways: tip.key_takeaways || [],
          examples: tip.examples || [],
        })
        setCurrentImageUrl(tip.image_url || '')
      } else {
        form.resetFields()
        form.setFieldsValue({
          skill: 'LISTENING',
          part: 'PART_1',
          order: 1,
          is_published: true,
          traps: [''],
          key_takeaways: [''],
          examples: [
            {
              question: '',
              options: ['(A) ', '(B) ', '(C) ', '(D) '],
              correct_answer: '',
              explanation: '',
            },
          ],
        })
        setCurrentImageUrl('')
      }
      setActiveTab('1')
    }
  }, [visible, tip, form])

  const handleFinish = async (values: any) => {
    try {
      const payload: ToeicTipPayload = {
        ...values,
        part: values.part || undefined,
        image_url: currentImageUrl || values.image_url,
      }
      await onSave(payload)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Không thể lưu mẹo TOEIC')
    }
  }

  const handleFileChange = async (file: File) => {
    if (!tip?._id || !onUploadImage) {
      toast.warning('Vui lòng lưu thông tin mẹo trước khi tải ảnh lên R2')
      return
    }
    setUploadingImage(true)
    try {
      const res = await onUploadImage(tip._id, file)
      setCurrentImageUrl(res.image_url)
      form.setFieldValue('image_url', res.image_url)
      toast.success('Đã tải ảnh lên Cloudflare R2 thành công!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải ảnh lên R2')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <Drawer
      title={tip ? `Chỉnh sửa Mẹo TOEIC: ${tip.title}` : 'Thêm mới Mẹo làm bài TOEIC'}
      open={visible}
      onClose={onClose}
      width={780}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
          >
            Lưu thay đổi
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: '1. Thông tin chung & Ảnh R2',
              children: (
                <div className="space-y-4">
                  <Form.Item
                    name="title"
                    label="Tiêu đề chiến thuật / Mẹo TOEIC"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input placeholder="VD: Chiến thuật Part 1: Bí kíp mô tả tranh & Bẫy Being + V3" />
                  </Form.Item>

                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item
                      name="skill"
                      label="Kỹ năng"
                      rules={[{ required: true, message: 'Chọn kỹ năng' }]}
                    >
                      <CustomSelect options={SKILL_OPTIONS} />
                    </Form.Item>

                    <Form.Item name="part" label="Phần thi (Part)">
                      <CustomSelect options={PART_OPTIONS} />
                    </Form.Item>

                    <Form.Item name="order" label="Thứ tự hiển thị">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Form.Item
                      name="is_published"
                      label="Trạng thái hiển thị cho học viên"
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Switch checkedChildren="Xuất bản" unCheckedChildren="Bản nháp" />
                    </Form.Item>
                  </div>

                  {/* Banner Preview & Upload R2 */}
                  <Card size="small" title="Ảnh banner chiến thuật (Lưu trữ Cloudflare R2)">
                    <div className="flex items-start gap-4">
                      {currentImageUrl ? (
                        <div className="w-48 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                          <Image
                            src={getImageUrl(currentImageUrl)}
                            alt="Banner Preview"
                            width="100%"
                            height="100%"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-28 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                          Chưa có ảnh R2
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <Form.Item name="image_url" label="Đường dẫn tương đối R2" className="mb-2">
                          <Input readOnly value={currentImageUrl} placeholder="/vocabulary/toeic-tips/..." />
                        </Form.Item>

                        <Upload
                          beforeUpload={(file) => {
                            void handleFileChange(file)
                            return false
                          }}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />} loading={uploadingImage}>
                            {currentImageUrl ? 'Tải ảnh mới thay thế (R2)' : 'Tải ảnh lên Cloudflare R2'}
                          </Button>
                        </Upload>
                      </div>
                    </div>
                  </Card>

                  <Form.Item
                    name="summary"
                    label="Tóm tắt nội dung ngắn gọn"
                    rules={[{ required: true, message: 'Nhập tóm tắt' }]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Tóm tắt 1-2 câu về nội dung cốt lõi của mẹo này..."
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: '2',
              label: '2. Nội dung chi tiết (Markdown)',
              children: (
                <div className="space-y-4">
                  <Form.Item
                    name="content_markdown"
                    label="Nội dung chiến thuật chi tiết (Hỗ trợ định dạng Markdown)"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung chi tiết' }]}
                  >
                    <Input.TextArea
                      rows={14}
                      className="font-mono text-xs"
                      placeholder={`### 1. Phân loại câu hỏi\n- Dạng 1: ...\n- Dạng 2: ...\n\n### 2. Chiến thuật làm bài\n1. Bước 1: ...\n2. Bước 2: ...`}
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: '3',
              label: '3. Bẫy đề thi & Chiến thuật cốt lõi',
              children: (
                <div className="space-y-6">
                  {/* Bẫy thường gặp (Traps) */}
                  <Card size="small" title="Danh sách bẫy thường gặp trong đề thi (Traps)">
                    <Form.List name="traps">
                      {(fields, { add, remove }) => (
                        <div className="space-y-2">
                          {fields.map(({ key, name, ...restField }, index) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-700 w-5">
                                #{index + 1}
                              </span>
                              <Form.Item
                                {...restField}
                                name={name}
                                className="flex-1 mb-0"
                                rules={[{ required: true, message: 'Nhập mô tả bẫy' }]}
                              >
                                <Input placeholder="VD: Bẫy từ phát âm gần giống nhưng sai ngữ cảnh..." />
                              </Form.Item>
                              <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              />
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            size="small"
                            block
                            icon={<PlusOutlined />}
                            onClick={() => add('')}
                          >
                            Thêm bẫy đề thi
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </Card>

                  {/* Chiến thuật ăn điểm (Key Takeaways) */}
                  <Card size="small" title="Chiến thuật cốt lõi ăn điểm (Key Takeaways)">
                    <Form.List name="key_takeaways">
                      {(fields, { add, remove }) => (
                        <div className="space-y-2">
                          {fields.map(({ key, name, ...restField }, index) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-700 w-5">
                                #{index + 1}
                              </span>
                              <Form.Item
                                {...restField}
                                name={name}
                                className="flex-1 mb-0"
                                rules={[{ required: true, message: 'Nhập chiến thuật' }]}
                              >
                                <Input placeholder="VD: Tranh không người -> Loại ngay đáp án có 'being'..." />
                              </Form.Item>
                              <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              />
                            </div>
                          ))}
                          <Button
                            type="dashed"
                            size="small"
                            block
                            icon={<PlusOutlined />}
                            onClick={() => add('')}
                          >
                            Thêm chiến thuật cốt lõi
                          </Button>
                        </div>
                      )}
                    </Form.List>
                  </Card>
                </div>
              ),
            },
            {
              key: '4',
              label: '4. Ví dụ minh họa thực tế',
              children: (
                <div>
                  <Form.List name="examples">
                    {(fields, { add, remove }) => (
                      <div className="space-y-4">
                        {fields.map(({ key, name, ...restField }, index) => (
                          <Card
                            key={key}
                            size="small"
                            className="border-slate-300"
                            title={`Câu hỏi ví dụ minh họa #${index + 1}`}
                            extra={
                              <Popconfirm
                                title="Xóa ví dụ này?"
                                onConfirm={() => remove(name)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            }
                          >
                            <Form.Item
                              {...restField}
                              name={[name, 'question']}
                              label="Câu hỏi / Đề bài"
                              rules={[{ required: true, message: 'Nhập đề bài' }]}
                            >
                              <Input.TextArea rows={2} placeholder="Nhập câu hỏi đề thi minh họa..." />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'options']}
                              label="Các phương án lựa chọn (A, B, C, D)"
                            >
                              <Select
                                mode="tags"
                                placeholder="Nhập từng phương án và nhấn Enter (VD: (A) Yes, (B) No...)"
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'correct_answer']}
                              label="Đáp án đúng"
                              rules={[{ required: true, message: 'Nhập đáp án đúng' }]}
                            >
                              <Input placeholder="VD: (B) Mr. Henderson in accounting would know." />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'explanation']}
                              label="Giải thích & Phân tích bẫy"
                              rules={[{ required: true, message: 'Nhập giải thích' }]}
                            >
                              <Input.TextArea
                                rows={3}
                                placeholder="Phân tích vì sao phương án A sai, bẫy gì, tại sao B đúng..."
                              />
                            </Form.Item>
                          </Card>
                        ))}

                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() =>
                            add({
                              question: '',
                              options: ['(A) ', '(B) ', '(C) ', '(D) '],
                              correct_answer: '',
                              explanation: '',
                            })
                          }
                        >
                          Thêm câu hỏi ví dụ minh họa
                        </Button>
                      </div>
                    )}
                  </Form.List>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Drawer>
  )
}


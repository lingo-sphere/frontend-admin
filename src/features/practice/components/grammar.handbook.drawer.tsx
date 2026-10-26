/**
 * @file grammar.handbook.drawer.tsx
 * @description Drawer chỉnh sửa chi tiết Chủ điểm Lý thuyết Ngữ pháp & Thể công thức
 */

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
  CheckCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { toast } from '@/store/toast.store'
import { API_CONFIG } from '@/config/api.config'
import type {
  GrammarHandbookItem,
  GrammarHandbookPayload,
  GrammarFormulaDetail,
} from '../types/grammar-handbook-admin.types'

interface Props {
  visible: boolean
  item: GrammarHandbookItem | null
  onClose: () => void
  onSave: (payload: GrammarHandbookPayload) => Promise<void>
  onUploadImage?: (id: string, file: File) => Promise<{ image_url: string }>
  loading?: boolean
}

const CATEGORY_OPTIONS = [
  { value: 'TENSES', label: '12 Thì tiếng Anh (TENSES)' },
  { value: 'PARTS_OF_SPEECH', label: 'Từ loại: Danh, Đại, Tính, Trạng (PARTS_OF_SPEECH)' },
  { value: 'COMPARISONS', label: 'Các dạng so sánh (COMPARISONS)' },
  { value: 'MODALS', label: 'Động từ khuyết thiếu (MODALS)' },
  { value: 'PASSIVE', label: 'Câu bị động (PASSIVE)' },
  { value: 'PASSIVE_VOICE', label: 'Câu bị động nâng cao (PASSIVE_VOICE)' },
  { value: 'CONDITIONALS', label: 'Câu điều kiện & Đảo ngữ (CONDITIONALS)' },
  { value: 'RELATIVE_CLAUSES', label: 'Mệnh đề quan hệ & Rút gọn (RELATIVE_CLAUSES)' },
  { value: 'VERB_PATTERNS', label: 'V-ing vs To-V (VERB_PATTERNS)' },
  { value: 'PARTICIPLES', label: 'Phân từ & Mệnh đề phân từ (PARTICIPLES)' },
  { value: 'AGREEMENT', label: 'Sự hòa hợp Chủ - Vị (AGREEMENT)' },
  { value: 'CONJUNCTIONS', label: 'Liên từ kết hợp & Phụ thuộc (CONJUNCTIONS)' },
  { value: 'PREPOSITIONS', label: 'Giới từ thời gian, nơi chốn, cụm (PREPOSITIONS)' },
  { value: 'ARTICLES', label: 'Mạo từ A, An, The (ARTICLES)' },
  { value: 'QUANTIFIERS', label: 'Từ chỉ số lượng (QUANTIFIERS)' },
  { value: 'INVERSION', label: 'Đảo ngữ phủ định (INVERSION)' },
  { value: 'SUBJUNCTIVE', label: 'Thể giả định / Thức giả định (SUBJUNCTIVE)' },
  { value: 'REPORTED_SPEECH', label: 'Câu tường thuật (REPORTED_SPEECH)' },
  { value: 'QUESTIONS', label: 'Câu hỏi đuôi & Trực tiếp (QUESTIONS)' },
  { value: 'SENTENCE_STRUCTURE', label: 'Cấu trúc song song & Câu phức (SENTENCE_STRUCTURE)' },
  { value: 'OTHER', label: 'Chủ điểm khác (OTHER)' },
]

const CEFR_OPTIONS = [
  { value: 'A1', label: 'A1 - Mới bắt đầu' },
  { value: 'A2', label: 'A2 - Sơ cấp' },
  { value: 'B1', label: 'B1 - Trung cấp (TOEIC 450-650)' },
  { value: 'B2', label: 'B2 - Trung cao cấp (TOEIC 650-800)' },
  { value: 'C1', label: 'C1 - Cao cấp (TOEIC 800+)' },
]

const FORM_TYPE_OPTIONS = [
  { value: 'AFFIRMATIVE', label: 'Khẳng định (+)' },
  { value: 'NEGATIVE', label: 'Phủ định (-)' },
  { value: 'INTERROGATIVE', label: 'Nghi vấn / Câu hỏi (?)' },
  { value: 'WH_QUESTION', label: 'Câu hỏi Wh-words' },
  { value: 'SPECIAL', label: 'Cấu trúc đặc biệt / Ngoại lệ' },
]

function getImageUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '')
  const cleanKey = url.replace(/^\/+/, '')
  return `${base}/media/stream/${cleanKey}`
}

export function GrammarHandbookDrawer({
  visible,
  item,
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
      if (item) {
        form.setFieldsValue({
          ...item,
          formula_details: item.formula_details || [],
        })
        setCurrentImageUrl(item.image_url || '')
      } else {
        form.resetFields()
        form.setFieldsValue({
          cefr_level: 'B1',
          category: 'TENSES',
          is_published: true,
          is_featured: false,
          toeic_relevance: 650,
          formula_details: [
            {
              form_type: 'AFFIRMATIVE',
              form_label: 'Thể Khẳng định (+)',
              pattern: 'S + V...',
              examples: [
                { sentence_en: '', sentence_vi: '', highlight: '' },
                { sentence_en: '', sentence_vi: '', highlight: '' },
                { sentence_en: '', sentence_vi: '', highlight: '' },
              ],
            },
            {
              form_type: 'NEGATIVE',
              form_label: 'Thể Phủ định (-)',
              pattern: 'S + not...',
              examples: [
                { sentence_en: '', sentence_vi: '', highlight: '' },
                { sentence_en: '', sentence_vi: '', highlight: '' },
                { sentence_en: '', sentence_vi: '', highlight: '' },
              ],
            },
            {
              form_type: 'INTERROGATIVE',
              form_label: 'Thể Nghi vấn (?)',
              pattern: 'Auxiliary + S + V...?',
              examples: [
                { sentence_en: '', sentence_vi: '', highlight: '' },
                { sentence_en: '', sentence_vi: '', highlight: '' },
                { sentence_en: '', sentence_vi: '', highlight: '' },
              ],
            },
          ],
        })
        setCurrentImageUrl('')
      }
      setActiveTab('1')
    }
  }, [visible, item, form])

  const handleFinish = async (values: any) => {
    try {
      const payload: GrammarHandbookPayload = {
        ...values,
        image_url: currentImageUrl || values.image_url,
      }
      await onSave(payload)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Không thể lưu chủ điểm ngữ pháp')
    }
  }

  const handleFileChange = async (file: File) => {
    if (!item?._id || !onUploadImage) {
      toast.warning('Vui lòng lưu thông tin chủ điểm trước khi tải ảnh lên R2')
      return
    }
    setUploadingImage(true)
    try {
      const res = await onUploadImage(item._id, file)
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
      title={
        item
          ? `Chỉnh sửa: ${item.title_vi || item.title_en}`
          : 'Thêm mới Chủ điểm Lý thuyết Ngữ pháp'
      }
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
              label: '1. Thông tin chung',
              children: (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="title_vi"
                      label="Tên chủ điểm (Tiếng Việt)"
                      rules={[{ required: true, message: 'Vui lòng nhập tên tiếng Việt' }]}
                    >
                      <Input placeholder="VD: Thì Hiện tại hoàn thành" />
                    </Form.Item>
                    <Form.Item
                      name="title_en"
                      label="Tên chủ điểm (Tiếng Anh)"
                      rules={[{ required: true, message: 'Vui lòng nhập tên tiếng Anh' }]}
                    >
                      <Input placeholder="VD: Present Perfect Tense" />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Form.Item
                      name="slug"
                      label="Định danh URL (Slug)"
                      rules={[{ required: true, message: 'Vui lòng nhập slug duy nhất' }]}
                    >
                      <Input placeholder="VD: present-perfect-tense" />
                    </Form.Item>
                    <Form.Item
                      name="category"
                      label="Nhóm ngữ pháp"
                      rules={[{ required: true, message: 'Chọn nhóm' }]}
                    >
                      <Select options={CATEGORY_OPTIONS} showSearch />
                    </Form.Item>
                    <Form.Item
                      name="cefr_level"
                      label="Cấp độ CEFR"
                      rules={[{ required: true, message: 'Chọn level' }]}
                    >
                      <Select options={CEFR_OPTIONS} />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Form.Item
                      name="toeic_relevance"
                      label="Điểm mục tiêu TOEIC"
                      tooltip="Điểm số mục tiêu liên quan đến chủ điểm này (VD: 450, 650, 850)"
                    >
                      <InputNumber min={0} max={990} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      name="is_published"
                      label="Xuất bản cho học viên"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
                    </Form.Item>
                    <Form.Item
                      name="is_featured"
                      label="Chủ điểm trọng điểm"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Nổi bật" unCheckedChildren="Thường" />
                    </Form.Item>
                  </div>

                  <Form.Item name="description_vi" label="Tóm tắt ứng dụng (Tiếng Việt)">
                    <Input.TextArea
                      rows={2}
                      placeholder="Mô tả ngắn gọn mục đích và cách dùng chủ điểm này..."
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: '2',
              label: '2. Quy tắc & Ảnh R2',
              children: (
                <div className="space-y-4">
                  {/* Banner Preview & Upload R2 */}
                  <Card size="small" title="Ảnh minh họa (Lưu trữ Cloudflare R2)">
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
                          <Input readOnly value={currentImageUrl} placeholder="/vocabulary/grammar/..." />
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
                        <p className="text-[11px] text-slate-400">
                          Hỗ trợ JPG, PNG, WEBP. Ảnh sẽ được tự động đồng bộ lên Cloudflare R2.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Form.Item
                    name="structure_form"
                    label="Công thức cốt lõi (Core Structure)"
                    rules={[{ required: true, message: 'Vui lòng nhập công thức cốt lõi' }]}
                  >
                    <Input placeholder="VD: S + have/has + V3/ed + O" className="font-mono font-bold" />
                  </Form.Item>

                  <Form.Item
                    name="rule_vi"
                    label="Quy tắc ngữ pháp chi tiết (Tiếng Việt)"
                    rules={[{ required: true, message: 'Vui lòng nhập quy tắc chi tiết' }]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Giải thích chi tiết quy tắc chia động từ, dấu hiệu nhận biết..."
                    />
                  </Form.Item>

                  <Form.Item name="rule_en" label="Quy tắc ngữ pháp (Tiếng Anh - Tùy chọn)">
                    <Input.TextArea
                      rows={2}
                      placeholder="English grammar rule summary..."
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: '3',
              label: '3. Thể công thức & 3 Ví dụ mẫu',
              children: (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        Bóc tách thể công thức (+, -, ?, ...)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Mỗi thể công thức nên có đúng 3 câu ví dụ mẫu song ngữ Anh - Việt để người học nhận biết.
                      </p>
                    </div>
                  </div>

                  <Form.List name="formula_details">
                    {(fields, { add, remove }) => (
                      <div className="space-y-4">
                        {fields.map(({ key, name, ...restField }, index) => (
                          <Card
                            key={key}
                            size="small"
                            className="border-slate-300 shadow-xs"
                            title={
                              <div className="flex items-center gap-2">
                                <Tag color="blue">Thể {index + 1}</Tag>
                                <span className="font-bold text-xs">
                                  {form.getFieldValue(['formula_details', name, 'form_label']) || 'Chi tiết thể'}
                                </span>
                              </div>
                            }
                            extra={
                              <Popconfirm
                                title="Xóa thể công thức này?"
                                onConfirm={() => remove(name)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            }
                          >
                            <div className="grid grid-cols-2 gap-3 mb-2">
                              <Form.Item
                                {...restField}
                                name={[name, 'form_type']}
                                label="Loại thể"
                                rules={[{ required: true, message: 'Chọn loại' }]}
                              >
                                <Select options={FORM_TYPE_OPTIONS} />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'form_label']}
                                label="Tên nhãn thể hiển thị"
                                rules={[{ required: true, message: 'Nhập nhãn' }]}
                              >
                                <Input placeholder="VD: Thể Khẳng định (+)" />
                              </Form.Item>
                            </div>

                            <Form.Item
                              {...restField}
                              name={[name, 'pattern']}
                              label="Cấu trúc công thức"
                              rules={[{ required: true, message: 'Nhập cấu trúc' }]}
                            >
                              <Input
                                placeholder="VD: S + have/has + V3/ed + O"
                                className="font-mono text-primary font-bold"
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'explanation']}
                              label="Giải thích / Lưu ý thể"
                            >
                              <Input placeholder="VD: Chủ ngữ I/You/We/They dùng have, He/She/It dùng has..." />
                            </Form.Item>

                            <Divider className="my-2" />

                            {/* Danh sách 3 câu ví dụ */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-700">
                                  3 Câu ví dụ mẫu song ngữ:
                                </span>
                              </div>

                              <Form.List name={[name, 'examples']}>
                                {(exFields, { add: addEx, remove: removeEx }) => (
                                  <div className="space-y-2">
                                    {exFields.map((exField, exIndex) => (
                                      <div
                                        key={exField.key}
                                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 relative"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[11px] font-bold text-slate-500">
                                            Ví dụ mẫu #{exIndex + 1}
                                          </span>
                                          {exFields.length > 1 && (
                                            <Button
                                              type="text"
                                              danger
                                              size="small"
                                              icon={<DeleteOutlined />}
                                              onClick={() => removeEx(exField.name)}
                                            />
                                          )}
                                        </div>

                                        <div className="space-y-2">
                                          <Form.Item
                                            name={[exField.name, 'sentence_en']}
                                            rules={[{ required: true, message: 'Nhập câu tiếng Anh' }]}
                                            className="mb-1"
                                          >
                                            <Input placeholder="Câu tiếng Anh (VD: We have completed the project.)" />
                                          </Form.Item>
                                          <Form.Item
                                            name={[exField.name, 'sentence_vi']}
                                            rules={[{ required: true, message: 'Nhập bản dịch' }]}
                                            className="mb-1"
                                          >
                                            <Input placeholder="Bản dịch tiếng Việt..." />
                                          </Form.Item>
                                          <Form.Item
                                            name={[exField.name, 'highlight']}
                                            className="mb-0"
                                          >
                                            <Input placeholder="Từ khóa nhận diện cần highlight (VD: have completed)" />
                                          </Form.Item>
                                        </div>
                                      </div>
                                    ))}

                                    <Button
                                      type="dashed"
                                      size="small"
                                      block
                                      icon={<PlusOutlined />}
                                      onClick={() => addEx({ sentence_en: '', sentence_vi: '', highlight: '' })}
                                    >
                                      Thêm câu ví dụ
                                    </Button>
                                  </div>
                                )}
                              </Form.List>
                            </div>
                          </Card>
                        ))}

                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() =>
                            add({
                              form_type: 'SPECIAL',
                              form_label: 'Thể bổ sung',
                              pattern: '',
                              explanation: '',
                              examples: [
                                { sentence_en: '', sentence_vi: '', highlight: '' },
                              ],
                            })
                          }
                        >
                          Thêm thể công thức mới
                        </Button>
                      </div>
                    )}
                  </Form.List>
                </div>
              ),
            },
            {
              key: '4',
              label: '4. Bẫy & Mẹo TOEIC',
              children: (
                <div className="space-y-4">
                  <Form.Item
                    name="common_mistakes"
                    label="Lỗi sai & Bẫy thường gặp (Common Mistakes)"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Các lỗi nhầm lẫn điển hình trong đề thi TOEIC, cách tránh mất điểm..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="usage_notes"
                    label="Chiến thuật & Mẹo giải nhanh 5 giây (TOEIC Tips)"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Mẹo làm bài nhanh Part 5/Part 6, các dấu hiệu nhận biết thần tốc..."
                    />
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Drawer>
  )
}


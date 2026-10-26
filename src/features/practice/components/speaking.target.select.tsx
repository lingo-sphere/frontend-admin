// Component chọn mục tiêu kiến thức cho bài Speaking.

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/use.debounce'
import { CustomSelect } from '@/components/custom.select'
import { speakingAdminService, type SpeakingTargetKind } from '@/features/practice/services/speaking-admin.service'

export function SpeakingTargetSelect({ kind, value = [], onChange, disabled, id }: { kind: SpeakingTargetKind; value?: string[]; onChange?: (ids: string[]) => void; disabled?: boolean; id?: string }) {
  const { i18n } = useTranslation(), vi = i18n.language.startsWith('vi')
  const [search, setSearch] = useState(''), debounced = useDebounce(search, 300)
  const selected = useQuery({ queryKey: ['speaking-admin', 'targets', kind, 'selected', value], queryFn: () => speakingAdminService.targets(kind, '', value), staleTime: 60000 })
  const searching = debounced.trim().length >= (kind === 'lexical' ? 2 : 1)
  const result = useQuery({ queryKey: ['speaking-admin', 'targets', kind, 'search', debounced], queryFn: () => speakingAdminService.targets(kind, debounced, []), enabled: searching, staleTime: 60000 })
  const options = searching ? [...new Map([...(result.data?.items || []), ...(selected.data?.items || []).filter(option => value.includes(option.value))].map(option => [option.value, option])).values()] : selected.data?.items || []
  const loading = selected.isFetching || (searching && result.isFetching)
  const error = selected.error || (searching ? result.error : null)

  return <Space direction="vertical" style={{ width: '100%' }}>
    <CustomSelect id={id} mode="multiple" style={{ width: '100%' }} disabled={disabled} showSearch filterOption={false} searchValue={search} onSearch={setSearch} onBlur={() => setSearch('')} loading={loading} value={value} onChange={ids => { onChange?.(ids); setSearch('') }} maxCount={100}
      placeholder={vi ? 'Tìm và chọn mục tiêu' : 'Search and select targets'}
      notFoundContent={loading ? (vi ? 'Đang tải…' : 'Loading…') : kind === 'lexical' && debounced.trim().length < 2 ? (vi ? 'Nhập ít nhất 2 ký tự' : 'Enter at least 2 characters') : (vi ? 'Không có kết quả' : 'No results')}
      options={options.map(option => ({ value: option.value, disabled: option.unavailable && !value.includes(option.value), label: option.unavailable ? (vi ? 'Liên kết cũ không còn khả dụng' : 'Existing target unavailable') : (vi ? option.label_vi : option.label_en) }))}
      labelRender={props => options.find(option => option.value === props.value) ? props.label : (vi ? 'Đang tải mục tiêu…' : 'Loading target…')} />
    {error && <Alert type="error" message={vi ? 'Không tải được mục tiêu' : 'Could not load targets'} action={<Button size="small" onClick={() => { void selected.refetch(); if (searching) void result.refetch() }}>{vi ? 'Thử lại' : 'Retry'}</Button>} />}
  </Space>
}

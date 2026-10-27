import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api.client'

const skills = ['LISTENING', 'READING', 'SPEAKING', 'WRITING'] as const
export function MeasurementProfilesPage() {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['measurement-profiles'], queryFn: () => api.get<Array<{ _id: string; name: string; version: string; comparison_group: string; validation: { dataset: string; sample_size: number }; approved_at: string }>>('/progress/measurement-profiles') })
  const [name, setName] = useState(''), [version, setVersion] = useState(''), [group, setGroup] = useState('')
  const [dataset, setDataset] = useState(''), [notes, setNotes] = useState(''), [sample, setSample] = useState('')
  const [method, setMethod] = useState(''), [duration, setDuration] = useState('60')
  const [listening, setListening] = useState(''), [reading, setReading] = useState('')
  const [speakingType, setSpeakingType] = useState('OPINION_RESPONSE'), [writingType, setWritingType] = useState('EXPRESS_OPINION')
  const [speakingStandard, setSpeakingStandard] = useState('PRACTICAL'), [writingStandard, setWritingStandard] = useState('PRACTICAL')
  const [speakingLevel, setSpeakingLevel] = useState('B1'), [writingLevel, setWritingLevel] = useState('B1')
  const [included, setIncluded] = useState<string[]>([...skills]), [tables, setTables] = useState<Record<string, string>>({})
  const [weights, setWeights] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const mutation = useMutation({ mutationFn: () => {
    const curves: Record<string, Array<{ input: number; score: number; lower: number; upper: number }>> = {}
    for (const skill of included) {
      const text = tables[skill]?.trim()
      if (!text) continue
      curves[skill] = text.split(/\r?\n/).filter(line => line.trim()).map(line => {
        const values = line.trim().split(/[,;\t ]+/).map(Number)
        if (values.length !== 4 || values.some(value => !Number.isFinite(value))) throw new Error(`Bảng ${skill} cần 4 số hợp lệ trên mỗi dòng`)
        return { input: values[0], score: values[1], lower: values[2], upper: values[3] }
      })
    }
    return api.post('/progress/measurement-profiles', { name, version, comparison_group: group,
      blueprint: { version: 'course-assessment-v2', required: skills.filter(skill => included.includes(skill)),
        weights: Object.fromEntries(included.map(skill => [skill, Number(weights[skill] ?? '1')])),
        listening_questions: included.includes('LISTENING') ? Number(listening) : 0, reading_questions: included.includes('READING') ? Number(reading) : 0,
        speaking_type: included.includes('SPEAKING') ? speakingType : '', speaking_standard: included.includes('SPEAKING') ? speakingStandard : '', speaking_level: included.includes('SPEAKING') ? speakingLevel : '', speaking_rubric: {},
        writing_type: included.includes('WRITING') ? writingType : '', writing_standard: included.includes('WRITING') ? writingStandard : '', writing_level: included.includes('WRITING') ? writingLevel : '', writing_rubric: {}, duration_minutes: Number(duration) },
      validation: { dataset, notes, sample_size: Number(sample), reference_method: method }, curves })
  }, onSuccess: () => { setError(''); void client.invalidateQueries({ queryKey: ['measurement-profiles'] }); setVersion('') }, onError: (failure: Error) => setError(failure.message) })
  const input = 'w-full rounded-lg border border-slate-300 bg-transparent p-2 text-sm'
  return <div className="space-y-6">
    <header><h1 className="text-xl font-bold">Hiệu chuẩn ước tính TOEIC</h1><p className="mt-2 text-sm text-slate-500">Đăng ký dữ liệu đối chiếu đã được thẩm định. Mỗi phiên bản được giữ nguyên để truy vết kết quả; cập nhật bằng phiên bản mới. Không có bảng quy đổi mặc định cho mọi đề.</p></header>
    <section className="space-y-2 rounded-xl border p-4"><h2 className="font-semibold">Hồ sơ đã công bố</h2>{query.isError && <p role="alert">Không tải được hồ sơ hiệu chuẩn.</p>}{query.data?.map(profile => <div key={profile._id} className="border-t py-2 text-sm"><strong>{profile.name} · {profile.version}</strong><p>Nhóm: {profile.comparison_group} · {profile.validation.sample_size} mẫu</p><p>{profile.validation.dataset}</p><small>Mã hồ sơ: {profile._id}</small></div>)}</section>
    <form onSubmit={event => { event.preventDefault(); mutation.mutate() }} className="space-y-4 rounded-xl border p-5">
      <h2 className="font-semibold">Công bố hồ sơ đã thẩm định</h2>
      <div className="grid gap-3 md:grid-cols-3">{[['Tên hồ sơ', name, setName], ['Phiên bản', version, setVersion], ['Mã nhóm đề tương đương', group, setGroup], ['Nguồn dữ liệu đối chiếu', dataset, setDataset], ['Số mẫu đối chiếu', sample, setSample], ['Mã phương pháp điểm tham chiếu', method, setMethod]] .map(([label, value, setter]) => <label key={String(label)} className="text-sm">{String(label)}<input required className={input} value={String(value)} onChange={event => (setter as (value: string) => void)(event.target.value)} /></label>)}</div>
      <p className="text-xs text-slate-500">Phương pháp tham chiếu phải chỉ rõ nguồn điểm đối chiếu. Bài thi thử của ứng dụng dùng tiền tố APP_MOCK_LR cùng phiên bản chấm; không gắn nhãn điểm ETS chính thức cho bảng nội bộ.</p>
      <label className="block text-sm">Kết quả thẩm định, giới hạn áp dụng và cách xác lập khoảng tham chiếu<textarea required rows={3} className={input} value={notes} onChange={event => setNotes(event.target.value)} /></label>
      <fieldset className="space-y-3"><legend className="font-semibold">Cấu trúc bài dùng để hiệu chuẩn</legend><div className="flex flex-wrap gap-4">{skills.map(skill => <label key={skill}><input type="checkbox" checked={included.includes(skill)} onChange={event => setIncluded(current => event.target.checked ? [...current, skill] : current.filter(value => value !== skill))} /> {skill}</label>)}</div>
        <div className="grid gap-3 md:grid-cols-3"><label>Thời gian (phút)<input className={input} type="number" min={1} max={240} required value={duration} onChange={event => setDuration(event.target.value)} /></label><label>Số câu Listening<input className={input} type="number" min={0} value={listening} onChange={event => setListening(event.target.value)} /></label><label>Số câu Reading<input className={input} type="number" min={0} value={reading} onChange={event => setReading(event.target.value)} /></label></div>
        <div className="grid gap-3 md:grid-cols-2"><label>Speaking<select className={input} value={speakingType} onChange={event => setSpeakingType(event.target.value)}>{['READ_ALOUD','DESCRIBE_PICTURE','ANSWER_QUESTION','RESPOND_USING_INFORMATION','OPINION_RESPONSE'].map(type => <option key={type}>{type}</option>)}</select><select className={input} value={speakingStandard} onChange={event => setSpeakingStandard(event.target.value)}><option>PRACTICAL</option><option>TOEIC</option></select><select className={input} value={speakingLevel} onChange={event => setSpeakingLevel(event.target.value)}>{['A1','A2','B1','B2','C1','C2'].map(level => <option key={level}>{level}</option>)}</select></label>
          <label>Writing<select className={input} value={writingType} onChange={event => setWritingType(event.target.value)}>{['DESCRIBE_PICTURE','WRITE_EMAIL','EXPRESS_OPINION','SENTENCE_COMPLETION'].map(type => <option key={type}>{type}</option>)}</select><select className={input} value={writingStandard} onChange={event => setWritingStandard(event.target.value)}><option>PRACTICAL</option><option>TOEIC</option></select><select className={input} value={writingLevel} onChange={event => setWritingLevel(event.target.value)}>{['A1','A2','B1','B2','C1','C2'].map(level => <option key={level}>{level}</option>)}</select></label></div>
        <div className="grid gap-3 md:grid-cols-4">{skills.filter(skill => included.includes(skill)).map(skill => <label key={skill}>Trọng số {skill}<input className={input} type="number" min="0.001" step="any" required value={weights[skill] ?? '1'} onChange={event => setWeights(current => ({ ...current, [skill]: event.target.value }))} /></label>)}</div>
      </fieldset>
      <div className="grid gap-4 md:grid-cols-2">{included.map(skill => <label key={skill} className="text-sm">Bảng {skill} · Thang {['LISTENING','READING'].includes(skill) ? '5–495' : '0–200'}<textarea rows={5} className={input} value={tables[skill] || ''} onChange={event => setTables(current => ({ ...current, [skill]: event.target.value }))} placeholder="Mỗi dòng: điểm nội bộ 0–100, điểm ước tính, cận dưới, cận trên" /><small>Chỉ nhập các mốc có dữ liệu đối chiếu. Hệ thống không ngoại suy ngoài miền đã thẩm định.</small></label>)}</div>
      {error && <p role="alert" className="text-red-600">{error}</p>}{mutation.isSuccess && <p className="text-emerald-700">Đã công bố hồ sơ. Chọn hồ sơ trong cấu hình bài đánh giá phù hợp.</p>}<button disabled={mutation.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">{mutation.isPending ? 'Đang lưu…' : 'Công bố hồ sơ đã thẩm định'}</button>
    </form>
  </div>
}

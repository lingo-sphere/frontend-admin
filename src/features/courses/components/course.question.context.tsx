import { TreeSelect } from 'antd'
import { useGrammarTree } from '@/features/practice/hooks/use.grammar.admin'
import { usePracticeContexts } from '@/features/practice/hooks/use.practice.contexts'

export function CourseQuestionContext({ index, value, grammar, isVi, onChange, onGrammarChange }: { index: number; value?: string | null; grammar?: string | null; isVi: boolean; onChange: (value: string | null) => void; onGrammarChange: (value: string | null) => void }) {
  const { contexts, isLoading, error } = usePracticeContexts()
  const grammarTree = useGrammarTree()
  const id = `course-question-context-${index}`
  return <div className="mt-2 flex flex-col gap-1 px-1">
    <label htmlFor={id} className="text-xs font-medium text-slate-700 dark:text-slate-300">{isVi ? 'Ngữ cảnh luyện tập' : 'Practice context'}</label>
    <TreeSelect id={id} aria-label={isVi ? `Ngữ cảnh câu ${index + 1}` : `Context for question ${index + 1}`}
      allowClear showSearch treeDataSimpleMode treeNodeFilterProp="title" value={value || undefined} loading={isLoading}
      placeholder={isVi ? 'Chọn ngữ cảnh nếu có' : 'Select a context if available'}
      treeData={contexts.map(context => ({ id: context._id, value: context._id, pId: context.parent_id, title: isVi ? (context.name_vi || context.name_en || context.name || context.code) : (context.name_en || context.name || context.name_vi || context.code) }))}
      onChange={(next) => onChange(next || null)} />
    {error && <span role="status" className="text-xs text-rose-600">{isVi ? 'Không tải được danh sách ngữ cảnh.' : 'Could not load contexts.'}</span>}
    <label htmlFor={`${id}-grammar`} className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">{isVi ? 'Chủ điểm ngữ pháp' : 'Grammar topic'}</label>
    <TreeSelect id={`${id}-grammar`} aria-label={isVi ? `Ngữ pháp câu ${index + 1}` : `Grammar topic for question ${index + 1}`}
      allowClear showSearch treeDataSimpleMode treeNodeFilterProp="title" value={grammar || undefined} loading={grammarTree.isLoading}
      placeholder={isVi ? 'Chọn nếu câu có nội dung ngữ pháp' : 'Select if applicable'}
      treeData={(grammarTree.data || []).map(row => ({ id: row._id, value: row._id, pId: row.parent_id, title: row.name_vi || row.name_en || row.code }))}
      onChange={(next) => onGrammarChange(next || null)} />
    {grammarTree.error && <span role="status" className="text-xs text-rose-600">{isVi ? 'Không tải được chủ điểm ngữ pháp.' : 'Could not load grammar topics.'}</span>}
  </div>
}

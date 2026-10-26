import type { FormInstance } from 'antd'
import { ApiRequestError } from '@/services/api.client'

/** Preserve the form and show structured server errors at registered Ant Design fields. */
export function applyPracticeFormError(form: FormInstance, error: unknown) {
  if (!(error instanceof ApiRequestError) || !error.fieldErrors.length) return
  const registered = form.getFieldsError().map(field => JSON.stringify(field.name))
  const fields = error.fieldErrors.filter(field => registered.includes(JSON.stringify(field.path)))
  form.setFields(fields.map(field => ({ name: field.path, errors: field.messages })))
  if (fields.length) requestAnimationFrame(() => form.scrollToField(fields[0].path, { block: 'center', focus: true }))
}

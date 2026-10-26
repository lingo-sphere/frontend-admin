// The vocabulary entry uses the same IPA management screen.
import { Navigate } from 'react-router-dom'

export function VocabularyIpaTab(_props: { onEditIpaSymbol?: unknown }) {
  return <Navigate to="/practice/ipa" replace />
}

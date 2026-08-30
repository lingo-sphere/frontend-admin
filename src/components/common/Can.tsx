import React from 'react'
import { usePermission } from '@/hooks/use-permission'

interface CanProps {
  do?: string
  on?: string
  module?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function Can({ do: action = 'GET', on: resource, module, fallback = null, children }: CanProps) {
  const { can, canModule } = usePermission()

  if (module && !canModule(module)) {
    return <>{fallback}</>
  }

  if (resource && !can(action, resource)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

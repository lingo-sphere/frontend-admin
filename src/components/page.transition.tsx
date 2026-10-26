// Component hiệu ứng chuyển trang mượt mà cho Frontend Admin với hỗ trợ giảm chuyển động.

import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface PageTransitionProps {
  children: ReactNode
  locationKey?: string
  className?: string
}

export function PageTransition({ children, locationKey, className }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      key={locationKey}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{
        duration: shouldReduceMotion ? 0.1 : 0.18,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className || 'flex-1 flex flex-col w-full min-w-0'}
    >
      {children}
    </motion.div>
  )
}

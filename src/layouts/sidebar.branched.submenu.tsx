// Component SidebarBranchedSubmenu tạo hiệu ứng đường rẽ nhánh SVG động cho danh mục con thanh bên Admin.
import React, { isValidElement } from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { ChevronRight } from 'lucide-react'
import type { NavSubItem } from '@/layouts/sidebar.nav.config'
import { navItemToPath } from '@/routes/navigation'

interface SidebarBranchedSubmenuProps {
  children: NavSubItem[]
  activeNavItem: string
  isExpanded: boolean
  onNavigate: (id: string) => void
}

const PAD = 4
const ROW_HEIGHT = 34
const INDENT = 36
const TRUNK = 14
const RADIUS = 8
const LINE_WIDTH = 1.5
const END_X = INDENT - 6

const renderChildIcon = (icon?: React.ReactNode | IconSvgElement) => {
  if (!icon) return null
  if (isValidElement(icon)) return icon
  if (typeof icon === 'function') {
    const Component = icon as React.ComponentType<{ className?: string }>
    return <Component className="w-3.5 h-3.5" />
  }
  return <HugeiconsIcon icon={icon as IconSvgElement} size={15} strokeWidth={1.8} />
}

export function SidebarBranchedSubmenu({
  children,
  activeNavItem,
  isExpanded,
  onNavigate,
}: SidebarBranchedSubmenuProps) {
  const r = Math.min(RADIUS, ROW_HEIGHT / 2 - 2)
  const endX = END_X
  const rowY = (k: number) => PAD + k * ROW_HEIGHT + ROW_HEIGHT / 2
  const branch = (k: number) => `M ${TRUNK} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${TRUNK + r} ${rowY(k)} H ${endX}`
  const reach = (k: number) => `M ${TRUNK} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${TRUNK + r} ${rowY(k)} H ${endX}`
  const length = (k: number) => rowY(k) - r + (Math.PI * r) / 2 + (endX - TRUNK - r)

  const bodyH = PAD * 2 + children.length * ROW_HEIGHT
  const activeIndex = children.findIndex((child) => child.id === activeNavItem)

  return (
    <div className="relative box-border ml-2" style={{ height: bodyH }}>
      <svg
        className={`pointer-events-none absolute top-0 left-0 overflow-visible transition-opacity duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
        width={INDENT}
        height={bodyH}
        aria-hidden="true"
      >
        <path
          className="fill-none stroke-slate-200 dark:stroke-slate-800"
          strokeWidth={LINE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          d={`M ${TRUNK} 0 V ${rowY(children.length - 1) - r}`}
        />
        {children.map((child, k) => (
          <path
            key={`branch-${child.id}`}
            className="fill-none stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={LINE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={branch(k)}
          />
        ))}
        {children.map((child, k) => (
          <path
            key={`reach-${child.id}`}
            className="fill-none stroke-blue-600 dark:stroke-blue-400 transition-[stroke-dashoffset] duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
            strokeWidth={LINE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={reach(k)}
            style={{
              strokeDasharray: length(k),
              strokeDashoffset: activeIndex === k ? 0 : length(k),
            }}
          />
        ))}
      </svg>

      {children.map((child) => {
        const isChildActive = activeNavItem === child.id

        return (
          <Link
            key={child.id}
            to={navItemToPath(child.id)}
            onClick={() => onNavigate(child.id)}
            tabIndex={isExpanded ? 0 : -1}
            className={`group relative box-border flex w-full items-center gap-2 rounded-xl text-xs bg-transparent transition-colors duration-200 cursor-pointer ${
              isChildActive
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
            }`}
            style={{
              height: ROW_HEIGHT,
              paddingLeft: INDENT,
              paddingRight: 8,
            }}
          >
            {child.icon && (
              <span
                className={`inline-flex shrink-0 transition-colors ${
                  isChildActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }`}
                aria-hidden="true"
              >
                {renderChildIcon(child.icon)}
              </span>
            )}
            <span className="truncate flex-1">{child.label}</span>
            {isChildActive && (
              <ChevronRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
          </Link>
        )
      })}
    </div>
  )
}

// Component thanh tab chuyển đổi giữa các hạng mục chấm điểm và phúc khảo.

import { useNavigate } from 'react-router-dom'
import { Mic, PenTool, GraduationCap } from 'lucide-react'
import { AdminTabs, type AdminTabItem } from '@/components/admin.tabs'

export interface SubmissionsTabHeaderProps {
  activeTab: 'speaking' | 'writing' | 'courses'
}

export function SubmissionsTabHeader({ activeTab }: SubmissionsTabHeaderProps) {
  const navigate = useNavigate()

  const items: AdminTabItem[] = [
    {
      key: 'speaking',
      label: 'Bài luyện Speaking',
      icon: <Mic className="w-4 h-4" />,
    },
    {
      key: 'writing',
      label: 'Bài luyện Writing',
      icon: <PenTool className="w-4 h-4" />,
    },
    {
      key: 'courses',
      label: 'Bài kiểm tra khóa học',
      icon: <GraduationCap className="w-4 h-4" />,
    },
  ]

  const handleChange = (key: string) => {
    if (key === 'speaking') {
      navigate('/submissions/practice/speaking')
    } else if (key === 'writing') {
      navigate('/submissions/practice/writing')
    } else if (key === 'courses') {
      navigate('/submissions/courses')
    }
  }

  return (
    <div className="pb-2">
      <AdminTabs
        items={items}
        activeKey={activeTab}
        onChange={handleChange}
        size="md"
      />
    </div>
  )
}

import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import StepModal from '../modals/StepModal'
import { usePlatforms } from '../../hooks/usePlatforms'

export default function Layout() {
  const { platformId } = useParams()
  const [addStep, setAddStep] = useState(false)
  const { data: platforms = [] } = usePlatforms()

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar onAddStep={() => setAddStep(true)} />
        <div className="content">
          <Outlet />
        </div>
      </div>

      <StepModal
        open={addStep}
        onClose={() => setAddStep(false)}
        platforms={platforms}
        platformId={platformId}
      />
    </div>
  )
}

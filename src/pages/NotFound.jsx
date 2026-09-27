import { useNavigate } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <Card className="card-pad animate-rise mx-auto flex max-w-xl flex-col items-center gap-4 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
        <Compass size={24} strokeWidth={2} />
      </span>
      <div>
        <p className="eyebrow">Error 404</p>
        <h2 className="heading mt-1 text-lg font-bold">
          This page isn't part of the demo
        </h2>
        <p className="muted mx-auto mt-2 max-w-sm text-[13px] leading-snug">
          The route you opened does not exist in SPENANCE. Jump back to the
          dashboard to continue the walkthrough.
        </p>
      </div>
      <Button icon={Home} onClick={() => navigate('/')}>
        Back to dashboard
      </Button>
    </Card>
  )
}

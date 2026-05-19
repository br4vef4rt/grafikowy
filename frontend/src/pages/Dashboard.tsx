import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import client from '../api/client'
import { translateStatus } from '../utils/ui'

interface Absence {
  id: number
  type: string
  start_date: string
  end_date: string
  status: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [absences, setAbsences] = useState<Absence[]>([])

  useEffect(() => {
    client.get('/absences/mine').then((res) => setAbsences(res.data))
  }, [])

  const stats = {
    total: absences.length,
    pending: absences.filter((a) => a.status === 'pending').length,
    approved: absences.filter((a) => a.status === 'approved').length,
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pulpit</h1>
          <p className="page-subtitle">Witaj, {user?.full_name}. Tutaj szybko sprawdzisz stan swoich wpisów.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Wszystkie wpisy" value={stats.total} color="#4a90d9" />
        <StatCard label="Oczekujące" value={stats.pending} color="#f5a623" />
        <StatCard label="Zatwierdzone" value={stats.approved} color="#22c55e" />
      </div>

      <div className="surface-card" style={{ marginTop: '1.25rem' }}>
        <h2>Jak działa status wpisu?</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Nowy wpis domyślnie dostaje status <strong>{translateStatus('pending')}</strong>, czyli czeka na zatwierdzenie.
          To celowe, bo w tym MVP wpisy przechodzą przez prosty proces akceptacji.
          Jeśli Twoje konto ma uprawnienia administratora, możesz je zatwierdzać w zakładce <strong>Akceptacje</strong>.
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="surface-card stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}

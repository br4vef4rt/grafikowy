import { useState, useEffect } from 'react'
import client from '../api/client'
import { translateAbsenceType, translateStatus } from '../utils/ui'
import AbsenceTypesAdmin from './AbsenceTypesAdmin'

interface User {
  id: number
  email: string
  full_name: string
  role: string
}

interface Absence {
  id: number
  type: string
  start_date: string
  end_date: string
  reason?: string
  status: string
  user: User
}

export default function Admin() {
  const [absences, setAbsences] = useState<Absence[]>([])
  const [tab, setTab] = useState<'approvals' | 'types'>('approvals')

  useEffect(() => {
    client.get('/absences/').then((res) => setAbsences(res.data))
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await client.put(`/absences/${id}`, { status })
    setAbsences((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }

  if (tab === 'types') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Administracja</h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setTab('approvals')} className="secondary-button">Akceptacje</button>
          <button onClick={() => setTab('types')} className="primary-button">Typy nieobecności</button>
        </div>
        <AbsenceTypesAdmin />
      </div>
    )
  }

  const pending = absences.filter((a) => a.status === 'pending')
  const others = absences.filter((a) => a.status !== 'pending')

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Administracja</h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setTab('approvals')} className="primary-button">Akceptacje</button>
        <button onClick={() => setTab('types')} className="secondary-button">Typy nieobecności</button>
      </div>

      <section>
        <h2>Oczekujące wpisy ({pending.length})</h2>
        {pending.length > 0 ? (
          <div className="admin-list">
            {pending.map((a) => (
              <div key={a.id} className="surface-card admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start' }}>
                  <div>
                    <div className="admin-card-title">{a.user?.full_name} • {translateAbsenceType(a.type)}</div>
                    <div className="muted">{a.start_date} → {a.end_date}</div>
                    {a.reason && <div style={{ marginTop: '0.4rem' }}>{a.reason}</div>}
                  </div>
                  <div className="status-badge status-pending">{translateStatus(a.status)}</div>
                </div>
                <div className="action-row">
                  <button onClick={() => updateStatus(a.id, 'approved')} className="success-button">Zatwierdź</button>
                  <button onClick={() => updateStatus(a.id, 'rejected')} className="danger-button">Odrzuć</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card muted">Brak wpisów oczekujących na akceptację.</div>
        )}
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>Historia decyzji</h2>
        <div className="admin-list" style={{ marginTop: '0.75rem' }}>
          {others.map((a) => (
            <div key={a.id} className="surface-card admin-history-card">
              <strong>{a.user?.full_name}</strong> • {translateAbsenceType(a.type)} • {translateStatus(a.status)} • {a.start_date} → {a.end_date}
            </div>
          ))}
          {others.length === 0 && <div className="surface-card muted">Brak przetworzonych wpisów.</div>}
        </div>
      </section>
    </div>
  )
}

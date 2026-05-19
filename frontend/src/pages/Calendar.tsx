import { useState, useEffect, useCallback } from 'react'
import { Calendar as RBCalendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import client from '../api/client'
import AbsenceForm from '../components/AbsenceForm'
import {
  absenceTypeLabels,
  calendarMessages,
  statusLabels,
  translateAbsenceType,
  translateStatus,
} from '../utils/ui'

const localizer = momentLocalizer(moment)

interface AbsenceEvent {
  id: number
  title: string
  start: Date
  end: Date
  type: string
  status: string
  allDay: boolean
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
}

export default function Calendar() {
  const [events, setEvents] = useState<AbsenceEvent[]>([])
  const [showForm, setShowForm] = useState(false)

  const fetchAbsences = useCallback(async () => {
    const res = await client.get('/absences/')
    const absences = res.data.map((a: any) => ({
      id: a.id,
      title: `${a.user?.full_name || 'Nieznany użytkownik'} • ${translateAbsenceType(a.type)} • ${translateStatus(a.status)}`,
      start: new Date(a.start_date),
      end: new Date(new Date(a.end_date).getTime() + 86400000),
      type: a.type,
      status: a.status,
      allDay: true,
    }))
    setEvents(absences)
  }, [])

  useEffect(() => {
    fetchAbsences()
  }, [fetchAbsences])

  const eventStyleGetter = (event: AbsenceEvent) => ({
    style: {
      backgroundColor: STATUS_COLORS[event.status] || '#4a90d9',
      borderRadius: '8px',
      opacity: 0.95,
      color: '#fff',
      border: 'none',
      padding: '3px 6px',
      fontSize: '0.85rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Kalendarz</h1>
          <p className="page-subtitle">Tydzień zaczyna się od poniedziałku. Nowe wpisy trafiają najpierw do akceptacji.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="primary-button">
          + Dodaj nieobecność
        </button>
      </div>

      <div className="surface-card calendar-card">
        <RBCalendar
          localizer={localizer}
          culture="pl"
          messages={calendarMessages}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          style={{ height: 680 }}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      <div className="legend-row">
        <Legend color={STATUS_COLORS.approved} label={statusLabels.approved} />
        <Legend color={STATUS_COLORS.pending} label={statusLabels.pending} />
        <Legend color={STATUS_COLORS.rejected} label={statusLabels.rejected} />
        <Legend color="#4a90d9" label={absenceTypeLabels.remote} />
      </div>

      {showForm && <AbsenceForm onClose={() => { setShowForm(false); fetchAbsences() }} />}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="legend-item">
      <div className="legend-dot" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}

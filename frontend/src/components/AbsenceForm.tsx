import { useState, useEffect, FormEvent } from 'react'
import client from '../api/client'
import { formatApiError, fetchAbsenceTypes } from '../utils/ui'

interface Props {
  onClose: () => void
}

interface TypeOption {
  name: string
  label: string
  color: string
}

export default function AbsenceForm({ onClose }: Props) {
  const [types, setTypes] = useState<TypeOption[]>([])
  const [type, setType] = useState('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAbsenceTypes().then((items) => {
      setTypes(items)
      if (items.length > 0 && !items.find(t => t.name === type)) {
        setType(items[0].name)
      }
    })
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await client.post('/absences/', { type, start_date: startDate, end_date: endDate, reason })
      onClose()
    } catch (err: any) {
      setError(formatApiError(err, 'Nie udało się zapisać wpisu. Sprawdź formularz i spróbuj ponownie.'))
    }
  }

  return (
    <div className="modal-backdrop">
      <form onSubmit={handleSubmit} className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Dodaj nieobecność</h2>
            <p className="page-subtitle">Po zapisaniu wpis otrzyma status „Oczekuje”, dopóki administrator go nie zatwierdzi.</p>
          </div>
        </div>

        <div className="form-row">
          <label className="field-label">Typ wpisu</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="text-input">
            {types.map((t) => (
              <option key={t.name} value={t.name}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="form-grid two-columns">
          <div className="form-row">
            <label className="field-label">Data od</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="text-input" />
          </div>

          <div className="form-row">
            <label className="field-label">Data do</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="text-input" />
          </div>
        </div>

        <div className="form-row">
          <label className="field-label">Powód (opcjonalnie)</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="text-input textarea-input" placeholder="Np. wyjazd rodzinny, konferencja, praca z domu" />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="action-row">
          <button type="button" onClick={onClose} className="secondary-button">Anuluj</button>
          <button type="submit" className="primary-button">Zapisz wpis</button>
        </div>
      </form>
    </div>
  )
}

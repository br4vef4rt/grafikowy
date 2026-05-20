import { useState, useEffect, FormEvent } from 'react'
import client from '../api/client'
import { formatApiError, translateAbsenceType } from '../utils/ui'

interface AbsenceType {
  id: number
  name: string
  color: string
  description: string
  is_default: boolean
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
]

export default function AbsenceTypesAdmin() {
  const [types, setTypes] = useState<AbsenceType[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const fetchTypes = async () => {
    try {
      const res = await client.get('/absence-types/')
      setTypes(res.data)
    } catch {
      setTypes([])
    }
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await client.post('/absence-types/', { name: name.trim(), color, description: description.trim() })
      setName('')
      setColor('#6366f1')
      setDescription('')
      setShowForm(false)
      fetchTypes()
    } catch (err: any) {
      setError(formatApiError(err, 'Nie udało się utworzyć typu.'))
    }
  }

  const handleDelete = async (id: number) => {
    setError('')
    try {
      await client.delete(`/absence-types/${id}`)
      setDeleteConfirm(null)
      fetchTypes()
    } catch (err: any) {
      setError(formatApiError(err, 'Nie udało się usunąć typu.'))
      setDeleteConfirm(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>Typy nieobecności</h2>
          <p className="page-subtitle">Zarządzaj rodzajami nieobecności dostępnymi w systemie. Predefiniowane typy są oznaczone i nie można ich usunąć.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="primary-button">
          {showForm ? 'Anuluj' : '+ Dodaj typ'}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="surface-card" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-row">
            <label className="field-label">Nazwa typu</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Np. "Szkolenie", "Wyjazd służbowy", "Opieka nad dzieckiem"'
              className="text-input"
              required
              maxLength={100}
            />
          </div>

          <div className="form-row">
            <label className="field-label">Kolor (dla kalendarza)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', padding: 0 }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{color}</span>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '2px solid #1f2937' : '1px solid #e2e6ef',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <label className="field-label">Opis (opcjonalnie)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótki opis typu"
              className="text-input"
              maxLength={500}
            />
          </div>

          <div className="action-row">
            <button type="submit" className="primary-button">Zapisz typ</button>
          </div>
        </form>
      )}

      <div className="admin-list">
        {types.map((t) => (
          <div key={t.id} className="surface-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: t.color,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {translateAbsenceType(t.name)}
                  {t.is_default && (
                    <span className="status-badge status-default" style={{ fontSize: '0.7rem', background: '#e0e0e0', color: '#333' }}>domyślny</span>
                  )}
                </div>
                {t.description && <div className="muted" style={{ fontSize: '0.85rem' }}>{t.description}</div>}
              </div>
            </div>
            <div>
              {!t.is_default && (
                deleteConfirm === t.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="muted" style={{ fontSize: '0.8rem' }}>Na pewno?</span>
                    <button onClick={() => handleDelete(t.id)} className="danger-button" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                      Usuń
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} className="secondary-button" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                      Anuluj
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(t.id)}
                    className="text-button"
                    style={{ color: 'var(--danger)', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                  >
                    Usuń
                  </button>
                )
              )}
            </div>
          </div>
        ))}
        {types.length === 0 && (
          <div className="surface-card muted">Brak zdefiniowanych typów nieobecności.</div>
        )}
      </div>
    </div>
  )
}

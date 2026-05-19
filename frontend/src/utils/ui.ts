import client from '../api/client'

export const absenceTypeLabels: Record<string, string> = {
  vacation: 'Urlop',
  remote: 'Praca zdalna',
  sick: 'Chorobowe',
  other: 'Inna nieobecność',
}

export const statusLabels: Record<string, string> = {
  pending: 'Oczekuje',
  approved: 'Zatwierdzone',
  rejected: 'Odrzucone',
}

export const calendarMessages = {
  allDay: 'Cały dzień',
  previous: 'Poprzedni',
  next: 'Następny',
  today: 'Dziś',
  month: 'Miesiąc',
  week: 'Tydzień',
  day: 'Dzień',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Godzina',
  event: 'Wydarzenie',
  noEventsInRange: 'Brak wpisów w tym zakresie.',
  showMore: (total: number) => `+${total} więcej`,
}

const fieldLabels: Record<string, string> = {
  email: 'E-mail',
  password: 'Hasło',
  full_name: 'Imię i nazwisko',
  start_date: 'Data od',
  end_date: 'Data do',
  reason: 'Powód',
  type: 'Typ',
}

function translateValidationMessage(item: any) {
  const field = fieldLabels[item?.loc?.[1]] || item?.loc?.[1] || 'Pole'

  switch (item?.type) {
    case 'string_too_short':
      return `${field}: minimum ${item?.ctx?.min_length} znaków.`
    case 'string_too_long':
      return `${field}: maksymalnie ${item?.ctx?.max_length} znaków.`
    case 'value_error':
      return `${field}: nieprawidłowa wartość.`
    case 'missing':
      return `${field}: to pole jest wymagane.`
    default:
      return `${field}: ${item?.msg || 'nieprawidłowa wartość.'}`
  }
}

export function formatApiError(err: any, fallback = 'Wystąpił błąd. Spróbuj ponownie.') {
  const data = err?.response?.data

  if (typeof data?.detail === 'string') return data.detail

  if (Array.isArray(data?.detail)) {
    return data.detail.map(translateValidationMessage).join(' ')
  }

  if (typeof data === 'string' && data.trim()) return data

  if (err?.response?.status >= 500) {
    return 'Wystąpił błąd po stronie serwera. Spróbuj ponownie za chwilę.'
  }

  return fallback
}

export let absenceTypeCache: { name: string; label: string; color: string }[] = []

export async function fetchAbsenceTypes(): Promise<{ name: string; label: string; color: string }[]> {
  try {
    const res = await client.get('/absence-types/')
    const types = res.data.map((t: any) => ({
      name: t.name,
      label: absenceTypeLabels[t.name] || t.name,
      color: t.color,
    }))
    absenceTypeCache = types
    return types
  } catch {
    // Fallback to hardcoded labels
    const fallback = [
      { name: 'vacation', label: 'Urlop', color: '#22c55e' },
      { name: 'remote', label: 'Praca zdalna', color: '#3b82f6' },
      { name: 'sick', label: 'Chorobowe', color: '#ef4444' },
      { name: 'other', label: 'Inna nieobecność', color: '#6366f1' },
    ]
    absenceTypeCache = fallback
    return fallback
  }
}

export function translateAbsenceType(value: string) {
  return absenceTypeLabels[value] || value
}

export function translateStatus(value: string) {
  return statusLabels[value] || value
}

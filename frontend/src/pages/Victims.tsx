import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, User } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Card, EmptyState, Input, Select, Spinner } from '@/components/ui'
import { val } from '@/lib/format'
import { VICTIM_STATUSES, type Paginated, type Victim } from '@/types'

export default function Victims() {
  const [victims, setVictims] = useState<Victim[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      api
        .get<Paginated<Victim>>('/victims', { params: { search, status: status || undefined } })
        .then((res) => setVictims(res.data.data))
        .finally(() => setLoading(false))
    }, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, status])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Victims / Leads</h1>
        <p className="text-sm text-slate-500">Every person extracted from crash reports, with enrichment status.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search by name, address, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select className="max-w-[220px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {VICTIM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : victims.length === 0 ? (
          <EmptyState title="No leads found" subtitle="Upload a crash report or adjust your filters." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Lookup</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {victims.map((v) => (
                <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link to={`/victims/${v.id}`} className="flex items-center gap-2 font-medium text-brand-700">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <User size={14} />
                      </div>
                      {v.full_name || '—'}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{[v.city, v.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{val(v.enrichment?.primary_phone)}</td>
                  <td className="px-5 py-3">
                    <Badge status={v.enrichment?.lookup_status ?? 'pending'} />
                  </td>
                  <td className="px-5 py-3">
                    <Badge status={v.current_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

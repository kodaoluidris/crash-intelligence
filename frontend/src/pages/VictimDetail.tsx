import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Sparkles, Phone, Mail, Globe, Camera, Briefcase,
  MessageSquarePlus, Pencil, Clock, FileText,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Button, Card, Field, Input, Modal, Select, Spinner } from '@/components/ui'
import { formatDate, formatDateTime, val } from '@/lib/format'
import { useAuth } from '@/lib/auth'
import { VICTIM_STATUSES, type Enrichment, type Victim } from '@/types'

export default function VictimDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [victim, setVictim] = useState<Victim | null>(null)
  const [enriching, setEnriching] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const can = (p: string) => user?.permissions.includes(p)

  const load = () => api.get(`/victims/${id}`).then((res) => setVictim(res.data))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!victim) return <Spinner />

  const e = victim.enrichment

  const runEnrichment = async () => {
    setEnriching(true)
    try {
      await api.post(`/victims/${victim.id}/enrich`)
      await load()
    } finally {
      setEnriching(false)
    }
  }

  const changeStatus = async (status: string) => {
    await api.patch(`/victims/${victim.id}/status`, { status })
    await load()
  }

  const addNote = async () => {
    if (!note.trim()) return
    setSavingNote(true)
    try {
      await api.post(`/victims/${victim.id}/notes`, { note })
      setNote('')
      await load()
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/victims" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to leads
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{victim.full_name || '—'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {victim.is_driver ? 'Driver' : victim.is_passenger ? 'Passenger' : 'Person'} ·{' '}
            {[victim.city, victim.state].filter(Boolean).join(', ') || '—'}
            {victim.crash_report && (
              <>
                {' · '}
                <Link to={`/reports/${victim.crash_report_id}`} className="text-brand-700">
                  Crash #{victim.crash_report.crash_id ?? victim.crash_report_id}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {can('victims.update_status') && (
            <Select value={victim.current_status} onChange={(e) => changeStatus(e.target.value)} className="w-48">
              {VICTIM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          )}
          <Badge status={victim.current_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: identity */}
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Person details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Date of birth" value={formatDate(victim.dob)} />
            <Row label="Age" value={val(victim.age)} />
            <Row label="Gender" value={val(victim.gender)} />
            <Row label="Driver license" value={`${val(victim.driver_license_number)} ${victim.driver_license_state ?? ''}`} />
            <Row label="Address" value={val(victim.street_address)} />
            <Row label="City / ZIP" value={[victim.city, victim.zip_code].filter(Boolean).join(', ') || '—'} />
            <Row label="Injury" value={val(victim.injury_severity)} />
          </dl>
          {victim.vehicle && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <FileText size={15} className="text-slate-400" />
              {[victim.vehicle.vehicle_year, victim.vehicle.vehicle_make, victim.vehicle.vehicle_model]
                .filter(Boolean)
                .join(' ')}
            </div>
          )}
        </Card>

        {/* Middle: enrichment */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-700">Recovered contact info</h2>
              <Badge status={e?.lookup_status ?? 'pending'} />
              {e?.confidence_score != null && (
                <span className="text-xs text-slate-400">{e.confidence_score}% confidence</span>
              )}
            </div>
            <div className="flex gap-2">
              {can('enrichment.edit') && (
                <Button variant="secondary" onClick={() => setShowEdit(true)}>
                  <Pencil size={15} /> Edit
                </Button>
              )}
              {can('enrichment.run') && (
                <Button onClick={runEnrichment} loading={enriching}>
                  <Sparkles size={15} /> Run lookup
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ContactItem icon={Phone} label="Primary phone" value={e?.primary_phone} href={e?.primary_phone ? `tel:${e.primary_phone}` : undefined} />
            <ContactItem icon={Phone} label="Secondary phone" value={e?.secondary_phone} />
            <ContactItem icon={Mail} label="Primary email" value={e?.primary_email} href={e?.primary_email ? `mailto:${e.primary_email}` : undefined} />
            <ContactItem icon={Mail} label="Secondary email" value={e?.secondary_email} />
            <ContactItem icon={Globe} label="Facebook" value={e?.facebook_url} href={e?.facebook_url ?? undefined} />
            <ContactItem icon={Camera} label="Instagram" value={e?.instagram_url} href={e?.instagram_url ?? undefined} />
            <ContactItem icon={Briefcase} label="LinkedIn" value={e?.linkedin_url} href={e?.linkedin_url ?? undefined} />
            <ContactItem icon={MessageSquarePlus} label="Occupation" value={e?.occupation} />
          </div>

          {e?.last_lookup_at && (
            <p className="mt-4 text-xs text-slate-400">Last lookup: {formatDateTime(e.last_lookup_at)}</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Notes */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Notes</h2>
          {can('notes.manage') && (
            <div className="mb-4 flex gap-2">
              <Input placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()} />
              <Button onClick={addNote} loading={savingNote}>Add</Button>
            </div>
          )}
          <div className="space-y-3">
            {victim.notes?.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
            {victim.notes?.map((n) => (
              <div key={n.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-sm text-slate-700">{n.note}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {n.user?.name ?? 'System'} · {formatDateTime(n.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Status history</h2>
          <ol className="space-y-3">
            {victim.statuses?.map((s) => (
              <li key={s.id} className="flex gap-3">
                <div className="mt-1 flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <span className="mt-1 w-px flex-1 bg-slate-200" />
                </div>
                <div className="pb-2">
                  <Badge status={s.status} />
                  {s.reason && <p className="mt-1 text-sm text-slate-600">{s.reason}</p>}
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={11} /> {formatDateTime(s.created_at)}
                    {s.changed_by && ` · ${s.changed_by.name}`}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <EditEnrichmentModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        victimId={victim.id}
        enrichment={e ?? null}
        onSaved={() => {
          setShowEdit(false)
          load()
        }}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-700">{value}</dd>
    </div>
  )
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string | null | undefined
  href?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2">
      <Icon size={16} className="mt-0.5 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        {value ? (
          href ? (
            <a href={href} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-brand-700 hover:underline">
              {value}
            </a>
          ) : (
            <p className="truncate text-sm font-medium text-slate-700">{value}</p>
          )
        ) : (
          <p className="text-sm text-slate-300">Not found</p>
        )}
      </div>
    </div>
  )
}

const EDIT_FIELDS: { key: keyof Enrichment; label: string }[] = [
  { key: 'primary_phone', label: 'Primary phone' },
  { key: 'secondary_phone', label: 'Secondary phone' },
  { key: 'primary_email', label: 'Primary email' },
  { key: 'secondary_email', label: 'Secondary email' },
  { key: 'facebook_url', label: 'Facebook URL' },
  { key: 'instagram_url', label: 'Instagram URL' },
  { key: 'linkedin_url', label: 'LinkedIn URL' },
  { key: 'twitter_url', label: 'Twitter / X URL' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'employer', label: 'Employer' },
]

function EditEnrichmentModal({
  open,
  onClose,
  victimId,
  enrichment,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  victimId: number
  enrichment: Enrichment | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {}
      EDIT_FIELDS.forEach((f) => {
        initial[f.key] = (enrichment?.[f.key] as string) ?? ''
      })
      setForm(initial)
    }
  }, [open, enrichment])

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/victims/${victimId}/enrichment`, form)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit contact info" wide>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EDIT_FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <Input
              value={form[f.key] ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save} loading={saving}>
          Save
        </Button>
      </div>
    </Modal>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Search, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Button, Card, EmptyState, Input, Modal, Spinner } from '@/components/ui'
import { formatDate } from '@/lib/format'
import { useAuth } from '@/lib/auth'
import type { CrashReport, Paginated } from '@/types'

export default function CrashReports() {
  const { user } = useAuth()
  const canUpload = user?.permissions.includes('reports.upload')
  const [reports, setReports] = useState<CrashReport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get<Paginated<CrashReport>>('/crash-reports', { params: { search } })
      .then((res) => setReports(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Crash Reports</h1>
          <p className="text-sm text-slate-500">Upload a crash report PDF to extract victims automatically.</p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUpload(true)}>
            <Upload size={16} /> Upload PDF
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search by crash ID, city, county…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : reports.length === 0 ? (
          <EmptyState title="No crash reports yet" subtitle="Upload a PDF to get started." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Crash</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Victims</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link to={`/reports/${r.id}`} className="flex items-center gap-2 font-medium text-brand-700">
                      <FileText size={16} className="text-slate-400" />
                      {r.crash_id ? `#${r.crash_id}` : `Report ${r.id}`}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {[r.city, r.county].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(r.crash_date)}</td>
                  <td className="px-5 py-3 text-slate-600">{r.victims_count ?? 0}</td>
                  <td className="px-5 py-3">
                    <Badge status={r.report_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onDone={() => {
          setShowUpload(false)
          load()
        }}
      />
    </div>
  )
}

function UploadModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    const form = new FormData()
    form.append('pdf', file)
    try {
      await api.post('/crash-reports', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null)
      onDone()
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; message?: string } } }
      setError(e.response?.data?.error || e.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload crash report PDF">
      <div className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 text-center hover:border-brand-400 hover:bg-brand-50/40"
        >
          <Upload size={28} className="mb-2 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">{file ? file.name : 'Click to choose a PDF'}</p>
          <p className="mt-1 text-xs text-slate-400">PDF up to 20MB. Victims are extracted automatically.</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={uploading} disabled={!file}>
            Upload & Extract
          </Button>
        </div>
      </div>
    </Modal>
  )
}

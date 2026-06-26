import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Car, MapPin, User } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Card, Spinner } from '@/components/ui'
import { formatDate, val } from '@/lib/format'
import type { CrashReport } from '@/types'

export default function CrashReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState<CrashReport | null>(null)

  useEffect(() => {
    api.get(`/crash-reports/${id}`).then((res) => setReport(res.data))
  }, [id])

  if (!report) return <Spinner />

  return (
    <div className="space-y-6">
      <Link to="/reports" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to reports
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {report.crash_id ? `Crash #${report.crash_id}` : `Report ${report.id}`}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={14} />
            {[report.street_address, report.city, report.county, report.state].filter(Boolean).join(', ') || '—'} ·{' '}
            {formatDate(report.crash_date)} {report.crash_time}
          </p>
        </div>
        <Badge status={report.report_status} />
      </div>

      {report.report_status === 'failed' && report.processing_error && (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Extraction failed: {report.processing_error}
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Units" value={val(report.total_units)} />
        <Stat label="Persons" value={val(report.total_persons)} />
        <Stat label="Speed limit" value={val(report.speed_limit)} />
        <Stat label="TxDOT ID" value={val(report.txdot_id)} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Vehicles</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {report.vehicles?.map((v) => (
            <Card key={v.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Car size={18} className="text-slate-400" />
                <span className="font-medium text-slate-800">
                  Unit {v.unit_number} · {[v.vehicle_year, v.vehicle_make, v.vehicle_model].filter(Boolean).join(' ')}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <Detail label="Color" value={val(v.vehicle_color)} />
                <Detail label="Plate" value={`${val(v.license_plate)} ${v.plate_state ?? ''}`} />
                <Detail label="VIN" value={val(v.vin)} />
                <Detail label="Owner" value={val(v.owner_name)} />
              </dl>
            </Card>
          ))}
          {!report.vehicles?.length && <p className="text-sm text-slate-400">No vehicles extracted.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Victims ({report.victims?.length ?? 0})</h2>
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Age</th>
                <th className="px-5 py-3 font-medium">Contact lookup</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.victims?.map((v) => (
                <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link to={`/victims/${v.id}`} className="flex items-center gap-2 font-medium text-brand-700">
                      <User size={15} className="text-slate-400" />
                      {v.full_name || '—'}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{v.is_driver ? 'Driver' : v.is_passenger ? 'Passenger' : '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{val(v.age)}</td>
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
        </Card>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-800">{value}</p>
    </Card>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  )
}

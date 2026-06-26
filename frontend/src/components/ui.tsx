import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { Loader2, X } from 'lucide-react'

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

export function Button({
  children,
  variant = 'primary',
  loading,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
}) {
  const styles: Record<string, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
        styles[variant],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const STATUS_COLORS: Record<string, string> = {
  // report
  uploaded: 'bg-slate-100 text-slate-700',
  processing: 'bg-amber-100 text-amber-700',
  processed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  // enrichment
  pending: 'bg-slate-100 text-slate-700',
  searching: 'bg-amber-100 text-amber-700',
  found: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  not_found: 'bg-orange-100 text-orange-700',
  // victim pipeline
  NEW: 'bg-slate-100 text-slate-700',
  PDF_EXTRACTED: 'bg-sky-100 text-sky-700',
  LOOKUP_PENDING: 'bg-amber-100 text-amber-700',
  LOOKUP_RUNNING: 'bg-amber-100 text-amber-700',
  CONTACT_FOUND: 'bg-emerald-100 text-emerald-700',
  CONTACT_NOT_FOUND: 'bg-orange-100 text-orange-700',
  READY_FOR_OUTREACH: 'bg-indigo-100 text-indigo-700',
  CONTACTED: 'bg-violet-100 text-violet-700',
  FOLLOW_UP: 'bg-blue-100 text-blue-700',
  SIGNED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-200 text-slate-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export function Badge({ status, children }: { status?: string; children?: ReactNode }) {
  const label = (children ?? status ?? '') as string
  const color = (status && STATUS_COLORS[status]) || 'bg-slate-100 text-slate-700'
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', color)}>
      {String(label).replace(/_/g, ' ')}
    </span>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-400">
      <Loader2 className="animate-spin" />
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className={cn('mt-16 w-full rounded-xl bg-white shadow-xl', wide ? 'max-w-2xl' : 'max-w-md')}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  )
}

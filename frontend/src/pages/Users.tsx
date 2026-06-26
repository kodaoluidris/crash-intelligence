import { useEffect, useState } from 'react'
import { Plus, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Button, Card, Field, Input, Modal, Select, Spinner } from '@/components/ui'
import { formatDate, initials } from '@/lib/format'
import type { ManagedUser, Paginated, Role } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<Paginated<ManagedUser>>('/users'),
      api.get<Role[]>('/roles'),
    ])
      .then(([u, r]) => {
        setUsers(u.data.data)
        setRoles(r.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }
  const openEdit = (u: ManagedUser) => {
    setEditing(u)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Users & Roles</h1>
          <p className="text-sm text-slate-500">Manage team members and what they can access.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> New user
        </Button>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Roles</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                        {initials(u.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length ? (
                        u.roles.map((r) => (
                          <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            <ShieldCheck size={11} /> {r.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge status={u.status === 'active' ? 'found' : 'failed'}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" onClick={() => openEdit(u)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <UserModal
        open={showModal}
        onClose={() => setShowModal(false)}
        roles={roles}
        user={editing}
        onSaved={() => {
          setShowModal(false)
          load()
        }}
      />
    </div>
  )
}

function UserModal({
  open,
  onClose,
  roles,
  user,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  roles: Role[]
  user: ManagedUser | null
  onSaved: () => void
}) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', status: 'active' })
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setError('')
      setForm({
        first_name: user?.first_name ?? '',
        last_name: user?.last_name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        password: '',
        status: user?.status ?? 'active',
      })
      setSelectedRoles(user?.roles.map((r) => r.name) ?? [])
    }
  }, [open, user])

  const toggleRole = (name: string) =>
    setSelectedRoles((prev) => (prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name]))

  const save = async () => {
    setSaving(true)
    setError('')
    const payload = { ...form, roles: selectedRoles }
    try {
      if (user) {
        await api.put(`/users/${user.id}`, payload)
      } else {
        await api.post('/users', payload)
      }
      onSaved()
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Could not save user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={user ? 'Edit user' : 'New user'} wide>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="First name">
          <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
        </Field>
        <Field label="Last name">
          <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label={user ? 'New password (optional)' : 'Password'}>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="invited">Invited</option>
          </Select>
        </Field>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-slate-500">Roles</p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => toggleRole(r.name)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                selectedRoles.includes(r.name)
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save} loading={saving}>
          {user ? 'Save changes' : 'Create user'}
        </Button>
      </div>
    </Modal>
  )
}

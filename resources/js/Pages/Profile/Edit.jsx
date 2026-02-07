import AdminLayout from '@/Layouts/AdminLayout'
import UpdatePasswordForm from './Partials/UpdatePasswordForm'
import { Head, usePage } from '@inertiajs/react'

export default function Edit() {
  const { role, status } = usePage().props

  return (
    <>
      <Head title="Profil" />
      <div className="max-w-2xl mx-auto mt-6">
        <UpdatePasswordForm role={role} status={status} />
      </div>
    </>
  )
}

Edit.layout = (page) => <AdminLayout children={page} />

import AdminLayout from '@/Layouts/AdminLayout'

export default function AdminDashboard({ auth }) {
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date())

    return (
        <AdminLayout>
            <div className="pt-1 pl-4 font-sfPro">
                <h1 className="text-3xl text-gray-900 font-sfPro tracking-tight">
                    Hello {auth.user.name} 👋🏻
                </h1>
                <p className="mt-4 text-sm text-gray-500 capitalize font-sfPro">
                    {formattedDate}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 px-4">
            </div>
        </AdminLayout>
    )
}
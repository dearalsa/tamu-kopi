import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import AdminSidebar from '@/Components/AdminSidebar'
import { HiOutlineLogout, HiOutlineUserCircle, HiOutlineBell } from 'react-icons/hi'

export default function AdminLayout({ children }) {
  const { auth, statusBahan = 'aman' } = usePage().props
  const [profileOpen, setProfileOpen] = useState(false)
  
  const [notifOpen, setNotifOpen] = useState(false) 
  
  const isDashboard = window.location.pathname.includes('/dashboard')

  const profileRouteName =
    auth.user.role === 'owner' ? 'owner.profile.edit' : 'admin.profile.edit'

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex font-sfPro">
      <AdminSidebar />

      <div className="flex-1 ml-60 transition-all">
        <main className="px-10 py-10 relative">
          <div className={`absolute top-10 z-[60] flex items-center gap-3 ${isDashboard ? 'right-10' : 'left-10'}`}>
            
            {isDashboard && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)} 
                  className="relative p-2.5 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <HiOutlineBell size={20} className="text-gray-500" />
                  {statusBahan !== 'aman' && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-3 bg-rose-50/50 border-b border-gray-100">
                      <p className="text-sm font-sfPro text-slate-800">
                        {statusBahan === 'warning' ? '⚠️ Waspada' : '🚨 Habis'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {statusBahan === 'warning' ? 'Bahan hampir habis!' : 'Bahan sudah habis!'}
                      </p>
                    </div>
                    <Link 
                        href={route('admin.kelola-produk.index')} 
                        className="block px-5 py-3 text-xs text-red-600 hover:bg-gray-50 font-sfPro transition-all"
                    >
                        Lihat Detail Bahan →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="relative font-sfPro">
              <button
                onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotifOpen(false); 
                }}
                className="flex items-center gap-3 pl-1 pr-5 py-1 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=EF5350&color=fff`}
                  className="w-10 h-10 rounded-full object-cover"
                  alt="avatar"
                />
                <span className="text-sm font-sfPro text-gray-900">
                  {auth.user.name}
                </span>
              </button>

              {profileOpen && (
                <div
                  className={`absolute top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-[70] ${isDashboard ? 'right-0' : 'left-0'}`}
                >
                  <div className="px-5 py-4 border-b border-gray-50">
                    <p className="text-sm font-sfPro text-gray-900 truncate">{auth.user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{auth.user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href={route(profileRouteName)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <HiOutlineUserCircle className="text-lg text-gray-400" />
                      <span>Profil</span>
                    </Link>

                    <Link
                      href={route('logout')}
                      method="post"
                      as="button"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all"
                    >
                      <HiOutlineLogout className="text-lg" />
                      <span>Logout</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
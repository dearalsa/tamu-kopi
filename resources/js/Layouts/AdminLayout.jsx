import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminSidebar from '@/Components/AdminSidebar';
import { HiOutlineLogout, HiOutlineUserCircle, HiOutlineBell } from 'react-icons/hi';

export default function AdminLayout({ children }) {
  // Inisialisasi Data & State
  const { auth, notif } = usePage().props;
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Logika Helper
  const isDashboard = window.location.pathname.includes('/dashboard');
  const profileRouteName = 'admin.profile.edit';

  const getNotifHeaderColor = () => {
    if (notif?.status === 'habis') return 'bg-rose-50 text-rose-600';
    if (notif?.status === 'menipis') return 'bg-amber-50 text-amber-600';
    return 'bg-gray-50 text-gray-600';
  };

  // Mengecek apakah ada pesan notifikasi untuk menampilkan dot merah
  const hasNotification = notif?.messages && notif.messages.length > 0;

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex font-sfPro">
      <AdminSidebar />

      <div className="flex-1 ml-60 transition-all">
        <main className="px-10 py-10 relative">
          <div className={`absolute top-10 z-[60] flex items-center gap-3 ${isDashboard ? 'right-10' : 'left-10'}`}>
            
            {/* Notifikasi Lonceng */}
            {isDashboard && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setProfileOpen(false);
                  }}
                  className="relative p-2.5 bg-white rounded-full shadow border border-gray-50 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <HiOutlineBell size={20} className="text-gray-500" />
                  
                  {/* Dot merah berdenyut jika ada bahan bermasalah */}
                  {hasNotification && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {/* Dropdown Notifikasi */}
                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2">
                    <div className={`px-5 py-3 border-b border-gray-100 font-sfPro font-bold text-xs uppercase tracking-wider ${getNotifHeaderColor()}`}>
                      {notif?.status === 'habis' ? '🚨 Darurat Bahan' : notif?.status === 'menipis' ? '‼️Peringatan Bahan' : '✅ Informasi Bahan'}
                    </div>

                    <div className="p-4 max-h-60 overflow-y-auto space-y-2">
                      {hasNotification ? (
                        notif.messages.map((msg, i) => (
                          <p key={i} className="text-xs text-slate-600 leading-relaxed">
                            {msg}
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-2">Semua bahan tersedia, aman!</p>
                      )}
                    </div>

                    <Link
                      href={route('admin.kelola-produk.index')}
                      onClick={() => setNotifOpen(false)}
                      className="block px-5 py-3 text-[10px] text-center text-red-500 bg-gray-50 hover:bg-gray-100 tracking-[0.01em]"
                    >
                      Cek Detail Bahan Sekarang →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Bagian Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-3 pl-1 pr-5 py-1 bg-white rounded-full shadow border border-gray-50 hover:bg-gray-50 transition-all"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=EF5350&color=fff`}
                  className="w-10 h-10 rounded-full"
                  alt="avatar"
                />
                <span className="text-sm text-gray-800 font-medium">
                  {auth.user.name}
                </span>
              </button>

              {/* Dropdown Profile */}
              {profileOpen && (
                <div className={`absolute top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-[70] p-1 ${isDashboard ? 'right-0' : 'left-0'}`}>
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-sm text-gray-900 truncate">{auth.user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{auth.user.email}</p>
                  </div>

                  <Link
                    href={route(profileRouteName)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <HiOutlineUserCircle className="text-lg text-gray-400" />
                    Profil
                  </Link>

                  <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl text-left transition-colors"
                  >
                    <HiOutlineLogout className="text-lg" />
                    Logout
                  </Link>
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
  );
}
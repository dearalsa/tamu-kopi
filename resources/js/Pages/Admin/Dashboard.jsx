import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@inertiajs/react'
import AdminSidebar from '@/Components/AdminSidebar'
import { HiOutlineLogout, HiOutlineUserCircle } from 'react-icons/hi'

export default function AdminDashboard({ auth }) {
    const [profileOpen, setProfileOpen] = useState(false)

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date())

    return (
        <div className="min-h-screen bg-[#F8F9FD] flex font-sfPro">
            <AdminSidebar />

            <main className="flex-1 ml-60 p-10 relative">
                <div className="absolute top-8 right-10 z-[60]">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center rounded-full transition-all hover:opacity-90 active:scale-95"
                    >
                        <img
                            src={`https://ui-avatars.com/api/?name=${auth.user.name}&background=EF5350&color=fff`}
                            className="w-10 h-10 rounded-full"
                            alt="avatar"
                        />
                    </button>

                    <AnimatePresence>
                        {profileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                transition={{ duration: 0.16, ease: 'easeOut' }}
                                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.08)] z-50"
                            >
                                <div className="px-5 py-4 border-b border-gray-50">
                                    <p className="text-sm text-gray-900 font-medium">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {auth.user.email}
                                    </p>
                                </div>

                                <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    <HiOutlineUserCircle className="text-xl text-gray-400" />
                                    <span>Profile</span>
                                </button>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-[#EF5350] hover:bg-red-50 transition-colors"
                                >
                                    <HiOutlineLogout className="text-xl" />
                                    <span className="font-medium">Logout</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <header className="mb-10 ml-4 -mt-2">
                    <h1 className="text-3xl text-gray-900 font-medium">
                        Hello {auth.user.name} 👋🏻
                    </h1>
                    <p className="mt-3 text-sm text-gray-500 capitalize">
                        {formattedDate}
                    </p>
                </header>
            </main>
        </div>
    )
}

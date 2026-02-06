import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
    LayoutDashboard,
    ShoppingBag,
    PackageSearch,
    FileText,
    ChevronDown,
    Menu,
    X,
    UtensilsCrossed,
    ClipboardList,
    Tag,
    BarChart3,
    Receipt,
    Wallet,
    Clipboard
} from 'lucide-react'
import { Link, usePage } from '@inertiajs/react'

export default function AdminSidebar() {
    const { url } = usePage()
    const [openDropdown, setOpenDropdown] = useState(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        {
            label: 'Kasir',
            icon: ShoppingBag,
            children: [
                { label: 'Kelola Menu', icon: UtensilsCrossed, href: '/admin/menus' },
                { label: 'Katalog Menu', icon: ClipboardList, href: '/admin/catalog' },
                { label: 'Menu Promo', icon: Tag, href: '/admin/promos' },
                { label: 'Summary Menu', icon: BarChart3, href: '/admin/summary' },
                { label: 'Transaksi', icon: Receipt, href: '/admin/transactions' }
            ]
        },
        {
            label: 'Kelola Produk',
            icon: PackageSearch,
            children: [
                { label: 'Pengeluaran', icon: Wallet, href: '/admin/expenses' }
            ]
        },
        { label: 'Kategori', icon: Clipboard, href: '/admin/categories' },
        { label: 'Laporan', icon: FileText, href: '/admin/reports' }
    ]

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden fixed top-5 left-5 z-[60] font-sfPro">
                <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-[#374151]">
                    {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-white flex flex-col z-50 border-r border-gray-100 font-sfPro
                transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
            `}>
                <div className="flex justify-center pt-[50px] lg:pt-[24px] pb-[25px]">
                    <img src="/asset/Tamu.svg" alt="Logo" className="h-[60px] w-auto" />
                </div>

                <nav className="flex-1 px-5 space-y-2 overflow-y-auto">
                    {menuItems.map((item, index) => {
                        const hasChildren = !!item.children
                        const isOpen = openDropdown === index
                        const isActive = item.href === url || (hasChildren && item.children.some(child => child.href === url))

                        return (
                            <div key={index} className="relative">
                                {hasChildren ? (
                                    <div onClick={() => setOpenDropdown(isOpen ? null : index)} className="group">
                                        <motion.div
                                            animate={isActive 
                                                ? { backgroundColor: '#EF5350', color: '#FFFFFF' } 
                                                : { backgroundColor: 'transparent', color: '#374151' }
                                            }
                                            // Efek Hover hanya scale sedikit agar terasa "klik-able", tanpa warna merah muda
                                            whileHover={!isActive ? { scale: 1.02 } : {}}
                                            className="flex items-center justify-between px-5 h-11 rounded-lg cursor-pointer transition-shadow duration-200"
                                        >
                                            <div className="flex items-center gap-4 relative z-10">
                                                <item.icon size={22} strokeWidth={1.5} />
                                                <span className="font-sfPro text-[15px] tracking-tight">{item.label}</span>
                                            </div>
                                            <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                        </motion.div>
                                    </div>
                                ) : (
                                    <Link href={item.href} onClick={() => setIsMobileOpen(false)} className="block outline-none">
                                        <motion.div
                                            animate={isActive 
                                                ? { backgroundColor: '#EF5350', color: '#FFFFFF' } 
                                                : { backgroundColor: 'transparent', color: '#374151' }
                                            }
                                            // Efek Hover hanya scale sedikit tanpa warna background
                                            whileHover={!isActive ? { scale: 1.02 } : {}}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="flex items-center gap-4 px-5 h-11 rounded-lg cursor-pointer transition-shadow duration-200"
                                        >
                                            <item.icon size={22} strokeWidth={1.5} />
                                            <span className="font-sfPro text-[15px] tracking-tight">{item.label}</span>
                                        </motion.div>
                                    </Link>
                                )}

                                <AnimatePresence>
                                    {hasChildren && isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: -4 }}
                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: -4 }}
                                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                            className="ml-6 mt-1 space-y-1 overflow-hidden"
                                        >
                                            {item.children.map((child, idx) => {
                                                const isChildActive = child.href === url
                                                return (
                                                    <Link key={idx} href={child.href} onClick={() => setIsMobileOpen(false)} className="block">
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            className={`flex items-center gap-3 py-2.5 px-4 text-[13px] rounded-lg font-sfPro cursor-pointer transition-colors ${
                                                                isChildActive ? 'text-[#EF5350] font-bold' : 'text-[#374151]'
                                                            }`}
                                                        >
                                                            <child.icon size={16} strokeWidth={2} className="opacity-70" />
                                                            {child.label}
                                                        </motion.div>
                                                    </Link>
                                                )
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}
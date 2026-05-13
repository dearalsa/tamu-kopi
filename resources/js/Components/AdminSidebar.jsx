import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  ShoppingBag,
  PackageSearch,
  FileText,
  ChevronDown,
  Menu as MenuIcon,
  X,
  UtensilsCrossed,
  ClipboardList,
  Tag,
  BarChart3,
  CircleDollarSign, 
  Wallet,
  Clipboard,
  Users
} from 'lucide-react'
import { Link, usePage } from '@inertiajs/react'

export default function AdminSidebar() {
  const { url, props } = usePage();
  const auth = props.auth || { user: { role: 'kasir' } };
  const userRole = auth.user?.role || 'kasir';
  
  const [openDropdowns, setOpenDropdowns] = useState([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Definisi Menu Items
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard', show: true },
    {
      label: 'Kasir',
      icon: ShoppingBag,
      show: true, // Keduanya bisa lihat dropdown ini
      children: [
        // Menu yang hanya untuk Admin
        { label: 'Kelola Menu', icon: UtensilsCrossed, href: '/admin/kasir/menus', show: userRole === 'admin' },
        { label: 'Menu Promo', icon: Tag, href: '/admin/kasir/promo', show: userRole === 'admin' },
        { label: 'Kelola Kasir', icon: Users, href: '/admin/manage-cashiers', show: userRole === 'admin' },
        { label: 'Summary Menu', icon: BarChart3, href: '/admin/kasir/summary', show: userRole === 'admin' },
        
        // Menu yang hanya untuk Kasir
        { label: 'Katalog Menu', icon: ClipboardList, href: '/admin/kasir/katalog', show: userRole === 'kasir' },
        
        // Transaksi bisa diakses keduanya di dalam dropdown Kasir
        { label: 'Transaksi', icon: CircleDollarSign, href: '/admin/kasir/transaksi', show: true },
      ].filter(child => child.show !== false)
    },
    { label: 'Kelola Bahan', icon: PackageSearch, href: '/admin/kelola-produk', show: userRole === 'admin' },
    { label: 'Kategori', icon: Clipboard, href: '/admin/categories', show: userRole === 'admin' },
    {
      label: 'Laporan',
      icon: FileText,
      show: userRole === 'admin',
      children: [
        { label: 'Pemasukan', icon: BarChart3, href: '/admin/laporan/pemasukan' },
        { label: 'Pengeluaran', icon: Wallet, href: '/admin/laporan/pengeluaran' },
      ]
    }
  ].filter(item => item.show !== false);

  useEffect(() => {
    const activeIndices = menuItems
      .map((item, index) => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => url.split('?')[0].startsWith(child.href))
          if (hasActiveChild) return index
        }
        return null
      })
      .filter(index => index !== null)
    setOpenDropdowns(prev => Array.from(new Set([...prev, ...activeIndices])))
  }, [url]);

  const toggleDropdown = (index) => {
    setOpenDropdowns(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])
  }

  return (
    <>
      <div className="lg:hidden fixed top-5 left-5 z-[60] font-sfPro">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-[#374151]">
          {isMobileOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col h-screen z-50 border-r border-gray-100 font-sfPro transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex justify-center pt-[50px] lg:pt-[24px] pb-[25px]">
          <img src="/asset/Tamu.svg" alt="Logo" className="h-[60px] w-auto" />
        </div>

        <nav className="flex-1 px-5 space-y-2 overflow-y-auto pb-10">
          {menuItems.map((item, index) => {
            const hasChildren = !!item.children
            const isOpen = openDropdowns.includes(index)
            const currentPath = url.split('?')[0]
            const isActive = item.href ? (currentPath === item.href || currentPath.startsWith(item.href + '/')) : item.children.some(c => currentPath.startsWith(c.href))

            return (
              <div key={index} className="relative">
                {hasChildren ? (
                  <>
                    <div onClick={() => toggleDropdown(index)}>
                      <motion.div
                        animate={isActive ? { backgroundColor: '#EF5350', color: '#FFFFFF' } : { backgroundColor: 'transparent', color: '#374151' }}
                        className="flex items-center justify-between px-5 h-11 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <item.icon size={22} strokeWidth={1.5} />
                          <span className="font-sfPro text-[15px] tracking-tight">{item.label}</span>
                        </div>
                        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="ml-6 mt-1 space-y-1 overflow-hidden">
                          {item.children.map((child, idx) => (
                            <Link key={idx} href={child.href} className="block">
                              <div className={`flex items-center gap-3 py-2.5 px-4 text-[13px] rounded-lg font-sfPro ${currentPath.startsWith(child.href) ? 'text-[#EF5350]' : 'text-[#374151]'}`}>
                                <child.icon size={16} strokeWidth={2} className="opacity-70" />
                                {child.label}
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href={item.href} className="block">
                    <motion.div animate={isActive ? { backgroundColor: '#EF5350', color: '#FFFFFF' } : { backgroundColor: 'transparent', color: '#374151' }} className="flex items-center gap-4 px-5 h-11 rounded-lg">
                      <item.icon size={22} strokeWidth={1.5} />
                      <span className="font-sfPro text-[15px] tracking-tight">{item.label}</span>
                    </motion.div>
                  </Link>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
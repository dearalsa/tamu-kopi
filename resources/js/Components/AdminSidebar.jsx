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
  Clipboard
} from 'lucide-react'
import { Link, usePage } from '@inertiajs/react'

export default function AdminSidebar() {
  const { url } = usePage()
  const [openDropdowns, setOpenDropdowns] = useState([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    {
      label: 'Kasir',
      icon: ShoppingBag,
      children: [
        { label: 'Kelola Menu', icon: UtensilsCrossed, href: '/admin/kasir/menus' },
        { label: 'Menu Promo', icon: Tag, href: '/admin/kasir/promo' },
        { label: 'Katalog Menu', icon: ClipboardList, href: '/admin/kasir/katalog' },
        { label: 'Summary Menu', icon: BarChart3, href: '/admin/kasir/summary' },
        { label: 'Transaksi', icon: CircleDollarSign, href: '/admin/kasir/transaksi' }
      ]
    },
    {
      label: 'Kelola Produk', 
      icon: PackageSearch,
    },
    { label: 'Kategori', icon: Clipboard, href: '/admin/categories' },
    {
      label: 'Laporan',
      icon: FileText,
      children: [
        { label: 'Pemasukan', icon: BarChart3, href: '/admin/reports/income' },
        { label: 'Pengeluaran', icon: Wallet, href: '/admin/reports/expenses' },
        { label: 'Ringkasan Kas', icon: ClipboardList, href: '/admin/reports/summary' }
      ]
    }
  ]

  // Logika supaya dropdown tidak menutup sendiri
  useEffect(() => {
    const activeIndices = menuItems
      .map((item, index) => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => {
            return url === child.href || url.startsWith(child.href + '?')
          })
          if (hasActiveChild) return index
        }
        return null;
      })
      .filter(index => index !== null);

    setOpenDropdowns(prev => Array.from(new Set([...prev, ...activeIndices])));
  }, [url]);

  const toggleDropdown = (index) => {
    setOpenDropdowns(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    )
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed inset-y-0 left-0 w-64 bg-white flex flex-col z-50 border-r border-gray-100 font-sfPro
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
        `}
      >
        <div className="flex justify-center pt-[50px] lg:pt-[24px] pb-[25px]">
          <img src="/asset/Tamu.svg" alt="Logo" className="h-[60px] w-auto" />
        </div>

        <nav className="flex-1 px-5 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const hasChildren = !!item.children
            const isOpen = openDropdowns.includes(index)
            
            // Cek active untuk parent
            let isActive = false
            if (item.href) {
              isActive = url === item.href
            } else if (hasChildren) {
              isActive = item.children.some(child => url === child.href || url.startsWith(child.href + '?'))
            }

            return (
              <div key={index} className="relative">
                {hasChildren ? (
                  <>
                    <div
                      onClick={() => toggleDropdown(index)}
                      className="group"
                    >
                      <motion.div
                        animate={
                          isActive
                            ? { backgroundColor: '#EF5350', color: '#FFFFFF' }
                            : { backgroundColor: 'transparent', color: '#374151' }
                        }
                        whileHover={!isActive ? { scale: 1.02 } : {}}
                        className="flex items-center justify-between px-5 h-11 rounded-lg cursor-pointer transition-shadow duration-200"
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          <item.icon size={22} strokeWidth={1.5} />
                          <span className="font-sfPro text-[15px] tracking-tight">
                            {item.label}
                          </span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -4 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -4 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="ml-6 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.children.map((child, idx) => {
                            const isChildActive = url === child.href || url.startsWith(child.href + '?')

                            return (
                              <Link
                                key={idx}
                                href={child.href}
                                className="block"
                              >
                                <motion.div
                                  whileHover={{ x: 4 }}
                                  className={`flex items-center gap-3 py-2.5 px-4 text-[13px] rounded-lg font-sfPro cursor-pointer transition-colors ${
                                    isChildActive ? 'text-[#EF5350]' : 'text-[#374151]'
                                  }`}
                                >
                                  <child.icon
                                    size={16}
                                    strokeWidth={2}
                                    className="opacity-70"
                                  />
                                  {child.label}
                                </motion.div>
                              </Link>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="block outline-none"
                  >
                    <motion.div
                      animate={
                        isActive
                          ? { backgroundColor: '#EF5350', color: '#FFFFFF' }
                          : { backgroundColor: 'transparent', color: '#374151' }
                      }
                      whileHover={!isActive ? { scale: 1.02 } : {}}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="flex items-center gap-4 px-5 h-11 rounded-lg cursor-pointer transition-shadow duration-200"
                    >
                      <item.icon size={22} strokeWidth={1.5} />
                      <span className="font-sfPro text-[15px] tracking-tight">
                        {item.label}
                      </span>
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
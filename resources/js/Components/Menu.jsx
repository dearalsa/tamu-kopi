import { motion, AnimatePresence } from "framer-motion"
import { useMemo, useState } from "react"
import { Star, ChevronDown } from "lucide-react"

const GOFOOD_URL = "https://gofood.link/a/yM9RU2s"

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
}

export default function Menu({ menus, categories }) {
  const [showAll, setShowAll] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")

  const now = useMemo(() => new Date(), [])

  const normalizedMenus = useMemo(() => {
    const byId = new Map()
    const normalMenus = menus.filter((m) => !m.is_package)
    const promoMenus = menus.filter((m) => m.is_package)

    normalMenus.forEach((m) => {
      const key = `menu-${m.id}`
      byId.set(key, {
        id: key,
        baseId: m.id,
        name: m.name,
        image: m.image,
        category: m.category,
        is_best_seller: m.is_best_seller,
        base_price: Number(m.price),
        promo_price: null,
        promo_label: null,
        promo_id: null,
        type: "single",
      })
    })

    promoMenus.forEach((promo) => {
      const promoActive =
        (!promo.promo_start_at || new Date(promo.promo_start_at) <= now) &&
        (!promo.promo_end_at || new Date(promo.promo_end_at) >= now)

      if (!promoActive || !promo.is_available) return

      const categorySlug = promo.category?.slug
      const label = categorySlug === "paket-menu-hemat" 
        ? "Paket Menu Hemat" 
        : categorySlug === "paket-menu-spesial" 
        ? "Paket Menu Spesial" 
        : "Promo"

      if (!promo.package_items || promo.package_items.length === 0) {
        const key = `promo-${promo.id}`
        byId.set(key, {
          id: key,
          baseId: null,
          name: promo.name,
          image: promo.image,
          category: promo.category,
          is_best_seller: promo.is_best_seller,
          base_price: null,
          promo_price: Number(promo.price),
          promo_label: label,
          promo_id: promo.id,
          type: categorySlug === "paket-menu-hemat" ? "package_set" : "package_special",
          package_item_ids: [],
        })
      } else if (promo.package_items.length === 1) {
        const item = promo.package_items[0]
        const key = `menu-${item.id}`
        byId.set(key, {
          id: key,
          baseId: item.id,
          name: item.name,
          image: promo.image || item.image,
          category: item.category || promo.category,
          is_best_seller: item.is_best_seller,
          base_price: Number(item.price),
          promo_price: Number(promo.price),
          promo_label: label,
          promo_id: promo.id,
          type: "single",
        })
      } else {
        const key = `paket-${promo.id}`
        byId.set(key, {
          id: key,
          baseId: null,
          name: promo.name,
          image: promo.image,
          category: promo.category,
          is_best_seller: promo.is_best_seller,
          base_price: null,
          promo_price: Number(promo.price),
          promo_label: label,
          promo_id: promo.id,
          type: categorySlug === "paket-menu-hemat" ? "package_set" : "package_special",
          package_item_ids: promo.package_items.map((i) => i.id),
        })
      }
    })

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [menus, now])

  const filterOptions = useMemo(() => {
    const base = [
      { value: "all", label: "Semua Menu" },
      { value: "best_seller", label: "Best Seller" },
      { value: "paket_menu_hemat", label: "Paket Menu Hemat" },
      { value: "paket_menu_spesial", label: "Paket Menu Spesial" },
    ]

    const baseLabels = base.map(b => b.label.toLowerCase())

    const categoryOptions = (categories || [])
      .filter(cat => !baseLabels.includes(cat.name.toLowerCase()))
      .map((cat) => ({
        value: `cat_${cat.slug}`,
        label: cat.name,
        category_slug: cat.slug,
      }))

    return [...base, ...categoryOptions]
  }, [categories])

  const filteredMenus = useMemo(() => {
    return normalizedMenus.filter((m) => {
      if (selectedFilter === "all") return m.type === "single"
      if (selectedFilter === "best_seller") return !!m.is_best_seller
      if (selectedFilter === "paket_menu_hemat") return m.promo_label === "Paket Menu Hemat"
      if (selectedFilter === "paket_menu_spesial") return m.promo_label === "Paket Menu Spesial"
      if (selectedFilter.startsWith("cat_")) {
        const slug = selectedFilter.replace("cat_", "")
        return m.category?.slug === slug && m.type === "single"
      }
      return true
    })
  }, [normalizedMenus, selectedFilter])

  const displayMenus = showAll ? filteredMenus : filteredMenus.slice(0, 12)

  return (
    <>
      <section id="menu" className="bg-[#F8F3F3] py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto mt-4 sm:mt-6">
          <h2 className="text-[34px] sm:text-[42px] md:text-[50px] font-poppinsBold text-center mb-8 sm:mb-12 text-black">
            Daftar Menu
          </h2>

          <div className="flex items-center justify-center mb-8 sm:mb-10">
            <div className="relative w-full max-w-sm">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen((prev) => !prev)}
                className="w-full px-6 sm:px-7 py-2.5 sm:py-3 rounded-full border border-black text-xs sm:text-sm font-sfPro text-gray-900 flex items-center justify-between bg-transparent"
              >
                <span className="truncate">
                  {(filterOptions.find((f) => f.value === selectedFilter) || filterOptions[0]).label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-900" />
              </button>
              <AnimatePresence>
                {filterDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute z-30 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-xl"
                  >
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedFilter(option.value)
                          setFilterDropdownOpen(false)
                          setShowAll(true)
                        }}
                        className={`w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 ${
                          selectedFilter === option.value ? "text-black font-sfPro" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                    {filterOptions.length === 0 && (
                      <div className="px-4 py-3 text-xs sm:text-sm text-gray-400">Belum ada kategori.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <AnimatePresence mode="popLayout">
              {displayMenus.map((menu, index) => {
                const isSingle = menu.type === "single"
                const hasPromo = isSingle && menu.promo_price !== null
                const effectivePrice = isSingle && hasPromo ? menu.promo_price : (menu.base_price ?? menu.promo_price)

                return (
                  <motion.div
                    key={menu.id}
                    layout
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.18, ease: "easeOut", delay: (index % 4) * 0.02 }}
                    className="bg-white rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <motion.img
                        src={menu.image ? `/storage/${menu.image}` : "/asset/no-image.png"}
                        alt={menu.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.18 }}
                      />
                    </div>
                    <div className="p-3 sm:p-5 flex flex-col gap-1">
                      <h3 className="font-sfPro text-xs sm:text-sm md:text-base text-gray-900 leading-tight line-clamp-2">
                        {menu.name}
                      </h3>
                      <div className="mt-0.5 sm:mt-1 flex flex-col">
                        {isSingle && hasPromo && menu.base_price !== null && (
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            Rp. {Number(menu.base_price).toLocaleString("id-ID")}
                          </span>
                        )}
                        <span className="text-gray-900 font-sfPro text-sm sm:text-base font-semibold">
                          Rp. {Number(effectivePrice).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 h-5 mt-1">
                        {menu.is_best_seller && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 sm:px-3 py-0.5">
                            <Star size={10} className="fill-[#f59e0b] text-[#f59e0b]" />
                            <span className="text-[9px] sm:text-[10px] font-sfPro uppercase tracking-[0.18em] text-[#b45309]">Best Seller</span>
                          </div>
                        )}
                        {menu.promo_label && (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 sm:px-3 py-0.5 text-[9px] sm:text-[10px] font-sfPro uppercase tracking-[0.18em] text-[#b91c1c]">
                            {menu.promo_label}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center mb-10 sm:mb-12">
            {!showAll && filteredMenus.length > 12 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-gray-400 text-xs sm:text-sm font-sfPro hover:text-black mb-3 sm:mb-4 transition-colors"
              >
                Lihat menu lebih banyak...
              </button>
            )}
          </div>

          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-[#FF0000] hover:bg-[#D40000] text-white font-sfPro py-2.5 sm:py-3 w-full rounded-full text-base sm:text-lg shadow-lg transform transition active:scale-95"
            >
              Order Dengan GoFood
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full p-5 sm:p-6 relative"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <button onClick={() => setShowOrderModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-sm">✕</button>
              <div className="mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-sfPro text-gray-900">Lanjut ke GoFood?</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-6 font-sfPro">
                Kamu akan diarahkan ke halaman GoFood <span className="font-sfPro">Tamu Kopi untuk menyelesaikan pesananmu.</span>
              </p>
              <div className="flex items-center justify-between gap-3">
                <button onClick={() => setShowOrderModal(false)} className="flex-1 border border-gray-300 text-gray-700 font-sfPro text-xs sm:text-sm py-2 sm:py-2.5 rounded-full hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={() => { window.open(GOFOOD_URL, "_blank"); setShowOrderModal(false); }} className="flex-1 bg-[#00AA13] hover:bg-[#00930F] text-white font-sfPro text-xs sm:text-sm py-2 sm:py-2.5 rounded-full shadow-md transition-colors">Buka GoFood</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
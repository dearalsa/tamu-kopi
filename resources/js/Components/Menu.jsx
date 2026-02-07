import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Star } from "lucide-react"

const GOFOOD_URL = "https://gofood.link/a/yM9RU2s"

const TABS = [
  { key: "all", label: "Semua", slug: null },
  { key: "kopi", label: "Kopi", slug: "kopi" },
  { key: "non-kopi", label: "Non Kopi", slug: "non-kopi" },
  { key: "cemilan", label: "Cemilan", slug: "cemilan" },
  { key: "makanan-berat", label: "Makanan Berat", slug: "makanan-berat" },
  { key: "best-seller", label: "Best Seller", slug: null },
]

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
}

export default function Menu({ menus }) {
  const [activeTab, setActiveTab] = useState("all")
  const [showAll, setShowAll] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const filteredMenus = menus.filter((menu) => {
    if (activeTab === "all") return true
    if (activeTab === "best-seller") {
      return menu.is_best_seller === 1 || menu.is_best_seller === true
    }
    const tabConfig = TABS.find((t) => t.key === activeTab)
    if (!tabConfig || !tabConfig.slug) return true
    return menu.category && menu.category.slug === tabConfig.slug
  })

  const displayMenus = showAll ? filteredMenus : filteredMenus.slice(0, 12)

  const handleConfirmOrder = () => {
    window.open(GOFOOD_URL, "_blank")
    setShowOrderModal(false)
  }

  return (
    <>
      <section id="menu" className="bg-[#F8F3F3] py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto mt-4 sm:mt-6">
          <h2 className="text-[34px] sm:text-[42px] md:text-[50px] font-poppinsBold text-center mb-8 sm:mb-12 text-black">
            Daftar Menu
          </h2>

          <div className="flex justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-10 flex-wrap">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setShowAll(false)
                  }}
                  className="relative min-w-[120px] sm:min-w-[150px] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border text-xs sm:text-sm md:text-base font-sfPro flex items-center justify-center text-center transition-colors duration-200"
                  style={{
                    borderColor: isActive ? "#EF5350" : "#000000",
                    backgroundColor: isActive ? "#EF5350" : "transparent",
                    color: isActive ? "#ffffff" : "#000000",
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full -z-10"
                      style={{ backgroundColor: "#EF5350" }}
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <AnimatePresence mode="popLayout">
              {displayMenus.map((menu, index) => (
                <motion.div
                  key={menu.id}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                    delay: (index % 4) * 0.02,
                  }}
                  className="bg-white rounded-[1.8rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <motion.img
                      src={
                        menu.image
                          ? `/storage/${menu.image}`
                          : "/asset/no-image.png"
                      }
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
                    <p className="text-gray-900 font-sfPro text-sm sm:text-base font-semibold mt-0.5 sm:mt-1">
                      Rp. {Number(menu.price).toLocaleString("id-ID")}
                    </p>
                    <div className="h-5">
                      {menu.is_best_seller && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 sm:px-3 py-0.5">
                          <Star
                            size={10}
                            className="fill-[#f59e0b] text-[#f59e0b]"
                          />
                          <span className="text-[9px] sm:text-[10px] font-sfPro uppercase tracking-[0.18em] text-[#b45309]">
                            Best Seller
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
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

            <div className="flex gap-2">
              {TABS.map((tab) => (
                <div
                  key={tab.key}
                  className={`
                    w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-200
                    ${activeTab === tab.key ? "bg-black" : "bg-gray-300"}
                  `}
                />
              ))}
            </div>
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
              <button
                onClick={() => setShowOrderModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-sm"
              >
                ✕
              </button>

              <div className="mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-sfPro text-gray-900">
                  Lanjut ke GoFood?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-6 font-sfPro">
                Kamu akan diarahkan ke halaman GoFood{" "}
                <span className="font-sfPro">Tamu Kopi untuk menyelesaikan pesananmu.</span>
              </p>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-sfPro text-xs sm:text-sm py-2 sm:py-2.5 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 bg-[#00AA13] hover:bg-[#00930F] text-white font-sfPro text-xs sm:text-sm py-2 sm:py-2.5 rounded-full shadow-md transition-colors"
                >
                  Buka GoFood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

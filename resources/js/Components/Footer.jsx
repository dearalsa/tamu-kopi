import { router } from "@inertiajs/react"

export default function Footer() {
  const year = new Date().getFullYear()

  const handleScrollOrLink = (section) => {
    if (window.location.pathname === "/") {
      const el = document.getElementById(section)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      router.get(
        "/",
        {},
        {
          preserveScroll: false,
          onSuccess: () => {
            setTimeout(() => {
              const el = document.getElementById(section)
              if (el) {
                el.scrollIntoView({ behavior: "smooth" })
              }
            }, 50)
          },
        }
      )
    }
  }

  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8 font-lightPoppins text-black">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 items-start">
          <div className="col-span-1">
            <img src="/asset/Tamu.svg" alt="Tamu Kopi" className="h-10 mb-4" />
            <p className="text-[13px] leading-relaxed max-w-[250px]">
              Setiap ajakan datang adalah ajakan untuk bertamu, dan setiap tamu adalah ruang untuk bertemu.
            </p>
          </div>

          <div>
            <h3 className="font-poppinsBold text-[13px] tracking-widest uppercase mb-5">Navigasi</h3>
            <nav className="flex flex-col gap-2.5">
              <button
                onClick={() => handleScrollOrLink("hero")}
                className="text-left text-[13px] hover:text-[#DE0F38] transition-colors w-fit"
              >
                Beranda
              </button>
              <button
                onClick={() => handleScrollOrLink("menu")}
                className="text-left text-[13px] hover:text-[#DE0F38] transition-colors w-fit"
              >
                Menu
              </button>
              <button
                onClick={() => handleScrollOrLink("about")}
                className="text-left text-[13px] hover:text-[#DE0F38] transition-colors w-fit"
              >
                Tentang Kami
              </button>
              <button
                onClick={() => handleScrollOrLink("contact")}
                className="text-left text-[13px] hover:text-[#DE0F38] transition-colors w-fit"
              >
                Kontak
              </button>
            </nav>
          </div>

          <div>
            <h3 className="font-poppinsBold text-[13px] tracking-widest uppercase mb-5">Jam Operasional</h3>
            <div className="text-[13px] space-y-2 max-w-[189px]">
              <div className="flex justify-between gap-4 border-b border-gray-50 pb-1">
                <span className="whitespace-nowrap">Senin-Jumat</span>
                <span className="font-poppins">09.00 - 24.00</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-50 pb-1">
                <span className="whitespace-nowrap">Sabtu-Minggu</span>
                <span className="font-poppins">09.00 - 03.00</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-poppinsBold text-[13px] tracking-widest uppercase mb-5">Hubungi Kami</h3>
            <div className="space-y-2.5 mb-5">
              <div className="space-y-2.5 mb-5">
                <a
                  href="mailto:rumu.kopi@gmail.com"
                  className="block text-[13px] hover:text-[#DE0F38] transition-colors"
                >
                  rumu.kopi@gmail.com
                </a>
                <a
                  href="https://wa.me/6289759512"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[13px] hover:text-[#DE0F38] transition-colors"
                >
                  +62 8975 9512
                </a>
              </div>
            </div>
            <div className="flex gap-2.5">
              <a
                href="https://instagram.com/tamu_kopi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#3B1F1A] hover:border-[#0000] transition-all duration-300"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@tamu.kopi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#3B1F1A] hover:border-[#0000] transition-all duration-300"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 text-center font-poppins">
          <p className="text-[12px]">
            &copy; {year} Tamu Kopi. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}

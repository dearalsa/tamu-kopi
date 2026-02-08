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
              </a>
              <a
                href="https://tiktok.com/@tamu.kopi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-[#3B1F1A] hover:border-[#0000] transition-all duration-300"
              >
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

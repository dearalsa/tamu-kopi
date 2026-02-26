import { Link, usePage } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { url } = usePage()

  useEffect(() => {
    const handleScroll = () => {
      if (url !== "/") {
        setScrolled(true)
      } else {
        setScrolled(window.scrollY > 20)
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [url])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset"
  }, [open])

  const handleScrollOrLink = (section) => {
    if (url === "/") {
      const el = document.getElementById(section)
      if (el) el.scrollIntoView({ behavior: "smooth" })
    } else {
      window.location.href = `/#${section}`
    }
    setOpen(false)
  }

  return (
    <>
      <header
        className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-[#F8F3F3]/95 backdrop-blur-md shadow-sm"
            : "bg-[#F8F3F3]"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-10 py-4">
          <Link href="/">
            <img
              src="/asset/Tamu.svg"
              alt="Tamu"
              className="h-[48px] sm:h-[56px] md:h-[60px]"
            />
          </Link>

          <nav className="hidden md:flex gap-10 text-[16px] font-poppinsBold text-[#3B1F1A] items-center">
            <Link
              href="/"
              className="hover:text-[#E84949] transition-colors duration-300"
            >
              Beranda
            </Link>

            <button
              onClick={() => handleScrollOrLink("menu")}
              className="hover:text-[#E84949] transition-colors duration-300"
            >
              Menu
            </button>

            <button
              onClick={() => handleScrollOrLink("about")}
              className="hover:text-[#E84949] transition-colors duration-300"
            >
              Tentang
            </button>

            <button
              onClick={() => handleScrollOrLink("contact")}
              className="hover:text-[#E84949] transition-colors duration-300"
            >
              Kontak
            </button>
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-[#3b2f2f] z-[70]"
          >
            <Menu size={32} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div
        className={`md:hidden fixed inset-0 bg-[#F8F3F3] z-[100] transition-transform duration-500 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <button
            onClick={() => setOpen(false)}
            className="text-[#3b2f2f]"
          >
            <X size={32} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex flex-col items-start px-10 mt-6 gap-10 text-[16px] font-poppinsBold text-[#3b2f2f]">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="w-full hover:text-[#E84949] transition-colors duration-300"
          >
            Beranda
          </Link>

          <button
            onClick={() => handleScrollOrLink("menu")}
            className="w-full text-left hover:text-[#E84949] transition-colors duration-300"
          >
            Menu
          </button>

          <button
            onClick={() => handleScrollOrLink("about")}
            className="w-full text-left hover:text-[#E84949] transition-colors duration-300"
          >
            Tentang
          </button>

          <button
            onClick={() => handleScrollOrLink("contact")}
            className="w-full text-left hover:text-[#E84949] transition-colors duration-300"
          >
            Kontak
          </button>
        </nav>
      </div>
    </>
  )
}
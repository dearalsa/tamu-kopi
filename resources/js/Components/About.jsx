import React, { useEffect, useRef, useState } from "react"

const About = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ rating: null, count: 0 })
  const [loading, setLoading] = useState(true)
  const [activeIdx, setActiveIdx] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => sectionRef.current && observer.unobserve(sectionRef.current)
  }, [])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews")
        const data = await res.json()
        if (!data?.error) {
          setReviews([...data.reviews, ...data.reviews])
          setSummary({
            rating: data.rating,
            count: data.userRatingCount,
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  return (
    <>
      <section
        ref={sectionRef}
        id="about"
        className="bg-[#F8F3F3] px-6 sm:px-10 py-16 md:py-28"
      >
        <div className="max-w-[1206px] mx-auto">
          <div
            className={`bg-[#E84949] rounded-[25px] px-8 sm:px-10 md:px-20 py-10 sm:py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 shadow-xl transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <div
              className={`flex-1 max-w-[500px] text-white transition-all duration-700 delay-150 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4"
              }`}
            >
              <h1 className="text-[38px] sm:text-[48px] md:text-[68px] font-gochiHand mb-6 md:mb-8 leading-tight">
                Kenapa harus pilih Tamu Kopi?
              </h1>
              <p className="text-[16px] sm:text-[18px] md:text-[20px] leading-[1.7] md:leading-[1.8] font-sfPro">
                Di Tamu Kopi, setiap cangkir dibuat dengan biji pilihan, disajikan
                dalam suasana nyaman yang bikin betah nongkrong atau melepas penat.
                Setiap kunjungan, kami pastikan jadi pengalaman yang spesial.
              </p>
            </div>

            <div
              className={`flex-shrink-0 transition-all duration-700 delay-300 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4"
              }`}
            >
              <div className="w-[280px] h-[340px] sm:w-[320px] sm:h-[400px] md:w-[380px] md:h-[490px] rounded-[20px] overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/asset/about-tamu.jpg"
                  alt="Tamu Kopi"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F3F3] pt-14 md:pt-20 pb-24 md:pb-32 overflow-hidden">
        <div className="max-w-[1206px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-[23px] sm:text-[30px] md:text-[36px] font-telegraf text-gray-900 leading-tight">
                Apa kata mereka?
              </h2>
              <p className="text-[14px] sm:text-[15px] text-gray-600 mt-2 font-telegraf max-w-xl">
                Ulasan asli dari para pengunjung, dikurasi khusus untuk Tamu Kopi.
              </p>
            </div>

            {summary.rating && (
              <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
                <div className="text-[26px] font-poppinsBold text-yellow-500">
                  {summary.rating.toFixed(1)}
                </div>
                <div className="text-xs sm:text-sm font-telegraf text-gray-700 border-l pl-3 border-gray-100">
                  <p className="font-telegraf">Rating Pengunjung</p>
                  <p className="text-gray-500 text-[11px]">
                    dari {summary.count} ulasan
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="max-w-[1206px] mx-auto px-6 sm:px-10">
            <p className="text-gray-500 text-sm font-telegraf">Memuat ulasan...</p>
          </div>
        ) : (
          <div className="relative w-full">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-[15%] bg-gradient-to-r from-[#F8F3F3] via-[#F8F3F3]/80 to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-[15%] bg-gradient-to-l from-[#F8F3F3] via-[#F8F3F3]/80 to-transparent z-20" />

            <div className="overflow-visible py-10">
              <div className="flex gap-8 w-max animate-marquee-slower hover:[animation-play-state:paused] px-4">
                {reviews.map((rev, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`
                      min-w-[320px] max-w-[320px] bg-white rounded-2xl p-6 border border-gray-100 shadow-sm
                      flex flex-col relative group text-left
                      transition-[transform,box-shadow,border-color] duration-500 ease-out
                      hover:scale-105 hover:shadow-[0_16px_32px_rgba(0,0,0,0.12)] hover:border-[#E84949]/20
                      ${
                        activeIdx === idx
                          ? "scale-105 shadow-[0_18px_36px_rgba(0,0,0,0.18)] border-[#E84949]/40"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <p className="font-sfPro text-[15px] text-gray-900 group-hover:text-[#E84949] transition-colors duration-300">
                          {rev.author}
                        </p>
                        {rev.relativeTime && (
                          <p className="text-[11px] text-gray-400 font-sfPro mt-0.5">
                            {rev.relativeTime}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg text-[12px] text-yellow-600 font-sfPro shadow-sm">
                        <span>★</span>
                        <span className="font-sfPro">{rev.rating}</span>
                      </div>
                    </div>

                    <p className="text-[14px] text-gray-600 font-sfPro leading-relaxed line-clamp-4 italic">
                      {rev.text}
                    </p>

                    <div className="mt-auto pt-4 flex justify-end opacity-10 group-hover:opacity-80 transition-opacity duration-500">
                      <svg
                        className="w-5 h-5 text-[#E84949] fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12M10.017 21L10.017 18C10.017 16.8954 9.12157 16 8.017 16H5.017C4.46472 16 4.017 15.5523 4.017 15V9C4.017 8.44772 4.46472 8 5.017 8H9.017C9.56928 8 10.017 8.44772 10.017 9V12" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes marquee-slow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-slow {
            animation: marquee-slow 80s linear infinite;
          }
          .animate-marquee-slower {
            animation: marquee-slow 120s linear infinite;
          }
        `}</style>
      </section>
    </>
  )
}

export default About

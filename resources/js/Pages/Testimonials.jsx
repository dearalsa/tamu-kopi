import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Testimonials() {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState({ rating: null, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/admin/reviews")
        const data = await res.json()
        if (!data?.error) {
          setReviews([...data.reviews, ...data.reviews])
          setSummary({
            rating: data.rating,
            count: data.userRatingCount
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
    <section className="bg-[#F8F3F3] px-6 sm:px-10 pb-16 md:pb-24 overflow-hidden">
      <div className="max-w-[1206px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10"
        >
          <div>
            <p className="text-[12px] sm:text-[13px] font-sfPro tracking-[0.18em] uppercase text-[#E84949] mb-2">
              Apa kata mereka
            </p>
            <h2 className="text-[24px] sm:text-[30px] md:text-[36px] font-poppinsBold text-gray-900 leading-tight">
              Apa yang orang katakan tentang Tamu Kopi?
            </h2>
            <p className="text-[14px] sm:text-[15px] text-gray-600 mt-2 font-sfPro max-w-xl">
              Ulasan asli dari pengunjung, diambil langsung dari Google Reviews.
            </p>
          </div>

          {summary.rating && (
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-md">
              <div className="text-[26px] font-poppinsBold text-yellow-500">
                {summary.rating.toFixed(1)}
              </div>
              <div className="text-xs sm:text-sm font-sfPro text-gray-700">
                <p>Rating Google</p>
                <p className="text-gray-500">
                  dari {summary.count} ulasan
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {loading ? (
          <p className="text-gray-500 text-sm font-sfPro">Memuat ulasan...</p>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#F8F3F3] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#F8F3F3] to-transparent z-10" />

            <div className="overflow-hidden group">
              <div className="flex gap-6 w-max animate-marquee group-hover:[animation-play-state:paused]">
                {reviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="min-w-[320px] max-w-[320px] bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-sfPro font-semibold text-sm text-gray-900">
                        {rev.author}
                      </p>
                      <div className="flex items-center gap-1 text-[12px] text-yellow-500">
                        <span>★</span>
                        <span className="font-sfPro">{rev.rating}</span>
                      </div>
                    </div>

                    <p className="text-[14px] text-gray-700 font-sfPro leading-relaxed line-clamp-5">
                      {rev.text}
                    </p>

                    {rev.relativeTime && (
                      <p className="text-[11px] text-gray-400 font-sfPro mt-3">
                        {rev.relativeTime}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  )
}

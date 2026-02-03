import { useEffect, useState } from "react";
import LandingLayout from "@/Layouts/LandingLayout";
import About from "@/Components/About";
import Contact from "@/Components/Contact";

const images = [
  "/asset/Kopi1.jpeg",
  "/asset/Kopi2.jpg",
  "/asset/Kopi3.jpg"
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LandingLayout>
      <section className="bg-[#F8F3F3] px-6 sm:px-10 pt-24 md:pt-28 pb-10">
        <div className="relative w-full max-w-[1309px] mx-auto h-[480px] md:h-[600px] rounded-[30px] overflow-hidden shadow-2xl bg-black">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Kopi ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === i ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />

          <div className="relative z-10 flex flex-col items-start justify-center h-full px-12 md:px-24 text-white">
            <h1 className={`text-5xl sm:text-6xl md:text-[107px] font-freckle mb-6 leading-none transition-all duration-1000 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              Tamu Kopi
            </h1>

            <p className={`text-base sm:text-lg md:text-xl font-sfPro mb-10 max-w-xl opacity-95 transition-all duration-1000 ${
                isLoaded ? "opacity-95 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              Datang Untuk Ber-Tamu, Ber-Tamu untuk bertemu 🏡
            </p>

            <button className={`bg-[#FF1C00] hover:bg-[#E61D00] text-white px-10 py-3 rounded-[15px] text-[15px] font-poppinsBold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              Lihat Menu
            </button>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-700 ${
                  index === i ? "w-10 bg-white" : "w-2.5 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <About />
      <Contact />
    </LandingLayout>
  );
}
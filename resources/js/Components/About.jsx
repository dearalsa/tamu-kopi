import React, { useEffect, useRef, useState } from "react";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px"
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="bg-[#F8F3F3] px-6 sm:px-10 py-16 md:py-28"
    >
      <div className="max-w-[1206px] mx-auto">
        <div 
          className={`bg-[#E84949] rounded-[25px] px-8 sm:px-10 md:px-20 py-10 sm:py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 shadow-xl hover:shadow-2xl transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div 
            className={`flex-1 max-w-[500px] text-white transition-all duration-700 delay-200 -mt-3 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <h1 className="text-[38px] sm:text-[48px] md:text-[68px] font-gochiHand mb-6 md:mb-8 leading-tight">
              Kenapa harus pilih Tamu Kopi?
            </h1>
            <p className="text-[16px] sm:text-[18px] md:text-[20px] leading-[1.7] md:leading-[1.8] font-sfPro">
              Di Tamu Kopi, setiap cangkir dibuat dengan biji pilihan, disajikan dalam suasana nyaman yang bikin betah nongkrong atau melepas penat. Setiap kunjungan, kami pastikan jadi pengalaman yang spesial.
            </p>
          </div>

          <div 
            className={`flex-shrink-0 transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="w-[280px] h-[340px] sm:w-[320px] sm:h-[400px] md:w-[380px] md:h-[490px] rounded-[20px] overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
              <img
                src="/asset/about-tamu.jpg"
                alt="Tamu Kopi Experience"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
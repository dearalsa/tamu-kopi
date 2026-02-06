import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const position = [-6.5971, 106.8060];
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 }, 
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const serviceID = "service_bsvalzq"; 
    const templateID = "template_0w34gak"; 
    const publicKey = "Jf5CYDdUQAoteHpof"; 

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log("SUCCESS!", response.status, response.text);
        alert("✅ Terima kasih! Pesan kamu berhasil terkirim.");
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.error("FAILED...", err);
        alert("❌ Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
        setIsSubmitting(false);
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="bg-[#F8F3F3] px-6 sm:px-10 pt-10 pb-16 md:pt-14 md:pb-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <motion.h1 
          {...fadeInUp}
          className="text-4xl sm:text-5xl md:text-6xl font-poppinsBold text-center mb-6 text-[#3B1F1A]"
        >
          Hubungi Kami
        </motion.h1>

        {/* form */}
        <motion.div 
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
          className="p-8 sm:p-10 md:p-12"
        >
          <form onSubmit={handleSubmit} className="max-w-[900px] mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan Nama"
                className="flex-1 px-6 py-3 rounded-[40px] bg-transparent border border-gray-900 focus:outline-none focus:ring-0 focus:border-[#E84949] transition-colors font-sfPro text-[#3B1F1A]"
                required
                disabled={isSubmitting}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan Email"
                className="flex-1 px-6 py-3 rounded-[40px] bg-transparent border border-gray-900 focus:outline-none focus:ring-0 focus:border-[#E84949] transition-colors font-sfPro text-[#3B1F1A]"
                required
                disabled={isSubmitting}
              />
            </div>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Pesan"
              rows="6"
              className="w-full px-6 py-4 rounded-[15px] bg-transparent border border-gray-900 focus:outline-none focus:ring-0 focus:border-[#E84949] transition-colors font-sfPro text-[#3B1F1A] mb-6 resize-none"
              required
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#393535] hover:bg-[#2d1814] text-white px-14 py-2 rounded-[30px] text-[15px] font-poppinsBold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Mengirim..." : "Kirim"}
            </button>
          </form>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16 max-w-[900px] mx-auto">
          {[
            { id: 1, href: "https://instagram.com/tamu_kopi", icon: "instagram", label: "tamu_kopi", desc: "Ikuti kami di Instagram.", delay: 0.2 },
            { id: 2, href: "https://tiktok.com/@tamu.kopi", icon: "tiktok", label: "tamu.kopi", desc: "Lihat konten seru kami di TikTok.", delay: 0.3 },
            { id: 3, href: "https://maps.google.com/?q=-6.5971,106.8060", icon: "location", label: "Lokasi", desc: "Jl. Dadali No. 07, Kota Bogor", delay: 0.4 },
          ].map((item) => (
            <motion.a
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: item.delay, ease: "easeOut" }}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#DE0F38] rounded-[20px] p-8 flex items-center gap-5 transition-transform hover:scale-105"
            >
              <div className="bg-white rounded-full p-3 flex items-center justify-center">
                 {item.icon === "instagram" && <svg className="w-6 h-6 text-[#E84949]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>}
                 {item.icon === "tiktok" && <svg className="w-6 h-6 text-[#E84949]" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>}
                 {item.icon === "location" && <svg className="w-6 h-6 text-[#E84949]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>}
              </div>
              <div className="text-white">
                <h3 className="font-poppins text-lg mb-1">{item.label}</h3>
                <p className="text-sm opacity-90 font-sfPro">{item.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* ini bagian map */}
        <motion.div 
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.5 }}
          className="max-w-[900px] mx-auto relative z-0"
        >
          <div className="rounded-2xl overflow-hidden shadow-xl h-[350px]">
            <MapContainer center={position} zoom={16} scrollWheelZoom={false} className="w-full h-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              <Marker position={position}>
                <Popup><strong>Tamu Kopi</strong><br />Bogor, Jawa Barat</Popup>
              </Marker>
            </MapContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
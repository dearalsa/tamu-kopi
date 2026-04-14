import { Head, useForm, Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    // Fungsi untuk menerjemahkan status pesan dari Laravel ke Bahasa Indonesia Formal
    const getStatusMessage = (msg) => {
    if (!msg) return null;
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("emailed")) return "Tautan pengaturan ulang kata sandi telah dikirim ke alamat email Anda.";
    if (lowerMsg.includes("throttled")) return "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat.";
    if (lowerMsg.includes("reset")) return "Kata sandi Anda telah berhasil diperbarui.";
    return msg;
    };

    return (
        <>
            <Head title="Lupa Kata Sandi" />
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#FF7D7D] to-[#ECD9D9]">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="relative z-10 w-full max-w-md mx-4">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/20">
                        
                        <div className="mb-6 flex justify-center">
                            <img src="/asset/Tamu.svg" alt="Logo" className="w-44 object-contain" />
                        </div>

                        <h2 className="text-2xl font-poppinsBold text-center mb-2 text-gray-800">
                            Lupa Kata Sandi?
                        </h2>
                        
                        <p className="text-sm font-sfPro text-gray-500 text-center mb-8">
                            Silakan masukkan alamat email admin Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                        </p>

                        {status && (
                            <div className="mb-6 bg-green-50 border-l-4 border-green-500 px-4 py-3 rounded-lg">
                                <p className="text-sm font-sfPro text-green-700">
                                    {getStatusMessage(status)}
                                </p>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6" noValidate>
                            <div>
                                <label className="block text-sm font-sfPro text-gray-700 mb-2">
                                    Alamat Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    placeholder="Masukkan Alamat Email"
                                    className={`w-full bg-transparent border-0 border-b ${errors.email ? 'border-red-500' : 'border-gray-400'} px-0 py-2 font-sfPro text-gray-800 placeholder:text-[15px] placeholder-gray-400 focus:border-black hover:border-black focus:outline-none focus:ring-0 focus:shadow-none transition-colors`}
                                />
                                {errors.email && (
                                    <p className="mt-2 text-[13px] text-red-600 font-sfPro italic leading-tight">
                                        {errors.email.includes("user") ? "Alamat email tidak terdaftar dalam sistem kami." : "Alamat email wajib diisi."}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center bg-[#171212] hover:bg-black text-white rounded-[15px] font-sfPro py-3 transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                {processing ? "Mengirim..." : "Kirim Tautan Reset"}
                            </button>

                            <div className="flex justify-center mt-4">
                                <Link 
                                    href={route('login')} 
                                    className="flex items-center gap-2 text-[13px] font-sfPro text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <ArrowLeft size={14} /> Kembali ke Halaman Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                    0%,100% { transform: translate(0,0) scale(1); }
                    25% { transform: translate(20px,-50px) scale(1.1); }
                    50% { transform: translate(-20px,20px) scale(0.9); }
                    75% { transform: translate(50px,50px) scale(1.05); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </>
    );
}
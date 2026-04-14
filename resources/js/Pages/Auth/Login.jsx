import { useEffect, useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);

    // Fungsi untuk menerjemahkan status pesan dari Laravel ke Bahasa Indonesia Formal
    const getStatusMessage = (msg) => {
        if (!msg) return null;
        const lowerMsg = msg.toLowerCase();
        // Cek jika pesan berisi tentang reset password
        if (lowerMsg.includes("reset")) return "Kata sandi Anda telah berhasil diperbarui.";
        if (lowerMsg.includes("emailed")) return "Tautan pengaturan ulang kata sandi telah dikirim ke email Anda.";
        return msg;
    };

    // Tangkap error limit dari backend
    useEffect(() => {
        if (errors.email && errors.email.includes("coba lagi dalam")) {
            const match = errors.email.match(/dalam (\d+) detik/);
            if (match) {
                const seconds = parseInt(match[1], 10);
                const unlockTime = Date.now() + seconds * 1000;
                localStorage.setItem('login_unlock_time', unlockTime.toString());
                setCooldownTime(seconds);
            }
        }
    }, [errors]);

    // Timer penghitung mundur
    useEffect(() => {
        const checkCooldown = () => {
            const unlockTime = localStorage.getItem('login_unlock_time');
            if (unlockTime) {
                const remaining = Math.ceil((parseInt(unlockTime, 10) - Date.now()) / 1000);
                if (remaining > 0) {
                    setCooldownTime(remaining);
                } else {
                    setCooldownTime(0);
                    localStorage.removeItem('login_unlock_time');
                }
            }
        };

        checkCooldown();
        const interval = setInterval(checkCooldown, 1000);
        return () => clearInterval(interval);
    }, []);

    const isThrottled = cooldownTime > 0;

    const submit = (e) => {
        e.preventDefault();
        if (isThrottled) return;
        post(route("login"));
    };

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#FF7D7D] to-[#ECD9D9]">
                {/* Blobs Background */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="relative z-10 w-full max-w-md mx-4">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/20">
                        <div className="flex justify-center mb-3">
                            <img src="/asset/Tamu.svg" alt="Logo" className="w-44 object-contain" />
                        </div>

                        <h2 className="text-3xl font-poppinsBold text-center mb-8 text-gray-800">
                            Masuk
                        </h2>

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
                                    disabled={isThrottled}
                                    className={`w-full bg-transparent border-0 border-b ${errors.email ? 'border-red-500' : 'border-gray-400'} px-0 py-2 pr-10 font-sfPro text-gray-800 placeholder:text-[15px] placeholder-gray-400 focus:border-black hover:border-black focus:outline-none focus:ring-0 focus:shadow-none transition-colors disabled:opacity-50`}
                                />
                                {errors.email && (
                                    <p className="mt-2 text-[13px] text-red-600 font-sfPro italic leading-tight">
                                        {errors.email.includes("match") ? "Kredensial ini tidak cocok dengan data kami." : errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-sfPro text-gray-700 mb-2">
                                    Kata Sandi
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="Masukkan Kata Sandi"
                                        disabled={isThrottled}
                                        className={`w-full bg-transparent border-0 border-b ${errors.password ? 'border-red-500' : 'border-gray-400'} px-0 py-2 pr-10 font-sfPro text-gray-800 placeholder:text-[15px] placeholder-gray-400 focus:border-black hover:border-black focus:outline-none focus:ring-0 focus:shadow-none transition-colors disabled:opacity-50`}
                                    />
                                    <button
                                        type="button"
                                        tabIndex="-1"
                                        disabled={isThrottled}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 flex items-center justify-center h-full text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-[13px] text-red-600 font-sfPro italic leading-tight">
                                        Kata sandi wajib diisi.
                                    </p>
                                )}
                                
                                <div className="flex justify-end mt-3">
                                    <Link 
                                        href={route('password.request')}
                                        className="text-[13px] font-sfPro text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        Lupa Kata Sandi?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || isThrottled}
                                className={`w-full flex justify-center items-center ${isThrottled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#171212] hover:bg-black'} text-white rounded-[15px] font-sfPro py-3 transition-all active:scale-[0.98] disabled:opacity-70`}
                            >
                                {processing 
                                    ? "Memproses..." 
                                    : isThrottled 
                                        ? `Akses Terkunci (${cooldownTime}s)` 
                                        : "Masuk"}
                            </button>
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
                
                input::-ms-reveal,
                input::-ms-clear {
                    display: none;
                }
            `}</style>
        </>
    );
}
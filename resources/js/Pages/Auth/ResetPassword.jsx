import { useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("password.store"));
    };

    // Fungsi pembantu untuk menerjemahkan error password dari Laravel ke Bahasa Indonesia Formal
    const translateError = (error) => {
        if (!error) return null;
        if (error.includes("confirmation")) return "Konfirmasi kata sandi tidak sesuai.";
        if (error.includes("least 8 characters")) return "Kata sandi minimal harus terdiri dari 8 karakter.";
        if (error.includes("required")) return "Kolom ini wajib diisi.";
        if (error.includes("token") || error.includes("email")) return "Tautan pengaturan ulang tidak valid atau telah kedaluwarsa.";
        return error;
    };

    return (
        <>
            <Head title="Atur Ulang Kata Sandi" />
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

                        <h2 className="text-2xl font-poppinsBold text-center mb-8 text-gray-800">
                            Atur Ulang Kata Sandi
                        </h2>

                        <form onSubmit={submit} className="space-y-6" noValidate>
                            <div>
                                <label className="block text-sm font-sfPro text-gray-700 mb-2">
                                    Alamat Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full bg-transparent border-0 border-b border-gray-400 px-0 py-2 font-sfPro text-gray-500 cursor-not-allowed focus:ring-0"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-[13px] text-red-600 font-sfPro italic leading-tight">
                                        {translateError(errors.email)}
                                    </p>
                                )}
                            </div>

                            {/* Password Baru */}
                            <div>
                                <label className="block text-sm font-sfPro text-gray-700 mb-2">
                                    Kata Sandi Baru
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="Masukkan Kata Sandi Baru"
                                        className={`w-full bg-transparent border-0 border-b ${errors.password ? 'border-red-500' : 'border-gray-400'} px-0 py-2 pr-10 font-sfPro text-gray-800 placeholder:text-[15px] placeholder-gray-400 focus:border-black hover:border-black focus:outline-none focus:ring-0 transition-colors`}
                                    />
                                    <button
                                        type="button"
                                        tabIndex="-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 flex items-center justify-center h-full text-gray-500 hover:text-black transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-[13px] text-red-600 font-sfPro italic leading-tight">
                                        {translateError(errors.password)}
                                    </p>
                                )}
                            </div>

                            {/* Konfirmasi Password */}
                            <div>
                                <label className="block text-sm font-sfPro text-gray-700 mb-2">
                                    Konfirmasi Kata Sandi Baru
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        placeholder="Ulangi Kata Sandi Baru"
                                        className={`w-full bg-transparent border-0 border-b ${errors.password_confirmation ? 'border-red-500' : 'border-gray-400'} px-0 py-2 pr-10 font-sfPro text-gray-800 placeholder:text-[15px] placeholder-gray-400 focus:border-black hover:border-black focus:outline-none focus:ring-0 transition-colors`}
                                    />
                                    <button
                                        type="button"
                                        tabIndex="-1"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-0 flex items-center justify-center h-full text-gray-500 hover:text-black transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-2 text-[13px] text-red-600 font-sfPro italic leading-tight">
                                        {translateError(errors.password_confirmation)}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center bg-[#2D2727] hover:bg-black text-white rounded-[15px] font-sfPro py-3 transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
                            >
                                {processing ? "Memproses..." : "Simpan Perubahan Kata Sandi"}
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
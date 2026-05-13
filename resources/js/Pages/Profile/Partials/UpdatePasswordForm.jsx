import { useRef, useEffect, useState } from 'react'
import { useForm, usePage, router } from '@inertiajs/react'

export default function UpdateProfileForm({ admin, role, status }) {
    const passwordInput = useRef()
    const currentPasswordInput = useRef()
    
    // State untuk toggle mata password
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { auth } = usePage().props;

    const { data, setData, errors, patch, reset, processing, recentlySuccessful } = useForm({
        name: admin?.name || auth?.user?.name || '',
        email: admin?.email || auth?.user?.email || '', 
        current_password: '',
        password: '',
        password_confirmation: '',
    })

    useEffect(() => {
        if (admin) {
            setData((prevData) => ({
                ...prevData,
                name: admin.name,
                email: admin.email,
            }));
        }
    }, [admin]);

    const submit = (e) => {
        e.preventDefault()
        
        patch(route(role + '.profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('current_password', 'password', 'password_confirmation');
                setTimeout(() => {
                    router.visit(route('admin.dashboard'));
                }, 1500);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation')
                    passwordInput.current?.focus()
                }
                if (errors.current_password) {
                    reset('current_password')
                    currentPasswordInput.current?.focus()
                }
            },
        })
    }

    const handleCancel = () => window.history.back();

    const inputBase = 'w-full bg-transparent border-0 border-b py-3 pl-9 pr-10 font-sfPro text-gray-800 placeholder-gray-400 focus:ring-0 focus:ring-offset-0 focus:outline-none transition-colors duration-200'
    const inputNormal = `${inputBase} border-gray-200 focus:border-gray-700`
    const inputError = `${inputBase} border-red-500 text-red-600 placeholder-red-400 focus:border-red-500`

    // Komponen Ikon Mata
    const EyeIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    );
    const EyeOffIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
    );

    return (
        <section className="mt-20 px-6 lg:px-12 flex justify-start pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 w-full max-w-xl text-left">
                <header className="mb-8">
                    <h2 className="text-2xl font-telegraf text-gray-900 tracking-tight">Profil Admin</h2>
                    <p className="mt-2 text-sm text-gray-500 font-telegraf leading-relaxed">
                      Perbarui informasi profil Anda.
                    </p>
                </header>

                {recentlySuccessful && (
                    <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl animate-in fade-in slide-in-from-left-4">
                        <div className="flex items-center text-emerald-800">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm font-sfPro">Profil Berhasil Diperbarui! Mengalihkan...</p>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Input Nama */}
                    <div className="group">
                        <label className="block text-[11px] uppercase tracking-[0.15em] font-sfPro text-gray-400 mb-1 group-focus-within:text-gray-800 transition-colors">
                            Nama 
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center text-gray-400 group-focus-within:text-gray-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                type="text"
                                required
                                className={errors.name ? inputError : inputNormal}
                                placeholder="Masukkan nama admin"
                            />
                        </div>
                        {errors.name && <p className="mt-2 text-xs text-red-500 font-sfPro italic">{errors.name}</p>}
                    </div>

                    {/* Input Email */}
                    <div className="group">
                        <label className="block text-[11px] uppercase tracking-[0.15em] font-sfPro text-gray-400 mb-1 group-focus-within:text-gray-800 transition-colors">
                            Email Akun
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center text-gray-400 group-focus-within:text-gray-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input 
                                value={data.email} 
                                onChange={(e) => setData('email', e.target.value)}
                                type="email" 
                                required
                                className={errors.email ? inputError : inputNormal} 
                                placeholder="Masukkan email baru"
                            />
                        </div>
                        {errors.email && <p className="mt-2 text-xs text-red-500 font-sfPro italic">{errors.email}</p>}
                    </div>

                    <div className="pt-4 border-t border-gray-50">
                         <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 font-sfPro">Ganti Password (Isi jika perlu)</p>
                    </div>

                    {/* Input Password Saat Ini */}
                    <div className="group">
                        <label className="block text-[11px] uppercase tracking-[0.15em] font-sfPro text-gray-400 mb-1 group-focus-within:text-gray-800 transition-colors">
                            Password Saat Ini
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center text-gray-400 group-focus-within:text-gray-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type={showCurrentPassword ? "text" : "password"}
                                autoComplete="current-password"
                                className={errors.current_password ? inputError : inputNormal}
                                placeholder="••••••••"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.current_password && <p className="mt-2 text-xs text-red-500 font-sfPro italic">{errors.current_password}</p>}
                    </div>

                    {/* Input Password Baru */}
                    <div className="group">
                        <label className="block text-[11px] uppercase tracking-[0.15em] font-sfPro text-gray-400 mb-1 group-focus-within:text-gray-800 transition-colors">
                            Password Baru
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center text-gray-400 group-focus-within:text-gray-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <input
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type={showNewPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className={errors.password ? inputError : inputNormal}
                                placeholder="Ketik password baru"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-2 text-xs text-red-500 font-sfPro italic">{errors.password}</p>}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="group">
                        <label className="block text-[11px] uppercase tracking-[0.15em] font-sfPro text-gray-400 mb-1 group-focus-within:text-gray-800 transition-colors">
                            Konfirmasi Password Baru
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center text-gray-400 group-focus-within:text-gray-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <input
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className={errors.password_confirmation ? inputError : inputNormal}
                                placeholder="Ulangi password baru"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-start gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-10 py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-sfPro shadow-md disabled:opacity-50 transition-all active:scale-95"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-8 py-2.5 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-sfPro text-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}
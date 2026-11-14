import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import CursorWatchingCat from '#/components/catEye/catEye.tsx'
import { registerUserMutation } from '#/server/functions/auth/userRegistration'
import { loginUserMutation } from '#/server/functions/auth/userLogin'

export const Route = createFileRoute('/pages/auth')({
    component: Auth,
})

type Tab = 'login' | 'registration'
type PasswordField = 'loginPass' | 'regPass' | 'regConfirm'

function Auth() {
    const [activeTab, setActiveTab] = useState<Tab>('login')

    const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
        loginPass: false,
        regPass: false,
        regConfirm: false,
    })

    const toggleVisible = (field: PasswordField) =>
        setVisible((prev) => ({ ...prev, [field]: !prev[field] }))

    const switchTab = (tab: Tab) => {
        setVisible({ loginPass: false, regPass: false, regConfirm: false })
        setActiveTab(tab)
    }

    const inputClasses =
        'w-full rounded-xl border border-[#d97706]/30 bg-[#fdf6e2]/40 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all duration-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/15'
    const labelClasses = 'block text-sm font-semibold text-[#b45309] mb-1.5'
    const errorClasses = 'mt-1 text-xs font-medium text-red-600 min-h-[1rem]'

    // Login
    const mutationLogin = useMutation(loginUserMutation())

    const handleSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget)

        mutationLogin.mutate({
            email: form.get('email') as string,
            password: form.get('password') as string,
        })
    };

    // Registration
    const mutationRegistration = useMutation(registerUserMutation())

    const handleSubmitRegistration = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget)

        mutationRegistration.mutate({
            firstName: form.get('firstName') as string,
            lastName: form.get('lastName') as string,
            email: form.get('email') as string,
            password: form.get('password') as string,
            passwordConfirm: form.get('passwordConfirm') as string,
        })
    };

    return (
        <div className="min-h-screen w-full bg-[#fdf6e2] flex flex-col items-center justify-center p-4 sm:p-6  ">
            {/* Wider container for the two-column layout */}
            <div className="w-full max-w-4xl">

                {/* Main Auth Card - 2-column grid */}
                <div className="w-full rounded-2xl bg-white/85 backdrop-blur-md shadow-xl shadow-[#b45309]/10 border border-[#d97706]/20 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">

                    {/* LEFT SIDE: Form (7 columns wide) */}
                    <div className="md:col-span-7 flex flex-col justify-center">
                        {/* Brand / Header */}
                        <div className="text-center md:text-left mb-6">
                            <h1 className="text-2xl font-bold tracking-tight text-[#b45309]">
                                {activeTab === 'login' ? 'Welcome back (Mraaa)' : 'Create your account (Meow)'}
                            </h1>
                            <p className="text-sm text-stone-500 mt-1">
                                {activeTab === 'login'
                                    ? 'Enter your credentials to access Meowzeum'
                                    : 'Join Meowzeum to get started today'}
                            </p>
                        </div>

                        {/* Segmented Tab Switcher */}
                        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-[#fdf6e2] border border-[#d97706]/20">
                            <button
                                type="button"
                                onClick={() => switchTab('login')}
                                className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${activeTab === 'login'
                                    ? 'bg-[#d97706] text-white shadow-sm'
                                    : 'text-[#b45309] hover:text-[#d97706]'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => switchTab('registration')}
                                className={`py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${activeTab === 'registration'
                                    ? 'bg-[#d97706] text-white shadow-sm'
                                    : 'text-[#b45309] hover:text-[#d97706]'
                                    }`}
                            >
                                Registration
                            </button>
                        </div>

                        {/* Forms Container */}
                        {/* Login */}
                        <div>
                            {activeTab === 'login' && (
                                <section role="login" className="animate-fadeIn">
                                    <form onSubmit={handleSubmitLogin} className="space-y-4">
                                        {/* Email */}
                                        <div>
                                            <label htmlFor="l-email" className={labelClasses}>
                                                Email
                                            </label>
                                            <input
                                                id="l-email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="you@company.com"
                                                required
                                                className={inputClasses}
                                                name="email"
                                            />
                                            <p id="l-email-err" role="alert" className={errorClasses}></p>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label htmlFor="l-pass" className="text-sm font-semibold text-[#b45309]">
                                                    Password
                                                </label>
                                                <a
                                                    href="#forgot"
                                                    className="text-xs font-medium text-[#d97706] hover:text-[#b45309] hover:underline transition-colors"
                                                >
                                                    Forgot password?
                                                </a>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    id="l-pass"
                                                    type={visible.loginPass ? 'text' : 'password'}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••"
                                                    required
                                                    className={`${inputClasses} pr-16`}
                                                    name="password"
                                                />
                                                <button
                                                    id="l-pass-toggle"
                                                    type="button"
                                                    onClick={() => toggleVisible('loginPass')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-[#b45309] bg-[#fdf6e2] hover:bg-[#d97706]/20 rounded-md transition-colors cursor-pointer"
                                                >
                                                    {visible.loginPass ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                            <p id="l-pass-err" role="alert" className={errorClasses}></p>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="w-full py-3 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-[#d97706]/25 transition-all duration-200 cursor-pointer"
                                        >
                                            Login
                                        </button>

                                        <p className="text-center text-sm text-stone-600 pt-2">
                                            New to Meowzeum?{' '}
                                            <a
                                                onClick={() => switchTab('registration')}
                                                className="font-semibold text-[#d97706] hover:text-[#b45309] underline-offset-4 hover:underline cursor-pointer transition-colors"
                                            >
                                                Create an account
                                            </a>
                                        </p>
                                    </form>
                                </section>
                            )}

                            {/* Registration */}
                            {activeTab === 'registration' && (
                                < section role="registration" className="animate-fadeIn">
                                    <form onSubmit={handleSubmitRegistration} className="space-y-3.5">
                                        {/* First & Last Name Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label htmlFor="r-first" className={labelClasses}>
                                                    First name
                                                </label>
                                                <input
                                                    id="r-first"
                                                    type="text"
                                                    placeholder="Jane"
                                                    required
                                                    name="firstName"
                                                    className={inputClasses}
                                                />
                                                <p id="r-first-err" role="alert" className={errorClasses}></p>
                                            </div>

                                            <div>
                                                <label htmlFor="r-last" className={labelClasses}>
                                                    Last name
                                                </label>
                                                <input
                                                    id="r-last"
                                                    type="text"
                                                    placeholder="Doe"
                                                    required
                                                    name="lastName"
                                                    className={inputClasses}
                                                />
                                                <p id="r-last-err" role="alert" className={errorClasses}></p>
                                            </div>
                                        </div>

                                        {/* Email Address */}
                                        <div>
                                            <label htmlFor="r-email" className={labelClasses}>
                                                Work email
                                            </label>
                                            <input
                                                id="r-email"
                                                type="email"
                                                placeholder="you@company.com"
                                                required
                                                name="email"
                                                className={inputClasses}
                                            />
                                            <p id="r-email-err" role="alert" className={errorClasses}></p>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label htmlFor="r-pass" className={labelClasses}>
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="r-pass"
                                                    type={visible.regPass ? 'text' : 'password'}
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    required
                                                    name="password"
                                                    className={`${inputClasses} pr-16`}
                                                />
                                                <button
                                                    id="r-pass-toggle"
                                                    type="button"
                                                    onClick={() => toggleVisible('regPass')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-[#b45309] bg-[#fdf6e2] hover:bg-[#d97706]/20 rounded-md transition-colors cursor-pointer"
                                                >
                                                    {visible.regPass ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                            <p id="r-pass-err" role="alert" className={errorClasses}></p>
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label htmlFor="r-confirm" className={labelClasses}>
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="r-confirm"
                                                    type={visible.regConfirm ? 'text' : 'password'}
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    required
                                                    name="passwordConfirm"
                                                    className={`${inputClasses} pr-16`}
                                                />
                                                <button
                                                    id="r-confirm-toggle"
                                                    type="button"
                                                    onClick={() => toggleVisible('regConfirm')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-[#b45309] bg-[#fdf6e2] hover:bg-[#d97706]/20 rounded-md transition-colors cursor-pointer"
                                                >
                                                    {visible.regConfirm ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                            <p id="r-confirm-err" role="alert" className={errorClasses}></p>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="w-full py-3 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-[#d97706]/25 transition-all duration-200 cursor-pointer"
                                        >
                                            Registration
                                        </button>

                                        <p className="text-center text-sm text-stone-600 pt-2">
                                            Already have an account?{' '}
                                            <a
                                                onClick={() => switchTab('login')}
                                                className="font-semibold text-[#d97706] hover:text-[#b45309] underline-offset-4 hover:underline cursor-pointer transition-colors"
                                            >
                                                Sign in
                                            </a>
                                        </p>
                                    </form>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE: The cat as a proper framed image (5 columns wide) */}
                    <div className="md:col-span-5 flex items-center justify-center order-first md:order-last">
                        <CursorWatchingCat className="w-full h-56 md:h-full min-h-[240px]" />
                    </div>

                </div>
            </div>
        </div >
    )
}
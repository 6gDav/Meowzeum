import React from 'react'
import { styles, type ComponetsFormProps } from './CommonInterfaces'
import { useMutation } from '@tanstack/react-query';
import { loginUserMutation } from '#/server/functions/auth/userLogin';

export default function LoginComponents({
    visible,
    toggleVisible,
    switchTab,
}: ComponetsFormProps) {
    const inputClasses = styles.input;
    const labelClasses = styles.label;
    const errorClasses = styles.error;

    const mutationLogin = useMutation(loginUserMutation())

    const handleSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget)

        mutationLogin.mutate({
            email: form.get('email') as string,
            password: form.get('password') as string,
        })
    };

    return (
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
                    <div className="flex  items-center justify-between mb-1.5">
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
    )
}

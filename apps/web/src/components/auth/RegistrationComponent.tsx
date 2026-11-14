import { registerUserMutation } from '#/server/functions/auth/userRegistration';
import { useMutation } from '@tanstack/react-query';
import React from 'react'
import { styles } from './CommonInterfaces'
import type { ComponetsFormProps } from './CommonInterfaces'

function RegistrationComponent({
    visible,
    toggleVisible,
    switchTab,
}: ComponetsFormProps) {

    const inputClasses = styles.input;
    const labelClasses = styles.label;
    const errorClasses = styles.error;

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
        <section role="registration" data-testid="registration-form" className="animate-fadeIn">
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
    )
}

export default RegistrationComponent

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { RegistrationInputSchema } from '@Meowzeum/shared-types'
import { registerUserMutation } from '#/server/functions/auth/userRegistration'
import { styles } from '../CommonInterfaces'
import type { ComponetsFormProps } from '../CommonInterfaces'
 
type Field = 'firstName' | 'lastName' | 'email' | 'password' | 'passwordConfirm'
type FieldErrors = Partial<Record<Field, string>>
 
function RegistrationComponent({
    visible,
    toggleVisible,
    switchTab,
}: ComponetsFormProps) {
 
    const inputClasses = styles.input;
    const labelClasses = styles.label;
    const errorClasses = styles.error;
 
    const navigate = useNavigate()
    const mutationRegistration = useMutation(registerUserMutation())
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
 
    const handleSubmitRegistration = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget)
 
        const values = {
            firstName: String(form.get('firstName') ?? ''),
            lastName: String(form.get('lastName') ?? ''),
            email: String(form.get('email') ?? '').trim(),
            password: String(form.get('password') ?? ''),
            passwordConfirm: String(form.get('passwordConfirm') ?? ''),
        }
 
        const parsed = RegistrationInputSchema.safeParse(values)
        if (!parsed.success) {
            const errs = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>
            setFieldErrors({
                firstName: errs.firstName?.[0],
                lastName: errs.lastName?.[0],
                email: errs.email?.[0],
                password: errs.password?.[0],
                passwordConfirm: errs.passwordConfirm?.[0],
            })
            return
        }
 
        setFieldErrors({})
        mutationRegistration.mutate(parsed.data, {
            onSuccess: () => navigate({ to: '/pages/welcomePage' }),
        })
    };
 
    return (
        <section role="registration" data-testid="registration-form" className="animate-fadeIn">
            <form onSubmit={handleSubmitRegistration} noValidate className="space-y-3.5">
                {/* First & Last Name Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label htmlFor="r-first" className={labelClasses}>
                            First name
                        </label>
                        <input
                            id="r-first"
                            type="text"
                            placeholder="Jhon"
                            autoComplete="given-name"
                            required
                            name="firstName"
                            aria-invalid={!!fieldErrors.firstName}
                            aria-describedby="r-first-err"
                            className={inputClasses}
                        />
                        <p id="r-first-err" role="alert" className={errorClasses}>
                            {fieldErrors.firstName}
                        </p>
                    </div>
 
                    <div>
                        <label htmlFor="r-last" className={labelClasses}>
                            Last name
                        </label>
                        <input
                            id="r-last"
                            type="text"
                            placeholder="Doe"
                            autoComplete="family-name"
                            required
                            name="lastName"
                            aria-invalid={!!fieldErrors.lastName}
                            aria-describedby="r-last-err"
                            className={inputClasses}
                        />
                        <p id="r-last-err" role="alert" className={errorClasses}>
                            {fieldErrors.lastName}
                        </p>
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
                        autoComplete="email"
                        required
                        name="email"
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby="r-email-err"
                        className={inputClasses}
                    />
                    <p id="r-email-err" role="alert" className={errorClasses}>
                        {fieldErrors.email}
                    </p>
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
                            aria-invalid={!!fieldErrors.password}
                            aria-describedby="r-pass-err"
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
                    <p id="r-pass-err" role="alert" className={errorClasses}>
                        {fieldErrors.password}
                    </p>
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
                            aria-invalid={!!fieldErrors.passwordConfirm}
                            aria-describedby="r-confirm-err"
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
                    <p id="r-confirm-err" role="alert" className={errorClasses}>
                        {fieldErrors.passwordConfirm}
                    </p>
                </div>
 
                {/* Server error (e.g. "Email already registered") */}
                {mutationRegistration.isError && (
                    <p id="r-form-err" role="alert" className={errorClasses}>
                        {mutationRegistration.error.message}
                    </p>
                )}
 
                {/* Submit */}
                <button
                    type="submit"
                    disabled={mutationRegistration.isPending}
                    className="w-full py-3 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-[#d97706]/25 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {mutationRegistration.isPending ? 'Creating account…' : 'Registration'}
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
 
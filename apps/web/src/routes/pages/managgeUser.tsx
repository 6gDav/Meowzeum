
import React, { useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { styles } from '#/components/CommonInterfaces'

export const Route = createFileRoute('/pages/managgeUser')({
    component: ManageUserPage,
})

type Field = 'firstName' | 'lastName' | 'email' | 'password' | 'passwordConfirm'
type FieldErrors = Partial<Record<Field, string>>

type UserDatails = {
    firstName: string
    lastName: string
    email: string
}

// TODO: replace with the real current user once the backend is connected
const INITIAL_USER: UserDatails = {
    firstName: 'Jhon',
    lastName: 'Doe',
    email: 'you@company.com',
}

const toggleBtn =
    'absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-[#b45309] bg-[#fdf6e2] hover:bg-[#d97706]/20 rounded-md transition-colors cursor-pointer'

function ManageUserPage() {
    const inputClasses = styles.input
    const labelClasses = styles.label
    const errorClasses = styles.error

    const navigate = useNavigate()

    const [user, setUser] = useState<UserDatails>(INITIAL_USER)

    const fileRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const [saved, setSaved] = useState(false)

    // Release object URLs created for the local preview
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const initials =
        `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || '?'

    const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !file.type.startsWith('image/')) return
        setPreviewUrl(URL.createObjectURL(file))
        setSaved(false)
    }

    const handleImageRemove = () => {
        setPreviewUrl(null)
        setSaved(false)
        if (fileRef.current) fileRef.current.value = ''
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaved(false)
        const form = new FormData(e.currentTarget)

        const values = {
            firstName: String(form.get('firstName') ?? '').trim(),
            lastName: String(form.get('lastName') ?? '').trim(),
            email: String(form.get('email') ?? '').trim(),
            password: String(form.get('password') ?? ''),
            passwordConfirm: String(form.get('passwordConfirm') ?? ''),
        }

        const errs: FieldErrors = {}
        if (!values.firstName) errs.firstName = 'First name is required'
        if (!values.lastName) errs.lastName = 'Last name is required'
        if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = 'Enter a valid email address'
        if (values.password && values.password.length < 8)
            errs.password = 'Password must be at least 8 characters'
        if (values.password !== values.passwordConfirm)
            errs.passwordConfirm = 'Passwords do not match'

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs)
            return
        }

        setFieldErrors({})
        // TODO: call the update mutation here
        setUser({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
        })
        setSaved(true)
    }

    const handleLogout = () => {
        // TODO: call the logout mutation here
        navigate({ to: '/pages/auth' })
    }

    const handleDelete = () => {
        // TODO: call the delete mutation here
        navigate({ to: '/' })
    }

    return (
        <main className="min-h-screen bg-[#fdf6e2] px-4 py-10 sm:py-16">
            <section
                data-testid="manage-user-page"
                className="animate-fadeIn w-full max-w-xl mx-auto rounded-2xl bg-white/70 border border-[#d97706]/15 shadow-md shadow-[#d97706]/10 p-6 sm:p-8"
            >
                <h1 className="font-serif text-2xl font-semibold text-stone-800">
                    Manage account
                </h1>
                <p className="text-sm text-stone-600 mt-1">
                    Update your profile details, or leave the password empty to keep it.
                </p>

                <form
                    key={user.email /* reset defaults after a save */}
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-3.5 mt-6"
                >
                    {/* Profile image */}
                    <div className="flex items-center gap-4 pb-2">
                        <div
                            data-testid="manage-user-avatar"
                            className="h-20 w-20 shrink-0 rounded-full overflow-hidden bg-[#fdf6e2] border-2 border-[#d97706]/40 flex items-center justify-center"
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Your profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="font-serif text-2xl font-semibold text-[#b45309]">
                                    {initials}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col items-start gap-1.5">
                            <input
                                ref={fileRef}
                                id="m-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImagePick}
                                className="sr-only"
                            />
                            <button
                                id="m-image-change"
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="px-3.5 py-1.5 text-sm font-semibold text-[#b45309] bg-[#fdf6e2] hover:bg-[#d97706]/20 rounded-lg transition-colors cursor-pointer"
                            >
                                {previewUrl ? 'Change photo' : 'Upload photo'}
                            </button>
                            {previewUrl && (
                                <button
                                    id="m-image-remove"
                                    type="button"
                                    onClick={handleImageRemove}
                                    className="text-xs font-semibold text-stone-500 hover:text-[#b45309] underline-offset-4 hover:underline cursor-pointer transition-colors"
                                >
                                    Remove photo
                                </button>
                            )}
                        </div>
                    </div>

                    {/* First & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label htmlFor="m-first" className={labelClasses}>
                                First name
                            </label>
                            <input
                                id="m-first"
                                type="text"
                                autoComplete="given-name"
                                required
                                name="firstName"
                                defaultValue={user.firstName}
                                aria-invalid={!!fieldErrors.firstName}
                                aria-describedby="m-first-err"
                                className={inputClasses}
                            />
                            <p id="m-first-err" role="alert" className={errorClasses}>
                                {fieldErrors.firstName}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="m-last" className={labelClasses}>
                                Last name
                            </label>
                            <input
                                id="m-last"
                                type="text"
                                autoComplete="family-name"
                                required
                                name="lastName"
                                defaultValue={user.lastName}
                                aria-invalid={!!fieldErrors.lastName}
                                aria-describedby="m-last-err"
                                className={inputClasses}
                            />
                            <p id="m-last-err" role="alert" className={errorClasses}>
                                {fieldErrors.lastName}
                            </p>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="m-email" className={labelClasses}>
                            Email address
                        </label>
                        <input
                            id="m-email"
                            type="email"
                            autoComplete="email"
                            required
                            name="email"
                            defaultValue={user.email}
                            aria-invalid={!!fieldErrors.email}
                            aria-describedby="m-email-err"
                            className={inputClasses}
                        />
                        <p id="m-email-err" role="alert" className={errorClasses}>
                            {fieldErrors.email}
                        </p>
                    </div>

                    {/* New password */}
                    <div>
                        <label htmlFor="m-pass" className={labelClasses}>
                            New password
                        </label>
                        <div className="relative">
                            <input
                                id="m-pass"
                                type={showPass ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Leave empty to keep current"
                                name="password"
                                aria-invalid={!!fieldErrors.password}
                                aria-describedby="m-pass-err"
                                className={`${inputClasses} pr-16`}
                            />
                            <button
                                id="m-pass-toggle"
                                type="button"
                                onClick={() => setShowPass((v) => !v)}
                                className={toggleBtn}
                            >
                                {showPass ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <p id="m-pass-err" role="alert" className={errorClasses}>
                            {fieldErrors.password}
                        </p>
                    </div>

                    {/* Confirm new password */}
                    <div>
                        <label htmlFor="m-confirm" className={labelClasses}>
                            Confirm new password
                        </label>
                        <div className="relative">
                            <input
                                id="m-confirm"
                                type={showConfirm ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                name="passwordConfirm"
                                aria-invalid={!!fieldErrors.passwordConfirm}
                                aria-describedby="m-confirm-err"
                                className={`${inputClasses} pr-16`}
                            />
                            <button
                                id="m-confirm-toggle"
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className={toggleBtn}
                            >
                                {showConfirm ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <p id="m-confirm-err" role="alert" className={errorClasses}>
                            {fieldErrors.passwordConfirm}
                        </p>
                    </div>

                    {saved && (
                        <p role="status" className="text-sm font-semibold text-green-700">
                            Changes saved.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-[#d97706] hover:bg-[#b45309] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-[#d97706]/25 transition-all duration-200 cursor-pointer"
                    >
                        Save changes
                    </button>
                </form>

                {/* Account actions */}
                <div className="mt-8 pt-6 border-t border-[#d97706]/15 space-y-3">
                    <button
                        id="m-logout"
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-3 px-4 rounded-xl border border-[#d97706] text-[#b45309] hover:bg-[#d97706]/10 active:scale-[0.99] font-semibold text-sm transition-all duration-200 cursor-pointer"
                    >
                        Log out
                    </button>

                    {!confirmingDelete ? (
                        <button
                            id="m-delete"
                            type="button"
                            onClick={() => setConfirmingDelete(true)}
                            className="w-full py-3 px-4 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 active:scale-[0.99] font-semibold text-sm transition-all duration-200 cursor-pointer"
                        >
                            Delete account
                        </button>
                    ) : (
                        <div
                            role="alertdialog"
                            aria-labelledby="m-delete-title"
                            data-testid="delete-confirm"
                            className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3"
                        >
                            <p id="m-delete-title" className="text-sm text-red-800">
                                This permanently deletes your account and all your posts. This
                                cannot be undone.
                            </p>
                            <div className="flex gap-2.5">
                                <button
                                    id="m-delete-cancel"
                                    type="button"
                                    onClick={() => setConfirmingDelete(false)}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-white text-stone-700 hover:bg-stone-100 font-semibold text-sm transition-colors cursor-pointer"
                                >
                                    Keep account
                                </button>
                                <button
                                    id="m-delete-confirm"
                                    type="button"
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-sm transition-colors cursor-pointer"
                                >
                                    Delete account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}

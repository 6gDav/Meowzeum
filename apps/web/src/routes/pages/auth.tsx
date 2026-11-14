import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

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

    return (
        <div>
            <div>
                <button onClick={() => switchTab('login')}>Login</button>
                <button onClick={() => switchTab('registration')}>Registration</button>
            </div>

            <div>
                {activeTab === 'login' && (
                    <section role="login">
                        <form action="">
                            {/* Email */}
                            <div>
                                <label htmlFor="l-email">Email</label>
                                <input id="l-email" type="email" autoComplete="email" placeholder="you@company.com" required />
                                <p id="l-email-err" role="alert"></p>
                            </div>
                            {/* Password */}
                            <div>
                                <div>
                                    <label htmlFor="l-pass">Password</label>
                                </div>
                                <div>
                                    <input id="l-pass" type={visible.loginPass ? 'text' : 'password'} autoComplete="current-password"
                                        required />
                                    <button id="r-pass-toggle" type="button" onClick={() => toggleVisible('loginPass')}>
                                        {visible.loginPass ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <a href="#forgot">Forgot password?</a>
                                <p id="l-pass-err" role="alert"></p>
                            </div>
                            <button>Login</button>
                            <p>New to Meridian? <a onClick={() => switchTab('registration')}>Create an account</a></p>
                        </form>
                    </section>
                )}

                {activeTab === 'registration' && (
                    <section role="registration">
                        <form action="">
                            {/* First Name */}
                            <div>
                                <label htmlFor="r-first">First name</label>
                                <input id="r-first" type="text" required />
                                <p id="r-first-err" role="alert"></p>
                            </div>
                            {/* Last Name */}
                            <div>
                                <label htmlFor="r-last">Last name</label>
                                <input id="r-last" type="text" required />
                                <p id="r-last-err" role="alert"></p>
                            </div>

                            {/* Email Address */}
                            <div>
                                <label htmlFor="r-email">Work email</label>
                                <input id="r-email" type="email" placeholder="you@company.com" required />
                                <p id="r-email-err" role="alert"></p>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="r-pass">Password</label>
                                <div>
                                    <input id="r-pass" type={visible.regPass ? 'text' : 'password'} autoComplete="new-password" required />
                                    <button id="r-pass-toggle" type="button" onClick={() => toggleVisible('regPass')}>
                                        {visible.regPass ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <p id="r-pass-err" role="alert"></p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="r-confirm">Confirm Password</label>
                                <div>
                                    <input id="r-confirm" type={visible.regConfirm ? 'text' : 'password'} autoComplete="new-password" required />
                                    <button id="r-pass-toggle" type="button" onClick={() => toggleVisible('regConfirm')}>
                                        {visible.regConfirm ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <p id="r-confirm-err" role="alert"></p>
                            </div>

                            <button>Registration</button>
                            <p>Already have an account? <a onClick={() => switchTab('login')}>Sign in</a></p>
                        </form>
                    </section>
                )}
            </div>
        </div>
    )
}

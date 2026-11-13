import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';


export const Route = createFileRoute('/auth')({
    component: Auth,
})

function Auth() {
    const [activeTab, setActiveTab] = useState("login");
    return (
        <div>
            <div>
                <button
                    onClick={() => setActiveTab("login")}>
                    Login
                </button>

                <button
                    onClick={() => setActiveTab('registration')}>
                    Registration
                </button>
            </div>

            <div>
                {activeTab === "login" && (
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
                                    <input id="l-pass" type="password" required />
                                    <button id="l-pass-toggle" type="button">Show</button>
                                </div>
                                <a href="#forgot">Forgot password?</a>
                                <p id="l-pass-err" role="alert"></p>
                            </div>
                            <button>Login</button>
                            <p>New to Meridian? <a onClick={() => setActiveTab("registration")} data-go="register">Create an account</a></p>
                        </form>
                    </section>

                )}

                {activeTab === "registration" && (
                    <section role="registration">
                        <form action="">
                            {/* First Name */}
                            <div>
                                <label htmlFor="r-first">First name</label>
                                <input id="r-first" type="text" required />
                                <p id="r-first-err" role="alert"></p>
                            </div>
                            {/* Last Name */}
                            <div >
                                <label htmlFor="r-last">Last name</label>
                                <input id="r-last" type="text" required />
                                <p id="r-last-err" role="alert"></p>
                            </div>

                            {/* Email Address */}
                            <div >
                                <label htmlFor="r-email">Work email</label>
                                <input id="r-email" type="email" placeholder="you@company.com" required />
                                <p id="r-email-err" role="alert"></p>
                            </div>

                            {/* Password */}
                            <div >
                                <label htmlFor="r-pass">Password</label>
                                <div>
                                    <input id="r-pass" type="password" aria-describedby="r-hint" required />
                                    <button type="button" data-target="r-pass" aria-label="Show password">
                                        Show
                                    </button>
                                </div>
                                <p id="r-pass-err" role="alert"></p>
                            </div>

                            <div>
                                <label htmlFor="r-pass">Confirm Password</label>
                                <div>
                                    <input id="r-pass" type="password" aria-describedby="r-hint" required />
                                    <button type="button" data-target="r-pass" aria-label="Show password">
                                        Show
                                    </button>
                                </div>
                                <p id="r-pass-err" role="alert"></p>
                            </div>

                            <button>Registration</button>
                            <p>Already have an account? <a onClick={() => setActiveTab("login")} data-go="login">Sign in</a></p>
                        </form>
                    </section>
                )}
            </div>
        </div>
    )
}
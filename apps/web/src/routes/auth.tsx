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
                    <form action="">
                        <input type="email" placeholder="jhondoe@gmail.com" /> <br />
                        <input type="password" /> <br />
                        <button>Login</button>
                    </form>
                )}

                {activeTab === "registration" && (
                    <form action="">
                        <input type="text" placeholder="John Doe" /> <br />
                        <input type="email" placeholder="jhondoe@gmail.com" /> <br />
                        <input type="password" /> <br />
                        <button>Registration</button>
                    </form>
                )}
            </div>


        </div>
    )
}
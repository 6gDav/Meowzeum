import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import CursorWatchingCat from '#/components/catEye/catEye.tsx'
import RegistrationComponent from '#/components/auth/RegistrationComponent'
import LoginComponents from '#/components/auth/LoginComponents'

export const Route = createFileRoute('/pages/auth')({
    component: Auth,
})

export type Tab = 'login' | 'registration'
export type PasswordField = 'loginPass' | 'regPass' | 'regConfirm'

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
        <div className="min-h-screen  flex flex-col items-center justify-center p-4 sm:p-6  ">
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
                        <div role="tablist" className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-[#fdf6e2] border border-[#d97706]/20">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'login'}
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
                                role="tab"
                                aria-selected={activeTab === 'registration'}
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
                                <LoginComponents
                                    visible={visible}
                                    toggleVisible={toggleVisible}
                                    switchTab={switchTab}
                                />
                            )}

                            {/* Registration */}
                            {activeTab === 'registration' && (
                                <RegistrationComponent
                                    visible={visible}
                                    toggleVisible={toggleVisible}
                                    switchTab={switchTab}
                                />
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
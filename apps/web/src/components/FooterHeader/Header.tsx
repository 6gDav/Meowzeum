
import { currentUserQueryOptions } from "#/server/functions/auth/getCurrentUser";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import CatIcon from "../../assets/cat.ico";

function AuthButtons({ isMobile = false }: { isMobile?: boolean }) {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions());

  const containerClass = isMobile
    ? "pt-4 mt-2 border-t border-[#e5a965]/60 flex flex-col gap-2"
    : "hidden md:flex items-center space-x-4";

  const avatarSrc = user?.avatar
    ? user.avatar.startsWith("data:")
      ? user.avatar
      : `data:image/png;base64,${user.avatar}`
    : null;

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return user ? (
    <Link
      to="/pages/profile"
      data-testid="header-profile-button"
      className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-[#fdf6e2]/70 hover:bg-[#d97706]/15 border border-[#d97706]/30 transition-colors cursor-pointer"
    >
      <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-[#fdf6e2] border border-[#d97706]/40 flex items-center justify-center">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={user.firstName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-serif text-xs font-semibold text-[#b45309]">
            {initials}
          </span>
        )}
      </div>

      <span className="text-sm font-semibold text-[#b45309] max-w-[120px] truncate">
        {user.firstName}
      </span>
    </Link>
  ) : (
    <div className={containerClass}>
      <Link
        to="/pages/auth"
        hash="login"
        className="block text-center px-4 py-2 rounded-md text-base font-medium text-[#b45309] border border-[#e5a965] hover:bg-[#e5a965]/20 transition-colors"
      >
        Log in
      </Link>
      <Link
        to="/pages/auth"
        hash="registration"
        className="text-center bg-[#d97706] hover:bg-[#b45309] text-[#fdf6e2] font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-all duration-200 border border-[#b45309]/20"
      >
        Get Started
      </Link>
    </div>
  );
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fdf6e2] border-b border-[#e5a965] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#d97706] group-hover:bg-[#b45309] transition-colors flex items-center justify-center overflow-hidden">
                <img src={CatIcon} alt="Meowzeum logo" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#b45309]">
                Meowzeum
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-[#b45309] hover:text-[#d97706] font-medium text-sm transition-colors duration-200"
            >
              Home
            </Link>
            <a
              href="/pages/gallery"
              className="text-[#b45309] hover:text-[#d97706] font-medium text-sm transition-colors duration-200"
            >
              Gallery
            </a>
            <a
              href="/pages/community"
              className="text-[#b45309] hover:text-[#d97706] font-medium text-sm transition-colors duration-200"
            >
              Community
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-[#b45309] hover:text-[#fdf6e2] hover:bg-[#e5a965] focus:outline-none transition-colors"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                /* Hamburger Icon */
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                /* Close Icon */
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#fdf6e2] border-t border-[#e5a965]">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <a
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#b45309] hover:bg-[#e5a965]/30 hover:text-[#d97706] transition-colors"
            >
              Home
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#b45309] hover:bg-[#e5a965]/30 hover:text-[#d97706] transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#b45309] hover:bg-[#e5a965]/30 hover:text-[#d97706] transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#b45309] hover:bg-[#e5a965]/30 hover:text-[#d97706] transition-colors"
            >
              About
            </a>

            {/* Pass isMobile here */}
            <AuthButtons isMobile />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

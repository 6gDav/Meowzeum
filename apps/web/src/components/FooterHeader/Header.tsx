
import { useState } from "react";
 
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  return (
    <header className="sticky top-0 z-50 w-full bg-[#fdf6e2] border-b border-[#e5a965] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
 
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#d97706] group-hover:bg-[#b45309] transition-colors flex items-center justify-center text-[#fdf6e2] font-bold text-lg">
                B
              </div>
              <span className="font-bold text-xl tracking-tight text-[#b45309]">
                Meowzeum
              </span>
            </a>
          </div>
 
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#"
              className="text-[#b45309] hover:text-[#d97706] font-medium text-sm transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-[#b45309] hover:text-[#d97706] font-medium text-sm transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-[#b45309] hover:text-[#d97706] font-medium text-sm transition-colors duration-200"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-[#b45309] hover:text-[#d97706] font-medium text-sm transition-colors duration-200"
            >
              About
            </a>
          </nav>
 
          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="#login"
              className="text-[#b45309] hover:text-[#d97706] font-medium text-sm transition-colors"
            >
              Log in
            </a>
            <a
              href="#signup"
              className="bg-[#d97706] hover:bg-[#b45309] text-[#fdf6e2] font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-all duration-200 border border-[#b45309]/20"
            >
              Get Started
            </a>
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
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#b45309] hover:bg-[#e5a965]/30 hover:text-[#d97706] transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#b45309] hover:bg-[#e5a965]/30 hover:text-[#d97706] transition-colors"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#b45309] hover:bg-[#e5a965]/30 hover:text-[#d97706] transition-colors"
            >
              About
            </a>
            <div className="pt-4 mt-2 border-t border-[#e5a965]/60 flex flex-col gap-2">
              <a
                href="#login"
                className="block text-center px-4 py-2 rounded-md text-base font-medium text-[#b45309] border border-[#e5a965] hover:bg-[#e5a965]/20 transition-colors"
              >
                Log in
              </a>
              <a
                href="#signup"
                className="block text-center px-4 py-2 rounded-md text-base font-medium bg-[#d97706] text-[#fdf6e2] hover:bg-[#b45309] transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
 
export default Header;
 
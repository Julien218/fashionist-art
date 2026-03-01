import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/shared/Logo';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Accueil', page: 'Home' },
  { label: 'Programme', page: 'Programme' },
  { label: 'Artistes', page: 'Artists' },
  { label: 'Galerie', page: 'Gallery' },
  { label: 'Infos pratiques', page: 'Infos' },
  { label: 'Billetterie', page: 'Billetterie' },
];

const ADMIN_PAGES = ['Admin'];

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = user && ['super_admin', 'admin'].includes(user.role);
  const isAdminPage = ADMIN_PAGES.includes(currentPageName);

  if (isAdminPage) {
    return <div className="grain-overlay bg-watermark min-h-screen">{children}</div>;
  }

  return (
    <div className="grain-overlay bg-watermark min-h-screen flex flex-col relative">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to={createPageUrl('Home')}>
              <Logo size="sm" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentPageName === item.page 
                      ? 'bg-[#C2185B]/10 text-[#C2185B]' 
                      : 'text-[#2D2024]/70 hover:text-[#C2185B] hover:bg-[#C2185B]/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to={createPageUrl('Admin')}
                  className="px-4 py-2 rounded-full text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* CTA + Mobile */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Billetterie')} className="hidden sm:inline-flex btn-premium text-sm py-2 px-5">
                Je m'inscris
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-full hover:bg-[#C2185B]/10 transition-colors">
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass border-t border-white/20"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-[#2D2024]/80 hover:bg-[#C2185B]/5 transition-colors"
                  >
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to={createPageUrl('Admin')}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors"
                  >
                    <span className="font-medium">Administration</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                )}
                <Link
                  to={createPageUrl('Billetterie')}
                  onClick={() => setMenuOpen(false)}
                  className="block btn-premium text-center mt-3"
                >
                  Je m'inscris
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Content */}
      <main className="flex-1 pt-16 md:pt-20 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Logo size="sm" />
              <p className="mt-3 text-sm text-[#2D2024]/50 font-body">
                18 avril 2026<br />
                Centre Sportif d'Élouges (Dour), Belgique
              </p>
              <span className="badge-free mt-3 inline-block">✦ Entrée gratuite</span>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[#2D2024]/40 mb-4">Navigation</h4>
              <div className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.page} to={createPageUrl(item.page)} className="block text-sm text-[#2D2024]/60 hover:text-[#C2185B] transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[#2D2024]/40 mb-4">Légal</h4>
              <div className="space-y-2">
                <Link to={createPageUrl('Legal')} className="block text-sm text-[#2D2024]/60 hover:text-[#C2185B] transition-colors">
                  Mentions légales
                </Link>
                <Link to={createPageUrl('Privacy')} className="block text-sm text-[#2D2024]/60 hover:text-[#C2185B] transition-colors">
                  Confidentialité & Cookies
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[#2D2024]/40 mb-4">Contact</h4>
              <p className="text-sm text-[#2D2024]/60">
                Centre Sportif d'Élouges<br />
                Dour, Belgique
              </p>
              <Link to={createPageUrl('Infos')} className="mt-2 inline-block text-sm text-[#C2185B] hover:underline">
                Nous contacter →
              </Link>
            </div>
          </div>
          <div className="section-divider mt-10 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2D2024]/40">
            <p>© 2026 Fashionist'ART — Tous droits réservés</p>
            <p>18 avril 2026 · Centre Sportif d'Élouges (Dour), Belgique</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
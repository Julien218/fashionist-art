import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Menu, X, ChevronRight, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Accueil', page: 'Home' },
  { label: 'Programme', page: 'Programme' },
  { label: 'Artistes', page: 'Artists' },
  { label: 'Galerie', page: 'Gallery' },
  { label: 'Infos pratiques', page: 'Infos' },
];

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = user && ['super_admin', 'admin'].includes(user.role);
  const isAdminPage = currentPageName === 'Admin';

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white">
        <div className="rainbow-bar" />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col">
      {/* Top rainbow bar */}
      <div className="rainbow-bar fixed top-0 left-0 right-0 z-50" />

      {/* Header */}
      <header className={`fixed top-[3px] left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl shadow-lg shadow-black/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png"
                alt="Fashionist'ART"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF2D8A]/40"
              />
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-0">
                  <span className="font-script text-lg text-[#FF2D8A]">Fashionist'</span>
                  <span className="font-display font-black text-base text-white">ART</span>
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentPageName === item.page
                      ? 'text-[#FF2D8A] bg-[#FF2D8A]/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to={createPageUrl('Admin')} className="px-4 py-2 rounded-full text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
                  Admin
                </Link>
              )}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Billetterie')} className="hidden sm:inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-6">
                <Ticket className="w-4 h-4" /> Réserver
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
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
              className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-white/80 hover:bg-white/5 transition-colors">
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                ))}
                {isAdmin && (
                  <Link to={createPageUrl('Admin')} onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl text-[#D4AF37] hover:bg-white/5 transition-colors">
                    <span>Administration</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                )}
                <Link to={createPageUrl('Billetterie')} onClick={() => setMenuOpen(false)} className="block btn-primary text-center mt-3">
                  Réserver
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Content */}
      <main className="flex-1 pt-[75px]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68ae1c019dacc474a322f2b2/742499905_Capturedecran2026-02-26a175005.png"
                  alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <span className="font-script text-lg text-[#FF2D8A]">Fashionist'</span>
                  <span className="font-display font-black text-base text-white">ART</span>
                </div>
              </div>
              <p className="text-sm text-white/40">18 avril 2026<br />Centre Sportif d'Élouges (Dour), Belgique</p>
              <span className="badge-free mt-3 inline-block">✦ Entrée gratuite</span>
            </div>
            <div>
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-white/30 mb-4">Navigation</h4>
              <div className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.page} to={createPageUrl(item.page)} className="block text-sm text-white/50 hover:text-[#FF2D8A] transition-colors">{item.label}</Link>
                ))}
                <Link to={createPageUrl('Billetterie')} className="block text-sm text-white/50 hover:text-[#FF2D8A] transition-colors">Billetterie</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-white/30 mb-4">Légal</h4>
              <div className="space-y-2">
                <Link to={createPageUrl('Legal')} className="block text-sm text-white/50 hover:text-[#FF2D8A] transition-colors">Mentions légales</Link>
                <Link to={createPageUrl('Privacy')} className="block text-sm text-white/50 hover:text-[#FF2D8A] transition-colors">Confidentialité & Cookies</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-white/30 mb-4">Contact</h4>
              <p className="text-sm text-white/40">Centre Sportif d'Élouges<br />Dour, Belgique</p>
              <Link to={createPageUrl('Infos')} className="mt-2 inline-block text-sm text-[#FF2D8A] hover:underline">Nous contacter →</Link>
            </div>
          </div>
          <div className="divider mt-10 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
            <p>© 2026 Fashionist'ART — Tous droits réservés</p>
            <p>18 avril 2026 · Centre Sportif d'Élouges (Dour), Belgique</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
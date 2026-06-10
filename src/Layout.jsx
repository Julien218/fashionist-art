import React, { useState, useEffect } from 'react';
import CookieBanner from './components/shared/CookieBanner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { Menu, X, ChevronRight, Ticket, LogIn, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from './components/shared/SplashScreen';
import SEOHead from './components/shared/SEOHead';

const NAV_ITEMS = [
  { label: 'Accueil', page: 'Home' },
  { label: 'Programme', page: 'Programme' },
  { label: 'Artistes', page: 'Artists' },
  { label: 'Galerie', page: 'Gallery' },
  { label: 'Histoire', page: 'Histoire' },
  { label: 'Infos pratiques', page: 'Infos' },
  { label: 'Blog', page: 'Blog' },
];

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isAdminPage = currentPageName === 'Admin';

  const bgImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a460cb984c65f748b49e7d/ef497c4fd_artisteimageb.jpg";

  const handleSplashDone = () => setShowSplash(false);

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white">
        <div className="rainbow-bar" />
        {children}
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col" style={{position:'relative'}}>
      <SEOHead pageName={currentPageName} />
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <div
        className="fixed inset-0 z-0 pointer-events-none select-none"
        style={{
          backgroundImage: `url("${bgImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.50,
        }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{background: 'rgba(10,10,15,0)'}} />

      <div className="rainbow-bar fixed top-0 left-0 right-0 z-50" />

      <header className="fixed top-0 left-0 right-0 z-40 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            <Link to={createPageUrl('Home')} className="flex items-center">
              <img
                src="https://media.base44.com/images/public/6a035427dca907aa03b71398/30db7f0e0_logoFashionistArtLogo.png"
                alt="Fashionist'ART"
                className="h-10 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 2px 10px rgba(212,175,55,0.35))' }}
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentPageName === item.page
                      ? 'text-[#FF2D8A] bg-[#FF2D8A]/10'
                      : 'text-white/80 hover:text-[#FF2D8A] hover:bg-[#FF2D8A]/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link to={createPageUrl('MyArtist')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentPageName === 'MyArtist' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#D4AF37]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                  }`}>
                  Mon artiste
                </Link>
              )}
              {isAdmin && (
                <Link to={createPageUrl('Admin')} className="px-4 py-2 rounded-full text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Billetterie')} className="hidden sm:inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-6 ring-2 ring-[#FF2D8A] ring-offset-2 ring-offset-transparent">
                <Ticket className="w-4 h-4" /> Réserver
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                  title={user?.email}
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user?.user_metadata?.full_name || user?.email}</span>
                  <LogOut className="w-3.5 h-3.5 opacity-60" />
                </button>
              ) : (
                <button
                  onClick={navigateToLogin}
                  className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  <LogIn className="w-4 h-4" /> Connexion
                </button>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

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
                {isAuthenticated && (
                  <Link to={createPageUrl('MyArtist')} onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl text-[#D4AF37]/80 hover:bg-white/5 transition-colors">
                    <span>Mon artiste</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                )}
                {isAdmin && (
                  <Link to={createPageUrl('Admin')} onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl text-[#D4AF37] hover:bg-white/5 transition-colors">
                    <span>Administration</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                )}
                <Link to={createPageUrl('Billetterie')} onClick={() => setMenuOpen(false)} className="block btn-primary text-center mt-3">
                  Réserver
                </Link>
                {isAuthenticated ? (
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 transition-colors mt-1"
                  >
                    <span className="flex items-center gap-2"><User className="w-4 h-4" />{user?.user_metadata?.full_name || user?.email}</span>
                    <LogOut className="w-4 h-4 opacity-40" />
                  </button>
                ) : (
                  <button
                    onClick={() => { setMenuOpen(false); navigateToLogin(); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 transition-colors mt-1"
                  >
                    <span>Connexion</span>
                    <LogIn className="w-4 h-4 opacity-40" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-[75px] relative z-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-white/10 mt-16 overflow-hidden bg-black">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-script text-[200px] text-white/[0.03] whitespace-nowrap">Fashionist'ART</span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <div className="flex flex-col gap-3 mb-4">
                <img
                  src="https://media.base44.com/images/public/6a035427dca907aa03b71398/30db7f0e0_logoFashionistArtLogo.png"
                  alt="Fashionist'ART — Logo officiel"
                  className="h-14 w-auto object-contain"
                  style={{ filter: 'drop-shadow(0 2px 12px rgba(212,175,55,0.25))' }}
                />
                <p className="text-[10px] text-white/30 font-display">Dour, Belgique</p>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">Festival alliant mode et art contemporain. ASBL Starlight Dour — BCE 1012.267.056</p>
            </div>
            <div>
              <h4 className="text-white/60 text-xs font-display font-semibold uppercase tracking-widest mb-4">Navigation</h4>
              <ul className="space-y-2">
                {NAV_ITEMS.slice(0,4).map(i => (
                  <li key={i.page}><Link to={createPageUrl(i.page)} className="text-white/40 hover:text-white/80 text-sm transition-colors">{i.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 text-xs font-display font-semibold uppercase tracking-widest mb-4">Informations</h4>
              <ul className="space-y-2">
                {NAV_ITEMS.slice(4).map(i => (
                  <li key={i.page}><Link to={createPageUrl(i.page)} className="text-white/40 hover:text-white/80 text-sm transition-colors">{i.label}</Link></li>
                ))}
                <li><Link to={createPageUrl('Partners')} className="text-white/40 hover:text-white/80 text-sm transition-colors">Partenaires</Link></li>
                <li><Link to={createPageUrl('Legal')} className="text-white/40 hover:text-white/80 text-sm transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 text-xs font-display font-semibold uppercase tracking-widest mb-4">Suivez-nous</h4>
              <div className="flex gap-3 mb-4">
                <a href="https://www.facebook.com/FashionistART" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#FF2D8A]/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/fashionistart_dour" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#FF2D8A]/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
              <p className="text-white/30 text-xs">#FashionistART #Dour #ArtEnWallonie</p>
              <p className="text-white/20 text-xs mt-2">#jsinnovia</p>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">© 2026 ASBL Starlight Dour — Fashionist'ART. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a460cb984c65f748b49e7d/19955f85a_Logo_JS-InnovIA_EvoluTion_Autonome_02-26.png" alt="JS-InnovIA" className="h-6 opacity-40 hover:opacity-80 transition-opacity" />
              <span className="text-white/20 text-xs">Propulsé par JS-InnovIA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    <CookieBanner />
    </>
  );
}

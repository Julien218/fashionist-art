import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('fa_cookie_consent')) setVisible(true);
  }, []);

  const accept = () => { localStorage.setItem('fa_cookie_consent', 'accepted'); setVisible(false); };
  const refuse = () => { localStorage.setItem('fa_cookie_consent', 'refused'); setVisible(false); };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(10,10,15,0.97)',
      borderTop: '1px solid rgba(255,45,138,0.25)',
      backdropFilter: 'blur(16px)',
      padding: '16px 24px',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center',
      justifyContent: 'space-between', gap: '12px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', margin: 0, flex: '1 1 280px', lineHeight: '1.5' }}>
        🍪 Ce site utilise des cookies pour améliorer votre expérience.{' '}
        <a href="/Legal" style={{ color: '#D4AF37', textDecoration: 'underline' }}>
          Mentions légales
        </a>{' '}·{' '}
        <a href="/Privacy" style={{ color: '#D4AF37', textDecoration: 'underline' }}>
          Confidentialité
        </a>
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button onClick={refuse} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.55)', borderRadius: '50px',
          padding: '8px 18px', fontSize: '0.78rem', cursor: 'pointer',
        }}>Refuser</button>
        <button onClick={accept} style={{
          background: 'linear-gradient(135deg,#FF2D8A,#D4AF37)',
          border: 'none', color: '#fff', borderRadius: '50px',
          padding: '8px 22px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
        }}>Accepter</button>
      </div>
    </div>
  );
}

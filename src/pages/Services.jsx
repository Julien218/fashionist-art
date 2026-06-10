import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShoppingCart, Sparkles, QrCode, Zap, Palette, Link2, Gift, ExternalLink } from 'lucide-react';

const formatPrice = (amount, currency) => {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: currency?.toUpperCase() || 'EUR',
  }).format(amount / 100);
};

// ─── Section QR Code ───────────────────────────────────────────────────────
function QRCodeSection() {
  const features = [
    {
      icon: <Palette className="w-5 h-5" />,
      color: '#D4AF37',
      bg: 'rgba(212,175,55,0.12)',
      border: 'rgba(212,175,55,0.3)',
      title: 'Design Premium',
      desc: 'QR codes visuellement frappants avec couleurs, logos et styles personnalisés.',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      color: '#06B6D4',
      bg: 'rgba(6,182,212,0.12)',
      border: 'rgba(6,182,212,0.3)',
      title: 'Génération Instantanée',
      desc: 'Votre QR code prêt en quelques secondes — téléchargeable immédiatement.',
    },
    {
      icon: <Link2 className="w-5 h-5" />,
      color: '#7C3AED',
      bg: 'rgba(124,58,237,0.12)',
      border: 'rgba(124,58,237,0.3)',
      title: 'Tous Usages',
      desc: 'URLs, vCards, WiFi, réseaux sociaux, menus, cartes de visite…',
    },
    {
      icon: <Gift className="w-5 h-5" />,
      color: '#EC4899',
      bg: 'rgba(236,72,153,0.12)',
      border: 'rgba(236,72,153,0.3)',
      title: '100% Gratuit',
      desc: 'Aucun compte requis. Aucune limite. Un cadeau JS-Innov.IA pour tous.',
    },
  ];

  return (
    <section className="relative mt-24 rounded-3xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0B0B0F 100%)',
      border: '1px solid rgba(212,175,55,0.15)',
      boxShadow: '0 0 80px rgba(212,175,55,0.05), 0 40px 80px rgba(0,0,0,0.4)',
    }}>
      {/* Décor bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{position:'absolute',top:'10%',left:'5%',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(212,175,55,0.07),transparent 70%)'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'5%',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.07),transparent 70%)'}}/>
      </div>

      <div className="relative z-10 px-8 py-14 md:px-14">
        {/* Badge + titre */}
        <div className="text-center mb-12">
          <span style={{
            display:'inline-block',
            background:'linear-gradient(135deg,#D4AF37,#FFB347)',
            color:'#0B0B0F',
            fontSize:'0.65rem',
            fontWeight:800,
            letterSpacing:'4px',
            textTransform:'uppercase',
            padding:'5px 18px',
            borderRadius:'99px',
            marginBottom:'16px',
          }}>✦ Service Offert ✦</span>

          <h2 className="font-display text-3xl md:text-4xl font-black mb-3" style={{
            background:'linear-gradient(180deg,#ffffff 0%,#D4AF37 60%,#A0841A 100%)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
          }}>
            Générateur QR Code Moderne
          </h2>
          <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
            Créez des QR codes visuellement frappants et brandés en quelques secondes.
            Un service <span style={{color:'#D4AF37',fontWeight:700}}>100% gratuit</span>, offert par JS-Innov.IA.
          </p>
        </div>

        {/* Grid : Preview + Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Preview iframe */}
          <div style={{
            borderRadius:'20px',
            overflow:'hidden',
            border:'1px solid rgba(212,175,55,0.2)',
            boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
            background:'rgba(255,255,255,0.02)',
          }}>
            {/* Barre navigateur */}
            <div style={{
              background:'rgba(255,255,255,0.04)',
              padding:'10px 14px',
              display:'flex',
              alignItems:'center',
              gap:'7px',
              borderBottom:'1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#ff5f56',display:'inline-block'}}/>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#ffbd2e',display:'inline-block'}}/>
              <span style={{width:10,height:10,borderRadius:'50%',background:'#27c93f',display:'inline-block'}}/>
              <span style={{
                background:'rgba(255,255,255,0.06)',
                borderRadius:6,
                padding:'3px 10px',
                fontSize:'0.65rem',
                color:'rgba(255,255,255,0.3)',
                marginLeft:8,
                flex:1,
              }}>fashionistartdour.be</span>
            </div>
            <iframe
              src="https://fashionistartdour.be"
              style={{width:'100%',height:'360px',border:'none',display:'block'}}
              title="Générateur QR Code JS-Innov.IA"
              loading="lazy"
            />
          </div>

          {/* Features + CTA */}
          <div className="flex flex-col gap-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div style={{
                  width:44,height:44,minWidth:44,
                  borderRadius:12,
                  background:f.bg,
                  border:`1px solid ${f.border}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:f.color,
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}

            {/* Séparateur */}
            <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.25),transparent)',margin:'4px 0'}}/>

            {/* CTA */}
            <a
              href="https://fashionistartdour.be"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary justify-center gap-3"
              style={{
                background:'linear-gradient(135deg,#D4AF37,#FFB347)',
                color:'#0B0B0F',
                fontWeight:800,
                fontSize:'0.95rem',
                padding:'15px 32px',
                borderRadius:'99px',
                textDecoration:'none',
                display:'flex',
                alignItems:'center',
                boxShadow:'0 8px 32px rgba(212,175,55,0.3)',
                transition:'all 0.3s',
              }}
            >
              <QrCode className="w-5 h-5" />
              Générer mon QR Code
              <ExternalLink className="w-4 h-4" />
            </a>

            <p className="text-white/25 text-center" style={{fontSize:'0.68rem'}}>
              ✓ Aucune inscription &nbsp;·&nbsp; ✓ Aucune limite &nbsp;·&nbsp; ✓ Téléchargement direct
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function Services() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.resolve([]) /* TODO: Stripe via Supabase Edge Function */
      .then(res => setProducts(res.data.items || []))
      .catch(() => setError('Impossible de charger les services.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (priceId) => {
    if (window.self !== window.top) {
      alert('Le paiement est uniquement disponible depuis l\'application publiée.');
      return;
    }
    setPaying(priceId);
    try {
      const res = { url: null }; /* TODO: Stripe via Supabase Edge Function */ console.warn('Stripe checkout à configurer');
      if (res.data.url) window.location.href = res.data.url;
    } catch {
      setError('Erreur lors de la création du paiement.');
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <div className="label-tag mb-3">Nos services</div>
          <h1 className="title-section mb-4">
            <span className="text-gradient">Services & Offres</span>
          </h1>
          <p className="subtitle-section max-w-xl mx-auto">
            Découvrez nos offres disponibles — paiement sécurisé via Stripe.
          </p>
        </div>

        {error && (
          <div className="text-center text-red-400 mb-8">{error}</div>
        )}

        {/* ── Grille produits Stripe ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF2D8A]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.price_id}
                className="glass-dark rounded-2xl border border-white/10 p-6 flex flex-col card-hover"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-full h-40 rounded-xl mb-4 bg-white/5 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-[#FF2D8A]/40" />
                  </div>
                )}

                <h3 className="font-display font-bold text-white text-lg mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-white/50 text-sm mb-4 flex-1 leading-relaxed">{product.description}</p>
                )}

                <div className="mt-auto">
                  <div className="text-[#D4AF37] font-display font-black text-2xl mb-4">
                    {formatPrice(product.amount, product.currency)}
                    {product.recurring && (
                      <span className="text-white/40 font-normal text-sm ml-1">
                        /{product.recurring.interval === 'month' ? 'mois' : product.recurring.interval}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleBuy(product.price_id)}
                    disabled={paying === product.price_id}
                    className="btn-primary w-full justify-center text-sm py-3"
                  >
                    {paying === product.price_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Acheter
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Section QR Code Gratuit ── */}
        <QRCodeSection />

      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShoppingCart, Sparkles } from 'lucide-react';

const formatPrice = (amount, currency) => {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: currency?.toUpperCase() || 'EUR',
  }).format(amount / 100);
};

export default function Services() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.functions.invoke('stripeGetProducts', {})
      .then(res => setProducts(res.data.items || []))
      .catch(() => setError('Impossible de charger les services.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (priceId) => {
    // Bloc iframe
    if (window.self !== window.top) {
      alert('Le paiement est uniquement disponible depuis l\'application publiée.');
      return;
    }
    setPaying(priceId);
    try {
      const res = await base44.functions.invoke('stripeGenericCheckout', { price_id: priceId });
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
        {/* Header */}
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
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                )}
                {!product.image && (
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
      </div>
    </div>
  );
}
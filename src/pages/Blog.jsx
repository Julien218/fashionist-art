import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BlogPostDetail from '@/components/blog/BlogPostDetail';

const CATEGORIES = [
  { value: 'all', label: 'Tous' },
  { value: 'coulisses', label: 'Coulisses' },
  { value: 'tendances', label: 'Tendances Mode' },
  { value: 'artistes', label: 'Artistes' },
  { value: 'evenement', label: 'Événement' },
  { value: 'actualites', label: 'Actualités' },
];

const CATEGORY_COLORS = {
  coulisses: 'bg-purple-500/20 text-purple-300',
  tendances: 'bg-[#FF2D8A]/20 text-[#FF6BB3]',
  artistes: 'bg-blue-500/20 text-blue-300',
  evenement: 'bg-[#D4AF37]/20 text-[#D4AF37]',
  actualites: 'bg-green-500/20 text-green-300',
};

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-public'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-published_at'),
  });

  if (selectedPost) {
    return <BlogPostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="label-tag mb-3">Le Magazine</p>
          <h1 className="title-section mb-4">
            <span className="font-script text-[#FF2D8A]">Blog </span>
            <span className="text-white">& Actualités</span>
          </h1>
          <p className="subtitle-section max-w-xl mx-auto">Coulisses, tendances mode, portraits d'artistes — vivez l'événement avant l'événement.</p>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Rechercher un article…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF2D8A]/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium font-display transition-all ${
                  activeCategory === cat.value
                    ? 'bg-[#FF2D8A] text-white shadow-lg shadow-[#FF2D8A]/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#FF2D8A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 text-white/30">Aucun article pour le moment.</div>
        )}

        {/* Featured post */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-12 cursor-pointer group rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:border-[#FF2D8A]/30 transition-all"
            onClick={() => setSelectedPost(featured)}
          >
            <div className="grid md:grid-cols-2">
              {featured.cover_image_url && (
                <div className="h-64 md:h-auto overflow-hidden">
                  <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-display font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[featured.category] || 'bg-white/10 text-white/60'}`}>
                    {CATEGORIES.find(c => c.value === featured.category)?.label || featured.category}
                  </span>
                  <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" />{featured.reading_time || 3} min</span>
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-3 group-hover:text-[#FF2D8A] transition-colors">{featured.title}</h2>
                {featured.excerpt && <p className="text-white/50 text-sm leading-relaxed mb-4">{featured.excerpt}</p>}
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xs text-white/30 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {featured.published_at ? format(new Date(featured.published_at), 'dd MMM yyyy', { locale: fr }) : ''}
                  </div>
                  <span className="text-[#FF2D8A] text-sm flex items-center gap-1 font-medium">Lire <ArrowRight className="w-4 h-4" /></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedPost(post)}
                className="cursor-pointer group rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-[#FF2D8A]/30 transition-all card-hover"
              >
                {post.cover_image_url && (
                  <div className="h-44 overflow-hidden">
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-display font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-white/10 text-white/60'}`}>
                      {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-white text-base mb-2 group-hover:text-[#FF2D8A] transition-colors line-clamp-2">{post.title}</h3>
                  {post.excerpt && <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs text-white/30">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: fr }) : ''}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.reading_time || 3} min</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
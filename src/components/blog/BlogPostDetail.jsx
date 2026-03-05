import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

const CATEGORY_LABELS = {
  coulisses: 'Coulisses',
  tendances: 'Tendances Mode',
  artistes: 'Artistes',
  evenement: 'Événement',
  actualites: 'Actualités',
};

export default function BlogPostDetail({ post, onBack }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-20">
      {/* Cover */}
      {post.cover_image_url && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-[#FF2D8A] transition-colors mt-8 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </button>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-display font-semibold px-3 py-1 rounded-full bg-[#FF2D8A]/20 text-[#FF6BB3]">
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
          {post.published_at && (
            <span className="text-xs text-white/30 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(post.published_at), 'dd MMMM yyyy', { locale: fr })}
            </span>
          )}
          <span className="text-xs text-white/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />{post.reading_time || 3} min de lecture
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-4 leading-tight">{post.title}</h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-white/50 leading-relaxed mb-8 border-l-2 border-[#FF2D8A]/50 pl-4 italic">{post.excerpt}</p>
        )}

        {/* Author */}
        {post.author_name && (
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/10">
            {post.author_avatar_url ? (
              <img src={post.author_avatar_url} alt={post.author_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF2D8A]/30" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FF2D8A]/20 flex items-center justify-center text-[#FF2D8A] font-bold">
                {post.author_name[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-display font-semibold text-white">{post.author_name}</p>
              <p className="text-xs text-white/30">Rédacteur Fashionist'ART</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-sm md:prose-base max-w-none
          prose-headings:font-display prose-headings:font-bold prose-headings:text-white
          prose-p:text-white/70 prose-p:leading-relaxed
          prose-a:text-[#FF2D8A] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white prose-em:text-white/80
          prose-blockquote:border-[#FF2D8A]/40 prose-blockquote:text-white/50
          prose-code:text-[#FF6BB3] prose-code:bg-white/5 prose-code:rounded
          prose-img:rounded-2xl prose-img:w-full
          mb-12
        ">
          <ReactMarkdown>{post.content || ''}</ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
            <Tag className="w-4 h-4 text-white/30 mt-0.5" />
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

export default function SectionTitle({ title, subtitle, tag, align = "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      {tag && (
        <span className="inline-block text-[#FF2D8A] text-xs font-display font-semibold uppercase tracking-widest mb-3">
          {tag}
        </span>
      )}
      <h2 className="font-display font-black text-2xl md:text-4xl text-white mb-3 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="mt-4 mx-auto divider max-w-xs" />
    </motion.div>
  );
}
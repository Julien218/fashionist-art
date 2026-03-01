import React from 'react';
import { motion } from 'framer-motion';

export default function SectionTitle({ title, subtitle, align = "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <h2 className="font-display font-bold text-3xl md:text-4xl text-[#2D2024] mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-[#2D2024]/60 text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="mt-4 mx-auto section-divider max-w-xs" />
    </motion.div>
  );
}
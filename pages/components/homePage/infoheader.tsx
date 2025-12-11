'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface KaalaBioSectionProps {
  title: string;
  subtitle: string;
  tech: string[];
  isMounted?: boolean;
  renderSubtitle: () => React.ReactNode;
}

export default function KaalaBioSection({
  title,
  subtitle,
  tech,
  isMounted = true,
  renderSubtitle,
}: KaalaBioSectionProps) {
  //
  // Motion variants
  //
  const chipsContainer = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.22 },
    },
  } as const;

  const chipItem = {
    hidden: { opacity: 0, scale: 0.88, y: 6 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 520, damping: 30 },
    },
  } as const;

  return (
    <section className="flex flex-col items-start md:items-center justify-center p-6 md:pl-10 md:pr-6 bg-white/30 h-4/5 backdrop-blur-sm">
      <motion.h1
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-4xl md:text-4xl font-extrabold leading-tight text-black"
      >
        {title}
      </motion.h1>

      <header className="w-full">{renderSubtitle()}</header>

      <motion.div
        className="mt-4 flex flex-wrap gap-2"
        variants={chipsContainer}
        initial="hidden"
        animate={isMounted ? 'show' : 'hidden'}
      >
        {tech.map((t) => (
          <motion.span
            key={t}
            className="text-xs px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-white/20 inline-flex"
            variants={chipItem}
          >
            {t}
          </motion.span>
        ))}
      </motion.div>

      <motion.p className="mt-4 text-sm text-slate-700 fade-in-15">
        I ship delightful developer tools and quirky product features — thoughtful, testable, and fun. Here are a few project highlights.
      </motion.p>
    </section>
  );
}

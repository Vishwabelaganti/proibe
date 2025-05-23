import React from 'react';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
};
const item = {
  hidden: { opacity: 0, y: -10 },
  show:  { opacity: 1, y:  0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
};

export default function Header() {
  return (
    <header className="relative overflow-hidden bg-earth-200 border-b border-accent/40">
      {/* blurred glow */}
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-accent rounded-full opacity-30 blur-3xl animate-pulse" />

      <motion.div
        className="relative z-10 flex items-center justify-between px-10 py-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* logo + name */}
        <motion.div variants={item} className="flex items-center space-x-3">
          <BookOpen size={28} className="text-earth-700" />
          <h1 className="text-3xl font-playfair font-bold text-earth-700">
            Proibe
          </h1>
        </motion.div>

        {/* tagline with underline */}
        <motion.div variants={item} className="relative inline-block">
          <p className="text-sm italic text-earth-700">
            Beautiful note-taking made simple
          </p>
          <motion.span
            className="absolute left-0 bottom-0 h-[2px] bg-earth-700"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.6, duration: 0.8, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </header>
  );
}

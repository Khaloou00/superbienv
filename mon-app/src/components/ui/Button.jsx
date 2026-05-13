import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', className = '', loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-label font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gold text-night hover:bg-yellow-400 active:scale-95',
    outline: 'border-2 border-gold text-gold hover:bg-gold hover:text-night active:scale-95',
    cinema: 'bg-cinema text-white hover:bg-red-700 active:scale-95',
    ghost: 'text-muted hover:text-white hover:bg-white/10 active:scale-95',
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
}

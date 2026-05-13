import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-label text-muted">{label}</label>}
      <input
        ref={ref}
        className={`bg-surface border ${error ? 'border-cinema' : 'border-white/10'} text-white rounded-xl px-4 py-3 font-body text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-cinema">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

import { forwardRef } from 'react';
import { CircleNotch } from '@phosphor-icons/react';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-700 focus-visible:ring-primary-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-400',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800',
  destructive: 'bg-destructive text-white hover:bg-destructive-600 focus-visible:ring-destructive-500',
  outline: 'border border-muted bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-primary-500',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-lg cursor-pointer
        transition-all duration-150 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <CircleNotch className="animate-spin shrink-0" size={16} />}
      {children}
    </button>
  );
});

export default Button;

const variants = {
  success: 'bg-accent-50 text-accent-500',
  warning: 'bg-warning-50 text-warning-500',
  danger: 'bg-destructive-50 text-destructive-500',
  info: 'bg-primary-50 text-primary',
  neutral: 'bg-gray-100 text-gray-600',
};

const dotColors = {
  success: 'bg-accent-500',
  warning: 'bg-warning-500',
  danger: 'bg-destructive-500',
  info: 'bg-primary-500',
  neutral: 'bg-gray-400',
};

export default function Badge({ variant = 'neutral', dot = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
        ${variants[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

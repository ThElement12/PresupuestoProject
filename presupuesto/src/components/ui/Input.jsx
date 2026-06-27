import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, className = '', type = 'text', ...props },
  ref
) {
  const isSelect = type === 'select';
  const Component = isSelect ? 'select' : 'input';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <Component
        ref={ref}
        type={isSelect ? undefined : type}
        className={`w-full border border-muted rounded-lg px-3 py-2.5 text-sm
          bg-white text-gray-800 placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          transition-colors duration-150
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${error ? 'border-destructive-500 focus:ring-destructive-500 focus:border-destructive-500' : ''}
          ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-destructive-500">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
});

export default Input;

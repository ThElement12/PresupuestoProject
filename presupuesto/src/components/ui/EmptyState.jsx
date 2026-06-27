import { Placeholder } from '@phosphor-icons/react';

export default function EmptyState({
  icon: Icon = Placeholder,
  title = 'Sin datos',
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6
      bg-surface-muted/50 rounded-xl border-2 border-dashed border-[#DBEAFE] ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-primary" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

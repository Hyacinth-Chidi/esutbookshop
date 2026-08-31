/**
 * ============================================
 * STATS CARD COMPONENT
 * ============================================
 * Dashboard statistics card - Mobile responsive
 */

export default function StatsCard({ title, value, icon: Icon, color = 'primary' }: { title: string, value: string | number, icon: any, color?: 'primary' | 'success' | 'warning' | 'error' | 'info' }) {
  const colorStyles = {
    primary: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      hoverShadow: 'hover:shadow-primary/20',
      border: 'border-primary/20',
    },
    success: {
      bg: 'bg-success/10',
      icon: 'text-success',
      hoverShadow: 'hover:shadow-success/20',
      border: 'border-success/20',
    },
    warning: {
      bg: 'bg-warning/10',
      icon: 'text-warning',
      hoverShadow: 'hover:shadow-warning/20',
      border: 'border-warning/20',
    },
    error: {
      bg: 'bg-error/10',
      icon: 'text-error',
      hoverShadow: 'hover:shadow-error/20',
      border: 'border-error/20',
    },
    info: {
      bg: 'bg-info/10',
      icon: 'text-info',
      hoverShadow: 'hover:shadow-info/20',
      border: 'border-info/20',
    },
  };

  const style = colorStyles[color];

  return (
    <div className={`relative overflow-hidden bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-sm hover:shadow-lg ${style.hoverShadow} transition-all duration-300 hover:-translate-y-1 border border-neutral-100 group`}>
      {/* Decorative subtle background gradient blob */}
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-30 ${style.bg} transition-opacity duration-300 group-hover:opacity-50`} />

      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} border ${style.border} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${style.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-wider truncate mb-0.5">{title}</p>
          <p className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
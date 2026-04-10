/**
 * Badge Component - TrybeTickets
 * Small label for categories, tags, and status indicators
 */

export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  ...rest 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const variantStyles = {
    default: 'bg-gray-100 text-[#454040]',
    yellow: 'bg-[#E6F082] text-[#2d2a28]',
    purple: 'bg-[#a855f7] text-white',
    dark: 'bg-[#454040] text-white',
    outline: 'border-2 border-[#454040] text-[#454040]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  
  const classes = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}

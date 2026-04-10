/**
 * Button Component - TrybeTickets
 * Simple, reusable button with variants
 */

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  children,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) {
  // Base styles
  const baseStyles = 'font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Size variants
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  // Color variants
  const variantStyles = {
    primary: 'bg-[#E6F082] text-[#2d2a28] hover:bg-[#D8D365]',
    purple: 'bg-[#a855f7] text-white hover:bg-[#9333ea]',
    dark: 'bg-[#454040] text-white hover:bg-[#2d2a28]',
    outline: 'border-2 border-[#454040] text-[#454040] hover:bg-[#454040] hover:text-white',
    ghost: 'text-[#454040] hover:bg-gray-100',
  };
  
  const classes = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  );
}

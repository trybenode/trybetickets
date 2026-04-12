/**
 * Card Component - TrybeTickets
 * Simple, reusable card container
 */

export default function Card({ 
  children, 
  className = '',
  hover = false,
  padding = 'md',
  ...rest 
}) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: 'p-0',
  };

  const classes = `
    bg-white 
    rounded-lg 
    border 
    border-gray-200 
    ${paddingStyles[padding]}
    ${hover ? 'hover:shadow-lg transition-shadow' : 'shadow-md'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

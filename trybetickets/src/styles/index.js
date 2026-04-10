/**
 * TrybeTickets Design System - Main Export
 * 
 * Central export for all design system tokens and utilities
 * Usage: import { colors, textStyles } from '@/styles'
 */

export { colors, cssVariables, default as colorSystem } from './colors';
export {
  fontFamilies,
  fontWeights,
  fontSizes,
  textStyles,
  typographyCssVariables,
  getTextClass,
  default as typography,
} from './typography';

/**
 * Utility: Combine class names conditionally
 * @param {...(string|false|null|undefined)} classes - Class names to combine
 * @returns {string} Combined class names
 * 
 * @example
 * cn('btn', isActive && 'active', 'btn-primary') // 'btn active btn-primary'
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Utility: Get responsive text style classes
 * @param {string} variant - Text style variant (e.g., 'h1', 'body-base')
 * @param {string} additionalClasses - Additional Tailwind classes
 * @returns {string} Combined class string
 * 
 * @example
 * getTextStyle('h1', 'text-brand-500 mb-4') // 'text-3xl md:text-4xl ... text-brand-500 mb-4'
 */
export const getTextStyle = (variant, additionalClasses = '') => {
  return cn(textStyles[variant], additionalClasses);
};

/**
 * Utility: Get role badge styles
 * @param {'admin'|'organizer'|'user'} role - User role
 * @returns {string} Badge class string
 * 
 * @example
 * getRoleBadgeStyle('admin') // Classes for admin badge styling
 */
export const getRoleBadgeStyle = (role) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider';
  
  const roleStyles = {
    admin: 'bg-warning-100 text-warning-900 border border-warning-400',
    organizer: 'bg-brand-200 text-brand-900 border border-brand-400',
    user: 'bg-info-100 text-info-900 border border-info-400',
  };
  
  return cn(baseClasses, roleStyles[role]);
};

/**
 * Utility: Get ticket status badge styles
 * @param {'valid'|'used'|'cancelled'} status - Ticket status
 * @returns {string} Badge class string
 * 
 * @example
 * getTicketStatusStyle('valid') // Classes for valid ticket badge
 */
export const getTicketStatusStyle = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider';
  
  const statusStyles = {
    valid: 'bg-success-100 text-success-900 border border-success-400',
    used: 'bg-neutral-100 text-neutral-600 border border-neutral-300',
    cancelled: 'bg-error-100 text-error-900 border border-error-400',
  };
  
  return cn(baseClasses, statusStyles[status]);
};

/**
 * Utility: Get event status badge styles
 * @param {'active'|'completed'|'cancelled'} status - Event status
 * @returns {string} Badge class string
 * 
 * @example
 * getEventStatusStyle('active') // Classes for active event badge
 */
export const getEventStatusStyle = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider';
  
  const statusStyles = {
    active: 'bg-success-100 text-success-900 border border-success-400',
    completed: 'bg-info-100 text-info-900 border border-info-400',
    cancelled: 'bg-error-100 text-error-900 border border-error-400',
  };
  
  return cn(baseClasses, statusStyles[status]);
};

/**
 * Utility: Get button variant styles
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant - Button variant
 * @param {'sm'|'md'|'lg'} size - Button size
 * @returns {string} Button class string
 */
export const getButtonStyle = (variant = 'primary', size = 'md') => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const variantStyles = {
    primary: 'bg-brand-500 text-neutral-900 hover:bg-brand-600 active:bg-brand-700 focus-visible:ring-brand-500',
    secondary: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 focus-visible:ring-accent-500',
    outline: 'border-2 border-brand-500 text-brand-700 hover:bg-brand-50 active:bg-brand-100 focus-visible:ring-brand-500',
    ghost: 'text-brand-700 hover:bg-brand-50 active:bg-brand-100 focus-visible:ring-brand-500',
    danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus-visible:ring-error-500',
  };
  
  return cn(baseClasses, sizeStyles[size], variantStyles[variant]);
};

/**
 * Utility: Get card styles
 * @param {boolean} interactive - Whether the card is interactive (hoverable)
 * @returns {string} Card class string
 */
export const getCardStyle = (interactive = false) => {
  const baseClasses = 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-md';
  const interactiveClasses = interactive 
    ? 'hover:shadow-lg hover:border-brand-300 transition-all duration-200 cursor-pointer'
    : '';
  
  return cn(baseClasses, interactiveClasses);
};

/**
 * Utility: Get input field styles
 * @param {boolean} hasError - Whether the input has an error
 * @returns {string} Input class string
 */
export const getInputStyle = (hasError = false) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const errorClasses = hasError
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
    : 'border-neutral-300 focus:border-brand-500 focus:ring-brand-500';
  
  return cn(baseClasses, errorClasses);
};

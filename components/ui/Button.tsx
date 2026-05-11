// =============================================
// Button Component
// =============================================
// Reusable button with variants and sizes

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

// Button variants for different styles
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Style mappings for variants
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white border-primary-dark hover:bg-primary-dark shadow-[3px_3px_0_rgba(91,33,182,0.28)]',
  secondary: 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200 shadow-[2px_2px_0_rgba(31,41,55,0.12)]',
  outline: 'bg-white border-primary text-primary hover:bg-primary hover:text-white shadow-[2px_2px_0_rgba(124,58,237,0.2)]',
  ghost: 'bg-transparent border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger: 'bg-red-500 text-white border-red-700 hover:bg-red-600 shadow-[3px_3px_0_rgba(153,27,27,0.24)]',
};

// Style mappings for sizes
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold border-2',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Custom classes
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Left icon */}
        {!isLoading && leftIcon && <span>{leftIcon}</span>}
        
        {/* Button text */}
        <span>{children}</span>
        
        {/* Right icon */}
        {rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

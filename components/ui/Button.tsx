// =============================================
// Button Component
// =============================================
// Reusable button with variants and sizes

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

// Button variants for different styles
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Squishy clay variants: gradient fill + hard bottom ledge that
// compresses on press (paired with .btn-squish translate)
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-primary-light to-primary text-white border-transparent ' +
    'shadow-[0_6px_0_#5b21b6,0_14px_20px_-8px_rgba(124,58,237,0.5),inset_0_2px_4px_rgba(255,255,255,0.5)] ' +
    'hover:brightness-105 ' +
    'active:shadow-[0_2px_0_#5b21b6,0_8px_12px_-6px_rgba(124,58,237,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)]',
  secondary:
    'bg-white text-ink border-transparent ' +
    'shadow-[0_6px_0_#d8ccf3,0_14px_20px_-8px_rgba(124,58,237,0.25),inset_0_2px_4px_rgba(255,255,255,0.9)] ' +
    'hover:bg-[#faf7ff] ' +
    'active:shadow-[0_2px_0_#d8ccf3,0_8px_12px_-6px_rgba(124,58,237,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)]',
  outline:
    'bg-white text-primary border-transparent ' +
    'shadow-[0_6px_0_#d8ccf3,0_14px_20px_-8px_rgba(124,58,237,0.25),inset_0_2px_4px_rgba(255,255,255,0.9)] ' +
    'hover:bg-[#faf7ff] ' +
    'active:shadow-[0_2px_0_#d8ccf3,0_8px_12px_-6px_rgba(124,58,237,0.2),inset_0_2px_4px_rgba(255,255,255,0.9)]',
  ghost: 'bg-transparent border-transparent text-ink-soft hover:bg-primary/5 hover:text-ink',
  danger:
    'bg-gradient-to-b from-[#fb9a9a] to-[#ef4444] text-white border-transparent ' +
    'shadow-[0_6px_0_#b91c1c,0_14px_20px_-8px_rgba(239,68,68,0.5),inset_0_2px_4px_rgba(255,255,255,0.5)] ' +
    'hover:brightness-105 ' +
    'active:shadow-[0_2px_0_#b91c1c,0_8px_12px_-6px_rgba(239,68,68,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)]',
  success:
    'bg-gradient-to-b from-[#4ade80] to-success text-white border-transparent ' +
    'shadow-[0_6px_0_#15803d,0_14px_20px_-8px_rgba(34,197,94,0.5),inset_0_2px_4px_rgba(255,255,255,0.5)] ' +
    'hover:brightness-105 ' +
    'active:shadow-[0_2px_0_#15803d,0_8px_12px_-6px_rgba(34,197,94,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)]',
};

// Style mappings for sizes
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
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
          // Base styles: pill shape + squishy press-down
          'btn-squish inline-flex items-center justify-center gap-2 rounded-full font-bold border-2 tracking-wide',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:transform-none',
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

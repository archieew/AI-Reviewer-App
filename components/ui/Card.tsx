// =============================================
// Card Component
// =============================================
// Flexible card container with variants

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantStyles = {
      default: 'bg-white shadow-sm',
      elevated: 'bg-white shadow-lg',
      outlined: 'bg-white border border-gray-200',
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-2xl',
          // Variant styles
          variantStyles[variant],
          // Padding styles
          paddingStyles[padding],
          // Hover effect
          hover && 'transition-transform duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer',
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header subcomponent
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title subcomponent
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold text-gray-900', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description subcomponent
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 mt-1', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content subcomponent
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

// Card Footer subcomponent
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-4 flex items-center', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export default Card;

import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-zinc-900 shadow-sm',
    elevated: 'bg-white dark:bg-zinc-900 shadow-lg hover:shadow-xl transition-shadow duration-300',
    outline: 'bg-transparent border border-border hover:shadow-md transition-shadow duration-300',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 relative overflow-hidden',
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Decorative corner circles */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-full pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-border', className)} {...props}>
      {children}
    </div>
  );
}

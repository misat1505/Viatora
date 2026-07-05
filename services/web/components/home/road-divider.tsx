import { cn } from '@/lib/utils';

interface RoadDividerProps {
  className?: string;
}

export function RoadDivider({ className }: RoadDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('h-0.75 w-full shrink-0 text-border', className)}
      style={{
        backgroundImage:
          'repeating-linear-gradient(to right, currentColor 0, currentColor 28px, transparent 28px, transparent 48px)',
      }}
    />
  );
}

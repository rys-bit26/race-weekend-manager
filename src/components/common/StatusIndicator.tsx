import type { ActivityStatus } from '../../types/activity';

interface StatusIndicatorProps {
  status: ActivityStatus;
  showLabel?: boolean;
}

export function StatusIndicator({ status, showLabel }: StatusIndicatorProps) {
  const isConfirmed = status === 'confirmed';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${
          isConfirmed ? 'bg-green-500' : 'bg-amber-400 animate-pulse'
        }`}
      />
      {showLabel && (
        <span
          className={`text-xs font-medium ${
            isConfirmed ? 'text-green-700' : 'text-amber-600'
          }`}
        >
          {isConfirmed ? 'Confirmed' : 'Pending'}
        </span>
      )}
    </span>
  );
}

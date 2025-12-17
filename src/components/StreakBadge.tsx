import { Flame, Snowflake } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';

export function StreakBadge() {
  const { streakData, loading } = useStreak();

  if (loading || !streakData) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-semibold text-orange-600">{streakData.current_streak}</span>
      </div>
      {streakData.freeze_count > 0 && (
        <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
          <Snowflake className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{streakData.freeze_count}</span>
        </div>
      )}
    </div>
  );
}

import { ScanResult } from '@/types/scan';
import { cn } from '@/lib/utils';

interface SugarBreakdownProps {
  scan: ScanResult;
}

export function SugarBreakdown({ scan }: SugarBreakdownProps) {
  const dailyLimit = 30; // average recommended daily limit
  const percentage = Math.min((scan.total_sugar_grams / dailyLimit) * 100, 100);

  const ratingColors = {
    low: 'bg-sugar-low',
    moderate: 'bg-sugar-moderate',
    high: 'bg-sugar-high',
  };

  return (
    <div className="space-y-6">
      {/* Total Sugar Circle */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(percentage / 100) * 352} 352`}
              strokeLinecap="round"
              className={cn(
                scan.health_rating === 'low' && 'text-sugar-low',
                scan.health_rating === 'moderate' && 'text-sugar-moderate',
                scan.health_rating === 'high' && 'text-sugar-high'
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {scan.total_sugar_grams}g
            </span>
            <span className="text-xs text-muted-foreground">total sugar</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {scan.daily_limit_percentage?.toFixed(0) ?? percentage.toFixed(0)}% of daily limit
        </p>
      </div>

      {/* Sugar Type Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Sugar Breakdown</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sugar-low" />
              <span className="text-sm text-muted-foreground">Natural Sugar</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {scan.natural_sugar_grams ?? 0}g
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sugar-high" />
              <span className="text-sm text-muted-foreground">Added Sugar</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {scan.added_sugar_grams ?? 0}g
            </span>
          </div>
        </div>

        {/* Visual bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          {scan.natural_sugar_grams && scan.natural_sugar_grams > 0 && (
            <div 
              className="bg-sugar-low transition-all"
              style={{ 
                width: `${(scan.natural_sugar_grams / scan.total_sugar_grams) * 100}%` 
              }}
            />
          )}
          {scan.added_sugar_grams && scan.added_sugar_grams > 0 && (
            <div 
              className="bg-sugar-high transition-all"
              style={{ 
                width: `${(scan.added_sugar_grams / scan.total_sugar_grams) * 100}%` 
              }}
            />
          )}
        </div>
      </div>

      {/* Health Rating */}
      <div className="p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', ratingColors[scan.health_rating])}>
            {scan.health_rating === 'low' && (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {scan.health_rating === 'moderate' && (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
            )}
            {scan.health_rating === 'high' && (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground capitalize">
              {scan.health_rating} Sugar Content
            </p>
            <p className="text-sm text-muted-foreground">
              {scan.health_rating === 'low' && 'Great choice for your health!'}
              {scan.health_rating === 'moderate' && 'Enjoy in moderation.'}
              {scan.health_rating === 'high' && 'Consider a lower-sugar option.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

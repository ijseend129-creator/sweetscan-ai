import { ScanResult } from '@/types/scan';
import { cn } from '@/lib/utils';
import { Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ScanCardProps {
  scan: ScanResult;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export function ScanCard({ scan, onDelete, onClick }: ScanCardProps) {
  const ratingColors = {
    low: 'bg-sugar-low',
    moderate: 'bg-sugar-moderate',
    high: 'bg-sugar-high',
  };

  const ratingLabels = {
    low: 'Low Sugar',
    moderate: 'Moderate',
    high: 'High Sugar',
  };

  return (
    <div 
      className="bg-card rounded-xl shadow-card overflow-hidden animate-fade-in cursor-pointer hover:shadow-soft transition-shadow"
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={scan.image_url}
            alt={scan.food_name}
            className="w-full h-full object-cover"
          />
          <div 
            className={cn(
              'absolute bottom-1 right-1 w-3 h-3 rounded-full',
              ratingColors[scan.health_rating]
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {scan.food_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(scan.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground">
                {scan.total_sugar_grams}g
              </span>
              <span className="text-xs text-muted-foreground">sugar</span>
            </div>
            <span 
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground',
                ratingColors[scan.health_rating]
              )}
            >
              {ratingLabels[scan.health_rating]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

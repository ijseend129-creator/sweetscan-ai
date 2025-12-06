import { Camera, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  showScanButton?: boolean;
}

export function EmptyState({ title, description, showScanButton = true }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Scan className="w-10 h-10 text-primary" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>
      
      {showScanButton && (
        <Button asChild className="gradient-primary shadow-soft">
          <Link to="/scan">
            <Camera className="w-4 h-4 mr-2" />
            Scan Your First Food
          </Link>
        </Button>
      )}
    </div>
  );
}

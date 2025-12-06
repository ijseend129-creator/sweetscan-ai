import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useScans } from '@/hooks/useScans';
import { BottomNav } from '@/components/BottomNav';
import { PhotoCapture } from '@/components/PhotoCapture';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Scan() {
  const { user, loading: authLoading } = useAuth();
  const { scanFood, isScanning, scanningStep } = useScans();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCapture = async (file: File) => {
    try {
      const scan = await scanFood(file);
      toast.success('Analysis complete!');
      navigate(`/scan/${scan.id}`);
    } catch (error) {
      console.error('Scan error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else if (error.message.includes('credits')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error(error.message || 'Failed to analyze food');
        }
      } else {
        toast.error('Failed to analyze food');
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Scan Food</h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <PhotoCapture
          onCapture={handleCapture}
          isAnalyzing={isScanning}
          analyzeStep={scanningStep}
        />
      </main>

      <BottomNav />
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useScans } from '@/hooks/useScans';
import { BottomNav } from '@/components/BottomNav';
import { SugarBreakdown } from '@/components/SugarBreakdown';
import { HealthierAlternatives } from '@/components/HealthierAlternatives';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScanDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { scans, isLoading, deleteScan } = useScans();
  const navigate = useNavigate();

  const scan = scans.find((s) => s.id === id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleDelete = () => {
    if (scan) {
      deleteScan(scan.id);
      navigate('/');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Scan not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground truncate max-w-[200px]">
              {scan.food_name}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Food Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-card">
          <img
            src={scan.image_url}
            alt={scan.food_name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Sugar Breakdown */}
        <section className="bg-card rounded-2xl p-5 shadow-card">
          <h2 className="font-semibold text-foreground mb-4">Sugar Analysis</h2>
          <SugarBreakdown scan={scan} />
        </section>

        {/* Context & Alternatives */}
        <section className="bg-card rounded-2xl p-5 shadow-card">
          <HealthierAlternatives
            alternatives={scan.healthier_alternatives}
            context={scan.nutritional_context}
          />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

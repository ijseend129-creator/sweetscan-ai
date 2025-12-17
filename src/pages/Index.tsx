import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useScans } from '@/hooks/useScans';
import { BottomNav } from '@/components/BottomNav';
import { ScanCard } from '@/components/ScanCard';
import { EmptyState } from '@/components/EmptyState';
import { StreakBadge } from '@/components/StreakBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Scan, TrendingUp, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { scans, isLoading: scansLoading, deleteScan } = useScans();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Calculate stats
  const todayScans = scans.filter(
    (scan) => new Date(scan.created_at).toDateString() === new Date().toDateString()
  );
  const totalSugarToday = todayScans.reduce((sum, scan) => sum + scan.total_sugar_grams, 0);
  const recentScans = scans.slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary shadow-soft flex items-center justify-center">
                <Scan className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">SweetScan</h1>
                <p className="text-sm text-muted-foreground">Track your sugar intake</p>
              </div>
            </div>
            <StreakBadge />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Today's Summary */}
        <section className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Today's Summary</h2>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{todayScans.length}</p>
              <p className="text-sm text-muted-foreground">Scans Today</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{totalSugarToday.toFixed(0)}g</p>
              <p className="text-sm text-muted-foreground">Total Sugar</p>
            </div>
          </div>

          {/* Daily limit progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Daily limit (30g)</span>
              <span className="font-medium text-foreground">
                {Math.min((totalSugarToday / 30) * 100, 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${
                  totalSugarToday <= 15
                    ? 'bg-sugar-low'
                    : totalSugarToday <= 30
                    ? 'bg-sugar-moderate'
                    : 'bg-sugar-high'
                }`}
                style={{ width: `${Math.min((totalSugarToday / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
        </section>

        {/* Quick Scan Button */}
        <Button asChild className="w-full h-14 gradient-primary shadow-soft text-lg">
          <Link to="/scan">
            <Camera className="w-5 h-5 mr-2" />
            Scan Food
          </Link>
        </Button>

        {/* Recent Scans */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Scans</h2>
            {scans.length > 5 && (
              <Link to="/history" className="text-sm text-primary font-medium">
                View All
              </Link>
            )}
          </div>

          {scansLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : recentScans.length === 0 ? (
            <EmptyState
              title="No scans yet"
              description="Take a photo of your food to analyze its sugar content"
            />
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <ScanCard
                  key={scan.id}
                  scan={scan}
                  onDelete={deleteScan}
                  onClick={() => navigate(`/scan/${scan.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

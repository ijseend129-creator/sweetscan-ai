import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useScans } from '@/hooks/useScans';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { LogOut, User, BarChart3, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { scans } = useScans();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const totalScans = scans.length;
  const totalSugar = scans.reduce((sum, scan) => sum + scan.total_sugar_grams, 0);
  const avgSugar = totalScans > 0 ? totalSugar / totalScans : 0;

  const lowSugarScans = scans.filter((s) => s.health_rating === 'low').length;
  const lowSugarPercentage = totalScans > 0 ? (lowSugarScans / totalScans) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-xl font-display font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        <section className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {user.user_metadata?.display_name || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Your Stats</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{totalScans}</p>
              <p className="text-sm text-muted-foreground">Total Scans</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{avgSugar.toFixed(1)}g</p>
              <p className="text-sm text-muted-foreground">Avg Sugar/Scan</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center col-span-2">
              <p className="text-2xl font-bold text-sugar-low">{lowSugarPercentage.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Low Sugar Choices</p>
            </div>
          </div>
        </section>

        {/* Member Since */}
        <section className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium text-foreground">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStreak } from '@/hooks/useStreak';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Snowflake, Coins, Flame } from 'lucide-react';

export default function Shop() {
  const { user, loading: authLoading } = useAuth();
  const { streakData, loading: streakLoading, buyFreeze, FREEZE_COST } = useStreak();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || streakLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-xl font-display font-bold text-foreground">Shop</h1>
          <div className="flex items-center gap-2 mt-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-foreground">{streakData?.coins || 0} coins</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Current Streak Info */}
        <section className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{streakData?.current_streak || 0} days</p>
              <p className="text-sm text-muted-foreground">Current streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Snowflake className="w-4 h-4 text-primary" />
            <span>{streakData?.freeze_count || 0} streak freezes available</span>
          </div>
        </section>

        {/* How to earn coins */}
        <section className="bg-muted/30 rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-3">How to earn coins</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Stay under {25}g sugar daily = +10 coins
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Maintain your streak to keep earning!
            </li>
          </ul>
        </section>

        {/* Shop Items */}
        <section>
          <h2 className="font-semibold text-foreground mb-4">Available Items</h2>
          
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Snowflake className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Streak Freeze</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Protects your streak for one day if you go over the sugar limit.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-foreground">{FREEZE_COST} coins</span>
                </div>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={buyFreeze}
              disabled={(streakData?.coins || 0) < FREEZE_COST}
            >
              {(streakData?.coins || 0) < FREEZE_COST 
                ? `Need ${FREEZE_COST - (streakData?.coins || 0)} more coins`
                : 'Buy Streak Freeze'
              }
            </Button>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useScans } from './useScans';
import { toast } from 'sonner';

const DAILY_SUGAR_LIMIT = 25; // grams
const FREEZE_COST = 50; // coins

interface StreakData {
  current_streak: number;
  longest_streak: number;
  freeze_count: number;
  coins: number;
  last_check_date: string | null;
}

export function useStreak() {
  const { user } = useAuth();
  const { scans } = useScans();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching streak:', error);
      return;
    }

    if (!data) {
      // Create initial streak record
      const { data: newData, error: insertError } = await supabase
        .from('user_streaks')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating streak:', insertError);
        return;
      }
      setStreakData(newData);
    } else {
      setStreakData(data);
    }
    setLoading(false);
  };

  const checkAndUpdateStreak = async () => {
    if (!user || !streakData) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Already checked today
    if (streakData.last_check_date === today) return;

    // Calculate yesterday's sugar intake
    const yesterdayScans = scans.filter(scan => {
      const scanDate = new Date(scan.created_at).toISOString().split('T')[0];
      return scanDate === yesterday;
    });

    const yesterdaySugar = yesterdayScans.reduce((sum, scan) => sum + scan.total_sugar_grams, 0);
    const wasUnderLimit = yesterdaySugar < DAILY_SUGAR_LIMIT;

    let newStreak = streakData.current_streak;
    let newFreezeCount = streakData.freeze_count;
    let newCoins = streakData.coins;

    if (wasUnderLimit) {
      // Stayed under limit - increment streak and earn coins
      newStreak += 1;
      newCoins += 10; // Earn 10 coins per successful day
    } else if (newFreezeCount > 0) {
      // Over limit but has freeze - use it
      newFreezeCount -= 1;
      toast.info('Streak freeze used! Your streak is protected.');
    } else if (streakData.last_check_date) {
      // Over limit and no freeze - reset streak
      newStreak = 0;
      toast.error('Streak lost! Stay under the daily limit to rebuild it.');
    }

    const newLongest = Math.max(streakData.longest_streak, newStreak);

    const { error } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        freeze_count: newFreezeCount,
        coins: newCoins,
        last_check_date: today,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating streak:', error);
      return;
    }

    setStreakData({
      ...streakData,
      current_streak: newStreak,
      longest_streak: newLongest,
      freeze_count: newFreezeCount,
      coins: newCoins,
      last_check_date: today,
    });
  };

  const buyFreeze = async () => {
    if (!user || !streakData) return false;

    if (streakData.coins < FREEZE_COST) {
      toast.error(`Not enough coins! You need ${FREEZE_COST} coins.`);
      return false;
    }

    const { error } = await supabase
      .from('user_streaks')
      .update({
        freeze_count: streakData.freeze_count + 1,
        coins: streakData.coins - FREEZE_COST,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error buying freeze:', error);
      toast.error('Failed to purchase streak freeze');
      return false;
    }

    setStreakData({
      ...streakData,
      freeze_count: streakData.freeze_count + 1,
      coins: streakData.coins - FREEZE_COST,
    });

    toast.success('Streak freeze purchased!');
    return true;
  };

  useEffect(() => {
    fetchStreak();
  }, [user]);

  useEffect(() => {
    if (streakData && scans.length >= 0) {
      checkAndUpdateStreak();
    }
  }, [streakData, scans]);

  return {
    streakData,
    loading,
    buyFreeze,
    DAILY_SUGAR_LIMIT,
    FREEZE_COST,
  };
}

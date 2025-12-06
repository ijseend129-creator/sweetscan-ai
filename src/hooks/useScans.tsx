import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScanResult, AIAnalysisResult } from '@/types/scan';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useScans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: scans, isLoading } = useQuery({
    queryKey: ['scans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ScanResult[];
    },
    enabled: !!user,
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!user) throw new Error('Must be logged in');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fileName);

      return publicUrl;
    },
  });

  const analyzeFoodMutation = useMutation({
    mutationFn: async (imageUrl: string): Promise<AIAnalysisResult> => {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageUrl },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data.analysis;
    },
  });

  const saveScanMutation = useMutation({
    mutationFn: async ({
      imageUrl,
      analysis,
    }: {
      imageUrl: string;
      analysis: AIAnalysisResult;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const insertData = {
        user_id: user.id,
        image_url: imageUrl,
        food_name: analysis.food_name,
        total_sugar_grams: analysis.total_sugar_grams,
        natural_sugar_grams: analysis.natural_sugar_grams,
        added_sugar_grams: analysis.added_sugar_grams,
        health_rating: analysis.health_rating,
        daily_limit_percentage: analysis.daily_limit_percentage,
        nutritional_context: analysis.nutritional_context,
        healthier_alternatives: analysis.healthier_alternatives,
      };

      const { data, error } = await supabase
        .from('scans')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });

  const deleteScanMutation = useMutation({
    mutationFn: async (scanId: string) => {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      toast.success('Scan deleted');
    },
    onError: () => {
      toast.error('Failed to delete scan');
    },
  });

  const scanFood = async (file: File) => {
    try {
      const imageUrl = await uploadImageMutation.mutateAsync(file);
      const analysis = await analyzeFoodMutation.mutateAsync(imageUrl);
      const scan = await saveScanMutation.mutateAsync({ imageUrl, analysis });
      return scan;
    } catch (error) {
      throw error;
    }
  };

  return {
    scans: scans ?? [],
    isLoading,
    scanFood,
    deleteScan: deleteScanMutation.mutate,
    isScanning: uploadImageMutation.isPending || analyzeFoodMutation.isPending || saveScanMutation.isPending,
    scanningStep: uploadImageMutation.isPending 
      ? 'uploading' 
      : analyzeFoodMutation.isPending 
        ? 'analyzing' 
        : saveScanMutation.isPending 
          ? 'saving' 
          : null,
  };
}

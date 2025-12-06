export interface ScanResult {
  id: string;
  user_id: string;
  image_url: string;
  food_name: string;
  total_sugar_grams: number;
  natural_sugar_grams: number | null;
  added_sugar_grams: number | null;
  health_rating: 'low' | 'moderate' | 'high';
  daily_limit_percentage: number | null;
  nutritional_context: string | null;
  healthier_alternatives: string[] | null;
  raw_analysis: Record<string, unknown> | null;
  created_at: string;
}

export interface AIAnalysisResult {
  food_name: string;
  total_sugar_grams: number;
  natural_sugar_grams: number;
  added_sugar_grams: number;
  health_rating: 'low' | 'moderate' | 'high';
  daily_limit_percentage: number;
  nutritional_context: string;
  healthier_alternatives: string[];
}

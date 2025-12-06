-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create scans table for storing food analysis results
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  food_name TEXT NOT NULL,
  total_sugar_grams DECIMAL(10, 2) NOT NULL DEFAULT 0,
  natural_sugar_grams DECIMAL(10, 2) DEFAULT 0,
  added_sugar_grams DECIMAL(10, 2) DEFAULT 0,
  health_rating TEXT NOT NULL DEFAULT 'moderate',
  daily_limit_percentage DECIMAL(5, 2) DEFAULT 0,
  nutritional_context TEXT,
  healthier_alternatives TEXT[],
  raw_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scans
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Scans RLS policies
CREATE POLICY "Users can view their own scans"
  ON public.scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON public.scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans"
  ON public.scans FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true);

-- Storage policies for food images
CREATE POLICY "Users can upload their own food images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view food images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'food-images');

CREATE POLICY "Users can delete their own food images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create enum for device status
CREATE TYPE public.device_status AS ENUM ('online', 'offline', 'maintenance');

-- Create enum for door status
CREATE TYPE public.door_status AS ENUM ('open', 'closed');

-- Create devices table
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status device_status NOT NULL DEFAULT 'offline',
  temperature NUMERIC(6,2) NOT NULL DEFAULT 0,
  humidity NUMERIC(5,2) NOT NULL DEFAULT 0,
  battery INTEGER NOT NULL DEFAULT 100,
  signal TEXT,
  door_status door_status NOT NULL DEFAULT 'closed',
  ai_insight TEXT,
  anomaly BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read devices
CREATE POLICY "Authenticated users can view devices"
  ON public.devices FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert devices
CREATE POLICY "Authenticated users can insert devices"
  ON public.devices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update devices
CREATE POLICY "Authenticated users can update devices"
  ON public.devices FOR UPDATE
  TO authenticated
  USING (true);

-- Allow public read for dashboard without login
CREATE POLICY "Public can view devices"
  ON public.devices FOR SELECT
  TO anon
  USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

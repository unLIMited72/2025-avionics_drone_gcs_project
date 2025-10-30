/*
  # Create drones tracking table

  1. New Tables
    - `drones`
      - `id` (uuid, primary key) - Unique identifier for each drone
      - `drone_id` (text, unique, not null) - External drone identifier/serial number
      - `name` (text) - Human-readable drone name
      - `status` (text, not null) - Connection status: 'connected', 'disconnected', 'error'
      - `last_heartbeat` (timestamptz) - Last time drone sent heartbeat
      - `battery_level` (integer) - Battery percentage (0-100)
      - `location_lat` (decimal) - Current latitude
      - `location_lon` (decimal) - Current longitude
      - `altitude` (decimal) - Current altitude in meters
      - `metadata` (jsonb) - Additional drone metadata
      - `created_at` (timestamptz) - When drone was first registered
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `drones` table
    - Add policy for authenticated users to read all drones
    - Add policy for authenticated users to insert/update drones

  3. Indexes
    - Index on `status` for fast filtering
    - Index on `last_heartbeat` for cleanup queries
*/

CREATE TABLE IF NOT EXISTS drones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id text UNIQUE NOT NULL,
  name text DEFAULT '',
  status text NOT NULL DEFAULT 'disconnected',
  last_heartbeat timestamptz DEFAULT now(),
  battery_level integer DEFAULT 100,
  location_lat decimal(10, 8) DEFAULT 0,
  location_lon decimal(11, 8) DEFAULT 0,
  altitude decimal(10, 2) DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add check constraint for status values
ALTER TABLE drones ADD CONSTRAINT drones_status_check 
  CHECK (status IN ('connected', 'disconnected', 'error'));

-- Add check constraint for battery level
ALTER TABLE drones ADD CONSTRAINT drones_battery_check 
  CHECK (battery_level >= 0 AND battery_level <= 100);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drones_status ON drones(status);
CREATE INDEX IF NOT EXISTS idx_drones_last_heartbeat ON drones(last_heartbeat);

-- Enable Row Level Security
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all drones
CREATE POLICY "Authenticated users can view all drones"
  ON drones
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert drones
CREATE POLICY "Authenticated users can insert drones"
  ON drones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update drones
CREATE POLICY "Authenticated users can update drones"
  ON drones
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete drones
CREATE POLICY "Authenticated users can delete drones"
  ON drones
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert some sample drones for testing
INSERT INTO drones (drone_id, name, status, battery_level, location_lat, location_lon, altitude) VALUES
  ('DRONE-001', 'Alpha Wing', 'connected', 95, 37.7749, -122.4194, 120.5),
  ('DRONE-002', 'Beta Hawk', 'connected', 87, 37.7750, -122.4195, 115.2),
  ('DRONE-003', 'Gamma Scout', 'connected', 92, 37.7751, -122.4196, 118.7),
  ('DRONE-004', 'Delta Eagle', 'connected', 78, 37.7752, -122.4197, 122.3),
  ('DRONE-005', 'Epsilon Falcon', 'connected', 88, 37.7753, -122.4198, 119.8),
  ('DRONE-006', 'Zeta Raven', 'connected', 91, 37.7754, -122.4199, 121.1),
  ('DRONE-007', 'Eta Phoenix', 'connected', 85, 37.7755, -122.4200, 117.9),
  ('DRONE-008', 'Theta Swift', 'connected', 89, 37.7756, -122.4201, 120.0),
  ('DRONE-009', 'Iota Sparrow', 'connected', 93, 37.7757, -122.4202, 116.5),
  ('DRONE-010', 'Kappa Condor', 'connected', 81, 37.7758, -122.4203, 123.4),
  ('DRONE-011', 'Lambda Osprey', 'connected', 86, 37.7759, -122.4204, 119.2),
  ('DRONE-012', 'Mu Kestrel', 'connected', 90, 37.7760, -122.4205, 118.0),
  ('DRONE-013', 'Nu Harrier', 'disconnected', 45, 37.7761, -122.4206, 0),
  ('DRONE-014', 'Xi Vulture', 'disconnected', 32, 37.7762, -122.4207, 0),
  ('DRONE-015', 'Omicron Albatross', 'error', 12, 37.7763, -122.4208, 0)
ON CONFLICT (drone_id) DO NOTHING;

export interface User {
  id: number
  first_name: string | null
  last_name: string | null
  name: string
  email: string
  phone: string | null
  status: string
  roles: string[]
  permissions: string[]
}

export interface ManagedUser {
  id: number
  first_name: string | null
  last_name: string | null
  name: string
  email: string
  phone: string | null
  status: string
  roles: { id: number; name: string }[]
  created_at: string
}

export interface Role {
  id: number
  name: string
}

export interface CrashReport {
  id: number
  crash_id: string | null
  txdot_id: string | null
  crash_date: string | null
  crash_time: string | null
  county: string | null
  city: string | null
  state: string | null
  street_address: string | null
  road_name: string | null
  intersection: string | null
  latitude: number | null
  longitude: number | null
  speed_limit: number | null
  total_units: number | null
  total_persons: number | null
  report_status: 'uploaded' | 'processing' | 'processed' | 'failed'
  processing_error: string | null
  victims_count?: number
  created_at: string
  vehicles?: CrashVehicle[]
  victims?: Victim[]
  documents?: CrashDocument[]
  creator?: { id: number; name: string; email: string } | null
}

export interface CrashVehicle {
  id: number
  unit_number: number | null
  vehicle_year: number | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  vin: string | null
  license_plate: string | null
  plate_state: string | null
  owner_name: string | null
  insurance_company: string | null
}

export interface CrashDocument {
  id: number
  document_type: string
  file_name: string
  file_size: number | null
  created_at: string
}

export interface Enrichment {
  id: number
  victim_id: number
  primary_phone: string | null
  secondary_phone: string | null
  primary_email: string | null
  secondary_email: string | null
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  tiktok_url: string | null
  occupation: string | null
  employer: string | null
  marital_status: string | null
  estimated_income: string | null
  property_owner: boolean | null
  confidence_score: number | null
  lookup_status: 'pending' | 'searching' | 'found' | 'partial' | 'not_found' | 'failed'
  last_lookup_at: string | null
}

export interface VictimNote {
  id: number
  note: string
  created_at: string
  user?: { id: number; name: string } | null
}

export interface VictimStatusEntry {
  id: number
  status: string
  reason: string | null
  created_at: string
  changed_by?: { id: number; name: string } | null
}

export interface EnrichmentSearch {
  id: number
  search_provider: string
  search_term: string | null
  status: string
  searched_at: string | null
  response_json: Record<string, unknown> | null
}

export interface Victim {
  id: number
  crash_report_id: number
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  full_name: string | null
  dob: string | null
  age: number | null
  gender: string | null
  driver_license_number: string | null
  driver_license_state: string | null
  street_address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  is_driver: boolean
  is_passenger: boolean
  injury_severity: string | null
  current_status: string
  enrichment?: Enrichment | null
  vehicle?: CrashVehicle | null
  crash_report?: Partial<CrashReport>
  notes?: VictimNote[]
  statuses?: VictimStatusEntry[]
  searches?: EnrichmentSearch[]
}

export interface Paginated<T> {
  data: T[]
  total: number
  current_page: number
  last_page: number
  per_page: number
}

export const VICTIM_STATUSES = [
  'NEW', 'PDF_EXTRACTED', 'LOOKUP_PENDING', 'LOOKUP_RUNNING', 'CONTACT_FOUND',
  'CONTACT_NOT_FOUND', 'READY_FOR_OUTREACH', 'CONTACTED', 'FOLLOW_UP',
  'SIGNED', 'CLOSED', 'REJECTED',
] as const

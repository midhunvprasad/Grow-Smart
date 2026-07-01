import { createClient } from '@supabase/supabase-js';
import { Zone, JournalEntry, Alert, Device } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' && 
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'your-supabase-anon-key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ========================================================
// MAPPERS FOR SNAKE_CASE <-> CAMELCASE
// ========================================================

export function mapZoneFromDb(db: any): Zone {
  return {
    id: db.id,
    name: db.name,
    crop: db.crop,
    status: db.status as 'Healthy' | 'Warning' | 'Critical',
    image: db.image || '',
    pH: Number(db.ph ?? 6.2),
    ec: Number(db.ec ?? 1.8),
    temp: Number(db.temp ?? 24.5),
    humidity: Number(db.humidity ?? 68),
    vpd: Number(db.vpd ?? 0.95),
    growthStage: db.growth_stage as any,
    history: {
      pH: (db.history_ph || []).map(Number),
      ec: (db.history_ec || []).map(Number),
      temp: (db.history_temp || []).map(Number),
      humidity: (db.history_humidity || []).map(Number)
    }
  };
}

export function mapZoneToDb(zone: Zone) {
  return {
    id: zone.id,
    name: zone.name,
    crop: zone.crop,
    status: zone.status,
    image: zone.image,
    ph: zone.pH,
    ec: zone.ec,
    temp: zone.temp,
    humidity: zone.humidity,
    vpd: zone.vpd,
    growth_stage: zone.growthStage,
    history_ph: zone.history.pH,
    history_ec: zone.history.ec,
    history_temp: zone.history.temp,
    history_humidity: zone.history.humidity
  };
}

export function mapJournalFromDb(db: any): JournalEntry {
  return {
    id: db.id,
    week: Number(db.week),
    dateRange: db.date_range,
    avgPh: Number(db.avg_ph),
    avgEc: Number(db.avg_ec),
    vpd: Number(db.vpd),
    growthStage: db.growth_stage as any,
    notes: db.notes,
    insight: db.insight,
    createdAt: db.created_at
  };
}

export function mapJournalToDb(entry: JournalEntry) {
  return {
    id: entry.id,
    week: entry.week,
    date_range: entry.dateRange,
    avg_ph: entry.avgPh,
    avg_ec: entry.avgEc,
    vpd: entry.vpd,
    growth_stage: entry.growthStage,
    notes: entry.notes,
    insight: entry.insight,
    created_at: entry.createdAt
  };
}

export function mapAlertFromDb(db: any): Alert {
  return {
    id: db.id,
    type: db.type,
    message: db.message,
    zone: db.zone,
    active: !!db.active
  };
}

export function mapAlertToDb(alert: Alert) {
  return {
    id: alert.id,
    type: alert.type,
    message: alert.message,
    zone: alert.zone,
    active: alert.active
  };
}

// ========================================================
// SELF-HEALING DATABASE SYSTEM (FOR CUSTOM/OUT-OF-SYNC SCHEMAS)
// ========================================================

const unsupportedColumns: Record<string, Set<string>> = {
  zones: new Set<string>(),
  journal_entries: new Set<string>(),
  alerts: new Set<string>(),
  devices: new Set<string>()
};

function parseMissingColumnError(table: string, err: any): string | null {
  if (!err) return null;
  const message = String(err.message || err.details || err || '');
  
  // PostgREST pattern: "Could not find the 'history_ec' column of 'zones' in the schema cache"
  const postgrestMatch = message.match(/Could not find the '([^']+)' column/i);
  if (postgrestMatch) return postgrestMatch[1];
  
  // PostgreSQL pattern: "column "history_ec" of relation "zones" does not exist"
  const postgresMatch = message.match(/column "([^"]+)" of relation/i);
  if (postgresMatch) return postgresMatch[1];

  // SQL pattern: "column zones.created_at does not exist"
  const sqlMatch = message.match(/column [a-zA-Z0-9_]+\.([a-zA-Z0-9_]+) does not exist/i);
  if (sqlMatch) return sqlMatch[1];
  
  return null;
}

function filterSupportedFields(table: string, dbRow: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {};
  const unsupp = unsupportedColumns[table] || new Set<string>();
  for (const [key, value] of Object.entries(dbRow)) {
    if (!unsupp.has(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

function isRlsPolicyViolation(err: any): boolean {
  if (!err) return false;
  const message = String(err.message || err.details || err || '');
  return message.toLowerCase().includes('row-level security') || 
         message.toLowerCase().includes('row-level security policy') ||
         message.toLowerCase().includes('violates row-level security');
}

// ========================================================
// DATA ACCESS SYNC WRAPPER FUNCTIONS (WITH FALLBACKS)
// ========================================================

// 1. ZONES SYNC
export async function getZones(fallbackData: Zone[]): Promise<Zone[]> {
  if (!supabase) return fallbackData;
  let attempt = 0;
  while (attempt < 5) {
    try {
      let query = supabase.from('zones').select('*');
      
      const unsupp = unsupportedColumns.zones;
      if (!unsupp.has('created_at')) {
        query = query.order('created_at', { ascending: true });
      } else if (!unsupp.has('updated_at')) {
        query = query.order('updated_at', { ascending: true });
      } else {
        query = query.order('id', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        return data.map(mapZoneFromDb);
      }
      return [];
    } catch (err: any) {
      const missingCol = parseMissingColumnError('zones', err);
      if (missingCol) {
        console.warn(`[Self-Healing] Column '${missingCol}' not supported on zones table. Adding to blocklist and retrying.`);
        unsupportedColumns.zones.add(missingCol);
        attempt++;
      } else {
        console.warn('Supabase getZones failed, falling back to local state:', err);
        return fallbackData;
      }
    }
  }
  return fallbackData;
}

export async function upsertZone(zone: Zone): Promise<void> {
  if (!supabase) return;
  let attempt = 0;
  while (attempt < 8) {
    try {
      const dbRow = mapZoneToDb(zone);
      const filteredRow = filterSupportedFields('zones', dbRow);
      
      const { error } = await supabase
        .from('zones')
        .upsert(filteredRow, { onConflict: 'id' });
      
      if (error) throw error;
      return; // Success!
    } catch (err: any) {
      const missingCol = parseMissingColumnError('zones', err);
      if (missingCol) {
        console.warn(`[Self-Healing] Excluding column '${missingCol}' from zones upsert.`);
        unsupportedColumns.zones.add(missingCol);
        attempt++;
      } else if (isRlsPolicyViolation(err)) {
        console.warn('[Supabase RLS Help] RLS Policy violation on table \'zones\'. To allow public writes, execute the SQL policies defined in \'supabase_schema.sql\' in your Supabase dashboard.');
        return;
      } else {
        console.error('Supabase upsertZone failed:', err);
        return;
      }
    }
  }
}

// 2. JOURNAL SYNC
export async function getJournalEntries(fallbackData: JournalEntry[]): Promise<JournalEntry[]> {
  if (!supabase) return fallbackData;
  let attempt = 0;
  while (attempt < 5) {
    try {
      let query = supabase.from('journal_entries').select('*');
      
      const unsupp = unsupportedColumns.journal_entries;
      if (!unsupp.has('week')) {
        query = query.order('week', { ascending: false });
      } else {
        query = query.order('id', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        return data.map(mapJournalFromDb);
      }
      return [];
    } catch (err: any) {
      const missingCol = parseMissingColumnError('journal_entries', err);
      if (missingCol) {
        console.warn(`[Self-Healing] Column '${missingCol}' not supported on journal_entries table. Adding to blocklist and retrying.`);
        unsupportedColumns.journal_entries.add(missingCol);
        attempt++;
      } else {
        console.warn('Supabase getJournalEntries failed, falling back to local state:', err);
        return fallbackData;
      }
    }
  }
  return fallbackData;
}

export async function upsertJournalEntry(entry: JournalEntry): Promise<void> {
  if (!supabase) return;
  let attempt = 0;
  while (attempt < 8) {
    try {
      const dbRow = mapJournalToDb(entry);
      const filteredRow = filterSupportedFields('journal_entries', dbRow);
      
      const { error } = await supabase
        .from('journal_entries')
        .upsert(filteredRow, { onConflict: 'id' });
      
      if (error) throw error;
      return; // Success!
    } catch (err: any) {
      const missingCol = parseMissingColumnError('journal_entries', err);
      if (missingCol) {
        console.warn(`[Self-Healing] Excluding column '${missingCol}' from journal_entries upsert.`);
        unsupportedColumns.journal_entries.add(missingCol);
        attempt++;
      } else if (isRlsPolicyViolation(err)) {
        console.warn('[Supabase RLS Help] RLS Policy violation on table \'journal_entries\'. To allow public writes, execute the SQL policies defined in \'supabase_schema.sql\' in your Supabase dashboard.');
        return;
      } else {
        console.error('Supabase upsertJournalEntry failed:', err);
        return;
      }
    }
  }
}

export async function deleteJournalEntryDb(id: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    if (isRlsPolicyViolation(err)) {
      console.warn('[Supabase RLS Help] RLS Policy violation when deleting from \'journal_entries\'.');
    } else {
      console.error('Supabase deleteJournalEntryDb failed:', err);
    }
  }
}

// 3. ALERTS SYNC
export async function getAlerts(fallbackData: Alert[]): Promise<Alert[]> {
  if (!supabase) return fallbackData;
  let attempt = 0;
  while (attempt < 5) {
    try {
      let query = supabase.from('alerts').select('*');
      
      const unsupp = unsupportedColumns.alerts;
      if (!unsupp.has('created_at')) {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('id', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        return data.map(mapAlertFromDb);
      }
      return [];
    } catch (err: any) {
      const missingCol = parseMissingColumnError('alerts', err);
      if (missingCol) {
        console.warn(`[Self-Healing] Column '${missingCol}' not supported on alerts table. Adding to blocklist and retrying.`);
        unsupportedColumns.alerts.add(missingCol);
        attempt++;
      } else {
        console.warn('Supabase getAlerts failed, falling back to local state:', err);
        return fallbackData;
      }
    }
  }
  return fallbackData;
}

export async function upsertAlert(alert: Alert): Promise<void> {
  if (!supabase) return;
  let attempt = 0;
  while (attempt < 8) {
    try {
      const dbRow = mapAlertToDb(alert);
      const filteredRow = filterSupportedFields('alerts', dbRow);
      
      const { error } = await supabase
        .from('alerts')
        .upsert(filteredRow, { onConflict: 'id' });
      
      if (error) throw error;
      return; // Success!
    } catch (err: any) {
      const missingCol = parseMissingColumnError('alerts', err);
      if (missingCol) {
        console.warn(`[Self-Healing] Excluding column '${missingCol}' from alerts upsert.`);
        unsupportedColumns.alerts.add(missingCol);
        attempt++;
      } else if (isRlsPolicyViolation(err)) {
        console.warn('[Supabase RLS Help] RLS Policy violation on table \'alerts\'. To allow public writes, execute the SQL policies defined in \'supabase_schema.sql\' in your Supabase dashboard.');
        return;
      } else {
        console.error('Supabase upsertAlert failed:', err);
        return;
      }
    }
  }
}

// ========================================================
// 4. DEVICES SYNC & OPERATIONS
// ========================================================

export async function getDevices(fallbackData: Device[]): Promise<Device[]> {
  if (!supabase) return fallbackData;
  let attempt = 0;
  while (attempt < 5) {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        return data as Device[];
      }
      return [];
    } catch (err: any) {
      const missingCol = parseMissingColumnError('devices', err);
      if (missingCol) {
        console.warn(`[Self-Healing] Column '${missingCol}' not supported on devices table. Adding to blocklist and retrying.`);
        unsupportedColumns.devices.add(missingCol);
        attempt++;
      } else {
        console.warn('Supabase getDevices failed or table does not exist yet. Falling back to local state:', err);
        return fallbackData;
      }
    }
  }
  return fallbackData;
}

export async function insertDeviceDb(device: Omit<Device, 'id'>): Promise<Device | null> {
  if (!supabase) return null;
  let attempt = 0;
  while (attempt < 8) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id || null;
      
      const newRow = {
        device_uid: device.device_uid,
        nickname: device.nickname,
        status: device.status,
        user_id: user_id
      };
      
      const filteredRow = filterSupportedFields('devices', newRow);
      
      const { data, error } = await supabase
        .from('devices')
        .insert(filteredRow)
        .select()
        .single();
      
      if (error) throw error;
      return data as Device;
    } catch (err: any) {
      const missingCol = parseMissingColumnError('devices', err);
      if (missingCol) {
        console.warn(`[Self-Healing] Excluding column '${missingCol}' from devices insert.`);
        unsupportedColumns.devices.add(missingCol);
        attempt++;
      } else if (isRlsPolicyViolation(err)) {
        console.warn('[Supabase RLS Help] RLS Policy violation on table \'devices\'.');
        throw err;
      } else {
        console.error('Supabase insertDeviceDb failed:', err);
        throw err;
      }
    }
  }
  return null;
}

export async function deleteDeviceDb(id: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    if (isRlsPolicyViolation(err)) {
      console.warn('[Supabase RLS Help] RLS Policy violation when deleting from \'devices\'.');
    } else {
      console.error('Supabase deleteDeviceDb failed:', err);
    }
  }
}


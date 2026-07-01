export type CropStage = 'Seedling' | 'Vegetative' | 'Flowering' | 'Harvest';

export interface Zone {
  id: string;
  name: string;
  crop: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  image: string;
  pH: number;
  ec: number;
  temp: number;
  humidity: number;
  vpd: number; // Vapor Pressure Deficit
  growthStage: CropStage;
  history: {
    pH: number[];
    ec: number[];
    temp: number[];
    humidity: number[];
  };
}

export interface Metric {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  icon: string;
  history: number[];
  status: 'normal' | 'alert';
}

export interface JournalEntry {
  id: string;
  week: number;
  dateRange: string;
  avgPh: number;
  avgEc: number;
  vpd: number;
  insight: string;
  growthStage: CropStage;
  notes: string;
  createdAt: string;
}

export interface Certificate {
  cropType: string;
  harvestDate: string;
  purityScore: number;
  batchId: string;
  statement: string;
  signedBy: string;
  position: string;
  growthDuration: number; // in days
  optimalWindowStatus: 'ACHIEVED' | 'MISSED';
  hydrationStability: string;
  photosyntheticLog: string;
  terpeneProfile: string;
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  zone: string;
  active: boolean;
}

export interface Device {
  id: string;
  device_uid: string;
  nickname: string;
  status: 'online' | 'offline';
  user_id?: string;
  created_at?: string;
}


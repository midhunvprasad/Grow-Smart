import { Zone, Metric, JournalEntry, Certificate, Alert } from './types';

export const INITIAL_ZONES: Zone[] = [
  {
    id: 'zone-1',
    name: 'Zone 1',
    crop: 'Microgreens',
    status: 'Healthy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4lP5P_BYp68c1LpP3gnU6z3clwOR7dO2364KIGnOryeyGiYgp4LXr0DE0rOINOrhh67dP8-_o8vwCQCU81KpUIvZHyp9dwc6cuW1ef2ubRtjthhOXFlX-bHSLvPgqyGs7wEq6FTByuOv-kr8OqKLN_ZwGcbk5A7e9LvyRVbWp48EAhQzK8DBHHxwI2OWPmXSm9KhLyF-CedCF1U9eZa2OuDrmCISPH0L8CqHY5qXS566J36scXVFsxJRkNEG0DgHVkNVSauqsr5WV',
    pH: 6.2,
    ec: 1.8,
    temp: 24.5,
    humidity: 68,
    vpd: 0.95,
    growthStage: 'Vegetative',
    history: {
      pH: [6.1, 6.3, 6.2, 6.0, 6.2, 6.1, 6.2, 6.3, 6.2],
      ec: [1.7, 1.8, 1.8, 1.7, 1.9, 1.8, 1.8, 1.8, 1.8],
      temp: [23.8, 24.1, 24.5, 24.8, 24.2, 24.5, 24.6, 24.4, 24.5],
      humidity: [65, 66, 68, 69, 67, 68, 68, 67, 68]
    }
  },
  {
    id: 'zone-2',
    name: 'Zone 2',
    crop: 'Vine Crops',
    status: 'Healthy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD24-e7Qc0IdG8tJYzvYLlHNMRglckSjxZgfG9siDezYWw8Evoj0d4uSdDZcs5blju85AG7tnFWjnBSgBHtBuEEfJz2ga8UlkCUsONnYO8jqVrMBKq9ZyRn6pvlYxfIWJyyvUMO_EiEf3fL5BdnEA0qi5JH-WI2GGYITn6Gp8qZftPhRGbSfJ3uOQitY0gKdfCbjd-s5Gbt1g4VW_r1g6Yf4nbVmNSJeRRxckrsviNz8VTh6ntp1jmm9TnvkF9HM5-b9PnlUpq8YhTu',
    pH: 6.5,
    ec: 2.2,
    temp: 26.0,
    humidity: 60,
    vpd: 1.15,
    growthStage: 'Flowering',
    history: {
      pH: [6.4, 6.4, 6.5, 6.5, 6.6, 6.5, 6.4, 6.5, 6.5],
      ec: [2.1, 2.2, 2.2, 2.3, 2.2, 2.2, 2.1, 2.2, 2.2],
      temp: [25.5, 25.8, 26.0, 26.2, 25.9, 26.0, 26.1, 26.0, 26.0],
      humidity: [58, 59, 60, 61, 60, 60, 60, 59, 60]
    }
  },
  {
    id: 'zone-4',
    name: 'Zone 4',
    crop: 'Lettuce',
    status: 'Warning',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_RbrE67FmLXhslP9sRqf8pmGxsTZ-_nJqaSlEAlnd9OUbRprKR3szN7_cKgrsWOo-0IK05FeRIiW6XoDTwlg7cJIaSEpAEahVhlf8LibeyD1znTHFrczHkEq3X4Ng2KVMSJgfNm_6lAZ5Rk84WZkQlHzdohnLm_zkgIKG8Yen2NNzTjuQlF7NwZpt51uaRupQMGFeOYNyxBQpl7ys1PHgBQc3BynFoydytJB5goZZbS0pIma19Ez-YTYgHdeFCjMymsp7ojov32J5',
    pH: 5.4, // Warning state
    ec: 1.5,
    temp: 22.1,
    humidity: 72,
    vpd: 0.80,
    growthStage: 'Seedling',
    history: {
      pH: [5.9, 5.8, 5.7, 5.6, 5.4, 5.3, 5.4, 5.5, 5.4],
      ec: [1.6, 1.5, 1.5, 1.6, 1.5, 1.4, 1.5, 1.5, 1.5],
      temp: [22.0, 22.2, 22.1, 22.3, 22.0, 22.1, 22.2, 22.1, 22.1],
      humidity: [70, 71, 72, 73, 72, 72, 73, 72, 72]
    }
  }
];

export const INITIAL_METRICS: Metric[] = [
  {
    id: 'ph',
    name: 'pH Levels',
    value: 6.2,
    unit: 'pH',
    icon: 'TestTube',
    history: [35, 25, 30, 15, 25, 10, 20],
    status: 'normal'
  },
  {
    id: 'ec',
    name: 'EC Value',
    value: 1.8,
    unit: 'mS/cm',
    icon: 'Zap',
    history: [30, 32, 28, 20, 25, 22],
    status: 'normal'
  },
  {
    id: 'temp',
    name: 'Air Temp',
    value: '24.5',
    unit: '°C',
    icon: 'Thermometer',
    history: [20, 15, 20, 18],
    status: 'normal'
  },
  {
    id: 'humidity',
    name: 'Humidity',
    value: 68,
    unit: '% rH',
    icon: 'Droplets',
    history: [25, 20, 22, 15],
    status: 'normal'
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    type: 'pH Imbalance',
    message: 'Urgent: pH imbalance detected in Zone 4 (Lettuce)',
    zone: 'Zone 4',
    active: true
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'journal-4',
    week: 4,
    dateRange: 'May 14 - May 20',
    avgPh: 6.2,
    avgEc: 1.8,
    vpd: 0.95,
    growthStage: 'Vegetative',
    notes: 'Growth rate is 12% above average. Foliage density is optimal. No sign of nutrient lock-out detected.',
    insight: 'Growth rate is 12% above average. Foliage density is optimal. No sign of nutrient lock-out detected.',
    createdAt: '2026-05-20T10:00:00Z'
  },
  {
    id: 'journal-3',
    week: 3,
    dateRange: 'May 07 - May 13',
    avgPh: 6.1,
    avgEc: 1.7,
    vpd: 0.92,
    growthStage: 'Vegetative',
    notes: 'Transitioned from seedling stage successfully. Root development looks fantastic under the multi-spectrum LEDs.',
    insight: 'Root morphology shows highly optimized absorption rate. Biomass development is on track.',
    createdAt: '2026-05-13T10:00:00Z'
  },
  {
    id: 'journal-2',
    week: 2,
    dateRange: 'Apr 30 - May 06',
    avgPh: 6.3,
    avgEc: 1.6,
    vpd: 0.88,
    growthStage: 'Seedling',
    notes: 'True leaves appeared. First nutrient dose introduced. EC targets slightly adjusted upwards.',
    insight: 'Germination rate recorded at 98.4%. Standard deviation remains low.',
    createdAt: '2026-05-06T10:00:00Z'
  }
];

export const INITIAL_CERTIFICATE: Certificate = {
  cropType: 'Sweet Genovese Basil',
  harvestDate: 'Oct 24, 2023',
  purityScore: 99.8,
  batchId: 'GS-BASIL-2023-X92',
  statement: '"This harvest meets the Grow Smart Premium standard for nutrient density and microbial balance, verified via real-time IoT gateway telemetry and AI-driven growth modeling."',
  signedBy: 'Alex Rivers',
  position: 'Lead Agronomist',
  growthDuration: 32,
  optimalWindowStatus: 'ACHIEVED',
  hydrationStability: 'Consistent moisture levels throughout the flowering stage.',
  photosyntheticLog: 'Spectrographic light absorption aligned with Genovese DNA needs.',
  terpeneProfile: 'Predicted aromatic intensity in top 5th percentile for region.'
};

// Local storage helpers
export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`growsmart_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error('Error loading growsmart data', e);
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`growsmart_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving growsmart data', e);
  }
};

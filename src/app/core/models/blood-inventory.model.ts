// blood-inventory.model.ts

export interface BloodInventory {
  id?: number;
  bloodGroup: string;
  units: number;
  updatedAt?: string;
}

export interface UpdateInventoryRequest {
  bloodGroup: string;
  units: number;
}

export interface InventorySummary {
  bloodGroup: string;
  bloodGroupLabel: string;
  units: number;
  stockLevel: StockLevel;
  updatedAt?: string;
}

export type StockLevel = 'critical' | 'low' | 'medium' | 'good';

export interface StockLevelInfo {
  level: StockLevel;
  label: string;
  minUnits: number;
  maxUnits: number;
  color: string;
  bgColor: string;
}

export const STOCK_LEVELS: Record<StockLevel, StockLevelInfo> = {
  critical: {
    level: 'critical',
    label: 'Out of Stock',
    minUnits: 0,
    maxUnits: 0,
    color: '#c62828',
    bgColor: '#ffebee'
  },
  low: {
    level: 'low',
    label: 'Low Stock',
    minUnits: 1,
    maxUnits: 4,
    color: '#e65100',
    bgColor: '#fff3e0'
  },
  medium: {
    level: 'medium',
    label: 'Moderate',
    minUnits: 5,
    maxUnits: 14,
    color: '#f57f17',
    bgColor: '#fff8e1'
  },
  good: {
    level: 'good',
    label: 'Well Stocked',
    minUnits: 15,
    maxUnits: Infinity,
    color: '#2e7d32',
    bgColor: '#e8f5e9'
  }
};

export function getStockLevel(units: number): StockLevel {
  if (units === 0) return 'critical';
  if (units <= 4) return 'low';
  if (units <= 14) return 'medium';
  return 'good';
}

export function getStockLevelInfo(units: number): StockLevelInfo {
  return STOCK_LEVELS[getStockLevel(units)];
}
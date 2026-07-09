import { Bike, Bus, Car, Truck } from 'lucide-react';

export const categoryIcons = {
  AM: Bike,
  A1: Bike,
  A2: Bike,
  A: Bike,
  B1: Car,
  B: Car,
  C: Truck,
  D: Bus,
} as const;

export type DrivingCategory = keyof typeof categoryIcons;

export const categoryIds = Object.keys(categoryIcons) as DrivingCategory[];

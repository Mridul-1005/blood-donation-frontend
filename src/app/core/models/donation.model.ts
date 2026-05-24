// donation.model.ts
import { UserSummary } from './user.model';
import { BloodRequest } from './blood-request.model';

export interface Donation {
  id?: number;
  donor?: UserSummary;
  bloodRequest?: BloodRequest | null;
  unitsDonated: number;
  donatedAt: string;
  location?: string;
  notes?: string;
}

export interface CreateDonationRequest {
  unitsDonated: number;
  donatedAt: string;
  location?: string;
  notes?: string;
  bloodRequest?: number | null;
}

export interface DonationSummary {
  id: number;
  donorId: number;
  donorName: string;
  unitsDonated: number;
  donatedAt: string;
  location?: string;
}
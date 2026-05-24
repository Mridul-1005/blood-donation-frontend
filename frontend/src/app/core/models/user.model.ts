// user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  role: Role;
  address?: string;
  isAvailable: boolean;
  lastDonated?: string;
  createdAt?: string;
}

export type BloodGroup =
  | 'A_POSITIVE' | 'A_NEGATIVE'
  | 'B_POSITIVE' | 'B_NEGATIVE'
  | 'AB_POSITIVE' | 'AB_NEGATIVE'
  | 'O_POSITIVE' | 'O_NEGATIVE';

export type Role = 'USER' | 'DONOR' | 'ADMIN';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  role: Role;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: string;
  bloodGroup?: BloodGroup;
  isAvailable?: boolean;
}

export interface RoleUpdateRequest {
  role: Role;
}

export const BLOOD_GROUP_LABELS: Record<BloodGroup, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-'
};

export const BLOOD_GROUP_OPTIONS: { value: BloodGroup; label: string }[] = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
];
// blood-request.model.ts
import { UserSummary } from './user.model';

export interface BloodRequest {
  id?: number;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospital: string;
  contact: string;
  reason?: string;
  status?: RequestStatus;
  createdBy?: UserSummary | number;
  createdAt?: string;
}

export type RequestStatus = 'OPEN' | 'PENDING' | 'FULFILLED' | 'CLOSED';

export interface CreateBloodRequest {
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospital: string;
  contact: string;
  reason?: string;
}

export interface UpdateBloodRequest extends Partial<CreateBloodRequest> {
  status?: RequestStatus;
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  OPEN: 'Open',
  PENDING: 'Pending',
  FULFILLED: 'Fulfilled',
  CLOSED: 'Closed'
};

export const REQUEST_STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'CLOSED', label: 'Closed' }
];
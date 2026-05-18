export const DDSStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  EXPIRING_SOON: 'EXPIRING_SOON',
  GEOLOCATION_MISMATCH: 'GEOLOCATION_MISMATCH',
  PENDING_RENEWAL: 'PENDING_RENEWAL',
} as const;

export type DDSStatus = (typeof DDSStatus)[keyof typeof DDSStatus];

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  receivedDate: Date | string;
  expiryDate?: Date | string;
  ddsNumber?: string;
  ddsStatus: DDSStatus;
  ddsExpiryDate?: Date | string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  intakeQualityOutcome?: 'PENDING' | 'PASS' | 'FAIL';
  intakeTransportOutcome?: 'PENDING' | 'PASS' | 'FAIL';
  erpLockRequested?: boolean;
  product?: {
    id: string;
    name: string;
    hsCode?: string;
  };
  ingredients?: BatchIngredient[];
  usedInBatches?: BatchIngredient[];
}

export interface BatchIngredient {
  id: string;
  manufacturedBatchId: string;
  ingredientProductId: string;
  ingredientBatchId?: string;
  quantityUsed: number;
  unit: string;
  percentageOfTotal?: number;
  createdAt: Date | string;
  ingredientProduct?: {
    id: string;
    name: string;
  };
  ingredientBatch?: ProductBatch;
  manufacturedBatch?: ProductBatch;
}

export interface CreateBatchData {
  productId: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  receivedDate: Date | string;
  expiryDate?: Date | string;
  ddsNumber?: string;
  ddsExpiryDate?: Date | string;
  notes?: string;
}

export interface UpdateBatchData {
  batchNumber?: string;
  quantity?: number;
  unit?: string;
  receivedDate?: Date | string;
  expiryDate?: Date | string;
  ddsNumber?: string;
  ddsStatus?: DDSStatus;
  ddsExpiryDate?: Date | string;
  notes?: string;
}

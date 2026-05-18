export interface OwnGood {
  id: string;
  userId: string;
  name: string;
  category: string;
  country: string;
  hsCode?: string;
  unit?: string;
  productType: 'MANUFACTURED';
  createdAt: string | Date;
  updatedAt: string | Date;
  batches?: OwnGoodBatch[];
  recipeIngredients?: Array<{
    id: string;
    productId: string;
    percentage: number;
    product: {
      id: string;
      name: string;
      internalProductCode?: string;
      supplierProductCode?: string;
    };
  }>;
}

export interface OwnGoodBatch {
  id: string;
  productId: string;
  batchNumber: string;
  productionDate: string | Date;
  quantity: number;
  unit: string;
  receivedDate?: string | Date;
  ingredients: BatchIngredient[];
}

export interface BatchIngredient {
  id: string;
  manufacturedBatchId: string;
  ingredientProductId: string;
  ingredientBatchId?: string;
  quantityUsed: number;
  unit: string;
  percentageOfTotal?: number;
  ingredientProduct: {
    id: string;
    name: string;
    supplier?: {
      name: string;
    };
  };
  ingredientBatch?: {
    batchNumber: string;
    ddsNumber?: string;
    ddsStatus?: string;
  };
}

export interface CreateOwnGoodData {
  name: string;
  category: string;
  country: string;
  hsCode?: string;
  unit?: string;
  commodityType?: string;
  ingredients: {
    productId: string;
    batchId?: string;
    quantityUsed: number;
    unit: string;
    percentageOfTotal?: number;
  }[];
}

export interface AvailableIngredient {
  id: string;
  name: string;
  category: string;
  internalProductCode?: string;
  supplierProductCode?: string;
  supplier?: {
    name: string;
  };
  batches: {
    id: string;
    batchNumber: string;
    quantity: number;
    unit: string;
    ddsNumber?: string;
  }[];
}

export interface BillOfMaterials {
  batch: {
    id: string;
    batchNumber: string;
    product: string;
    quantity: number;
    unit: string;
  };
  ingredients: {
    id: string;
    product: string;
    supplier: string;
    batch: string;
    quantityUsed: number;
    unit: string;
    percentage?: number;
    ddsNumber?: string;
    ddsStatus?: string;
  }[];
  totalPercentage: number;
}

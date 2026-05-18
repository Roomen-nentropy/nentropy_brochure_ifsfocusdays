import { api } from '.';
import type {
  OwnGood,
  CreateOwnGoodData,
  AvailableIngredient,
  BillOfMaterials,
} from '../types/own-goods.types';

export const ownGoodsService = {
  /**
   * Get all manufactured products (own goods)
   */
  async getOwnGoods(): Promise<OwnGood[]> {
    const response = await api.get('/api/own-goods');
    return response.data;
  },

  /**
   * Get a single manufactured product by ID
   */
  async getOwnGoodById(id: string): Promise<OwnGood> {
    const response = await api.get(`/api/own-goods/${id}`);
    return response.data;
  },

  /**
   * Get available ingredients (purchased products with batches)
   */
  async getAvailableIngredients(): Promise<AvailableIngredient[]> {
    const response = await api.get('/api/own-goods/ingredients');
    return response.data;
  },

  /**
   * Create a new manufactured product with initial batch and ingredients
   */
  async createOwnGood(data: CreateOwnGoodData): Promise<OwnGood> {
    const response = await api.post('/api/own-goods', data);
    return response.data;
  },

  /**
   * Update a manufactured product
   */
  async updateOwnGood(
    id: string,
    data: Partial<
      Omit<
        CreateOwnGoodData,
        'batchNumber' | 'quantity' | 'batchUnit' | 'ingredients'
      >
    >
  ): Promise<OwnGood> {
    const response = await api.put(`/api/own-goods/${id}`, data);
    return response.data;
  },

  /**
   * Delete a manufactured product
   */
  async deleteOwnGood(id: string): Promise<void> {
    await api.delete(`/api/own-goods/${id}`);
  },

  /**
   * Create a new batch for an own good
   */
  async createOwnGoodBatch(
    ownGoodId: string,
    data: {
      batchNumber: string;
      productionDate: string;
      quantity: number;
      unit: string;
      ingredients: Array<{
        productId: string;
        batchNumber: string;
        quantity: number;
      }>;
    }
  ): Promise<any> {
    const response = await api.post(
      `/api/own-goods/${ownGoodId}/batches`,
      data
    );
    return response.data;
  },

  /**
   * Get batches for an own good
   */
  async getOwnGoodBatches(ownGoodId: string): Promise<any[]> {
    const response = await api.get(`/api/own-goods/${ownGoodId}/batches`);
    return response.data;
  },

  /**
   * Delete a batch
   */
  async deleteBatch(batchId: string): Promise<void> {
    await api.delete(`/api/own-goods/batches/${batchId}`);
  },

  /**
   * Get Bill of Materials for a batch
   */
  async getBillOfMaterials(batchId: string): Promise<BillOfMaterials> {
    const response = await api.get(`/api/own-goods/batch/${batchId}/bom`);
    return response.data;
  },

  /**
   * Import own good recipes from CSV
   */
  async importRecipesFromCsv(
    formData: FormData
  ): Promise<{ imported: number; failed: number; skipped: number }> {
    const response = await api.post('/api/own-goods/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

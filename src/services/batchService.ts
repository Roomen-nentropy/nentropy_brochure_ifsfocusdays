import { api } from './index';
import type {
  ProductBatch,
  CreateBatchData,
  UpdateBatchData,
  DDSStatus,
} from '../types/batch.types';

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BatchPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  productIds?: string[];
}

export const batchService = {
  /**
   * Get paginated batches with search and filtering
   */
  async getBatchesPaginated(
    params: BatchPaginationParams
  ): Promise<PaginatedResult<ProductBatch>> {
    const { page = 1, limit = 25, search = '', productIds } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    if (productIds && productIds.length > 0) {
      queryParams.append('productIds', productIds.join(','));
    }

    const { data } = await api.get<PaginatedResult<ProductBatch>>(
      `/api/batches?${queryParams.toString()}`
    );
    return data;
  },

  /**
   * Get all batches for the current user
   */
  async getAllBatches(): Promise<ProductBatch[]> {
    const { data } = await api.get<ProductBatch[]>('/api/batches');
    return data;
  },

  /**
   * Get all batches for a specific product
   */
  async getBatchesByProduct(productId: string): Promise<ProductBatch[]> {
    const { data } = await api.get<ProductBatch[]>(
      `/api/batches/product/${productId}`
    );
    return data;
  },

  /**
   * Get a single batch by ID
   */
  async getBatchById(batchId: string): Promise<ProductBatch> {
    const { data } = await api.get<ProductBatch>(`/api/batches/${batchId}`);
    return data;
  },

  /**
   * Create a new batch
   */
  async createBatch(data: CreateBatchData): Promise<ProductBatch> {
    const response = await api.post<ProductBatch>('/api/batches', data);
    return response.data;
  },

  /**
   * Update an existing batch
   */
  async updateBatch(
    batchId: string,
    data: UpdateBatchData
  ): Promise<ProductBatch> {
    const response = await api.put<ProductBatch>(
      `/api/batches/${batchId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a batch
   */
  async deleteBatch(batchId: string): Promise<void> {
    await api.delete(`/api/batches/${batchId}`);
  },

  /**
   * Update DDS status for a batch
   */
  async updateDDSStatus(
    batchId: string,
    ddsStatus: DDSStatus
  ): Promise<ProductBatch> {
    const response = await api.patch<ProductBatch>(
      `/api/batches/${batchId}/dds-status`,
      { ddsStatus }
    );
    return response.data;
  },

  /**
   * Get batches with expiring DDS (within 30 days)
   */
  async getExpiringDDSBatches(): Promise<ProductBatch[]> {
    const { data } = await api.get<ProductBatch[]>(
      '/api/batches/alerts/expiring-dds'
    );
    return data;
  },
};

import type { Product } from '../types';
import { paginationService } from './paginationService';
import type { Supplier } from '../types/survey.types';
import { api } from '.';

interface ImportData {
  suppliers: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>[];
  products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[];
}

interface ImportResult {
  suppliers: {
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
  products: {
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
  warnings: string[];
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PackagingDocument {
  id: string;
  filename: string;
  url?: string | null;
  expiryDate?: string | null;
  docType?: string;
  docTypeLabel?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

class ApiService {
  async getProductsWithPrefetch(
    params: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 25, search = '' } = params;

    const cached = paginationService.getCachedPage<Product>(
      'products',
      page,
      search,
      limit
    );

    if (cached) {
      this.prefetchProductPages(page, cached.totalPages, search, limit);
      return cached;
    }

    // Fetch from API
    const result = await this.getProducts(params);

    // Cache the result
    paginationService.setCachedPage('products', page, result, search, limit);

    // Prefetch next pages in background
    this.prefetchProductPages(page, result.totalPages, search, limit);

    return result;
  }

  async getSuppliersWithPrefetch(
    params: PaginationParams
  ): Promise<PaginatedResult<Supplier>> {
    const { page = 1, limit = 25, search = '' } = params;

    // Check cache first
    const cached = paginationService.getCachedPage<Supplier>(
      'suppliers',
      page,
      search,
      limit
    );
    if (cached) {
      // Prefetch next pages in background if needed
      this.prefetchSupplierPages(page, cached.totalPages, search, limit);
      return cached;
    }

    // Fetch from API
    const result = await this.getSuppliers(params);

    // Cache the result
    paginationService.setCachedPage('suppliers', page, result, search, limit);

    // Prefetch next pages in background
    this.prefetchSupplierPages(page, result.totalPages, search, limit);

    return result;
  }

  private async prefetchProductPages(
    currentPage: number,
    totalPages: number,
    search: string,
    limit: number
  ): Promise<void> {
    const pagesToPrefetch = paginationService.getPrefetchPages(
      currentPage,
      totalPages
    );

    // Prefetch pages in background (don't await to avoid blocking)
    pagesToPrefetch.forEach(async pageNum => {
      // Check if already cached
      const cached = paginationService.getCachedPage<Product>(
        'products',
        pageNum,
        search,
        limit
      );
      if (!cached) {
        try {
          const result = await this.getProducts({
            page: pageNum,
            limit,
            search,
          });
          paginationService.setCachedPage(
            'products',
            pageNum,
            result,
            search,
            limit
          );
        } catch (error) {
          console.warn(`Failed to prefetch products page ${pageNum}:`, error);
        }
      }
    });
  }

  private async prefetchSupplierPages(
    currentPage: number,
    totalPages: number,
    search: string,
    limit: number
  ): Promise<void> {
    const pagesToPrefetch = paginationService.getPrefetchPages(
      currentPage,
      totalPages
    );

    pagesToPrefetch.forEach(async pageNum => {
      const cached = paginationService.getCachedPage<Supplier>(
        'suppliers',
        pageNum,
        search,
        limit
      );
      if (!cached) {
        try {
          const result = await this.getSuppliers({
            page: pageNum,
            limit,
            search,
          });
          paginationService.setCachedPage(
            'suppliers',
            pageNum,
            result,
            search,
            limit
          );
        } catch (error) {
          console.warn(`Failed to prefetch suppliers page ${pageNum}:`, error);
        }
      }
    });
  }

  getAllCachedProducts(search = '', limit = 25): Product[] {
    return paginationService.getAllCachedData<Product>(
      'products',
      search,
      limit
    );
  }

  getAllCachedSuppliers(search = '', limit = 25): Supplier[] {
    return paginationService.getAllCachedData<Supplier>(
      'suppliers',
      search,
      limit
    );
  }

  clearProductsCache(): void {
    paginationService.clearCache('products');
  }

  clearSuppliersCache(): void {
    paginationService.clearCache('suppliers');
  }

  async getSuppliers(
    params?: PaginationParams
  ): Promise<PaginatedResult<Supplier>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await api.get<PaginatedResult<Supplier>>(
      `/api/suppliers?${searchParams.toString()}`
    );
    return response.data;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    let allSuppliers: Supplier[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await this.getSuppliers({ page, limit: 100 });
      allSuppliers = [...allSuppliers, ...result.data];
      hasMore = page < result.totalPages;
      page++;
    }

    return allSuppliers;
  }

  async getSupplier(id: string): Promise<Supplier> {
    const response = await api.get<Supplier>(`/api/suppliers/${id}`);
    return response.data;
  }

  async getSuppliersWithCompletedSurveys(): Promise<
    Array<{
      id: string;
      name: string;
      email?: string;
      country: string;
      contactPerson?: string;
      latestSurveyId: string;
      latestSurveyCompletedAt: string;
      templateName: string;
      assessmentType: 'EU_SUPPLIER' | 'NON_EU_SUPPLIER';
    }>
  > {
    const response = await api.get('/api/suppliers/with-completed-surveys');

    return response.data;
  }

  async createSupplier(
    supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Supplier> {
    const response = await api.post<Supplier>('/api/suppliers', supplier);
    this.clearSuppliersCache();
    return response.data;
  }

  async updateSupplier(
    id: string,
    supplier: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Supplier> {
    const response = await api.put<Supplier>(`/api/suppliers/${id}`, supplier);
    this.clearSuppliersCache();
    return response.data;
  }

  async deleteSupplier(id: string): Promise<void> {
    await api.delete(`/api/suppliers/${id}`);
    this.clearSuppliersCache();
  }

  async deleteSuppliers(ids: string[]): Promise<{ count: number }> {
    const response = await api.delete<{ count: number }>('/api/suppliers', {
      data: { ids },
    });
    this.clearSuppliersCache();
    return response.data;
  }

  async getProducts(
    params?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await api.get<PaginatedResult<Product>>(
      `/api/products?${searchParams.toString()}`
    );
    return response.data;
  }

  async getAllProducts(): Promise<Product[]> {
    let allProducts: Product[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await this.getProducts({ page, limit: 100 });
      allProducts = [...allProducts, ...result.data];
      hasMore = page < result.totalPages;
      page++;
    }

    return allProducts;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  }

  async getPackagingDocuments(
    productId: string
  ): Promise<PackagingDocument[]> {
    const response = await api.get<PackagingDocument[]>(
      `/api/products/${productId}/packaging-documents`
    );
    return response.data;
  }

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    const response = await api.get<Product[]>(
      `/api/products/by-supplier/${supplierId}`
    );
    return response.data;
  }

  async getProductsBySupplierPaginated(
    supplierId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await api.get<PaginatedResult<Product>>(
      `/api/products/by-supplier/${supplierId}?${searchParams.toString()}`
    );
    return response.data;
  }

  async createProduct(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> {
    const response = await api.post<Product>('/api/products', product);
    this.clearProductsCache();
    return response.data;
  }

  async updateProduct(
    id: string,
    product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Product> {
    const response = await api.put<Product>(`/api/products/${id}`, product);
    this.clearProductsCache();
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
    this.clearProductsCache();
  }

  async deleteProducts(ids: string[]): Promise<{ count: number }> {
    const response = await api.delete<{ count: number }>('/api/products', {
      data: { ids },
    });
    this.clearProductsCache();
    return response.data;
  }

  async importData(importData: ImportData): Promise<{ result: ImportResult }> {
    const response = await api.post<{ result: ImportResult }>(
      '/api/csv-import',
      importData
    );

    this.clearProductsCache();
    this.clearSuppliersCache();
    return response.data;
  }

  async validateImportData(importData: ImportData): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    summary: {
      supplierCount: number;
      productCount: number;
    };
  }> {
    const response = await api.post('/api/csv-import/validate', importData);
    return response.data;
  }
}

export const apiService = new ApiService();
export type { ImportData, ImportResult, PaginatedResult, PaginationParams };

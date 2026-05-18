const SUPPLIERS_PAGE_SIZE_KEY = 'eudr_suppliers_page_size';
const PRODUCTS_PAGE_SIZE_KEY = 'eudr_products_page_size';

export class LocalStorageService {
  static getSuppliersPageSize(): number {
    try {
      const size = localStorage.getItem(SUPPLIERS_PAGE_SIZE_KEY);
      return size ? parseInt(size, 10) : 25;
    } catch (error) {
      console.error(
        'Error loading suppliers page size from localStorage:',
        error
      );
      return 25;
    }
  }

  static saveSuppliersPageSize(size: number): void {
    try {
      localStorage.setItem(SUPPLIERS_PAGE_SIZE_KEY, size.toString());
    } catch (error) {
      console.error('Error saving suppliers page size to localStorage:', error);
    }
  }

  static getProductsPageSize(): number {
    try {
      const size = localStorage.getItem(PRODUCTS_PAGE_SIZE_KEY);
      return size ? parseInt(size, 10) : 25;
    } catch (error) {
      console.error(
        'Error loading products page size from localStorage:',
        error
      );
      return 25;
    }
  }

  static saveProductsPageSize(size: number): void {
    try {
      localStorage.setItem(PRODUCTS_PAGE_SIZE_KEY, size.toString());
    } catch (error) {
      console.error('Error saving products page size to localStorage:', error);
    }
  }
}

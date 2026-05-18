import type { Product } from '../types';
import type { Supplier } from '../types/survey.types';
import { getRiskLevelFromCountry } from '../lib/country-risk';

export interface CSVParseResult {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

export interface HeaderMapping {
  // Supplier fields
  supplierName?: string;
  supplierCountry?: string;
  supplierContactPerson?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;

  // Product fields
  productName?: string;
  productHsCode?: string;
  productCategory?: string;
  productCountry?: string;
  productOrigin?: string;
  productUnit?: string;
  internalProductCode?: string;
  supplierProductCode?: string;
}

export interface ImportResult {
  suppliers: Supplier[];
  products: Product[];
  errors: string[];
  warnings: string[];
}

export interface ImportPreview {
  totalRows: number;
  previewRows: string[][];
  headers: string[];
  delimiter: string;
}

export class CSVImportService {
  static detectDelimiter(csvText: string): string {
    const firstLine = csvText.split('\n')[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;

    if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
    if (semicolonCount > commaCount) return ';';
    return ',';
  }

  static parseCSVStructure(
    csvText: string,
    previewRowCount: number = 50
  ): ImportPreview {
    const lines = csvText.trim().split('\n');
    const delimiter = this.detectDelimiter(csvText);

    if (lines.length < 1) {
      return {
        totalRows: 0,
        previewRows: [],
        headers: [],
        delimiter,
      };
    }

    const headers = lines[0]
      .split(delimiter)
      .map(h => h.trim().replace(/^"|"$/g, ''));

    const dataLines = lines.slice(1);
    const previewRows: string[][] = [];

    for (let i = 0; i < Math.min(previewRowCount, dataLines.length); i++) {
      const line = dataLines[i].trim();
      if (line) {
        const values = line
          .split(delimiter)
          .map(v => v.trim().replace(/^"|"$/g, ''));
        previewRows.push(values);
      }
    }

    return {
      totalRows: dataLines.filter(line => line.trim()).length,
      previewRows,
      headers,
      delimiter,
    };
  }

  static importWithMapping(
    csvText: string,
    headerMapping: HeaderMapping
  ): ImportResult {
    const lines = csvText.trim().split('\n');
    const errors: string[] = [];
    const warnings: string[] = [];
    const suppliersMap = new Map<string, Supplier>();
    const products: Product[] = [];

    if (lines.length < 2) {
      errors.push('CSV file must contain at least a header and one data row');
      return { suppliers: [], products: [], errors, warnings };
    }

    const delimiter = this.detectDelimiter(csvText);
    const headers = lines[0]
      .split(delimiter)
      .map(h => h.trim().replace(/^"|"$/g, ''));

    // Create column index mapping
    const columnMapping: Partial<Record<keyof HeaderMapping, number>> = {};

    (
      Object.entries(headerMapping) as Array<
        [keyof HeaderMapping, string | undefined]
      >
    ).forEach(([key, headerName]) => {
      if (headerName) {
        const columnIndex = headers.indexOf(headerName);
        if (columnIndex !== -1) {
          columnMapping[key] = columnIndex;
        }
      }
    });

    // Validate required mappings
    const hasSupplierName = columnMapping.supplierName !== undefined;
    const hasProductName = columnMapping.productName !== undefined;

    if (!hasSupplierName && !hasProductName) {
      errors.push('At least supplier name or product name must be mapped');
      return { suppliers: [], products: [], errors, warnings };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line
        .split(delimiter)
        .map(v => v.trim().replace(/^"|"$/g, ''));

      try {
        // Extract supplier data if supplier name is mapped
        if (hasSupplierName && columnMapping.supplierName !== undefined) {
          const supplierName = values[columnMapping.supplierName];

          if (supplierName && !suppliersMap.has(supplierName)) {
            const supplier: Supplier = {
              id: this.generateId(),
              name: supplierName,
              country:
                columnMapping.supplierCountry !== undefined
                  ? values[columnMapping.supplierCountry] || 'Unknown'
                  : 'Unknown',
              address:
                columnMapping.supplierAddress !== undefined
                  ? values[columnMapping.supplierAddress]
                  : undefined,
              contactPerson:
                columnMapping.supplierContactPerson !== undefined
                  ? values[columnMapping.supplierContactPerson]
                  : undefined,
              email:
                columnMapping.supplierEmail !== undefined
                  ? values[columnMapping.supplierEmail]
                  : undefined,
              phone:
                columnMapping.supplierPhone !== undefined
                  ? values[columnMapping.supplierPhone]
                  : undefined,
              riskLevel: 'medium', // Will be derived from country below
              certifications: [],
              isEuOrigin: false, // Will be determined by origin if mapped
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Determine EU origin based on product origin if available
            if (columnMapping.productOrigin !== undefined) {
              const origin = values[columnMapping.productOrigin]?.toLowerCase();
              supplier.isEuOrigin = origin === 'eu' || origin === 'EU';
            }

            // Derive risk level from country using EUDR country risk classification
            supplier.riskLevel = getRiskLevelFromCountry(supplier.country);

            suppliersMap.set(supplierName, supplier);
          }
        }

        // Extract product data if product name is mapped
        if (hasProductName && columnMapping.productName !== undefined) {
          const productName = values[columnMapping.productName];

          if (productName) {
            const supplierName =
              hasSupplierName && columnMapping.supplierName !== undefined
                ? values[columnMapping.supplierName]
                : undefined;

            const rawOrigin =
              columnMapping.productOrigin !== undefined
                ? values[columnMapping.productOrigin]
                : undefined;
            const normalizedOrigin: 'EU' | 'NON-EU' =
              rawOrigin?.toLowerCase() === 'eu' || rawOrigin === 'EU'
                ? 'EU'
                : 'NON-EU';

            const product: Product = {
              id: this.generateId(),
              name: productName,
              hsCode:
                columnMapping.productHsCode !== undefined
                  ? values[columnMapping.productHsCode]
                  : undefined,
              internalProductCode:
                columnMapping.internalProductCode !== undefined
                  ? values[columnMapping.internalProductCode]
                  : undefined,
              supplierProductCode:
                columnMapping.supplierProductCode !== undefined
                  ? values[columnMapping.supplierProductCode]
                  : undefined,
              supplierName: supplierName || 'Unknown',
              supplierId: supplierName
                ? suppliersMap.get(supplierName)?.id
                : undefined,
              category:
                columnMapping.productCategory !== undefined
                  ? values[columnMapping.productCategory] || ''
                  : '', // Backend will auto-generate from HS code if empty
              country:
                columnMapping.productCountry !== undefined
                  ? values[columnMapping.productCountry] || 'Unknown'
                  : 'Unknown',
              origin: normalizedOrigin,
              unit:
                columnMapping.productUnit !== undefined
                  ? values[columnMapping.productUnit]
                  : undefined,
              // Backend will auto-calculate isEudrRelevant and commodityType based on HS code
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            products.push(product);
          }
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: Error processing data - ${error}`);
      }
    }

    const suppliers = Array.from(suppliersMap.values());

    return {
      suppliers,
      products,
      errors,
      warnings,
    };
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static linkProductsToSuppliers(
    products: Product[],
    suppliers: Supplier[]
  ): Product[] {
    const supplierMap = new Map(suppliers.map(s => [s.name, s.id]));

    return products.map(product => ({
      ...product,
      supplierId: supplierMap.get(product.supplierName) || product.supplierId,
    }));
  }

  static exportSuppliersToCSV(suppliers: Supplier[]): string {
    const headers = [
      'Name',
      'Supplier Code',
      'Country',
      'Contact Person',
      'Email',
      'Phone',
      'Address',
      'Risk Level',
      'EU Origin',
    ];

    const rows = suppliers.map(supplier => [
      supplier.name,
      supplier.country,
      supplier.contactPerson || '',
      supplier.email || '',
      supplier.phone || '',
      supplier.address || '',
      supplier.riskLevel,
      supplier.isEuOrigin ? 'EU' : 'Non-EU',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  static exportProductsToCSV(products: Product[]): string {
    const headers = [
      'Internal Product Code',
      'Supplier Product Code',
      'HS Code',
      'Name',
      'Supplier',
      'Category',
      'Country',
      'Origin',
      'Unit',
      'EUDR Relevant',
      'Commodity Type',
    ];

    const rows = products.map(product => [
      product.internalProductCode || '',
      product.supplierProductCode || '',
      product.hsCode || '',
      product.name,
      product.supplierName,
      product.category,
      product.country,
      product.origin || '',
      product.unit || '',
      product.isEudrRelevant ? 'Yes' : 'No',
      product.commodityType || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

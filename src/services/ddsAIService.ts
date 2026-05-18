import type {
  Product,
  Geolocation,
  SupplyChain,
  CompanySettings,
} from '../types';
import type { Supplier } from '../types/survey.types';

export interface DDSFormData {
  supplier?: Supplier;
  products?: Product[];
  geolocations?: Geolocation[];
  supplyChains?: SupplyChain[];
  companySettings?: CompanySettings;
  companyInfo?: {
    eoriNumber?: string;
    vatNumber?: string;
    registrationNumber?: string;
  };
  shipmentInfo?: {
    shipmentId?: string;
    placementDate?: string;
    portOfEntry?: string;
    customsNumber?: string;
    transportDocument?: string;
    containerNumbers?: string[];
  };
}

export class DDSAIService {
  /**
   * Auto-fill DDS template with available data
   */
  static autoFillTemplate(template: string, data: DDSFormData): string {
    let filledTemplate = template;

    // Replace supplier information
    if (data.supplier) {
      filledTemplate = filledTemplate
        .replace(
          /\[FULL LEGAL NAME\]/g,
          data.supplier.name || '[FULL LEGAL NAME]'
        )
        .replace(/\[COUNTRY NAME\]/g, data.supplier.country || '[COUNTRY NAME]')
        .replace(/\[FULL ADDRESS\]/g, data.supplier.address || '[FULL ADDRESS]')
        .replace(/\[EMAIL ADDRESS\]/g, data.supplier.email || '[EMAIL ADDRESS]')
        .replace(/\[PHONE NUMBER\]/g, data.supplier.phone || '[PHONE NUMBER]')
        .replace(
          /\[NAME, TITLE\]/g,
          data.supplier.contactPerson || '[NAME, TITLE]'
        )
        .replace(/\[COMPANY NAME\]/g, data.supplier.name || '[COMPANY NAME]');
    }

    // Replace company information from settings first
    if (data.companySettings) {
      const settings = data.companySettings;
      filledTemplate = filledTemplate
        .replace(/\[COMPANY NAME\]/g, settings.companyName || '[COMPANY NAME]')
        .replace(
          /\[LEGAL ENTITY NAME\]/g,
          settings.companyName || '[LEGAL ENTITY NAME]'
        )
        .replace(
          /\[REGISTRATION NUMBER\]/g,
          settings.registrationNumber || '[REGISTRATION NUMBER]'
        )
        .replace(/\[VAT NUMBER\]/g, settings.vatNumber || '[VAT NUMBER]')
        .replace(
          /\[FULL ADDRESS\]/g,
          settings.address
            ? `${settings.address.street}, ${settings.address.city}, ${settings.address.postalCode}, ${settings.address.country}`
            : '[FULL ADDRESS]'
        )
        .replace(
          /\[EMAIL ADDRESS\]/g,
          settings.contactInfo?.email || '[EMAIL ADDRESS]'
        )
        .replace(
          /\[PHONE NUMBER\]/g,
          settings.contactInfo?.phone || '[PHONE NUMBER]'
        )
        .replace(
          /\[REPRESENTATIVE NAME\]/g,
          settings.legalRepresentative?.name || '[REPRESENTATIVE NAME]'
        )
        .replace(
          /\[REPRESENTATIVE TITLE\]/g,
          settings.legalRepresentative?.position || '[REPRESENTATIVE TITLE]'
        )
        .replace(
          /\[BUSINESS TYPE\]/g,
          settings.businessType || '[BUSINESS TYPE]'
        )
        .replace(
          /\[COUNTRY NAME\]/g,
          settings.address?.country || '[COUNTRY NAME]'
        );
    }

    // Replace additional company information
    if (data.companyInfo) {
      filledTemplate = filledTemplate
        .replace(
          /\[EORI NUMBER\]/g,
          data.companyInfo.eoriNumber || '[EORI NUMBER]'
        )
        .replace(
          /\[VAT NUMBER\]/g,
          data.companyInfo.vatNumber || '[VAT NUMBER]'
        )
        .replace(
          /\[REGISTRATION NUMBER\]/g,
          data.companyInfo.registrationNumber || '[REGISTRATION NUMBER]'
        );
    }

    // Replace shipment information
    if (data.shipmentInfo) {
      filledTemplate = filledTemplate
        .replace(
          /\[UNIQUE ID\]/g,
          data.shipmentInfo.shipmentId || '[UNIQUE ID]'
        )
        .replace(
          /\[DD\/MM\/YYYY\]/g,
          data.shipmentInfo.placementDate || '[DD/MM/YYYY]'
        )
        .replace(/\[LOCATION\]/g, data.shipmentInfo.portOfEntry || '[LOCATION]')
        .replace(/\[NUMBER\]/g, data.shipmentInfo.customsNumber || '[NUMBER]')
        .replace(
          /\[BILL OF LADING\/AWB\/CMR\]/g,
          data.shipmentInfo.transportDocument || '[BILL OF LADING/AWB/CMR]'
        )
        .replace(
          /\[CONTAINER IDS\]/g,
          data.shipmentInfo.containerNumbers?.join(', ') || '[CONTAINER IDS]'
        );
    }

    // Replace product information in table
    if (data.products && data.products.length > 0) {
      const productTableRows = data.products
        .map(
          product => `
        <tr>
          <td>${product.hsCode || '[CODE]'}</td>
          <td>${product.name || '[DESCRIPTION]'}</td>
          <td>tons</td>
          <td>${product.hsCode || '[HS CODE]'}</td>
        </tr>
      `
        )
        .join('');

      // Replace the template product rows
      filledTemplate = filledTemplate.replace(
        /<tr>\s*<td>\[CODE\]<\/td>[\s\S]*?<\/tr>\s*<tr>\s*<td>\[CODE\]<\/td>[\s\S]*?<\/tr>/,
        productTableRows
      );

      // Determine primary EUDR commodity
      const commodities = data.products.map(p =>
        this.getCommodityFromCategory(p.category || '')
      );
      const primaryCommodity = [...new Set(commodities)].join('/');
      filledTemplate = filledTemplate.replace(
        /\[CATTLE\/COCOA\/COFFEE\/PALM OIL\/SOY\/WOOD\/RUBBER\]/g,
        primaryCommodity || '[CATTLE/COCOA/COFFEE/PALM OIL/SOY/WOOD/RUBBER]'
      );
    }

    // Replace geolocation information
    if (data.geolocations && data.geolocations.length > 0) {
      const geoTableRows = data.geolocations
        .map(
          geo => `
        <tr>
          <td>${geo.plotNumber || '[ID]'}</td>
          <td>${geo.country || '[COUNTRY]'}</td>
          <td>${geo.coordinates.latitude.toFixed(6) || '[LAT 6 decimals]'}</td>
          <td>${geo.coordinates.longitude.toFixed(6) || '[LONG 6 decimals]'}</td>
          <td>${geo.area || '[AREA]'}</td>
          <td>Agricultural</td>
          <td>${geo.name || '[NAME]'}</td>
        </tr>
      `
        )
        .join('');

      // Replace the template geolocation rows
      filledTemplate = filledTemplate.replace(
        /<tr>\s*<td>\[ID\]<\/td>[\s\S]*?<\/tr>\s*<tr>\s*<td>\[ID\]<\/td>[\s\S]*?<\/tr>/,
        geoTableRows
      );
    }

    // Replace supply chain information
    if (data.supplyChains && data.supplyChains.length > 0) {
      const chain = data.supplyChains[0]; // Use first supply chain
      // For now, create a simple supply chain representation
      const chainInfo = `
        <p><strong>Supply Chain:</strong> ${chain.name}</p>
        <p><strong>Risk Level:</strong> ${chain.riskLevel}</p>
        <p><strong>Compliance Status:</strong> ${chain.isCompliant ? 'Compliant' : 'Non-Compliant'}</p>
      `;

      filledTemplate = filledTemplate.replace(
        /\[SUPPLY CHAIN INFORMATION\]/g,
        chainInfo
      );
    }

    // Add current date for various date fields
    const currentDate = new Date().toLocaleDateString('en-GB');
    filledTemplate = filledTemplate.replace(/\[DATE\]/g, currentDate);

    return filledTemplate;
  }

  /**
   * Get smart suggestions for field completion
   */
  static getFieldSuggestions(fieldType: string): string[] {
    switch (fieldType) {
      case 'role':
        return ['OPERATOR', 'TRADER'];
      case 'commodity':
        return [
          'CATTLE',
          'COCOA',
          'COFFEE',
          'PALM OIL',
          'SOY',
          'WOOD',
          'RUBBER',
        ];
      case 'riskLevel':
        return ['LOW', 'MEDIUM', 'HIGH'];
      case 'verificationMethod':
        return ['FIELD VISIT', 'SATELLITE', 'THIRD PARTY', 'DOCUMENTARY'];
      case 'compliance':
        return ['COMPLIANT', 'NON-COMPLIANT', 'PENDING'];
      case 'yesNo':
        return ['YES', 'NO'];
      case 'coordinates':
        return ['WGS84 (EPSG:4326)', 'GPS', 'SATELLITE', 'SURVEY'];
      case 'landUse':
        return ['Agricultural', 'Forestry', 'Mixed Use', 'Plantation'];
      case 'certification':
        return ['FSC', 'PEFC', 'RSPO', 'Rainforest Alliance', 'Fair Trade'];
      default:
        return [];
    }
  }

  /**
   * Validate DDS completeness
   */
  static validateDDS(content: string): {
    isComplete: boolean;
    missingFields: string[];
    warnings: string[];
  } {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    // Check for unfilled mandatory fields
    const mandatoryPatterns = [
      { pattern: /\[FULL LEGAL NAME\]/g, field: 'Company Name' },
      { pattern: /\[EORI NUMBER\]/g, field: 'EORI Number' },
      { pattern: /\[UNIQUE ID\]/g, field: 'Shipment ID' },
      { pattern: /\[CODE\]/g, field: 'Product Codes' },
      { pattern: /\[LAT 6 decimals\]/g, field: 'Geolocation Coordinates' },
    ];

    mandatoryPatterns.forEach(({ pattern, field }) => {
      if (pattern.test(content)) {
        missingFields.push(field);
      }
    });

    // Check for warnings
    if (content.includes('[DESCRIPTION]')) {
      warnings.push('Product descriptions are not filled');
    }
    if (content.includes('[COUNTRY]')) {
      warnings.push('Country information is incomplete');
    }
    if (content.includes('[DATE]')) {
      warnings.push('Some dates need to be specified');
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      warnings,
    };
  }

  /**
   * Extract commodity type from product category
   */
  private static getCommodityFromCategory(category: string): string {
    const categoryLower = category.toLowerCase();

    if (categoryLower.includes('coffee') || categoryLower.includes('кафе')) {
      return 'COFFEE';
    }
    if (
      categoryLower.includes('palm oil') ||
      categoryLower.includes('палмово масло')
    ) {
      return 'PALM OIL';
    }
    if (categoryLower.includes('soy') || categoryLower.includes('соя')) {
      return 'SOY';
    }
    if (
      categoryLower.includes('beef') ||
      categoryLower.includes('cattle') ||
      categoryLower.includes('говеждо')
    ) {
      return 'CATTLE';
    }
    if (
      categoryLower.includes('timber') ||
      categoryLower.includes('wood') ||
      categoryLower.includes('дървесина')
    ) {
      return 'WOOD';
    }
    if (categoryLower.includes('cocoa') || categoryLower.includes('какао')) {
      return 'COCOA';
    }
    if (categoryLower.includes('rubber') || categoryLower.includes('каучук')) {
      return 'RUBBER';
    }

    return 'OTHER';
  }

  /**
   * Generate AI-powered field suggestions based on context
   */
  static generateContextualSuggestions(
    fieldContent: string,
    context: DDSFormData
  ): string[] {
    const suggestions: string[] = [];

    // If field contains supplier placeholder and we have supplier data
    if (fieldContent.includes('[FULL LEGAL NAME]') && context.supplier) {
      suggestions.push(`Company: ${context.supplier.name}`);
      suggestions.push(`Address: ${context.supplier.address}`);
      suggestions.push(`Contact: ${context.supplier.contactPerson}`);
    }

    // If field contains product placeholder and we have product data
    if (fieldContent.includes('[DESCRIPTION]') && context.products?.length) {
      context.products.forEach(product => {
        suggestions.push(`Product: ${product.name} (${product.hsCode})`);
      });
    }

    // If field contains geolocation placeholder and we have geo data
    if (
      fieldContent.includes('[LAT 6 decimals]') &&
      context.geolocations?.length
    ) {
      context.geolocations.forEach(geo => {
        suggestions.push(
          `Plot ${geo.plotNumber}: ${geo.coordinates.latitude.toFixed(6)}, ${geo.coordinates.longitude.toFixed(6)}`
        );
      });
    }

    return suggestions;
  }
}

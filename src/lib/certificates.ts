// ============================================================================
// CERTIFICATE REGISTRY
// ============================================================================

export type CommodityType =
  | 'WOOD'
  | 'PALM_OIL'
  | 'COFFEE'
  | 'COCOA'
  | 'SOY'
  | 'CATTLE'
  | 'RUBBER';

export interface Certificate {
  id: string;
  name: string;
  applicableTo: CommodityType[];
  description: string;
  website?: string;
  verificationUrl?: string;
}

export const CERTIFICATE_REGISTRY: Certificate[] = [
  // Wood products
  {
    id: 'fsc',
    name: 'FSC (Forest Stewardship Council)',
    applicableTo: ['WOOD'],
    description: 'Forest management certification',
    website: 'https://fsc.org',
    verificationUrl: 'https://info.fsc.org/certificate.php',
  },
  {
    id: 'pefc',
    name: 'PEFC (Programme for the Endorsement of Forest Certification)',
    applicableTo: ['WOOD'],
    description: 'Sustainable forest management',
    website: 'https://pefc.org',
  },

  // Palm oil
  {
    id: 'rspo',
    name: 'RSPO (Roundtable on Sustainable Palm Oil)',
    applicableTo: ['PALM_OIL'],
    description: 'Sustainable palm oil production',
    website: 'https://rspo.org',
  },

  // Coffee
  {
    id: 'rainforest_alliance',
    name: 'Rainforest Alliance',
    applicableTo: ['COFFEE', 'COCOA'],
    description: 'Sustainable agriculture certification',
    website: 'https://www.rainforest-alliance.org',
  },
  {
    id: 'fairtrade',
    name: 'Fairtrade',
    applicableTo: ['COFFEE', 'COCOA'],
    description: 'Fair trade certification',
    website: 'https://www.fairtrade.net',
  },
  {
    id: '4c',
    name: '4C (Common Code for the Coffee Community)',
    applicableTo: ['COFFEE'],
    description: 'Coffee sustainability standard',
    website: 'https://www.4c-services.org',
  },

  // Cocoa
  {
    id: 'cocoa_horizons',
    name: 'Cocoa Horizons',
    applicableTo: ['COCOA'],
    description: 'Cocoa sustainability program',
    website: 'https://www.cocoahorizons.org',
  },
  {
    id: 'utz',
    name: 'UTZ Certified',
    applicableTo: ['COFFEE', 'COCOA'],
    description: 'Sustainable farming program',
    website: 'https://utz.org',
  },

  // Soy
  {
    id: 'rtrs',
    name: 'RTRS (Round Table on Responsible Soy)',
    applicableTo: ['SOY'],
    description: 'Responsible soy production',
    website: 'https://responsiblesoy.org',
  },
  {
    id: 'proterra',
    name: 'ProTerra',
    applicableTo: ['SOY'],
    description: 'Non-GMO soy certification',
    website: 'https://www.proterrafoundation.org',
  },

  // Cattle
  {
    id: 'certified_sustainable_beef',
    name: 'Certified Sustainable Beef',
    applicableTo: ['CATTLE'],
    description: 'Sustainable beef production',
    website: 'https://www.sustainablebeef.org',
  },
  {
    id: 'global_gap',
    name: 'GLOBALG.A.P.',
    applicableTo: ['CATTLE'],
    description: 'Good agricultural practices',
    website: 'https://www.globalgap.org',
  },

  // Rubber
  {
    id: 'fsc_rubber',
    name: 'FSC (Rubber)',
    applicableTo: ['RUBBER'],
    description: 'Sustainable natural rubber',
    website: 'https://fsc.org',
  },
  {
    id: 'snr',
    name: 'SNR (Sustainable Natural Rubber)',
    applicableTo: ['RUBBER'],
    description: 'Natural rubber sustainability',
    website: 'https://www.snr-i.org',
  },

  // General/Multiple
  {
    id: 'organic',
    name: 'Organic Certification',
    applicableTo: ['COFFEE', 'COCOA', 'SOY', 'CATTLE'],
    description: 'Organic production standards',
  },
];

/**
 * Get certificate by ID
 */
export function getCertificateById(id: string): Certificate | undefined {
  return CERTIFICATE_REGISTRY.find(cert => cert.id === id);
}

/**
 * Get all certificates for a specific commodity type
 */
export function getCertificatesByCommodity(
  commodityType: CommodityType
): Certificate[] {
  return CERTIFICATE_REGISTRY.filter(cert =>
    cert.applicableTo.includes(commodityType)
  );
}

/**
 * Get certificates from metadata IDs
 */
export function getCertificatesByIds(ids: string[]): Certificate[] {
  return ids.map(id => getCertificateById(id)).filter(Boolean) as Certificate[];
}

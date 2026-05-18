export const DDS_TEMPLATE = `
<h1 style="text-align: center; font-weight: bold; margin-bottom: 20px;">EUDR Due Diligence Statement (DDS) Template</h1>

<h2>SECTION 1: OPERATOR/TRADER INFORMATION</h2>

<h3>1.1 Company Details</h3>
<p><strong>Company Name:</strong> [FULL LEGAL NAME]</p>
<p><strong>EORI Number:</strong> [EORI NUMBER]</p>
<p><strong>VAT Number:</strong> [VAT NUMBER]</p>
<p><strong>Company Registration Number:</strong> [REGISTRATION NUMBER]</p>
<p><strong>Registered Address:</strong> [FULL ADDRESS]</p>
<p><strong>Contact Person:</strong> [NAME, TITLE]</p>
<p><strong>Email:</strong> [EMAIL ADDRESS]</p>
<p><strong>Phone:</strong> [PHONE NUMBER]</p>

<h3>1.2 Role Declaration</h3>
<p><strong>Role in Supply Chain:</strong> [OPERATOR / TRADER]</p>
<p><strong>Definition Confirmation:</strong></p>
<ul>
  <li>☐ Operator: First entity to place products on EU market or export from EU</li>
  <li>☐ Trader: Entity in supply chain (after operator) that makes products available on EU market</li>
</ul>

<h2>SECTION 2: SHIPMENT/CONSIGNMENT DETAILS</h2>

<h3>2.1 Consignment Information</h3>
<p><strong>Consignment/Shipment ID:</strong> [UNIQUE ID]</p>
<p><strong>Date of Placement on Market:</strong> [DD/MM/YYYY]</p>
<p><strong>Port/Point of Entry:</strong> [LOCATION]</p>
<p><strong>Customs Declaration Number:</strong> [NUMBER]</p>
<p><strong>Transport Document Number:</strong> [BILL OF LADING/AWB/CMR]</p>
<p><strong>Container Numbers:</strong> [CONTAINER IDS]</p>

<h3>2.2 Destination</h3>
<p><strong>Final Destination Country:</strong> [COUNTRY]</p>
<p><strong>Final Destination Address:</strong> [FULL ADDRESS]</p>
<p><strong>Consignee Details:</strong> [NAME, ADDRESS]</p>

<h2>SECTION 3: PRODUCT INFORMATION</h2>

<h3>3.1 Products in Consignment</h3>
<table>
  <thead>
    <tr>
      <th>Product Code</th>
      <th>Description</th>
      <th>Quantity</th>
      <th>Unit</th>
      <th>Weight (kg)</th>
      <th>HS/CN Code</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[CODE]</td>
      <td>[DESCRIPTION]</td>
      <td>[QTY]</td>
      <td>[UNIT]</td>
      <td>[WEIGHT]</td>
      <td>[HS CODE]</td>
    </tr>
    <tr>
      <td>[CODE]</td>
      <td>[DESCRIPTION]</td>
      <td>[QTY]</td>
      <td>[UNIT]</td>
      <td>[WEIGHT]</td>
      <td>[HS CODE]</td>
    </tr>
  </tbody>
</table>

<p><strong>Total Quantity:</strong> [TOTAL] <strong>Total Weight:</strong> [TOTAL KG]</p>

<h3>3.2 EUDR Commodity Classification</h3>
<p><strong>Primary EUDR Commodity:</strong> [CATTLE/COCOA/COFFEE/PALM OIL/SOY/WOOD/RUBBER]</p>
<p><strong>Derived Products:</strong> [YES/NO - LIST IF YES]</p>

<h2>SECTION 4: WOOD/FIBER SPECIES INFORMATION</h2>
<p><em>(Complete for wood-based products)</em></p>

<h3>4.1 Species Declaration</h3>
<table>
  <thead>
    <tr>
      <th>Species Common Name</th>
      <th>Scientific Name (Latin)</th>
      <th>Percentage by Weight</th>
      <th>CITES Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[NAME]</td>
      <td>[SCIENTIFIC NAME]</td>
      <td>[%]</td>
      <td>[LISTED/NOT LISTED]</td>
    </tr>
    <tr>
      <td>[NAME]</td>
      <td>[SCIENTIFIC NAME]</td>
      <td>[%]</td>
      <td>[LISTED/NOT LISTED]</td>
    </tr>
  </tbody>
</table>

<p><strong>Total Percentage:</strong> [MUST EQUAL 100%]</p>

<h3>4.2 Species Verification</h3>
<p><strong>Species Identification Method:</strong> [VISUAL/DNA/ANATOMICAL/CERTIFICATE]</p>
<p><strong>Verification Authority:</strong> [NAME IF APPLICABLE]</p>
<p><strong>Verification Date:</strong> [DATE]</p>
<p><strong>Verification Document:</strong> [DOCUMENT REFERENCE]</p>

<h2>SECTION 5: GEOLOCATION INFORMATION</h2>

<h3>5.1 Production Areas</h3>
<p>All plots where commodities were produced:</p>
<table>
  <thead>
    <tr>
      <th>Plot ID</th>
      <th>Country</th>
      <th>Latitude</th>
      <th>Longitude</th>
      <th>Area (ha)</th>
      <th>Land Use Type</th>
      <th>Owner/Manager</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[ID]</td>
      <td>[COUNTRY]</td>
      <td>[LAT 6 decimals]</td>
      <td>[LONG 6 decimals]</td>
      <td>[AREA]</td>
      <td>[TYPE]</td>
      <td>[NAME]</td>
    </tr>
    <tr>
      <td>[ID]</td>
      <td>[COUNTRY]</td>
      <td>[LAT 6 decimals]</td>
      <td>[LONG 6 decimals]</td>
      <td>[AREA]</td>
      <td>[TYPE]</td>
      <td>[NAME]</td>
    </tr>
  </tbody>
</table>

<h3>5.2 Geolocation Verification</h3>
<p><strong>Coordinate System:</strong> WGS84 (EPSG:4326)</p>
<p><strong>Accuracy Level:</strong> [±X METERS]</p>
<p><strong>Data Source:</strong> [GPS/SATELLITE/SURVEY/OTHER]</p>
<p><strong>Collection Date:</strong> [DATE]</p>
<p><strong>Verification Method:</strong> [FIELD VISIT/SATELLITE/THIRD PARTY]</p>

<h3>5.3 Polygon Data (for plots ≥4 ha)</h3>
<p><strong>GeoJSON Files Attached:</strong> [YES/NO]</p>
<p><strong>File Names:</strong> [LIST FILES]</p>

<h2>SECTION 6: PRODUCTION DATE VERIFICATION</h2>

<h3>6.1 Production Timeline</h3>
<p><strong>Harvest/Production Start Date:</strong> [DD/MM/YYYY]</p>
<p><strong>Harvest/Production End Date:</strong> [DD/MM/YYYY]</p>
<p><strong>All production occurred after 31/12/2020:</strong> [CONFIRMED ✓]</p>

<h3>6.2 Deforestation Cutoff Compliance</h3>
<p><strong>Declaration:</strong> All commodities in this consignment were produced on land that was NOT deforested or degraded after 31 December 2020.</p>
<p><strong>Verification Evidence:</strong></p>
<ul>
  <li>☐ Satellite imagery analysis</li>
  <li>☐ Ground verification</li>
  <li>☐ Third-party certification</li>
  <li>☐ Government forest monitoring data</li>
  <li>☐ Historical land use records</li>
</ul>
<p><strong>Supporting Documents:</strong> [LIST DOCUMENT REFERENCES]</p>

<h2>SECTION 7: SUPPLY CHAIN INFORMATION</h2>

<h3>7.1 Complete Chain of Custody</h3>
<table>
  <thead>
    <tr>
      <th>Stage</th>
      <th>Company Name</th>
      <th>Country</th>
      <th>Address</th>
      <th>Contact</th>
      <th>Role</th>
      <th>Documents</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>[PRODUCER]</td>
      <td>[COUNTRY]</td>
      <td>[ADDRESS]</td>
      <td>[CONTACT]</td>
      <td>Grower/Producer</td>
      <td>[DOCS]</td>
    </tr>
    <tr>
      <td>2</td>
      <td>[AGGREGATOR]</td>
      <td>[COUNTRY]</td>
      <td>[ADDRESS]</td>
      <td>[CONTACT]</td>
      <td>Aggregator</td>
      <td>[DOCS]</td>
    </tr>
    <tr>
      <td>3</td>
      <td>[PROCESSOR]</td>
      <td>[COUNTRY]</td>
      <td>[ADDRESS]</td>
      <td>[CONTACT]</td>
      <td>Mill/Processor</td>
      <td>[DOCS]</td>
    </tr>
    <tr>
      <td>4</td>
      <td>[CONVERTER]</td>
      <td>[COUNTRY]</td>
      <td>[ADDRESS]</td>
      <td>[CONTACT]</td>
      <td>Converter</td>
      <td>[DOCS]</td>
    </tr>
    <tr>
      <td>5</td>
      <td>[EXPORTER]</td>
      <td>[COUNTRY]</td>
      <td>[ADDRESS]</td>
      <td>[CONTACT]</td>
      <td>Exporter</td>
      <td>[DOCS]</td>
    </tr>
  </tbody>
</table>

<h3>7.2 Traceability Verification</h3>
<p><strong>Chain Documentation Complete:</strong> [YES/NO]</p>
<p><strong>Volume Reconciliation:</strong> [VERIFIED/DISCREPANCIES]</p>
<p><strong>Timeline Consistency:</strong> [VERIFIED/ISSUES]</p>
<p><strong>Third-Party Chain Verification:</strong> [YES/NO - PROVIDER]</p>

<h2>SECTION 8: LEGAL COMPLIANCE</h2>

<h3>8.1 Country of Production Legal Compliance</h3>
<p><strong>Country:</strong> [COUNTRY NAME]</p>
<p><strong>Applicable Laws Verified:</strong></p>
<table>
  <thead>
    <tr>
      <th>Legal Requirement</th>
      <th>Status</th>
      <th>Permit/License Number</th>
      <th>Validity Date</th>
      <th>Verification Method</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Harvesting Rights</td>
      <td>[COMPLIANT]</td>
      <td>[NUMBER]</td>
      <td>[DATE]</td>
      <td>[METHOD]</td>
    </tr>
    <tr>
      <td>Land Use Permits</td>
      <td>[COMPLIANT]</td>
      <td>[NUMBER]</td>
      <td>[DATE]</td>
      <td>[METHOD]</td>
    </tr>
    <tr>
      <td>Environmental Permits</td>
      <td>[COMPLIANT]</td>
      <td>[NUMBER]</td>
      <td>[DATE]</td>
      <td>[METHOD]</td>
    </tr>
    <tr>
      <td>Export Permits</td>
      <td>[COMPLIANT]</td>
      <td>[NUMBER]</td>
      <td>[DATE]</td>
      <td>[METHOD]</td>
    </tr>
    <tr>
      <td>Tax Compliance</td>
      <td>[COMPLIANT]</td>
      <td>[NUMBER]</td>
      <td>[DATE]</td>
      <td>[METHOD]</td>
    </tr>
  </tbody>
</table>

<h3>8.2 Legal Verification</h3>
<p><strong>Legal Compliance Verified By:</strong> [INTERNAL/THIRD PARTY/GOVERNMENT]</p>
<p><strong>Verification Date:</strong> [DATE]</p>
<p><strong>Verification Authority:</strong> [NAME]</p>
<p><strong>Verification Document:</strong> [REFERENCE]</p>

<h2>SECTION 9: RISK ASSESSMENT RESULTS</h2>

<h3>9.1 Risk Level Determination</h3>
<p><strong>Overall Risk Assessment:</strong> [LOW/MEDIUM/HIGH]</p>
<p><strong>Assessment Date:</strong> [DATE]</p>
<p><strong>Assessment Reference:</strong> [INTERNAL REFERENCE]</p>

<h3>9.2 Risk Factors Evaluated</h3>
<table>
  <thead>
    <tr>
      <th>Risk Factor</th>
      <th>Level</th>
      <th>Mitigation Measures</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Country Risk</td>
      <td>[L/M/H]</td>
      <td>[MEASURES IF ANY]</td>
    </tr>
    <tr>
      <td>Geolocation Risk</td>
      <td>[L/M/H]</td>
      <td>[MEASURES IF ANY]</td>
    </tr>
    <tr>
      <td>Species Risk</td>
      <td>[L/M/H]</td>
      <td>[MEASURES IF ANY]</td>
    </tr>
    <tr>
      <td>Supply Chain Risk</td>
      <td>[L/M/H]</td>
      <td>[MEASURES IF ANY]</td>
    </tr>
    <tr>
      <td>Legal Risk</td>
      <td>[L/M/H]</td>
      <td>[MEASURES IF ANY]</td>
    </tr>
  </tbody>
</table>

<h3>9.3 Risk Mitigation Actions Taken</h3>
<ul>
  <li>[ACTION 1]</li>
  <li>[ACTION 2]</li>
  <li>[ACTION 3]</li>
</ul>

<h2>SECTION 10: CERTIFICATION INFORMATION</h2>

<h3>10.1 Sustainability Certificates</h3>
<table>
  <thead>
    <tr>
      <th>Certificate Type</th>
      <th>Certificate Number</th>
      <th>Holder</th>
      <th>Validity Date</th>
      <th>Scope</th>
      <th>% Coverage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>FSC</td>
      <td>[NUMBER]</td>
      <td>[HOLDER]</td>
      <td>[DATE]</td>
      <td>[SCOPE]</td>
      <td>[%]</td>
    </tr>
    <tr>
      <td>PEFC</td>
      <td>[NUMBER]</td>
      <td>[HOLDER]</td>
      <td>[DATE]</td>
      <td>[SCOPE]</td>
      <td>[%]</td>
    </tr>
    <tr>
      <td>Other</td>
      <td>[NUMBER]</td>
      <td>[HOLDER]</td>
      <td>[DATE]</td>
      <td>[SCOPE]</td>
      <td>[%]</td>
    </tr>
  </tbody>
</table>

<h3>10.2 Certificate Verification</h3>
<p><strong>Certificate Status Verified:</strong> [YES/NO]</p>
<p><strong>Chain of Custody Maintained:</strong> [YES/NO]</p>
<p><strong>Certificate Copies Attached:</strong> [YES/NO]</p>

<h2>SECTION 11: ADDITIONAL VERIFICATION</h2>

<h3>11.1 Third-Party Verification</h3>
<p><strong>Independent Audit Conducted:</strong> [YES/NO]</p>
<p><strong>Auditor:</strong> [COMPANY NAME]</p>
<p><strong>Audit Date:</strong> [DATE]</p>
<p><strong>Audit Report Reference:</strong> [REFERENCE]</p>
<p><strong>Audit Conclusions:</strong> [COMPLIANT/ISSUES NOTED]</p>

<h3>11.2 Satellite Monitoring</h3>
<p><strong>Satellite Monitoring Used:</strong> [YES/NO]</p>
<p><strong>Monitoring Service:</strong> [PROVIDER NAME]</p>
<p><strong>Monitoring Period:</strong> [FROM - TO]</p>
<p><strong>Deforestation Alerts:</strong> [NONE/RESOLVED/PENDING]</p>
<p><strong>Monitoring Report:</strong> [REFERENCE]</p>

<h2>SECTION 12: SUPPORTING DOCUMENTATION</h2>

<h3>12.1 Mandatory Documents Attached</h3>
<ul>
  <li>☐ Geolocation data (coordinates/polygons)</li>
  <li>☐ Supply chain documentation</li>
  <li>☐ Legal compliance evidence</li>
  <li>☐ Production timeline verification</li>
  <li>☐ Risk assessment report</li>
</ul>

<h3>12.2 Additional Documents</h3>
<ul>
  <li>☐ Sustainability certificates</li>
  <li>☐ Third-party audit reports</li>
  <li>☐ Satellite monitoring reports</li>
  <li>☐ Government permits/licenses</li>
  <li>☐ Laboratory test reports</li>
</ul>
<p><strong>Document Reference Numbers:</strong> [LIST ALL ATTACHED DOCUMENTS]</p>

<h2>SECTION 13: DECLARATIONS AND STATEMENTS</h2>

<h3>13.1 Deforestation-Free Declaration</h3>
<p>I hereby declare that:</p>
<ul>
  <li>All commodities in this consignment were produced on land that was NOT subject to deforestation after 31 December 2020</li>
  <li>All commodities in this consignment were produced on land that was NOT subject to forest degradation after 31 December 2020</li>
  <li>All commodities were produced in accordance with relevant legislation of the country of production</li>
</ul>

<h3>13.2 Information Accuracy Declaration</h3>
<p>I hereby declare that:</p>
<ul>
  <li>All information provided in this DDS is complete, accurate, and up-to-date</li>
  <li>All supporting documentation is genuine and unaltered</li>
  <li>I am authorized to make this declaration on behalf of [COMPANY NAME]</li>
  <li>I understand the legal consequences of providing false information</li>
</ul>

<h3>13.3 Data Processing Consent</h3>
<p>I hereby consent to:</p>
<ul>
  <li>Processing of personal data contained in this DDS by relevant EU authorities</li>
  <li>Sharing of this information with competent authorities for compliance verification</li>
  <li>Retention of this data for the period required by EUDR (minimum 5 years)</li>
</ul>

<h2>SECTION 14: SUBMISSION DETAILS</h2>

<h3>14.1 DDS Submission</h3>
<p><strong>DDS Reference Number:</strong> [AUTO-GENERATED BY SYSTEM]</p>
<p><strong>Submission Date:</strong> [DD/MM/YYYY]</p>
<p><strong>Submitted By:</strong> [NAME, TITLE]</p>
<p><strong>Submission Method:</strong> [EU INFORMATION SYSTEM]</p>

<h3>14.2 Processing Status</h3>
<p><strong>Status:</strong> [SUBMITTED/UNDER REVIEW/APPROVED/REJECTED]</p>
<p><strong>Processing Authority:</strong> [COMPETENT AUTHORITY]</p>
<p><strong>Processing Date:</strong> [DATE]</p>
<p><strong>Reference Number:</strong> [AUTHORITY REFERENCE]</p>

<h2>SECTION 15: SIGNATURES AND AUTHORIZATION</h2>

<h3>15.1 Company Representative</h3>
<p><strong>Name:</strong> [FULL NAME]</p>
<p><strong>Title:</strong> [TITLE]</p>
<p><strong>Date:</strong> [DD/MM/YYYY]</p>
<p><strong>Signature:</strong> [DIGITAL/PHYSICAL SIGNATURE]</p>
<p>I confirm that I am authorized to submit this DDS on behalf of [COMPANY NAME] and that all information provided is accurate to the best of my knowledge.</p>

<h3>15.2 Legal Representative (if different)</h3>
<p><strong>Name:</strong> [FULL NAME]</p>
<p><strong>Title:</strong> [TITLE]</p>
<p><strong>Date:</strong> [DD/MM/YYYY]</p>
<p><strong>Signature:</strong> [DIGITAL/PHYSICAL SIGNATURE]</p>

<hr>

<h3>NOTES FOR COMPLETION</h3>
<ul>
  <li><strong>Mandatory Fields:</strong> All fields marked with * must be completed</li>
  <li><strong>Geolocation Precision:</strong> Minimum 6 decimal places for coordinates</li>
  <li><strong>Document Retention:</strong> Keep all supporting documents for minimum 5 years</li>
  <li><strong>Updates:</strong> Any changes to information require DDS amendment</li>
  <li><strong>Multiple Plots:</strong> If shipment contains material from multiple plots, ALL must be listed</li>
  <li><strong>Language:</strong> Complete in language required by competent authority</li>
  <li><strong>Digital Signature:</strong> Use qualified electronic signature where required</li>
</ul>

<p><strong>Template Version:</strong> 1.0</p>
<p><strong>Valid From:</strong> December 30, 2024</p>
<p><strong>Review Date:</strong> Annual</p>
`;

// AI assistance prompts and mappings
export const AI_FIELD_MAPPINGS = {
  '[FULL LEGAL NAME]': 'supplier.name',
  '[COUNTRY]': 'supplier.country',
  '[ADDRESS]': 'supplier.address',
  '[EMAIL ADDRESS]': 'supplier.email',
  '[PHONE NUMBER]': 'supplier.phone',
  '[NAME, TITLE]': 'supplier.contactPerson',
  '[DESCRIPTION]': 'product.name',
  '[QTY]': 'product.volume',
  '[HS CODE]': 'product.hsCode',
  '[LAT 6 decimals]': 'geolocation.coordinates.latitude',
  '[LONG 6 decimals]': 'geolocation.coordinates.longitude',
  '[AREA]': 'geolocation.area',
  '[ID]': 'geolocation.plotNumber',
  '[TYPE]': 'geolocation.landUseType',
  '[NAME]': 'geolocation.ownerName',
};

export const AI_SUGGESTIONS = {
  supplier: {
    name: 'Use supplier company name from your records',
    country: 'Country where supplier is registered and operates',
    address: 'Full registered business address of the supplier',
    email: 'Primary business email for EUDR correspondence',
    phone: 'Business phone number with country code',
    contactPerson: 'Primary contact person with title for EUDR matters',
  },
  product: {
    name: 'Specific product name as it appears in commercial documents',
    volume: 'Total quantity being imported in metric units',
    hsCode: 'Harmonized System code for customs classification',
    category:
      'EUDR commodity category (cattle, cocoa, coffee, palm oil, soy, wood, rubber)',
  },
  geolocation: {
    coordinates: 'GPS coordinates with minimum 6 decimal places precision',
    area: 'Plot area in hectares',
    plotNumber: 'Unique identifier for the production plot',
    landUseType: 'Type of land use (agricultural, forestry, etc.)',
    ownerName: 'Legal owner or manager of the production area',
  },
  supplyChain: {
    stages: 'Complete chain from production to EU border',
    documentation: 'All transport and custody documents',
    verification: 'Third-party verification of chain integrity',
  },
};

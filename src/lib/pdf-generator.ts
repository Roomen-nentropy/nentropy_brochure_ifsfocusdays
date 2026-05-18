import jsPDF from 'jspdf';
import axios from 'axios';
import { API_BASE_URL } from '../services';

interface GeolocationData {
  latitude: number;
  longitude: number;
  country: string;
  plotId?: string;
  percentage?: number;
}

interface BatchVerificationData {
  batchNumber: string;
  productName: string;
  quantity: number;
  ddsNumber?: string;
  ddsStatus?: string;
  geolocations: GeolocationData[];
  submittedAt?: string;
}

export const generateBatchVerificationPDF = async (
  batchId: string,
  batchType: 'PRODUCT' | 'OWN_GOOD'
): Promise<void> => {
  try {
    // Fetch verification data
    const response = await axios.get(
      `${API_BASE_URL}/api/dds-submissions/batch-verification/${batchId}?batchType=${batchType}`,
      { withCredentials: true }
    );

    const data: BatchVerificationData = response.data;

    // Create PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text('EUDR Batch Verification Document', 20, yPosition);
    yPosition += 15;

    // Batch Information Section
    doc.setFontSize(14);
    doc.text('Batch Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.text(`Batch Number: ${data.batchNumber}`, 20, yPosition);
    yPosition += 7;

    doc.text(`Product: ${data.productName}`, 20, yPosition);
    yPosition += 7;

    doc.text(`Quantity: ${data.quantity}`, 20, yPosition);
    yPosition += 7;

    if (data.ddsNumber) {
      doc.text(`DDS Number: ${data.ddsNumber}`, 20, yPosition);
      yPosition += 7;
    }

    if (data.ddsStatus) {
      doc.text(`DDS Status: ${data.ddsStatus}`, 20, yPosition);
      yPosition += 7;
    }

    if (data.submittedAt) {
      doc.text(
        `Submitted: ${new Date(data.submittedAt).toLocaleString()}`,
        20,
        yPosition
      );
      yPosition += 7;
    }

    yPosition += 10;

    // Geolocations Section
    doc.setFontSize(14);
    doc.text('Verified Geolocations', 20, yPosition);
    yPosition += 10;

    if (data.geolocations && data.geolocations.length > 0) {
      doc.setFontSize(10);

      data.geolocations.forEach((geo, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(`Location ${index + 1}:`, 20, yPosition);
        yPosition += 6;

        doc.text(
          `  Coordinates: ${geo.latitude.toFixed(6)}, ${geo.longitude.toFixed(6)}`,
          20,
          yPosition
        );
        yPosition += 6;

        doc.text(`  Country: ${geo.country}`, 20, yPosition);
        yPosition += 6;

        if (geo.plotId) {
          doc.text(`  Plot ID: ${geo.plotId}`, 20, yPosition);
          yPosition += 6;
        }

        if (geo.percentage) {
          doc.text(`  Percentage: ${geo.percentage}%`, 20, yPosition);
          yPosition += 6;
        }

        yPosition += 5;
      });
    } else {
      doc.setFontSize(11);
      doc.text('No geolocations available', 20, yPosition);
      yPosition += 10;
    }

    // Footer
    yPosition = 280;
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    doc.text(
      'This document verifies EUDR compliance data for the specified batch.',
      20,
      yPosition + 5
    );

    // Save PDF
    const filename = `batch-verification-${data.batchNumber}-${Date.now()}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate batch verification PDF');
  }
};

export const downloadBatchVerificationPDF = (
  batchId: string,
  batchType: 'PRODUCT' | 'OWN_GOOD'
) => {
  generateBatchVerificationPDF(batchId, batchType)
    .then(() => {
      console.log('PDF downloaded successfully');
    })
    .catch(error => {
      console.error('PDF download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    });
};

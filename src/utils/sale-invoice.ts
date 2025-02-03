import { jsPDF } from 'jspdf';
import type { Sale } from '../types/database';
import { format } from 'date-fns';

export const generateSaleInvoicePDF = async (sale: Sale) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Add company header
  doc.setFontSize(20);
  doc.text('DINITECH', margin, margin);
  
  doc.setFontSize(12);
  doc.text('Facture', margin, margin + 10);
  doc.text(`Date: ${format(new Date(sale.date), 'PP')}`, margin, margin + 20);
  doc.text(`Facture #: ${sale.id.slice(0, 8)}`, margin, margin + 30);

  // Add customer information
  doc.setFontSize(14);
  doc.text('Informations Client', margin, margin + 50);
  doc.setFontSize(12);
  doc.text(`Nom: ${sale.customer.name}`, margin, margin + 60);
  if (sale.customer.email) {
    doc.text(`Email: ${sale.customer.email}`, margin, margin + 70);
  }
  if (sale.customer.phone) {
    doc.text(`Téléphone: ${sale.customer.phone}`, margin, margin + 80);
  }

  // Add sale details
  doc.setFontSize(14);
  doc.text('Détails de la Vente', margin, margin + 100);
  doc.setFontSize(12);

  let yPos = margin + 110;
  sale.items.forEach((item) => {
    const name = item.product?.name || item.service?.name || '';
    doc.text(name, margin, yPos);
    doc.text(
      `${item.quantity} x ${item.unit_price.toLocaleString()} Ar`,
      margin,
      yPos + 10
    );
    doc.text(
      `${item.total_price.toLocaleString()} Ar`,
      pageWidth - margin - 40,
      yPos + 10,
      { align: 'right' }
    );
    yPos += 25;
  });

  // Add total
  doc.setFontSize(14);
  doc.text('Total', margin, yPos + 10);
  doc.setFontSize(16);
  doc.text(
    `${sale.total_amount.toLocaleString()} Ar`,
    pageWidth - margin - 40,
    yPos + 10,
    { align: 'right' }
  );

  // Add footer
  doc.setFontSize(10);
  doc.text(
    'Merci de votre confiance !',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 20,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`facture-${sale.id.slice(0, 8)}.pdf`);
};

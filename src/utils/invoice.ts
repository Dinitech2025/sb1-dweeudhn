import { jsPDF } from 'jspdf';
import type { SubscriptionWithDetails } from '../types/database';
import { format } from 'date-fns';

export const generateInvoicePDF = async (subscription: SubscriptionWithDetails) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Add company header
  doc.setFontSize(20);
  doc.text('DINITECH', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.text(`Facture #${subscription.id.slice(0, 8)}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.text(`Date: ${format(new Date(subscription.created_at), 'PP')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Add customer information
  doc.setFontSize(14);
  doc.text('Informations Client', margin, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(subscription.customer.name, margin, yPos);
  yPos += 7;
  if (subscription.customer.email) {
    doc.text(subscription.customer.email, margin, yPos);
    yPos += 7;
  }
  if (subscription.customer.phone) {
    doc.text(subscription.customer.phone, margin, yPos);
    yPos += 7;
  }
  yPos += 10;

  // Add subscription details
  doc.setFontSize(14);
  doc.text('Détails de l\'Abonnement', margin, yPos);
  yPos += 10;
  doc.setFontSize(12);

  // Plan
  doc.text('Plan', margin, yPos);
  doc.text(subscription.plan.name, pageWidth - margin - 40, yPos, { align: 'right' });
  yPos += 10;

  // Profiles
  doc.text('Profils:', margin, yPos);
  yPos += 7;
  subscription.profiles_data.forEach(profile => {
    doc.text(`• ${profile.profile_name}`, margin + 5, yPos);
    yPos += 7;
  });
  yPos += 3;

  // Period
  doc.text('Période', margin, yPos);
  doc.text(
    `${format(new Date(subscription.start_date), 'PP')} - ${format(new Date(subscription.end_date), 'PP')}`,
    pageWidth - margin - 40,
    yPos,
    { align: 'right' }
  );
  yPos += 20;

  // Add total
  doc.setFontSize(14);
  doc.text('Total', margin, yPos);
  doc.setFontSize(16);
  doc.text(
    `${subscription.plan.price_ar.toLocaleString()} Ar`,
    pageWidth - margin - 40,
    yPos,
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
  doc.save(`facture-${subscription.id.slice(0, 8)}.pdf`);
};

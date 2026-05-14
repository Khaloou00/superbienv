import PDFDocument from 'pdfkit';

const NIGHT   = '#0a0a0a';
const SURFACE = '#141414';
const GOLD    = '#F5C518';
const WHITE   = '#FFFFFF';
const MUTED   = '#A0A0A0';

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const generateTicketPdf = (bookingData) =>
  new Promise((resolve, reject) => {
    const {
      numero, filmTitre, place, isVIP, immatriculation,
      montant, methode, qrCodeBase64, seanceDate, seanceHeure, userName,
    } = bookingData;

    const doc = new PDFDocument({
      size: [400, 600],
      margin: 0,
      info: { Title: `Billet SUPERBIENV — ${numero}`, Author: 'SUPERBIENV Drive-In' },
    });

    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Background ──────────────────────────────────────────────────────────
    doc.rect(0, 0, 400, 600).fill(NIGHT);

    // ── Gold top bar ────────────────────────────────────────────────────────
    doc.rect(0, 0, 400, 6).fill(GOLD);

    // ── Header ──────────────────────────────────────────────────────────────
    doc.fillColor(GOLD)
       .font('Helvetica-Bold')
       .fontSize(22)
       .text('SUPERBIENV', 0, 24, { align: 'center' });

    doc.fillColor(MUTED)
       .font('Helvetica')
       .fontSize(9)
       .text('DRIVE-IN CINEMA · ABIDJAN, CÔTE D\'IVOIRE', 0, 50, { align: 'center' });

    // ── Divider ─────────────────────────────────────────────────────────────
    doc.moveTo(32, 74).lineTo(368, 74).lineWidth(0.5).strokeColor(GOLD).stroke();

    // ── Film title ──────────────────────────────────────────────────────────
    doc.fillColor(WHITE)
       .font('Helvetica-Bold')
       .fontSize(16)
       .text(filmTitre || '—', 32, 90, { width: 336, align: 'center' });

    if (isVIP) {
      doc.fillColor(GOLD)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text('✦ PLACE VIP ✦', 0, 114, { align: 'center' });
    }

    // ── Surface card ────────────────────────────────────────────────────────
    const cardTop = isVIP ? 132 : 122;
    doc.roundedRect(24, cardTop, 352, 150, 8).fill(SURFACE);

    const col1x = 40;
    const col2x = 220;
    let rowY = cardTop + 16;
    const rowH = 28;

    const field = (label, value, x, y) => {
      doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8).text(label, x, y);
      doc.fillColor(WHITE).font('Helvetica').fontSize(11).text(value || '—', x, y + 11, { width: 150 });
    };

    field('NOM', userName,       col1x, rowY);
    field('PLACE', place,        col2x, rowY);
    rowY += rowH;

    field('VÉHICULE', immatriculation,  col1x, rowY);
    field('MONTANT', montant != null ? `${Number(montant).toLocaleString('fr-CI')} FCFA` : '—', col2x, rowY);
    rowY += rowH;

    const dateStr = seanceDate
      ? new Date(seanceDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';
    field('DATE', dateStr,         col1x, rowY);
    field('HEURE', seanceHeure || '—', col2x, rowY);
    rowY += rowH;

    field('PAIEMENT', methode || '—', col1x, rowY);

    // ── Perforated separator ─────────────────────────────────────────────────
    const sepY = cardTop + 166;
    doc.moveTo(32, sepY).lineTo(368, sepY)
       .lineWidth(1)
       .dash(4, { space: 5 })
       .strokeColor(MUTED)
       .stroke();
    doc.undash();

    // ── QR code ──────────────────────────────────────────────────────────────
    const qrTop = sepY + 14;
    if (qrCodeBase64) {
      const base64Data = qrCodeBase64.replace(/^data:image\/\w+;base64,/, '');
      const imgBuf = Buffer.from(base64Data, 'base64');
      doc.image(imgBuf, 140, qrTop, { width: 120, height: 120 });
    } else {
      doc.roundedRect(140, qrTop, 120, 120, 4).fill(SURFACE);
      doc.fillColor(MUTED).font('Helvetica').fontSize(9).text('QR indisponible', 140, qrTop + 55, { width: 120, align: 'center' });
    }

    doc.fillColor(MUTED)
       .font('Helvetica')
       .fontSize(8)
       .text('Présentez ce code à l\'entrée', 0, qrTop + 128, { align: 'center' });

    // ── Reservation number ───────────────────────────────────────────────────
    doc.fillColor(GOLD)
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(numero || '', 0, qrTop + 146, { align: 'center' });

    // ── Gold bottom bar ──────────────────────────────────────────────────────
    doc.rect(0, 594, 400, 6).fill(GOLD);

    doc.end();
  });

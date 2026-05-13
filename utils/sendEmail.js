import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"SUPERBIENV" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const bookingConfirmationEmail = (booking, film, user) => ({
  subject: `Confirmation de réservation — ${film.titre}`,
  html: `
    <div style="background:#0a0a0a;color:#fff;padding:32px;font-family:Inter,sans-serif;max-width:600px;margin:0 auto;border-radius:12px">
      <h1 style="color:#F5C518;margin-bottom:8px">SUPERBIENV Drive-In</h1>
      <p style="color:#A0A0A0">Vivez le cinéma autrement</p>
      <hr style="border-color:#222;margin:24px 0"/>
      <h2 style="color:#fff">Bonjour ${user.nom},</h2>
      <p>Votre réservation est confirmée !</p>
      <div style="background:#141414;border-radius:8px;padding:20px;margin:20px 0">
        <p><strong style="color:#F5C518">Film :</strong> ${film.titre}</p>
        <p><strong style="color:#F5C518">Place :</strong> ${booking.place}</p>
        <p><strong style="color:#F5C518">Véhicule :</strong> ${booking.immatriculation}</p>
        <p><strong style="color:#F5C518">Réservation N° :</strong> ${booking.numero}</p>
        <p><strong style="color:#F5C518">Montant :</strong> ${booking.paiement.montant.toLocaleString('fr-CI')} FCFA</p>
      </div>
      <p>Présentez votre QR code à l'entrée. À bientôt !</p>
      <hr style="border-color:#222;margin:24px 0"/>
      <p style="color:#A0A0A0;font-size:12px">SUPERBIENV — Abidjan, Côte d'Ivoire 🇨🇮</p>
    </div>
  `,
});

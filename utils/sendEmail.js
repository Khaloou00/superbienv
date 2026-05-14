import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  await transporter.sendMail({
    from: `"SUPERBIENV Drive-In" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
};

export const otpEmail = (user, otp) => ({
  subject: 'Code de vérification — SUPERBIENV',
  html: `
    <div style="background:#0a0a0a;color:#fff;padding:32px;font-family:Inter,sans-serif;max-width:600px;margin:0 auto;border-radius:12px">
      <h1 style="color:#F5C518;margin-bottom:8px;text-align:center">SUPERBIENV Drive-In</h1>
      <p style="color:#A0A0A0;text-align:center;margin-top:0">Vivez le cinéma autrement</p>
      <hr style="border-color:#222;margin:24px 0"/>
      <h2 style="color:#fff">Bonjour ${user.nom},</h2>
      <p>Utilisez le code ci-dessous pour vérifier votre compte. Il est valable <strong>10 minutes</strong>.</p>
      <div style="background:#141414;border-radius:12px;padding:28px;margin:24px 0;text-align:center">
        <p style="color:#A0A0A0;font-size:12px;margin:0 0 12px">VOTRE CODE DE VÉRIFICATION</p>
        <span style="font-size:42px;font-weight:bold;letter-spacing:16px;color:#F5C518">${otp}</span>
      </div>
      <p style="color:#A0A0A0;font-size:13px">Si vous n'avez pas créé de compte SUPERBIENV, ignorez cet email.</p>
      <hr style="border-color:#222;margin:24px 0"/>
      <p style="color:#A0A0A0;font-size:12px;text-align:center">SUPERBIENV — Abidjan, Côte d'Ivoire</p>
    </div>
  `,
});

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
      <p>Votre billet PDF est joint à cet email. Présentez le QR code à l'entrée. À bientôt !</p>
      <hr style="border-color:#222;margin:24px 0"/>
      <p style="color:#A0A0A0;font-size:12px">SUPERBIENV — Abidjan, Côte d'Ivoire 🇨🇮</p>
    </div>
  `,
});

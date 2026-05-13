import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  const qrString = await QRCode.toDataURL(JSON.stringify(data), {
    width: 300,
    margin: 2,
    color: { dark: '#0a0a0a', light: '#FFFFFF' },
  });
  return qrString;
};

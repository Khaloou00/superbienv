import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const qrString = await QRCode.toDataURL(content, {
    width: 300,
    margin: 2,
    color: { dark: '#0a0a0a', light: '#FFFFFF' },
  });
  return qrString;
};

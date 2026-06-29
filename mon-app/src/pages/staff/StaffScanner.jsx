import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useGetStaffStatsQuery, useScanBookingByNumeroMutation } from '../../store/api/bookingsApi';
import Button from '../../components/ui/Button';
import StaffLayout from './StaffLayout';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL ?? '';

const STATUT_CFG = {
  active:   { color: 'text-green-400', bg: 'bg-green-900/20 border-green-500/20', Icon: CheckCircle,   label: 'Valide — Accès autorisé' },
  utilisée: { color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-500/20', Icon: AlertTriangle, label: 'Déjà scanné' },
  annulée:  { color: 'text-red-400',   bg: 'bg-red-900/20 border-red-500/20',     Icon: XCircle,       label: 'Réservation annulée' },
};

export default function StaffScanner() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [loading, setLoading] = useState(false);
  const html5QrRef = useRef(null);

  const { data: staffStats, refetch: refetchStats } = useGetStaffStatsQuery({}, { pollingInterval: 60000 });
  const [scanBooking, { isLoading: isMarking }] = useScanBookingByNumeroMutation();

  const processQr = useCallback(async (text) => {
    setScanError('');
    setLoading(true);
    const match = text.match(/\/verify\/([A-Z0-9-]+)/i);
    const numero = match ? match[1] : text.trim();
    try {
      const res = await fetch(`${BASE}/api/bookings/verify/${encodeURIComponent(numero)}`);
      const data = await res.json();
      if (!data.valid) setScanError(data.message || 'Réservation introuvable');
      else setScanResult(data);
    } catch {
      setScanError('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cameraOpen) {
      if (html5QrRef.current?.isScanning) html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
      return;
    }
    const qr = new Html5Qrcode('qr-reader');
    html5QrRef.current = qr;
    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 260 },
      (decoded) => {
        qr.stop().catch(() => {});
        html5QrRef.current = null;
        setCameraOpen(false);
        processQr(decoded);
      },
      () => {}
    ).catch(() => {
      setCameraOpen(false);
      setScanError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
    });
    return () => {
      if (html5QrRef.current?.isScanning) html5QrRef.current.stop().catch(() => {});
    };
  }, [cameraOpen, processQr]);

  const handleMarkUsed = async () => {
    try {
      await scanBooking(scanResult.numero).unwrap();
      setScanResult((p) => ({ ...p, statut: 'utilisée' }));
      toast.success('Entrée validée !');
      refetchStats();
    } catch (err) {
      toast.error(err.data?.message || 'Erreur de validation');
    }
  };

  const reset = () => { setScanResult(null); setScanError(''); };
  const cfg = scanResult ? (STATUT_CFG[scanResult.statut] ?? STATUT_CFG.annulée) : null;

  return (
    <StaffLayout title="Scanner">
      <div className="space-y-4">
        {/* KPI rapides */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-white/5 rounded-2xl p-4 text-center">
            <p className="font-headline text-4xl font-bold text-gold leading-none">{staffStats?.ticketsScannesToday ?? '—'}</p>
            <p className="text-muted text-xs font-label mt-2">Scans aujourd'hui</p>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-4 text-center">
            <p className="font-headline text-4xl font-bold text-white leading-none">{staffStats?.ticketsScannesTotal ?? '—'}</p>
            <p className="text-muted text-xs font-label mt-2">Total scanné</p>
          </div>
        </div>

        {/* Scanner */}
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <div id="qr-reader" className={cameraOpen ? 'block' : 'hidden'} />

          {cameraOpen && (
            <div className="p-4 flex justify-center border-t border-white/5">
              <Button variant="ghost" onClick={() => setCameraOpen(false)} className="w-full">
                <X size={16} /> Annuler le scan
              </Button>
            </div>
          )}

          {!cameraOpen && !scanResult && !scanError && !loading && (
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                <Camera size={24} className="text-gold" />
              </div>
              <h2 className="font-headline text-lg font-bold mb-1">Scanner un billet</h2>
              <p className="text-muted text-sm font-label mb-5">Dirigez la caméra vers le QR code du billet client</p>
              <Button variant="primary" onClick={() => { reset(); setCameraOpen(true); }} className="w-full min-h-[52px]">
                <Camera size={18} /> Ouvrir la caméra
              </Button>
            </div>
          )}

          {loading && (
            <div className="p-10 text-center">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted text-sm font-label">Vérification en cours…</p>
            </div>
          )}

          {scanError && !loading && !cameraOpen && (
            <div className="p-6 text-center">
              <XCircle size={36} className="text-cinema mx-auto mb-3" />
              <p className="font-label font-semibold text-cinema mb-1">Billet invalide</p>
              <p className="text-muted text-sm mb-5">{scanError}</p>
              <Button variant="ghost" onClick={() => { reset(); setCameraOpen(true); }} className="w-full min-h-[52px]">
                <RefreshCw size={16} /> Réessayer
              </Button>
            </div>
          )}

          {scanResult && !loading && !cameraOpen && cfg && (
            <div className="p-4">
              <div className={`border rounded-xl p-4 mb-4 ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <cfg.Icon size={18} className={cfg.color} />
                  <p className={`font-label font-bold text-sm ${cfg.color}`}>{cfg.label}</p>
                </div>
                <div className="space-y-2.5 text-sm">
                  <InfoRow label="Film" value={scanResult.film?.titre || '—'} />
                  {scanResult.film?.seanceDate && (
                    <InfoRow label="Séance" value={`${new Date(scanResult.film.seanceDate).toLocaleDateString('fr-CI')} · ${scanResult.film.seanceHeure || ''}`} />
                  )}
                  <InfoRow label="Client" value={scanResult.userName || '—'} />
                  <InfoRow label="Place" value={`${scanResult.place}${scanResult.isVIP ? ' (VIP)' : ''}`} />
                  <InfoRow label="N° Billet" value={scanResult.numero} mono />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="ghost" onClick={() => { reset(); setCameraOpen(true); }} className="w-full min-h-[52px] sm:flex-1">
                  <RefreshCw size={16} /> Nouveau scan
                </Button>
                {scanResult.statut === 'active' && (
                  <Button variant="primary" onClick={handleMarkUsed} loading={isMarking} className="w-full min-h-[52px] sm:flex-1">
                    <CheckCircle size={16} /> Valider l'entrée
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted font-label flex-shrink-0 text-sm">{label}</span>
      <span className={`text-white text-right break-all ${mono ? 'font-mono text-xs' : 'font-label text-sm'}`}>{value}</span>
    </div>
  );
}

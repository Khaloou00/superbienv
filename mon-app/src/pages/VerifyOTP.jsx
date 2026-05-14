import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useVerifyOtpMutation, useResendOtpMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import StarField from '../components/ui/StarField';
import Button from '../components/ui/Button';

const COUNTDOWN = 60;

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = location.state?.email;

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(COUNTDOWN);
  const inputRefs = useRef([]);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // Redirect if accessed directly without email in state
  useEffect(() => {
    if (!email) navigate('/inscription', { replace: true });
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otp = digits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error('Entrez les 6 chiffres du code');
    try {
      const data = await verifyOtp({ email, otp }).unwrap();
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success('Compte vérifié ! Bienvenue sur SUPERBIENV');
      navigate('/');
    } catch (err) {
      toast.error(err.data?.message || 'Code incorrect');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success('Nouveau code envoyé !');
      setCountdown(COUNTDOWN);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors du renvoi');
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      <StarField count={100} />
      <motion.div
        className="glass rounded-2xl p-8 w-full max-w-md z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/" className="block mb-8">
          <span className="font-headline text-2xl font-bold text-gradient-gold">SUPERBIENV</span>
        </Link>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="font-headline text-2xl font-bold mb-2">Vérifiez votre email</h1>
        <p className="text-muted text-sm mb-2">
          Un code à 6 chiffres a été envoyé à
        </p>
        <p className="text-gold font-label text-sm mb-8 truncate">{email}</p>

        <form onSubmit={handleSubmit}>
          {/* OTP inputs */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={[
                  'w-12 h-14 text-center text-xl font-bold rounded-xl border bg-surface',
                  'focus:outline-none focus:ring-2 focus:ring-gold transition-all',
                  digit ? 'border-gold text-gold' : 'border-white/10 text-white',
                ].join(' ')}
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isVerifying}
            disabled={otp.length < 6}
          >
            Vérifier mon compte
          </Button>
        </form>

        {/* Resend */}
        <div className="mt-6">
          {countdown > 0 ? (
            <p className="text-muted text-sm">
              Renvoyer le code dans{' '}
              <span className="text-gold font-label tabular-nums">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-gold hover:underline text-sm font-label disabled:opacity-50"
            >
              {isResending ? 'Envoi en cours…' : 'Renvoyer le code'}
            </button>
          )}
        </div>

        <p className="text-center text-muted text-sm mt-6">
          <Link to="/inscription" className="text-gold hover:underline font-label">
            ← Modifier l'email
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

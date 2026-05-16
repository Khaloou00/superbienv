import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../store/api/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import StarField from '../components/ui/StarField';

const COUNTDOWN = 60;

const emailSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetSchema = z.object({
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const slideVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.15 } },
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword,  { isLoading: isResetting }] = useResetPasswordMutation();

  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    if (step !== 2) return;
    setCountdown(COUNTDOWN);
  }, [step]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const onRequestCode = async ({ email: mail }) => {
    try {
      await forgotPassword({ email: mail }).unwrap();
      setEmail(mail);
      setStep(2);
      toast.success('Code envoyé ! Vérifiez votre boîte email.');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.data?.message || "Erreur lors de l'envoi");
    }
  };

  const handleDigitChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (e, index) => {
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

  const onResetPassword = async ({ password }) => {
    if (otp.length < 6) {
      toast.error('Entrez les 6 chiffres du code reçu');
      inputRefs.current[0]?.focus();
      return;
    }
    try {
      await resetPassword({ email, otp, password }).unwrap();
      toast.success('Mot de passe réinitialisé ! Connectez-vous.');
      navigate('/connexion', { replace: true });
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de la réinitialisation');
      if (err.data?.message?.toLowerCase().includes('otp') || err.data?.message?.toLowerCase().includes('code')) {
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResend = async () => {
    try {
      await forgotPassword({ email }).unwrap();
      toast.success('Nouveau code envoyé !');
      setCountdown(COUNTDOWN);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors du renvoi');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      <StarField count={100} />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass rounded-2xl p-8 w-full max-w-md z-10"
          >
            <Link to="/" className="block text-center mb-8">
              <span className="font-headline text-2xl font-bold text-gradient-gold">SUPERBIENV</span>
            </Link>

            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="font-headline text-2xl font-bold mb-2 text-center">Mot de passe oublié ?</h1>
            <p className="text-muted text-sm text-center mb-8">
              Entrez votre email et nous vous enverrons un code à 6 chiffres.
            </p>

            <form onSubmit={emailForm.handleSubmit(onRequestCode)} className="space-y-4">
              <Input
                label="Adresse email"
                type="email"
                placeholder="vous@email.com"
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register('email')}
              />
              <Button type="submit" variant="primary" className="w-full" loading={isSending}>
                Envoyer le code
              </Button>
            </form>

            <p className="text-center text-muted text-sm mt-6">
              <Link to="/connexion" className="text-gold hover:underline font-label">
                ← Retour à la connexion
              </Link>
            </p>
          </motion.div>

        ) : (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass rounded-2xl p-8 w-full max-w-md z-10 text-center"
          >
            <Link to="/" className="block mb-8">
              <span className="font-headline text-2xl font-bold text-gradient-gold">SUPERBIENV</span>
            </Link>

            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="font-headline text-2xl font-bold mb-2">Vérifiez votre email</h1>
            <p className="text-muted text-sm mb-1">Code envoyé à</p>
            <p className="text-gold font-label text-sm mb-6 truncate">{email}</p>

            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="text-left space-y-6">
              <div>
                <p className="text-xs font-label text-muted mb-3 text-center uppercase tracking-wider">
                  Code à 6 chiffres
                </p>
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(e.target.value, i)}
                      onKeyDown={(e) => handleDigitKeyDown(e, i)}
                      className={[
                        'w-12 h-14 text-center text-xl font-bold rounded-xl border bg-surface',
                        'focus:outline-none focus:ring-2 focus:ring-gold transition-all',
                        digit ? 'border-gold text-gold' : 'border-white/10 text-white',
                      ].join(' ')}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="••••••••"
                  error={resetForm.formState.errors.password?.message}
                  {...resetForm.register('password')}
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  error={resetForm.formState.errors.confirmPassword?.message}
                  {...resetForm.register('confirmPassword')}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isResetting}
                disabled={otp.length < 6}
              >
                Réinitialiser le mot de passe
              </Button>
            </form>

            <div className="mt-6">
              {countdown > 0 ? (
                <p className="text-muted text-sm">
                  Renvoyer dans{' '}
                  <span className="text-gold font-label tabular-nums">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSending}
                  className="text-gold hover:underline text-sm font-label disabled:opacity-50"
                >
                  {isSending ? 'Envoi en cours…' : 'Renvoyer le code'}
                </button>
              )}
            </div>

            <p className="text-center text-muted text-sm mt-4">
              <button
                type="button"
                onClick={() => { setStep(1); setDigits(['', '', '', '', '', '']); }}
                className="text-gold hover:underline font-label"
              >
                ← Changer d'email
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

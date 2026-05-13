import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../store/api/authApi';
import { setCredentials, selectIsAuthenticated } from '../store/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import StarField from '../components/ui/StarField';

const schema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(8, 'Numéro invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const [registerMutation, { isLoading }] = useRegisterMutation();

  useEffect(() => { if (isAuth) navigate('/'); }, [isAuth, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ confirmPassword, ...values }) => {
    try {
      const data = await registerMutation(values).unwrap();
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success('Compte créé ! Bienvenue 🎬');
      navigate('/');
    } catch (err) {
      toast.error(err.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      <StarField count={100} />
      <motion.div
        className="glass rounded-2xl p-8 w-full max-w-md z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/" className="block text-center mb-8">
          <span className="font-headline text-2xl font-bold text-gradient-gold">SUPERBIENV</span>
        </Link>
        <h1 className="font-headline text-3xl font-bold mb-1 text-center">Créer un compte</h1>
        <p className="text-muted text-sm text-center mb-8">Rejoignez l'expérience SUPERBIENV.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nom complet" placeholder="Jean Koné" error={errors.nom?.message} {...register('nom')} />
          <Input label="Email" type="email" placeholder="vous@email.com" error={errors.email?.message} {...register('email')} />
          <Input label="Téléphone" placeholder="+225 XX XX XX XX" error={errors.telephone?.message} {...register('telephone')} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
            Créer mon compte
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-gold hover:underline font-label">Se connecter</Link>
        </p>
      </motion.div>
    </div>
  );
}

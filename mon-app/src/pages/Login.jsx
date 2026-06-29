import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials, selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import StarField from '../components/ui/StarField';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

// Page d'accueil par défaut selon le rôle (le staff atterrit directement sur son espace)
const roleHome = (role) => (role === 'admin' ? '/admin' : role === 'staff' ? '/staff/scanner' : '/');

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const [loginMutation, { isLoading }] = useLoginMutation();
  const from = location.state?.from;

  // Déjà connecté : redirige vers la destination demandée, sinon l'accueil du rôle
  useEffect(() => {
    if (isAuth) navigate(from || roleHome(currentUser?.role), { replace: true });
  }, [isAuth, navigate, from, currentUser]);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const data = await loginMutation(values).unwrap();
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success(`Bienvenue, ${data.user.nom.split(' ')[0]} !`);
      navigate(from || roleHome(data.user?.role), { replace: true });
    } catch (err) {
      toast.error(err.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <StarField count={100} />
      <motion.div
        className="glass rounded-2xl p-8 w-full max-w-md z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/" className="block text-center mb-8">
          <span className="font-headline text-2xl font-bold text-gradient-gold">SUPERBIENV</span>
        </Link>
        <h1 className="font-headline text-3xl font-bold mb-1 text-center">Connexion</h1>
        <p className="text-muted text-sm text-center mb-8">Bienvenue. Vivez le cinéma autrement.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" placeholder="vous@email.com" error={errors.email?.message} {...register('email')} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <div className="text-right">
            <Link to="/mot-de-passe-oublie" className="text-xs text-gold hover:underline font-label">Mot de passe oublié ?</Link>
          </div>
          <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
            Se connecter
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link to="/inscription" state={{ from }} className="text-gold hover:underline font-label">Créer un compte</Link>
        </p>
      </motion.div>
    </div>
  );
}

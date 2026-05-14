import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { QrCode } from 'lucide-react';
import { useLoginMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function StaffLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(form).unwrap();
      if (res.user?.role !== 'staff' && res.user?.role !== 'admin') {
        setError('Accès non autorisé — réservé au personnel SUPERBIENV');
        return;
      }
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      navigate('/staff/scanner', { replace: true });
    } catch (err) {
      setError(err.data?.message || 'Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen bg-night flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-3">
            <QrCode size={24} className="text-gold" />
          </div>
          <h1 className="font-headline text-2xl font-bold">Espace Staff</h1>
          <p className="text-muted text-sm font-label mt-1">SUPERBIENV Drive-In</p>
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="email@superbienv.ci"
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-cinema/10 border border-cinema/30 text-cinema text-sm rounded-xl px-4 py-3 font-label">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
              Connexion Staff
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

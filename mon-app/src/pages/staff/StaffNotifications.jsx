import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import StaffLayout from './StaffLayout';
import NotificationsView from '../../components/NotificationsView';

export default function StaffNotifications() {
  const user = useSelector(selectCurrentUser);
  // Le staff peut signaler un problème ; l'admin, lui, ne fait que recevoir ici
  const canReport = user?.role === 'staff';

  return (
    <StaffLayout title="Notifications">
      <NotificationsView canReport={canReport} />
    </StaffLayout>
  );
}

import { Redirect } from 'expo-router';
import { useAuth } from '@/store/useAuth';

export default function Index() {
  const booting = useAuth((s) => s.booting);
  const session = useAuth((s) => s.session);
  if (booting) return null;
  return session ? <Redirect href="/(tabs)/feed" /> : <Redirect href="/(auth)/login" />;
}

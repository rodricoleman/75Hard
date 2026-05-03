import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { font, spacing } from '@/theme/tokens';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado' }} />
      <View style={styles.wrap}>
        <Text style={styles.title}>Tela não encontrada</Text>
        <Link href="/" style={styles.link}>
          Voltar pro início
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: { color: colors.text, fontSize: font.size.lg, fontWeight: '700' },
  link: { color: colors.primary, marginTop: spacing.md, fontSize: font.size.md },
});

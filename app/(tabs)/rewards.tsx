import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { CoinBadge } from '@/components/CoinBadge';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { RewardCard } from '@/components/RewardCard';
import { useRewards } from '@/store/useRewards';
import { useProfile } from '@/store/useProfile';
import { colors } from '@/theme/colors';
import { font, spacing } from '@/theme/tokens';
import * as haptic from '@/lib/haptics';

function confirm(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Resgatar', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function Rewards() {
  const router = useRouter();
  const rewards = useRewards((s) => s.rewards);
  const redeem = useRewards((s) => s.redeem);
  const profile = useProfile((s) => s.profile);
  const [busyId, setBusyId] = useState<string | null>(null);

  const balance = profile?.coin_balance ?? 0;

  const handleRedeem = async (id: string, title: string, cost: number) => {
    const ok = await confirm(
      `Resgatar "${title}"?`,
      `Vai debitar ${cost} coin do seu saldo. Você tem permissão pra gastar dinheiro real correspondente.`,
    );
    if (!ok) return;
    setBusyId(id);
    const { error } = await redeem(id);
    setBusyId(null);
    if (error) {
      Alert.alert('Erro', error);
    } else {
      haptic.success();
    }
  };

  const groups = {
    consumable: rewards.filter((r) => r.type === 'consumable'),
    oneoff: rewards.filter((r) => r.type === 'oneoff'),
    big: rewards.filter((r) => r.type === 'big'),
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Loja</Text>
          <Text style={styles.sub}>Gaste coin no que importa.</Text>
        </View>
        <Card style={styles.balance}>
          <Text style={styles.balanceLabel}>SALDO</Text>
          <CoinBadge amount={balance} size="md" />
        </Card>
      </View>

      {rewards.length === 0 ? (
        <EmptyState
          emoji="🎁"
          title="Sem recompensas"
          body="Cadastre o que você quer comprar com coin. Pequenos prazeres, médios, grandes."
          actionLabel="Criar recompensa"
          onAction={() => router.push('/reward/new' as any)}
        />
      ) : (
        <>
          {groups.consumable.length > 0 && (
            <>
              <SectionHeader
                title="Consumíveis"
                actionLabel="+ novo"
                onAction={() => router.push('/reward/new' as any)}
              />
              {groups.consumable.map((r) => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  affordable={!busyId && balance >= r.coin_cost}
                  onRedeem={() => handleRedeem(r.id, r.title, r.coin_cost)}
                />
              ))}
            </>
          )}
          {groups.oneoff.length > 0 && (
            <>
              <SectionHeader title="Únicos" />
              {groups.oneoff.map((r) => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  affordable={!busyId && balance >= r.coin_cost}
                  onRedeem={() => handleRedeem(r.id, r.title, r.coin_cost)}
                />
              ))}
            </>
          )}
          {groups.big.length > 0 && (
            <>
              <SectionHeader title="Grandes" />
              {groups.big.map((r) => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  affordable={!busyId && balance >= r.coin_cost}
                  onRedeem={() => handleRedeem(r.id, r.title, r.coin_cost)}
                />
              ))}
            </>
          )}
          <SectionHeader
            title=""
            actionLabel="+ nova recompensa"
            onAction={() => router.push('/reward/new' as any)}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  h1: { color: colors.text, fontSize: font.size.title, fontWeight: '900', letterSpacing: -1 },
  sub: { color: colors.textMuted, fontSize: font.size.sm, marginTop: spacing.xs },
  balance: { padding: spacing.md, alignItems: 'flex-end' },
  balanceLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
});

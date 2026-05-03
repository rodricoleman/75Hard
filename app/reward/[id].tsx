import React, { useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { RewardForm } from '@/components/RewardForm';
import { useRewards } from '@/store/useRewards';
import { colors } from '@/theme/colors';

export default function EditReward() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const list = useRewards((s) => s.rewards);
  const update = useRewards((s) => s.update);
  const remove = useRewards((s) => s.remove);
  const item = list.find((r) => r.id === id);
  const [submitting, setSubmitting] = useState(false);

  if (!item) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Não encontrado.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <RewardForm
        initial={item}
        submitting={submitting}
        onSubmit={async (v) => {
          setSubmitting(true);
          await update(item.id, {
            title: v.title,
            description: v.description || null,
            emoji: v.emoji || null,
            type: v.type,
            coin_cost: v.coin_cost,
            real_price_brl: v.real_price_brl,
          });
          setSubmitting(false);
          router.back();
        }}
        onDelete={async () => {
          await remove(item.id);
          router.back();
        }}
      />
    </Screen>
  );
}

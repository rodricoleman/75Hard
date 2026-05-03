import React, { useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AntiHabitForm } from '@/components/AntiHabitForm';
import { useAntiHabits } from '@/store/useAntiHabits';
import { colors } from '@/theme/colors';

export default function EditAntiHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const list = useAntiHabits((s) => s.antiHabits);
  const update = useAntiHabits((s) => s.update);
  const archive = useAntiHabits((s) => s.archive);
  const item = list.find((a) => a.id === id);
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
      <AntiHabitForm
        initial={item}
        submitting={submitting}
        onSubmit={async (v) => {
          setSubmitting(true);
          await update(item.id, {
            title: v.title,
            description: v.description || null,
            emoji: v.emoji || null,
            coin_penalty: v.coin_penalty,
          });
          setSubmitting(false);
          router.back();
        }}
        onDelete={async () => {
          await archive(item.id);
          router.back();
        }}
      />
    </Screen>
  );
}

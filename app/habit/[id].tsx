import React, { useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HabitForm } from '@/components/HabitForm';
import { useHabits } from '@/store/useHabits';
import { colors } from '@/theme/colors';

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const habits = useHabits((s) => s.habits);
  const update = useHabits((s) => s.update);
  const archive = useHabits((s) => s.archive);
  const habit = habits.find((h) => h.id === id);
  const [submitting, setSubmitting] = useState(false);

  if (!habit) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted }}>Hábito não encontrado.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <HabitForm
        initial={habit}
        submitting={submitting}
        onSubmit={async (v) => {
          setSubmitting(true);
          await update(habit.id, {
            title: v.title,
            description: v.description || null,
            emoji: v.emoji || null,
            type: v.type,
            difficulty: v.difficulty,
            coin_reward: v.coin_reward,
            xp_reward: v.xp_reward,
            weekly_target: v.weekly_target,
            category: v.category,
            color: v.color,
            brutal: v.brutal,
          });
          setSubmitting(false);
          router.back();
        }}
        onDelete={async () => {
          await archive(habit.id);
          router.back();
        }}
      />
    </Screen>
  );
}

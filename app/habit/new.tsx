import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HabitForm } from '@/components/HabitForm';
import { useHabits } from '@/store/useHabits';

export default function NewHabit() {
  const router = useRouter();
  const create = useHabits((s) => s.create);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Screen>
      <HabitForm
        submitting={submitting}
        onSubmit={async (v) => {
          setSubmitting(true);
          const h = await create({
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
          if (h) router.back();
        }}
      />
    </Screen>
  );
}

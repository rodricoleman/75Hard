import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AntiHabitForm } from '@/components/AntiHabitForm';
import { useAntiHabits } from '@/store/useAntiHabits';

export default function NewAntiHabit() {
  const router = useRouter();
  const create = useAntiHabits((s) => s.create);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Screen>
      <AntiHabitForm
        submitting={submitting}
        onSubmit={async (v) => {
          setSubmitting(true);
          const a = await create({
            title: v.title,
            description: v.description || null,
            emoji: v.emoji || null,
            coin_penalty: v.coin_penalty,
          });
          setSubmitting(false);
          if (a) router.back();
        }}
      />
    </Screen>
  );
}

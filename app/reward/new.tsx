import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { RewardForm } from '@/components/RewardForm';
import { useRewards } from '@/store/useRewards';

export default function NewReward() {
  const router = useRouter();
  const create = useRewards((s) => s.create);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Screen>
      <RewardForm
        submitting={submitting}
        onSubmit={async (v) => {
          setSubmitting(true);
          const r = await create({
            title: v.title,
            description: v.description || null,
            emoji: v.emoji || null,
            type: v.type,
            coin_cost: v.coin_cost,
            real_price_brl: v.real_price_brl,
          });
          setSubmitting(false);
          if (r) router.back();
        }}
      />
    </Screen>
  );
}

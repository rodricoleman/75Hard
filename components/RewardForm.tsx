import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';
import { colors } from '@/theme/colors';
import { font, spacing } from '@/theme/tokens';
import type { Reward, RewardType } from '@/types';

export type RewardFormValues = {
  title: string;
  description: string;
  emoji: string;
  type: RewardType;
  coin_cost: number;
  real_price_brl: number | null;
};

const TYPE_LABELS: { value: RewardType; label: string }[] = [
  { value: 'consumable', label: 'Consumível' },
  { value: 'oneoff', label: 'Único' },
  { value: 'big', label: 'Grande' },
];

export function RewardForm({
  initial,
  onSubmit,
  onDelete,
  submitting,
}: {
  initial?: Partial<Reward>;
  onSubmit: (v: RewardFormValues) => void;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '');
  const [type, setType] = useState<RewardType>(initial?.type ?? 'consumable');
  const [cost, setCost] = useState(String(initial?.coin_cost ?? 50));
  const [price, setPrice] = useState(initial?.real_price_brl != null ? String(initial.real_price_brl) : '');

  const submit = () => {
    if (!title.trim()) return;
    const priceNum = price.trim() ? parseFloat(price.replace(',', '.')) : NaN;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      emoji: emoji.trim(),
      type,
      coin_cost: parseInt(cost, 10) || 0,
      real_price_brl: isNaN(priceNum) ? null : priceNum,
    });
  };

  return (
    <View>
      <Input label="Emoji (opcional)" value={emoji} onChangeText={setEmoji} placeholder="🍔" />
      <Input
        label="O que você quer comprar"
        value={title}
        onChangeText={setTitle}
        placeholder="Hambúrguer, jogo, viagem…"
      />
      <Input label="Detalhes" value={description} onChangeText={setDescription} multiline />

      <Text style={styles.section}>TIPO</Text>
      <SegmentedControl options={TYPE_LABELS} value={type} onChange={setType} />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Input label="Custo (coin)" value={cost} onChangeText={setCost} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="Preço real (R$, opcional)"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0,00"
          />
        </View>
      </View>

      <Button
        label={initial?.id ? 'Salvar' : 'Criar recompensa'}
        onPress={submit}
        loading={submitting}
        style={{ marginTop: spacing.md }}
      />
      {onDelete && (
        <Button
          label="Remover"
          variant="ghost"
          onPress={onDelete}
          style={{ marginTop: spacing.sm }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});

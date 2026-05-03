import React, { useState } from 'react';
import { View } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { spacing } from '@/theme/tokens';
import type { AntiHabit } from '@/types';

export type AntiHabitFormValues = {
  title: string;
  description: string;
  emoji: string;
  coin_penalty: number;
};

export function AntiHabitForm({
  initial,
  onSubmit,
  onDelete,
  submitting,
}: {
  initial?: Partial<AntiHabit>;
  onSubmit: (v: AntiHabitFormValues) => void;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '');
  const [penalty, setPenalty] = useState(String(initial?.coin_penalty ?? 15));

  const submit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      emoji: emoji.trim(),
      coin_penalty: parseInt(penalty, 10) || 0,
    });
  };

  return (
    <View>
      <Input label="Emoji (opcional)" value={emoji} onChangeText={setEmoji} placeholder="🚬" />
      <Input
        label="O que você quer evitar"
        value={title}
        onChangeText={setTitle}
        placeholder="Fast food, rolar Insta, etc."
      />
      <Input label="Detalhes" value={description} onChangeText={setDescription} multiline />
      <Input
        label="Coin perdido por slip"
        value={penalty}
        onChangeText={setPenalty}
        keyboardType="number-pad"
        hint="Cada vez que você registrar, perde esse valor."
      />
      <Button
        label={initial?.id ? 'Salvar' : 'Criar anti-hábito'}
        onPress={submit}
        loading={submitting}
        style={{ marginTop: spacing.md }}
      />
      {onDelete && (
        <Button
          label="Arquivar"
          variant="ghost"
          onPress={onDelete}
          style={{ marginTop: spacing.sm }}
        />
      )}
    </View>
  );
}

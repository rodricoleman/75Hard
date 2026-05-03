import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';
import { colors } from '@/theme/colors';
import { font, fontFamily, radius, spacing } from '@/theme/tokens';
import type { Habit, HabitDifficulty, HabitType } from '@/types';
import { DIFFICULTY_DEFAULTS } from '@/lib/economy';
import { CATEGORIES, COLORS } from '@/lib/categories';

export type HabitFormValues = {
  title: string;
  description: string;
  emoji: string;
  type: HabitType;
  difficulty: HabitDifficulty;
  coin_reward: number;
  xp_reward: number;
  weekly_target: number | null;
  category: string | null;
  color: string | null;
  brutal: boolean;
};

const DIFF_LABELS: { value: HabitDifficulty; label: string }[] = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' },
  { value: 'brutal', label: 'Brutal' },
];

const TYPE_LABELS: { value: HabitType; label: string }[] = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'once', label: 'Pontual' },
];

export function HabitForm({
  initial,
  onSubmit,
  onDelete,
  submitting,
}: {
  initial?: Partial<Habit>;
  onSubmit: (v: HabitFormValues) => void;
  onDelete?: () => void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '');
  const [type, setType] = useState<HabitType>(initial?.type ?? 'daily');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(initial?.difficulty ?? 'medium');
  const [coin, setCoin] = useState(String(initial?.coin_reward ?? DIFFICULTY_DEFAULTS.medium.coin));
  const [xp, setXp] = useState(String(initial?.xp_reward ?? DIFFICULTY_DEFAULTS.medium.xp));
  const [weekly, setWeekly] = useState(String(initial?.weekly_target ?? 3));
  const [category, setCategory] = useState<string | null>(initial?.category ?? 'health');
  const [color, setColor] = useState<string | null>(initial?.color ?? CATEGORIES[0].color);
  const [brutal, setBrutal] = useState<boolean>(initial?.brutal ?? false);

  const onDifficultyChange = (d: HabitDifficulty) => {
    setDifficulty(d);
    if (!initial?.id) {
      setCoin(String(DIFFICULTY_DEFAULTS[d].coin));
      setXp(String(DIFFICULTY_DEFAULTS[d].xp));
    }
  };

  const onCategoryChange = (id: string) => {
    setCategory(id);
    const c = CATEGORIES.find((x) => x.id === id);
    if (c) setColor(c.color);
  };

  const submit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      emoji: emoji.trim(),
      type,
      difficulty,
      coin_reward: parseInt(coin, 10) || 0,
      xp_reward: parseInt(xp, 10) || 0,
      weekly_target: type === 'weekly' ? parseInt(weekly, 10) || 1 : null,
      category,
      color,
      brutal,
    });
  };

  return (
    <View>
      <Input label="Emoji (opcional)" value={emoji} onChangeText={setEmoji} placeholder="💪" />
      <Input label="Título" value={title} onChangeText={setTitle} placeholder="Treinar 30min" />
      <Input
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        placeholder="Detalhes…"
        multiline
      />

      <Text style={styles.section}>CATEGORIA</Text>
      <View style={styles.catRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onCategoryChange(c.id)}
            style={[
              styles.catChip,
              {
                borderColor: category === c.id ? c.color : colors.border,
                backgroundColor: category === c.id ? `${c.color}22` : colors.surface,
              },
            ]}
          >
            <Text style={styles.catEmoji}>{c.emoji}</Text>
            <Text style={[styles.catLabel, category === c.id && { color: c.color, fontWeight: '700' }]}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>COR</Text>
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[
              styles.colorDot,
              {
                backgroundColor: c,
                borderColor: color === c ? '#fff' : 'transparent',
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.section}>FREQUÊNCIA</Text>
      <SegmentedControl options={TYPE_LABELS} value={type} onChange={setType} />

      {type === 'weekly' && (
        <View style={{ marginTop: spacing.md }}>
          <Input
            label="Meta semanal (vezes)"
            value={weekly}
            onChangeText={setWeekly}
            keyboardType="number-pad"
          />
        </View>
      )}

      <Text style={styles.section}>DIFICULDADE</Text>
      <SegmentedControl options={DIFF_LABELS} value={difficulty} onChange={onDifficultyChange} />

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Input label="Coin por check-in" value={coin} onChangeText={setCoin} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="XP" value={xp} onChangeText={setXp} keyboardType="number-pad" />
        </View>
      </View>

      <View style={styles.brutalRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brutalTitle}>Modo brutal</Text>
          <Text style={styles.brutalDesc}>
            Falhar 1 dia zera o streak inteiro. Pra quem leva a sério.
          </Text>
        </View>
        <Switch
          value={brutal}
          onValueChange={setBrutal}
          trackColor={{ true: colors.danger, false: colors.surfaceAlt }}
          thumbColor={brutal ? '#fff' : colors.textDim}
        />
      </View>

      <Button
        label={initial?.id ? 'Salvar alterações' : 'Criar hábito'}
        onPress={submit}
        loading={submitting}
        style={{ marginTop: spacing.md }}
      />

      {onDelete && (
        <Button
          label="Arquivar"
          onPress={onDelete}
          variant="ghost"
          style={{ marginTop: spacing.sm }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: fontFamily.body as any,
  },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  catEmoji: { fontSize: 14 },
  catLabel: {
    color: colors.textMuted,
    fontSize: font.size.sm,
    fontFamily: fontFamily.body as any,
  },
  colorRow: { flexDirection: 'row', gap: spacing.sm + 2, flexWrap: 'wrap' },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
  },
  brutalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md + 2,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  brutalTitle: {
    color: colors.text,
    fontSize: font.size.md,
    fontWeight: '700',
    fontFamily: fontFamily.body as any,
  },
  brutalDesc: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    marginTop: 2,
    fontFamily: fontFamily.body as any,
  },
});

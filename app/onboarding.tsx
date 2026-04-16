import { useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  ZoomIn,
} from 'react-native-reanimated';
import { useAuth } from '@/store/useAuth';
import { useChallenge } from '@/store/useChallenge';
import type { ChallengeGoals, ToleranceOption } from '@/types/challenge';
import { TASK_LIMITS, DEFAULT_GOALS, TOLERANCE_OPTIONS } from '@/types/challenge';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

type StepId =
  | 'intro'
  | 'indoor'
  | 'outdoor'
  | 'water'
  | 'diet'
  | 'reading'
  | 'tolerance'
  | 'start'
  | 'summary';
const STEPS: StepId[] = [
  'intro',
  'indoor',
  'outdoor',
  'water',
  'diet',
  'reading',
  'tolerance',
  'start',
  'summary',
];

function fireHaptic(kind: 'light' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  try {
    const H = require('expo-haptics');
    if (kind === 'success') H?.notificationAsync?.(H.NotificationFeedbackType.Success);
    else H?.impactAsync?.(H.ImpactFeedbackStyle.Light);
  } catch {}
}

export default function Onboarding() {
  const router = useRouter();
  const profile = useAuth((s) => s.profile);
  const startChallenge = useChallenge((s) => s.startChallenge);

  const [stepIdx, setStepIdx] = useState(0);
  const [indoor, setIndoor] = useState<number>(DEFAULT_GOALS.workout_indoor_min);
  const [outdoor, setOutdoor] = useState<number>(DEFAULT_GOALS.workout_outdoor_min);
  const [water, setWater] = useState<number>(DEFAULT_GOALS.water_ml_goal);
  const [diet, setDiet] = useState<boolean>(DEFAULT_GOALS.diet_enabled);
  const [reading, setReading] = useState<number>(DEFAULT_GOALS.reading_pages_goal);
  const [maxMisses, setMaxMisses] = useState<number>(DEFAULT_GOALS.max_misses);
  const [startOffset, setStartOffset] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = step === 'summary';
  const progress = (stepIdx + 1) / STEPS.length;

  const goals: ChallengeGoals = useMemo(
    () => ({
      workout_indoor_min: indoor,
      workout_outdoor_min: outdoor,
      water_ml_goal: water,
      reading_pages_goal: reading,
      diet_enabled: diet,
      max_misses: maxMisses,
    }),
    [indoor, outdoor, water, diet, reading, maxMisses],
  );

  function next() {
    fireHaptic();
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }
  function back() {
    fireHaptic();
    setStepIdx((i) => Math.max(0, i - 1));
  }

  async function onFinish() {
    setError(null);
    setSubmitting(true);
    try {
      const startDate = format(addDays(new Date(), startOffset), 'yyyy-MM-dd');
      await startChallenge(goals, startDate);
      fireHaptic('success');
      router.replace('/(tabs)/feed');
    } catch (e: any) {
      setError(e?.message ?? 'Falha ao iniciar desafio.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.topBar}>
        <Text style={styles.topBarTxt}>
          PASSO {String(stepIdx + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
        </Text>
        {!isFirst && !isLast ? (
          <Pressable onPress={back} hitSlop={8}>
            <Text style={styles.backTxt}>← VOLTAR</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={step}
          entering={FadeInRight.duration(280)}
          exiting={FadeOutLeft.duration(160)}
        >
          {step === 'intro' ? (
            <IntroStep name={profile?.display_name || profile?.username || 'atleta'} />
          ) : null}

          {step === 'indoor' ? (
            <MinutesStep
              eyebrow="TREINO 01 · INDOOR"
              title="Quantos minutos de treino indoor?"
              description="Academia, home gym, Pilates, qualquer coisa sob teto. Mínimo 45 min — você escolhe seu ritmo."
              icon="💪"
              min={TASK_LIMITS.WORKOUT_MIN_MIN}
              max={TASK_LIMITS.WORKOUT_MIN_MAX}
              step={15}
              unit="min"
              value={indoor}
              onChange={setIndoor}
              presets={[45, 60, 75, 90]}
            />
          ) : null}

          {step === 'outdoor' ? (
            <MinutesStep
              eyebrow="TREINO 02 · OUTDOOR"
              title="E o treino ao ar livre?"
              description="Corrida, bike, caminhada, esporte. Regra 75Hard: precisa ser fora de casa. Mínimo 45 min."
              icon="🏃"
              min={TASK_LIMITS.WORKOUT_MIN_MIN}
              max={TASK_LIMITS.WORKOUT_MIN_MAX}
              step={15}
              unit="min"
              value={outdoor}
              onChange={setOutdoor}
              presets={[45, 60, 75, 90]}
            />
          ) : null}

          {step === 'water' ? (
            <MinutesStep
              eyebrow="HIDRATAÇÃO"
              title="Quantos ml de água por dia?"
              description="Flexível — defina a meta que faz sentido pro seu corpo. Referência padrão: 3700 ml."
              icon="💧"
              min={TASK_LIMITS.WATER_ML_MIN}
              max={TASK_LIMITS.WATER_ML_MAX}
              step={250}
              unit="ml"
              value={water}
              onChange={setWater}
              presets={[2000, 3000, 3700, 4500]}
              bigStep={500}
            />
          ) : null}

          {step === 'diet' ? (
            <DietStep value={diet} onChange={setDiet} />
          ) : null}

          {step === 'reading' ? (
            <MinutesStep
              eyebrow="LEITURA"
              title="Quantas páginas por dia?"
              description="Livro físico ou e-reader. Desenvolvimento pessoal, técnico ou ficção — mínimo 10 páginas."
              icon="📖"
              min={TASK_LIMITS.READING_PAGES_MIN}
              max={TASK_LIMITS.READING_PAGES_MAX}
              step={5}
              unit="pág"
              value={reading}
              onChange={setReading}
              presets={[10, 15, 20, 30]}
            />
          ) : null}

          {step === 'tolerance' ? (
            <ToleranceStep value={maxMisses} onChange={setMaxMisses} />
          ) : null}

          {step === 'start' ? (
            <StartDateStep value={startOffset} onChange={setStartOffset} />
          ) : null}

          {step === 'summary' ? (
            <SummaryStep goals={goals} startOffset={startOffset} />
          ) : null}
        </Animated.View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTxt}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={isLast ? onFinish : next}
          disabled={submitting}
          style={[styles.cta, submitting && { opacity: 0.6 }]}
        >
          <Text style={styles.ctaTxt}>
            {isLast ? (submitting ? 'INICIANDO…' : 'COMEÇAR O DESAFIO') : isFirst ? 'VAMOS LÁ' : 'CONFIRMAR'}
          </Text>
          <Text style={styles.ctaArrow}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function IntroStep({ name }: { name: string }) {
  return (
    <View style={styles.stepWrap}>
      <Animated.View entering={ZoomIn.duration(400)} style={styles.heroBadge}>
        <Text style={styles.heroBadgeTxt}>75</Text>
        <Text style={styles.heroBadgeSub}>HARD</Text>
      </Animated.View>
      <Animated.Text entering={FadeInDown.duration(400).delay(180)} style={styles.heroHi}>
        bem-vindo, {name}.
      </Animated.Text>
      <Animated.Text entering={FadeInDown.duration(400).delay(280)} style={styles.heroTitle}>
        VAMOS MONTAR O SEU DESAFIO
      </Animated.Text>
      <Animated.Text entering={FadeInDown.duration(400).delay(360)} style={styles.heroDesc}>
        O 75Hard padrão tem regras fixas. Aqui você escolhe as suas — dentro dos mínimos que
        mantêm o desafio duro de verdade.
      </Animated.Text>

      <Animated.View entering={FadeIn.duration(400).delay(500)} style={styles.pillars}>
        <Pillar icon="⚡" label="2 treinos" sub="1 indoor + 1 outdoor, mín. 45 min" />
        <Pillar icon="💧" label="Meta de água" sub="você define o volume" />
        <Pillar icon="🥗" label="Dieta" sub="você escolhe se entra" />
        <Pillar icon="📖" label="Leitura" sub="mín. 10 páginas/dia" />
        <Pillar icon="📸" label="Foto diária" sub="prova de progresso" />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(700)} style={styles.warn}>
        <Text style={styles.warnTitle}>⚠︎  REGRA FUNDAMENTAL</Text>
        <Text style={styles.warnTxt}>
          Falhou em qualquer tarefa de qualquer dia?{'\n'}O contador volta ao Dia 1. Sem desculpas.
        </Text>
      </Animated.View>
    </View>
  );
}

function Pillar({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <View style={styles.pillar}>
      <Text style={styles.pillarIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.pillarLabel}>{label}</Text>
        <Text style={styles.pillarSub}>{sub}</Text>
      </View>
    </View>
  );
}

function MinutesStep({
  eyebrow,
  title,
  description,
  icon,
  min,
  max,
  step,
  unit,
  value,
  onChange,
  presets,
  bigStep,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  presets: number[];
  bigStep?: number;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const belowMin = value < min;

  return (
    <View style={styles.stepWrap}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.stepIcon}>{icon}</Text>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{description}</Text>

      <View style={styles.pickerCard}>
        <View style={styles.pickerRow}>
          <PickerBtn
            label={bigStep ? `−${bigStep}` : '−'}
            onPress={() => onChange(clamp(value - (bigStep ?? step)))}
            disabled={value <= min}
          />
          <PickerBtn
            label="−"
            onPress={() => onChange(clamp(value - step))}
            disabled={value <= min}
            small
          />
          <View style={styles.valueDisplay}>
            <Text style={styles.valueNum}>{value.toLocaleString()}</Text>
            <Text style={styles.valueUnit}>{unit}</Text>
          </View>
          <PickerBtn
            label="+"
            onPress={() => onChange(clamp(value + step))}
            disabled={value >= max}
            small
          />
          <PickerBtn
            label={bigStep ? `+${bigStep}` : '+'}
            onPress={() => onChange(clamp(value + (bigStep ?? step)))}
            disabled={value >= max}
          />
        </View>

        <View style={styles.presets}>
          {presets.map((p) => {
            const active = p === value;
            return (
              <Pressable
                key={p}
                onPress={() => onChange(clamp(p))}
                style={[styles.preset, active && styles.presetActive]}
              >
                <Text style={[styles.presetTxt, active && styles.presetTxtActive]}>
                  {p.toLocaleString()}
                  <Text style={styles.presetUnit}> {unit}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.hintRow, belowMin && styles.hintRowWarn]}>
          <Text style={[styles.hintLabel, belowMin && { color: colors.danger }]}>
            MÍN
          </Text>
          <Text style={[styles.hintVal, belowMin && { color: colors.danger }]}>
            {min.toLocaleString()} {unit}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PickerBtn({
  label,
  onPress,
  disabled,
  small,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        fireHaptic();
        onPress();
      }}
      disabled={disabled}
      style={[
        styles.pickerBtn,
        small && styles.pickerBtnSmall,
        disabled && { opacity: 0.35 },
      ]}
    >
      <Text style={[styles.pickerBtnTxt, small && { fontSize: 16 }]}>{label}</Text>
    </Pressable>
  );
}

function DietStep({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.eyebrow}>ALIMENTAÇÃO</Text>
      <Text style={styles.stepIcon}>🥗</Text>
      <Text style={styles.stepTitle}>Vai seguir uma dieta?</Text>
      <Text style={styles.stepDesc}>
        No 75Hard original, dieta é obrigatória + zero álcool. Aqui você escolhe: se ativar, precisa
        marcar como cumprida todo dia. Se desativar, sua rotina tem 5 tarefas em vez de 6.
      </Text>

      <View style={styles.dietCards}>
        <DietCard
          active={value === true}
          onPress={() => {
            fireHaptic();
            onChange(true);
          }}
          title="SIM, VOU SEGUIR"
          accent={colors.neon}
          bullets={[
            'Siga um plano alimentar definido',
            'Zero álcool pelos 75 dias',
            'Marcar check todo dia',
          ]}
        />
        <DietCard
          active={value === false}
          onPress={() => {
            fireHaptic();
            onChange(false);
          }}
          title="NÃO VOU INCLUIR"
          accent={colors.textMuted}
          bullets={[
            'Sua rotina terá 5 tarefas',
            'Foco no treino + leitura + água',
            'Você pode adicionar depois',
          ]}
        />
      </View>
    </View>
  );
}

function DietCard({
  active,
  onPress,
  title,
  bullets,
  accent,
}: {
  active: boolean;
  onPress: () => void;
  title: string;
  bullets: string[];
  accent: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dietCard,
        active && { borderColor: accent, backgroundColor: colors.neonSoft },
      ]}
    >
      <View style={styles.dietCardTop}>
        <View
          style={[
            styles.radio,
            { borderColor: active ? accent : colors.borderStrong },
            active && { backgroundColor: accent },
          ]}
        >
          {active ? <View style={styles.radioDot} /> : null}
        </View>
        <Text style={[styles.dietCardTitle, active && { color: colors.text }]}>{title}</Text>
      </View>
      {bullets.map((b) => (
        <View key={b} style={styles.bullet}>
          <Text style={styles.bulletDot}>·</Text>
          <Text style={styles.bulletTxt}>{b}</Text>
        </View>
      ))}
    </Pressable>
  );
}

function ToleranceStep({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.eyebrow}>TOLERÂNCIA</Text>
      <Text style={styles.stepIcon}>🎯</Text>
      <Text style={styles.stepTitle}>Quantas faltas você aceita?</Text>
      <Text style={styles.stepDesc}>
        O 75Hard clássico é zero faltas. Mas se a vida real apertar, você pode escolher um buffer
        agora — ele define em que ponto o contador reseta. Quanto mais rigoroso, mais difícil. E
        mais valioso quando terminar.
      </Text>

      <View style={styles.toleranceList}>
        {TOLERANCE_OPTIONS.map((opt) => (
          <ToleranceCard
            key={opt.id}
            opt={opt}
            active={value === opt.maxMisses}
            onPress={() => {
              fireHaptic();
              onChange(opt.maxMisses);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function ToleranceCard({
  opt,
  active,
  onPress,
}: {
  opt: ToleranceOption;
  active: boolean;
  onPress: () => void;
}) {
  const isHardcore = opt.maxMisses === 0;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toleranceCard,
        active && styles.toleranceCardActive,
        active && isHardcore && { borderColor: colors.neon },
      ]}
    >
      <View style={styles.toleranceTop}>
        <View
          style={[
            styles.radio,
            { borderColor: active ? colors.neon : colors.borderStrong },
            active && { backgroundColor: colors.neon },
          ]}
        >
          {active ? <View style={styles.radioDot} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.toleranceTitle, active && { color: colors.text }]}>
            {opt.title}
          </Text>
          <Text style={styles.toleranceSub}>{opt.subtitle}</Text>
        </View>
        <View style={[styles.toleranceBadge, active && { backgroundColor: colors.neon }]}>
          <Text style={[styles.toleranceBadgeTxt, active && { color: '#000' }]}>
            {opt.percent}%
          </Text>
        </View>
      </View>
      <Text style={styles.toleranceDesc}>{opt.description}</Text>
    </Pressable>
  );
}

function StartDateStep({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const MAX_OFFSET = 60;
  const clamp = (v: number) => Math.max(0, Math.min(MAX_OFFSET, v));
  const startDate = addDays(new Date(), value);
  const dayLabel = format(startDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const endDate = addDays(startDate, 74);
  const endLabel = format(endDate, "d 'de' MMM 'de' yyyy", { locale: ptBR });

  const presets: { offset: number; label: string }[] = [
    { offset: 0, label: 'HOJE' },
    { offset: 1, label: 'AMANHÃ' },
    { offset: 7, label: 'EM 1 SEMANA' },
  ];

  return (
    <View style={styles.stepWrap}>
      <Text style={styles.eyebrow}>DATA DE INÍCIO</Text>
      <Text style={styles.stepIcon}>📅</Text>
      <Text style={styles.stepTitle}>Quando você começa?</Text>
      <Text style={styles.stepDesc}>
        O Dia 1 cai na data que você escolher. Pode ser hoje mesmo ou daqui a algumas semanas — se
        preparar antes ajuda a chegar focado.
      </Text>

      <View style={styles.pickerCard}>
        <View style={styles.pickerRow}>
          <PickerBtn
            label="−7"
            onPress={() => onChange(clamp(value - 7))}
            disabled={value <= 0}
          />
          <PickerBtn
            label="−"
            onPress={() => onChange(clamp(value - 1))}
            disabled={value <= 0}
            small
          />
          <View style={styles.valueDisplay}>
            <Text style={styles.dateBigTxt}>
              {format(startDate, 'd', { locale: ptBR })}
              <Text style={styles.dateMonthTxt}> {format(startDate, 'MMM', { locale: ptBR })}</Text>
            </Text>
            <Text style={styles.dateWeekdayTxt}>{dayLabel}</Text>
          </View>
          <PickerBtn
            label="+"
            onPress={() => onChange(clamp(value + 1))}
            disabled={value >= MAX_OFFSET}
            small
          />
          <PickerBtn
            label="+7"
            onPress={() => onChange(clamp(value + 7))}
            disabled={value >= MAX_OFFSET}
          />
        </View>

        <View style={styles.presets}>
          {presets.map((p) => {
            const active = p.offset === value;
            return (
              <Pressable
                key={p.offset}
                onPress={() => {
                  fireHaptic();
                  onChange(clamp(p.offset));
                }}
                style={[styles.preset, active && styles.presetActive]}
              >
                <Text style={[styles.presetTxt, active && styles.presetTxtActive]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.hintRow}>
          <Text style={styles.hintLabel}>TERMINA EM</Text>
          <Text style={styles.hintVal}>{endLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function SummaryStep({ goals, startOffset }: { goals: ChallengeGoals; startOffset: number }) {
  const totalTasks = goals.diet_enabled ? 6 : 5;
  const tolerance = TOLERANCE_OPTIONS.find((o) => o.maxMisses === goals.max_misses);
  const startDate = addDays(new Date(), startOffset);
  const startLabel =
    startOffset === 0
      ? 'HOJE'
      : startOffset === 1
        ? 'AMANHÃ'
        : format(startDate, "d 'de' MMM", { locale: ptBR }).toUpperCase();
  const startSub =
    startOffset === 0
      ? format(startDate, "EEEE, d 'de' MMM", { locale: ptBR })
      : `daqui a ${startOffset} ${startOffset === 1 ? 'dia' : 'dias'}`;
  return (
    <View style={styles.stepWrap}>
      <Animated.View entering={ZoomIn.duration(360)} style={styles.summaryBadge}>
        <Text style={styles.summaryBadgeTxt}>SUAS REGRAS</Text>
      </Animated.View>
      <Animated.Text entering={FadeInDown.duration(360).delay(100)} style={styles.summaryTitle}>
        {totalTasks} TAREFAS.{'\n'}75 DIAS.{'\n'}SEM EXCEÇÃO.
      </Animated.Text>

      <Animated.View entering={FadeIn.duration(400).delay(240)} style={styles.ruleList}>
        <RuleCard icon="📅" label="Dia 1" value={startLabel} sub={startSub} />
        <RuleCard
          icon="💪"
          label="Treino indoor"
          value={`${goals.workout_indoor_min} min`}
          sub="todo dia, sem pular"
        />
        <RuleCard
          icon="🏃"
          label="Treino outdoor"
          value={`${goals.workout_outdoor_min} min`}
          sub="ao ar livre, chuva ou sol"
        />
        <RuleCard
          icon="💧"
          label="Água"
          value={`${goals.water_ml_goal.toLocaleString()} ml`}
          sub="sua meta diária"
        />
        {goals.diet_enabled ? (
          <RuleCard icon="🥗" label="Dieta" value="ATIVA" sub="zero álcool, plano definido" />
        ) : (
          <RuleCard
            icon="🥗"
            label="Dieta"
            value="OFF"
            sub="fora do desafio desta vez"
            muted
          />
        )}
        <RuleCard
          icon="📖"
          label="Leitura"
          value={`${goals.reading_pages_goal} pág`}
          sub="desenvolvimento pessoal"
        />
        <RuleCard icon="📸" label="Foto de progresso" value="DIÁRIA" sub="prova o avanço" />
        <RuleCard
          icon="🎯"
          label="Tolerância"
          value={tolerance ? `${tolerance.percent}%` : '100%'}
          sub={
            tolerance && tolerance.maxMisses > 0
              ? `até ${tolerance.maxMisses} faltas em 75 dias`
              : 'zero faltas — modo hardcore'
          }
        />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(420)} style={styles.pactCard}>
        <Text style={styles.pactEyebrow}>O PACTO</Text>
        <Text style={styles.pactTxt}>
          {tolerance && tolerance.maxMisses > 0
            ? `Você tem ${tolerance.maxMisses} ${tolerance.maxMisses === 1 ? 'dia' : 'dias'} de tolerância. Na ${tolerance.maxMisses + 1}ª falha, o contador volta ao Dia 1. Regra sua — compromisso inegociável.`
            : 'Se você falhar em qualquer tarefa, em qualquer dia, o contador volta ao Dia 1. Regra sua — compromisso inegociável.'}
        </Text>
      </Animated.View>
    </View>
  );
}

function RuleCard({
  icon,
  label,
  value,
  sub,
  muted,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  muted?: boolean;
}) {
  return (
    <View style={[styles.ruleCard, muted && { opacity: 0.55 }]}>
      <Text style={styles.ruleIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.ruleLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.ruleSub}>{sub}</Text>
      </View>
      <Text style={[styles.ruleValue, muted && { color: colors.textDim }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  progressTrack: {
    height: 3,
    backgroundColor: colors.surface,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.neon,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  topBarTxt: {
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  backTxt: {
    ...type.label,
    color: colors.textMuted,
    fontSize: 11,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },

  stepWrap: { paddingTop: 16, paddingBottom: 8 },

  eyebrow: { ...type.eyebrow, color: colors.neon, marginBottom: 12 },
  stepIcon: { fontSize: 44, marginBottom: 12 },
  stepTitle: { ...type.h1, fontSize: 26, color: colors.text, marginBottom: 10 },
  stepDesc: { ...type.body, color: colors.textMuted, lineHeight: 22, marginBottom: 24 },

  pickerCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  pickerBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerBtnSmall: { width: 42, height: 42, borderRadius: 12 },
  pickerBtnTxt: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: fonts.mono,
    letterSpacing: -0.3,
  },
  valueDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minHeight: 52,
  },
  valueNum: {
    fontFamily: fonts.mono,
    color: colors.neon,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -2.5,
  },
  valueUnit: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
    justifyContent: 'center',
  },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetActive: { backgroundColor: colors.neon, borderColor: colors.neon },
  presetTxt: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  presetTxtActive: { color: '#000' },
  presetUnit: { color: colors.textDim, fontWeight: '700' },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hintRowWarn: { borderTopColor: colors.danger },
  hintLabel: { ...type.eyebrow, color: colors.textDim, fontSize: 10 },
  hintVal: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },

  // Intro
  heroBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.neon,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  heroBadgeTxt: {
    fontFamily: fonts.mono,
    color: '#000',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -2.5,
    lineHeight: 36,
  },
  heroBadgeSub: {
    fontFamily: fonts.mono,
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 2,
  },
  heroHi: {
    ...type.body,
    color: colors.neon,
    fontSize: 16,
    marginBottom: 4,
    textTransform: 'lowercase',
  },
  heroTitle: {
    ...type.h1,
    color: colors.text,
    fontSize: 30,
    lineHeight: 34,
    marginBottom: 14,
  },
  heroDesc: {
    ...type.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  pillars: {
    gap: 10,
    marginBottom: 22,
  },
  pillar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  pillarIcon: { fontSize: 22 },
  pillarLabel: { ...type.bodyStrong, color: colors.text, fontSize: 14 },
  pillarSub: { ...type.caption, color: colors.textMuted, marginTop: 2 },

  warn: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.dangerSoft,
    gap: 6,
  },
  warnTitle: {
    fontFamily: fonts.mono,
    color: colors.danger,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  warnTxt: { ...type.body, color: colors.text, fontSize: 13, lineHeight: 18 },

  // Diet
  dietCards: { gap: 12 },
  dietCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dietCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#000' },
  dietCardTitle: {
    ...type.bodyStrong,
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  bullet: { flexDirection: 'row', gap: 8, paddingLeft: 34, marginBottom: 4 },
  bulletDot: { color: colors.neon, fontSize: 14, fontWeight: '900', lineHeight: 18 },
  bulletTxt: { ...type.body, color: colors.textMuted, fontSize: 13, lineHeight: 18 },

  // Summary
  summaryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neon,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 14,
  },
  summaryBadgeTxt: {
    color: '#000',
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  summaryTitle: {
    ...type.hero,
    color: colors.text,
    fontSize: 36,
    lineHeight: 38,
    marginBottom: 24,
    letterSpacing: -2,
  },
  ruleList: { gap: 8, marginBottom: 20 },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ruleIcon: { fontSize: 22, width: 30 },
  ruleLabel: { ...type.label, color: colors.text, fontSize: 12 },
  ruleSub: { ...type.caption, color: colors.textDim, marginTop: 2 },
  ruleValue: {
    fontFamily: fonts.mono,
    color: colors.neon,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: -0.5,
  },

  pactCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neon,
    backgroundColor: colors.neonSoft,
  },
  pactEyebrow: {
    ...type.eyebrow,
    color: colors.neon,
    marginBottom: 6,
  },
  pactTxt: { ...type.body, color: colors.text, lineHeight: 21 },

  errorBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  errorTxt: { color: colors.danger, fontSize: 13, lineHeight: 18 },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  cta: {
    backgroundColor: colors.neon,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaTxt: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 13,
  },
  ctaArrow: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
  },

  // Tolerance
  toleranceList: { gap: 10 },
  toleranceCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 8,
  },
  toleranceCardActive: {
    borderColor: colors.neon,
    backgroundColor: colors.neonSoft,
  },
  toleranceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toleranceTitle: {
    ...type.bodyStrong,
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  toleranceSub: {
    ...type.caption,
    color: colors.textDim,
    marginTop: 2,
    fontSize: 11,
  },
  toleranceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  toleranceBadgeTxt: {
    fontFamily: fonts.mono,
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  toleranceDesc: {
    ...type.body,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 34,
  },

  // Start date
  dateBigTxt: {
    fontFamily: fonts.mono,
    color: colors.neon,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
  },
  dateMonthTxt: {
    color: colors.text,
    fontSize: 18,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  dateWeekdayTxt: {
    fontFamily: fonts.mono,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});

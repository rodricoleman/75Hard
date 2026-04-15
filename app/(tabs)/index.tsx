import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useAuth } from '@/store/useAuth';
import { useChallenge } from '@/store/useChallenge';
import { computeDayProgress } from '@/lib/streak';
import { TASK_GOALS } from '@/types/challenge';
import { DayRing } from '@/components/DayRing';
import { TaskRow } from '@/components/TaskRow';
import { CounterInput } from '@/components/CounterInput';
import { captureProgressPhoto, uploadProgressPhoto } from '@/lib/photo';
import { colors } from '@/theme/colors';
import { type, fonts } from '@/theme/tokens';

export default function Home() {
  const userId = useAuth((s) => s.user?.id);
  const {
    loading,
    challenge,
    todayEntry,
    currentDay,
    justReset,
    upsertToday,
    ackReset,
  } = useChallenge();

  if (loading || !challenge) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.dim}>carregando…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const e = todayEntry ?? {};
  const progress = computeDayProgress(e);
  const pct = Math.round(progress * 100);

  const toggle = (key: 'workout_indoor' | 'workout_outdoor' | 'diet') =>
    upsertToday({ [key]: !(e as any)[key] } as any).catch((err) =>
      Alert.alert('Erro', err.message),
    );

  const setWater = (v: number) =>
    upsertToday({ water_ml: v }).catch((err) => Alert.alert('Erro', err.message));
  const setReading = (v: number) =>
    upsertToday({ reading_pages: v }).catch((err) => Alert.alert('Erro', err.message));

  async function onPhoto() {
    const uri = await captureProgressPhoto();
    if (!uri) return;
    try {
      const path = await uploadProgressPhoto(uri, userId!, challenge!.id, currentDay);
      await upsertToday({ progress_photo_url: path });
    } catch (err: any) {
      Alert.alert('Erro ao enviar foto', err.message);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>
              75<Text style={{ color: colors.neon }}>HARD</Text>
            </Text>
            <View style={styles.pctPill}>
              <Text style={styles.pctPillTxt}>{pct}%</Text>
            </View>
          </View>
          <Text style={styles.tagline}>NO COMPROMISSES · NO SUBSTITUTIONS</Text>
        </Animated.View>

        <Animated.View entering={ZoomIn.duration(600).delay(120)} style={styles.ringWrap}>
          <DayRing day={currentDay} total={TASK_GOALS.TOTAL_DAYS} progress={progress} />
        </Animated.View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>TAREFAS DO DIA</Text>
          <View style={styles.sectionLine} />
        </View>

        <Animated.View entering={FadeIn.duration(300).delay(280)}>
          <TaskRow
            icon="💪"
            label="Treino 1 · indoor"
            hint="45 min"
            done={!!(e as any).workout_indoor}
            onToggle={() => toggle('workout_indoor')}
          />
          <TaskRow
            icon="🏃"
            label="Treino 2 · outdoor"
            hint="45 min ao ar livre"
            done={!!(e as any).workout_outdoor}
            onToggle={() => toggle('workout_outdoor')}
          />
          <TaskRow
            icon="🥗"
            label="Dieta"
            hint="Seguir o plano · zero álcool"
            done={!!(e as any).diet}
            onToggle={() => toggle('diet')}
          />
          <TaskRow
            icon="💧"
            label="Água"
            hint={`${((e as any).water_ml ?? 0).toLocaleString()} / ${TASK_GOALS.WATER_ML.toLocaleString()} ml`}
            done={((e as any).water_ml ?? 0) >= TASK_GOALS.WATER_ML}
            onToggle={() =>
              setWater(((e as any).water_ml ?? 0) >= TASK_GOALS.WATER_ML ? 0 : TASK_GOALS.WATER_ML)
            }
            right={
              <CounterInput
                value={(e as any).water_ml ?? 0}
                step={250}
                goal={TASK_GOALS.WATER_ML}
                suffix="ml"
                onChange={setWater}
              />
            }
          />
          <TaskRow
            icon="📖"
            label="Leitura"
            hint={`${(e as any).reading_pages ?? 0} / ${TASK_GOALS.READING_PAGES} páginas`}
            done={((e as any).reading_pages ?? 0) >= TASK_GOALS.READING_PAGES}
            onToggle={() =>
              setReading(
                ((e as any).reading_pages ?? 0) >= TASK_GOALS.READING_PAGES
                  ? 0
                  : TASK_GOALS.READING_PAGES,
              )
            }
            right={
              <CounterInput
                value={(e as any).reading_pages ?? 0}
                step={1}
                goal={TASK_GOALS.READING_PAGES}
                onChange={setReading}
              />
            }
          />
          <TaskRow
            icon="📸"
            label="Foto de progresso"
            hint={(e as any).progress_photo_url ? 'Enviada ✓' : 'Capturar hoje'}
            done={!!(e as any).progress_photo_url}
            onToggle={onPhoto}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={!!justReset} transparent animationType="fade">
        <Animated.View entering={FadeIn.duration(250)} style={styles.modalBg}>
          <Animated.View
            entering={ZoomIn.springify().damping(16).stiffness(180)}
            style={styles.modal}
          >
            <View style={styles.modalStamp}>
              <Text style={styles.modalStampTxt}>RESET</Text>
            </View>
            <Text style={styles.modalTitle}>VOCÊ FALHOU NO DIA {justReset?.failedDay}</Text>
            <Text style={styles.modalText}>
              O desafio reiniciou no Dia 1. Disciplina não aceita meio-termo — recomece com mais
              foco.
            </Text>
            <Pressable style={styles.modalBtn} onPress={ackReset}>
              <Text style={styles.modalBtnText}>RECOMEÇAR</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dim: { color: colors.textMuted, fontFamily: fonts.mono, letterSpacing: 2 },
  header: { marginBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { ...type.h1, fontSize: 34, color: colors.text, letterSpacing: -1.5 },
  pctPill: {
    backgroundColor: colors.neon,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pctPillTxt: {
    fontFamily: fonts.mono,
    color: '#000',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: -0.3,
  },
  tagline: {
    ...type.eyebrow,
    color: colors.textDim,
    marginTop: 6,
    fontSize: 9,
  },
  ringWrap: { alignItems: 'center', marginVertical: 20 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 14,
  },
  section: {
    ...type.label,
    color: colors.textMuted,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    gap: 12,
  },
  modalStamp: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: colors.danger,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: '-3deg' }],
    marginBottom: 4,
  },
  modalStampTxt: {
    color: colors.danger,
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
  },
  modalTitle: {
    ...type.h2,
    color: colors.text,
    fontSize: 20,
    lineHeight: 24,
  },
  modalText: {
    ...type.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  modalBtn: {
    marginTop: 12,
    backgroundColor: colors.neon,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 13,
  },
});

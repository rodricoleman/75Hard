import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/store/useAuth';
import { useChallenge } from '@/store/useChallenge';
import { computeDayProgress } from '@/lib/streak';
import { TASK_GOALS } from '@/types/challenge';
import { DayRing } from '@/components/DayRing';
import { TaskRow } from '@/components/TaskRow';
import { CounterInput } from '@/components/CounterInput';
import { captureProgressPhoto, uploadProgressPhoto } from '@/lib/photo';
import { colors } from '@/theme/colors';

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
          <Text style={styles.dim}>Carregando…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const e = todayEntry ?? {};
  const progress = computeDayProgress(e);

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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            75<Text style={{ color: colors.neon }}>HARD</Text>
          </Text>
        </View>

        <View style={styles.ringWrap}>
          <DayRing day={currentDay} total={TASK_GOALS.TOTAL_DAYS} progress={progress} />
          <Text style={styles.progressText}>{Math.round(progress * 100)}% hoje</Text>
        </View>

        <Text style={styles.section}>TAREFAS</Text>

        <TaskRow
          label="Treino 1 (indoor)"
          hint="45 min"
          done={!!(e as any).workout_indoor}
          onToggle={() => toggle('workout_indoor')}
        />
        <TaskRow
          label="Treino 2 (outdoor)"
          hint="45 min ao ar livre"
          done={!!(e as any).workout_outdoor}
          onToggle={() => toggle('workout_outdoor')}
        />
        <TaskRow
          label="Dieta"
          hint="Seguir o plano, zero álcool"
          done={!!(e as any).diet}
          onToggle={() => toggle('diet')}
        />
        <TaskRow
          label="Água"
          hint={`${(e as any).water_ml ?? 0} / ${TASK_GOALS.WATER_ML} ml`}
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
          label="Leitura"
          hint={`${(e as any).reading_pages ?? 0} / ${TASK_GOALS.READING_PAGES} pág`}
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
          label="Foto de progresso"
          hint={(e as any).progress_photo_url ? 'Enviada' : 'Capturar hoje'}
          done={!!(e as any).progress_photo_url}
          onToggle={onPhoto}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={!!justReset} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>RESET</Text>
            <Text style={styles.modalText}>
              Você falhou no dia {justReset?.failedDay}. O desafio reiniciou no Dia 1.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={ackReset}>
              <Text style={styles.modalBtnText}>ENTENDI</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  dim: { color: colors.textMuted },
  header: { marginBottom: 20 },
  brand: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  ringWrap: { alignItems: 'center', marginVertical: 24 },
  progressText: { color: colors.neon, marginTop: 12, fontWeight: '700', letterSpacing: 1 },
  section: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 12,
  },
  modalTitle: { color: colors.danger, fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  modalText: { color: colors.text, fontSize: 16, lineHeight: 22 },
  modalBtn: {
    marginTop: 12,
    backgroundColor: colors.neon,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: { color: '#000', fontWeight: '800', letterSpacing: 1 },
});

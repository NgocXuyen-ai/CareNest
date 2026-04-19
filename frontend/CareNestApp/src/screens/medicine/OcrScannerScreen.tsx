import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/spacing';
import { TOP_BAR_HEIGHT, BOTTOM_NAV_HEIGHT } from '../../utils/constants';
import Icon from '../../components/common/Icon';
import TopAppBar from '../../components/layout/TopAppBar';
import Input from '../../components/common/Input';
import { confirmOcr, submitOcr } from '../../api/ai';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';

type OcrState = 'idle' | 'scanning' | 'result';

type EditableMedicine = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  note: string;
};

export default function OcrScannerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { selectedProfileId } = useFamily();
  const { user } = useAuth();
  const [ocrState, setOcrState] = useState<OcrState>('idle');
  const [ocrId, setOcrId] = useState<number | null>(null);
  const [medicines, setMedicines] = useState<EditableMedicine[]>([]);
  const [clinicName, setClinicName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState('');

  const activeProfileId = selectedProfileId || (user?.profileId ? Number(user.profileId) : null);

  async function processSelectedImage(base64?: string) {
    if (!activeProfileId) {
      Alert.alert('Chua co ho so', 'Vui long tao hoac chon ho so suc khoe truoc khi quet toa thuoc.');
      return;
    }

    if (!base64) {
      return;
    }

    try {
      setOcrState('scanning');
      const response = await submitOcr({
        profileId: activeProfileId,
        imageBase64: base64,
      });

      setOcrId(response.ocr_id || null);
      setMedicines(
        (response.structured_data.medicines || []).map(item => ({
          name: item.name || '',
          dosage: item.dosage || '',
          frequency: item.frequency ? String(item.frequency) : '1',
          duration: item.duration || '7 ngay',
          note: item.note || '',
        })),
      );
      setClinicName(response.structured_data.clinic_name || '');
      setDoctorName(response.structured_data.doctor_name || '');
      setPrescriptionDate(response.structured_data.date || '');
      setOcrState('result');
    } catch (error) {
      setOcrState('idle');
      Alert.alert('Khong the OCR', error instanceof Error ? error.message : 'Da co loi xay ra');
    }
  }

  async function handleCaptureFromCamera() {
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      saveToPhotos: false,
    });

    await processSelectedImage(result.assets?.[0]?.base64);
  }

  async function handlePickFromLibrary() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      selectionLimit: 1,
    });

    await processSelectedImage(result.assets?.[0]?.base64);
  }

  async function handleConfirm() {
    if (!activeProfileId || !ocrId) {
      return;
    }

    try {
      await confirmOcr(ocrId, {
        profileId: activeProfileId,
        structuredData: {
          medicines: medicines.map(item => ({
            name: item.name,
            dosage: item.dosage,
            frequency: Number(item.frequency) || 1,
            duration: item.duration,
            note: item.note,
          })),
          clinicName,
          doctorName,
          date: prescriptionDate,
        },
      });
      Alert.alert('Da nhap toa thuoc', 'Thong tin thuoc va lich uong da duoc them vao he thong.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Khong the xac nhan OCR', error instanceof Error ? error.message : 'Da co loi xay ra');
    }
  }

  return (
    <View style={styles.root}>
      <TopAppBar variant="detail" title="Quet toa thuoc OCR" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: TOP_BAR_HEIGHT + insets.top + 16, paddingBottom: BOTTOM_NAV_HEIGHT + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cameraBox}>
          {ocrState === 'scanning' ? (
            <View style={styles.scanningOverlay}>
              <View style={styles.scanLine} />
              <Text style={styles.scanningText}>Dang nhan dien toa thuoc...</Text>
            </View>
          ) : ocrState === 'result' ? (
            <View style={styles.resultPreview}>
              <Icon name="check_circle" size={48} color="#2E7D32" />
              <Text style={styles.resultPreviewText}>Nhan dien thanh cong!</Text>
            </View>
          ) : (
            <View style={styles.idleOverlay}>
              <View style={styles.scanFrame} />
              <Icon name="document_scanner" size={40} color="rgba(255,255,255,0.7)" />
              <Text style={styles.idleText}>Chup toa thuoc hoac chon anh de AI trich xuat</Text>
            </View>
          )}
        </View>

        {ocrState !== 'scanning' ? (
          <View style={styles.captureRow}>
            <TouchableOpacity style={styles.scanBtn} onPress={() => void handleCaptureFromCamera()} activeOpacity={0.85}>
              <Icon name="camera" size={22} color={colors.onPrimary} />
              <Text style={styles.scanBtnText}>{ocrState === 'result' ? 'Chup lai toa thuoc' : 'Chup toa thuoc'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => void handlePickFromLibrary()} activeOpacity={0.85}>
              <Icon name="image" size={20} color={colors.primary} />
              <Text style={styles.secondaryBtnText}>Chon tu thu vien</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {ocrState === 'result' ? (
          <>
            <View style={styles.resultHeader}>
              <Icon name="smart_toy" size={18} color={colors.primary} />
              <Text style={styles.resultHeaderText}>Kiem tra va chinh sua ket qua OCR truoc khi luu</Text>
            </View>

            <View style={[styles.card, shadows.sm]}>
              <Input label="Phong kham" value={clinicName} onChangeText={setClinicName} />
              <Input label="Bac si" value={doctorName} onChangeText={setDoctorName} />
              <Input label="Ngay ke toa" value={prescriptionDate} onChangeText={setPrescriptionDate} />

              {medicines.map((medicine, index) => (
                <View key={`${medicine.name}-${index}`} style={styles.medicineBlock}>
                  <Text style={styles.medicineBlockTitle}>Thuoc {index + 1}</Text>
                  <Input
                    label="Ten thuoc"
                    value={medicine.name}
                    onChangeText={value => setMedicines(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, name: value } : item))}
                  />
                  <Input
                    label="Lieu dung"
                    value={medicine.dosage}
                    onChangeText={value => setMedicines(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, dosage: value } : item))}
                  />
                  <Input
                    label="So lan/ngay"
                    value={medicine.frequency}
                    onChangeText={value => setMedicines(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, frequency: value } : item))}
                    keyboardType="numeric"
                  />
                  <Input
                    label="Thoi gian dung"
                    value={medicine.duration}
                    onChangeText={value => setMedicines(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, duration: value } : item))}
                  />
                  <Input
                    label="Ghi chu"
                    value={medicine.note}
                    onChangeText={value => setMedicines(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, note: value } : item))}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={() => void handleConfirm()} activeOpacity={0.85}>
              <Icon name="check" size={20} color={colors.onPrimary} />
              <Text style={styles.submitBtnText}>Xac nhan va luu vao he thong</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: 16, gap: 16 },
  cameraBox: {
    height: 240,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleOverlay: { alignItems: 'center', gap: 12 },
  scanFrame: {
    width: 180,
    height: 120,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    marginBottom: 8,
  },
  idleText: { fontSize: 13, fontFamily: 'Inter', color: 'rgba(255,255,255,0.7)' },
  scanningOverlay: { alignItems: 'center', gap: 16, width: '100%' },
  scanLine: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.9,
  },
  scanningText: { fontSize: 14, fontFamily: 'Inter', fontWeight: '600', color: '#fff', marginTop: 100 },
  resultPreview: { alignItems: 'center', gap: 10 },
  resultPreviewText: { fontSize: 16, fontFamily: 'Manrope', fontWeight: '700', color: '#fff' },
  captureRow: { gap: 10 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 999,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  scanBtnText: { fontSize: 16, fontFamily: 'Inter', fontWeight: '700', color: colors.onPrimary },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: 8,
  },
  secondaryBtnText: { fontSize: 14, fontFamily: 'Inter', fontWeight: '700', color: colors.primary },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultHeaderText: { fontSize: 13, fontFamily: 'Inter', fontWeight: '600', color: colors.primary, flex: 1 },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, gap: 12 },
  medicineBlock: {
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  medicineBlockTitle: { fontSize: 14, fontFamily: 'Manrope', fontWeight: '700', color: colors.onSurface, marginBottom: 8 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 999,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnText: { fontSize: 15, fontFamily: 'Inter', fontWeight: '700', color: colors.onPrimary },
});

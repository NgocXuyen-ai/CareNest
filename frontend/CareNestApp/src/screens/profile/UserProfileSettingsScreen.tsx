import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/spacing';
import { BOTTOM_NAV_HEIGHT } from '../../utils/constants';
import Icon from '../../components/common/Icon';
import SelectField from '../../components/common/SelectField';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { getCurrentUserProfile, updateCurrentUserProfile } from '../../api/auth';
import {
  BLOOD_TYPE_OPTIONS,
  GENDER_OPTIONS,
  formatBloodType,
  formatGender,
} from '../../utils/healthOptions';

interface InputFieldProps {
  icon: string;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

function InputField({ icon, label, value, onChangeText, placeholder, keyboardType = 'default' }: InputFieldProps) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputIconWrap}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.inputContent}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );
}

export default function UserProfileSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout, refreshUser } = useAuth();
  const { members } = useFamily();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bloodType, setBloodType] = useState('O_POSITIVE');
  const [gender, setGender] = useState('OTHER');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergy, setAllergy] = useState('');
  const [height, setHeight] = useState('160');
  const [weight, setWeight] = useState('55');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl || null);

  const memberRole = useMemo(() => {
    return members.find(member => String(member.profileId) === user?.profileId)?.role || 'Thanh vien gia dinh';
  }, [members, user?.profileId]);

  useEffect(() => {
    void getCurrentUserProfile()
      .then(profile => {
        setFullName(profile.fullName);
        setEmail(profile.email);
        setPhone(profile.phoneNumber || '');
        setBirthday(profile.birthday ? new Date(profile.birthday).toLocaleDateString('vi-VN') : '');
        setBloodType(profile.bloodType || 'O_POSITIVE');
        setGender(profile.gender || 'OTHER');
        setMedicalHistory(profile.medicalHistory || '');
        setAllergy(profile.allergy || '');
        setHeight(profile.height ? String(profile.height) : '160');
        setWeight(profile.weight ? String(profile.weight) : '55');
        setEmergencyContactPhone(profile.emergencyContactPhone || '');
        setAvatarUri(profile.avatarUrl || null);
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    try {
      const [day, month, year] = birthday.split('/');
      const isoBirthday = day && month && year
        ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        : '1990-01-01';

      await updateCurrentUserProfile({
        fullName,
        email,
        phoneNumber: phone,
        birthday: isoBirthday,
        gender,
        bloodType,
        medicalHistory,
        allergy,
        height: Number(height),
        weight: Number(weight),
        emergencyContactPhone,
      });
      await refreshUser();
      Alert.alert('Thanh cong', 'Thong tin cua ban da duoc cap nhat.');
    } catch (error) {
      Alert.alert('Khong the luu', error instanceof Error ? error.message : 'Da co loi xay ra');
    }
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thong tin tai khoan</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => void handleSave()}>
          <Text style={styles.saveBtnText}>Luu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: BOTTOM_NAV_HEIGHT + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatarContainer, shadows.md]}>
            <Image
              source={{ uri: avatarUri || `https://i.pravatar.cc/150?u=${user?.id || '1'}` }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userNameText}>{fullName}</Text>
          <Text style={styles.userRoleText}>{memberRole}</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.medicalRecordBtn, shadows.sm]}
            onPress={() => navigation.navigate('UserMedical', { memberId: user?.profileId })}
          >
            <View style={styles.medicalIconWrap}>
              <Icon name="healing" size={22} color="#fff" />
            </View>
            <View style={styles.medicalTextWrap}>
              <Text style={styles.medicalTitle}>Ho so y te</Text>
              <Text style={styles.medicalSub}>Xem tien su, di ung va nhom mau</Text>
            </View>
            <Icon name="chevron_right" size={22} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Thong tin ca nhan</Text>
          <View style={[styles.formCard, shadows.sm]}>
            <InputField icon="person" label="Ho va ten" value={fullName} onChangeText={setFullName} />
            <InputField icon="mail" label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <InputField icon="phone" label="So dien thoai" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <InputField icon="calendar_today" label="Ngay sinh" value={birthday} onChangeText={setBirthday} placeholder="dd/mm/yyyy" />
            <SelectField
              icon="person"
              label="Gioi tinh"
              value={gender}
              displayValue={formatGender(gender)}
              options={GENDER_OPTIONS}
              onChange={setGender}
            />
            <SelectField
              icon="healing"
              label="Nhom mau"
              value={bloodType}
              displayValue={formatBloodType(bloodType)}
              options={BLOOD_TYPE_OPTIONS}
              onChange={setBloodType}
            />
            <InputField icon="height" label="Chieu cao (cm)" value={height} onChangeText={setHeight} keyboardType="phone-pad" />
            <InputField icon="monitor_weight" label="Can nang (kg)" value={weight} onChangeText={setWeight} keyboardType="phone-pad" />
            <InputField icon="warning" label="Di ung" value={allergy} onChangeText={setAllergy} />
            <InputField icon="history" label="Tien su benh" value={medicalHistory} onChangeText={setMedicalHistory} />
            <InputField
              icon="phone"
              label="Lien he khan cap"
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Icon name="logout" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Dang xuat tai khoan</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'Manrope', fontWeight: '800', color: '#1E3A8A' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter', fontWeight: '700', color: '#3B82F6' },
  scroll: { paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    padding: 4,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 56 },
  userNameText: { fontSize: 22, fontFamily: 'Manrope', fontWeight: '800', color: '#1E293B', marginTop: 16 },
  userRoleText: { fontSize: 14, fontFamily: 'Inter', color: '#64748B', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formCard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  inputIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  inputContent: { flex: 1 },
  inputLabel: { fontSize: 12, fontFamily: 'Inter', fontWeight: '600', color: '#94A3B8', marginBottom: 2 },
  textInput: { fontSize: 16, fontFamily: 'Inter', fontWeight: '700', color: '#1E293B', padding: 0 },
  medicalRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  medicalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalTextWrap: { flex: 1 },
  medicalTitle: { fontSize: 16, fontFamily: 'Inter', fontWeight: '700', color: '#1E293B' },
  medicalSub: { fontSize: 12, fontFamily: 'Inter', color: '#64748B', marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    backgroundColor: '#FEF2F2',
    borderRadius: 24,
    marginBottom: 20,
  },
  logoutText: { fontSize: 16, fontFamily: 'Inter', fontWeight: '700', color: '#EF4444' },
});

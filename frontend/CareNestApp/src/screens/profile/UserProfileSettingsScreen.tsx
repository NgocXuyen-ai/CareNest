import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/spacing';
import { BOTTOM_NAV_HEIGHT } from '../../utils/constants';
import Icon from '../../components/common/Icon';
import SelectField from '../../components/common/SelectField';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFamily } from '../../context/FamilyContext';
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from '../../api/auth';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useTranslation } from '../../hooks/useTranslation';
import {
  BLOOD_TYPE_OPTIONS,
  formatBloodType,
  formatGender,
  GENDER_OPTIONS,
} from '../../utils/healthOptions';
import { formatLocalDate } from '../../utils/dateTime';

interface InputFieldProps {
  icon: string;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  editable?: boolean;
}

function InputField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
}: InputFieldProps) {
  const themedColors = useThemedColors();

  return (
    <View
      style={[
        styles.inputContainer,
        { borderBottomColor: themedColors.surfaceVariant },
      ]}
    >
      <View
        style={[
          styles.inputIconWrap,
          { backgroundColor: themedColors.primaryContainer },
        ]}
      >
        <Icon name={icon} size={20} color={themedColors.primary} />
      </View>
      <View style={styles.inputContent}>
        <Text
          style={[styles.inputLabel, { color: themedColors.onSurfaceVariant }]}
        >
          {label}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            { color: themedColors.onSurface },
            !editable && styles.textInputReadonly,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor={themedColors.onSurfaceVariant}
          editable={editable}
        />
      </View>
    </View>
  );
}

function parseIsoBirthday(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatBirthdayFromDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function normalizePhoneValue(value?: string | null): string {
  if (!value) {
    return '';
  }

  return value.trim().replace(/[\s().-]/g, '');
}

function formatMemberRole(role?: string) {
  switch (role) {
    case 'OWNER':
      return 'Chủ gia đình';
    case 'FATHER':
      return 'Bố';
    case 'MOTHER':
      return 'Mẹ';
    case 'OLDER_BROTHER':
      return 'Anh';
    case 'OLDER_SISTER':
      return 'Chị';
    case 'YOUNGER':
      return 'Em';
    case 'OTHER':
      return 'Người thân';
    case 'MEMBER':
      return 'Thành viên';
    default:
      return 'Tài khoản của bạn';
  }
}

export default function UserProfileSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout, refreshUser } = useAuth();
  const { members, refreshFamily } = useFamily();
  const themedColors = useThemedColors();
  const { language } = useLanguage();
  const { t } = useTranslation();

  const [medReminder, setMedReminder] = useState(true);
  const [apptReminder, setApptReminder] = useState(true);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthdayDate, setBirthdayDate] = useState<Date | null>(null);
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [bloodType, setBloodType] = useState('O_POSITIVE');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [gender, setGender] = useState('OTHER');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergy, setAllergy] = useState('');
  const [height, setHeight] = useState(160);
  const [weight, setWeight] = useState(55);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const bmiData = useMemo(() => {
    const h = Number(height || 0);
    const w = Number(weight || 0);
    if (h < 1 || w < 0.1) return null;
    const val = w / (h / 100) ** 2;
    let label = 'Bình thường';
    let color = '#22C55E';
    if (val < 18.5) {
      label = 'Gầy';
      color = '#3B82F6';
    } else if (val >= 25 && val < 30) {
      label = 'Thừa cân';
      color = '#F59E0B';
    } else if (val >= 30) {
      label = 'Béo phì';
      color = '#EF4444';
    }
    return { value: val.toFixed(1), label, color };
  }, [height, weight]);

  const memberRole = useMemo(() => {
    const currentMember = members.find(
      member => String(member.profileId) === user?.profileId,
    );
    return formatMemberRole(currentMember?.role);
  }, [members, user?.profileId]);

  const loadProfile = useCallback(async () => {
    await getCurrentUserProfile()
      .then(profile => {
        setFullName(profile.fullName);
        setEmail(profile.email);
        setPhone(profile.phoneNumber || '');
        const parsedBirthday = parseIsoBirthday(profile.birthday);
        setBirthdayDate(parsedBirthday);
        setBirthday(
          parsedBirthday ? formatBirthdayFromDate(parsedBirthday) : '',
        );
        setBloodType(profile.bloodType || 'O_POSITIVE');
        setGender(profile.gender || 'OTHER');
        setMedicalHistory(profile.medicalHistory || '');
        setAllergy(profile.allergy || '');
        setHeight(profile.height || 160);
        setWeight(profile.weight || 55);
        setEmergencyContactPhone(profile.emergencyContactPhone || '');
        setAvatarUri(profile.avatarUrl || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handlePrimaryAction = () => {
    if (isSaving) {
      return;
    }

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    void handleSave();
  };

  const handleChoosePhoto = () => {
    if (!isEditing) {
      Alert.alert(t('viewMode'), t('clickEditToEnableEditing'));
      return;
    }

    Alert.alert(t('notYetSupported'), t('avatarFeatureNotReady'));
  };

  const handleSave = async () => {
    if (!birthdayDate) {
      Alert.alert(t('invalidBirthday'), t('pleaseSelectValidBirthday'));
      return;
    }

    const normalizedPhone = normalizePhoneValue(phone);
    if (!normalizedPhone) {
      Alert.alert(t('missingPhone'), t('pleaseProvideValidPhone'));
      return;
    }

    const normalizedEmergencyPhone = normalizePhoneValue(emergencyContactPhone);

    try {
      setIsSaving(true);
      await updateCurrentUserProfile({
        fullName,
        email,
        phoneNumber: normalizedPhone,
        birthday: formatLocalDate(birthdayDate),
        gender,
        bloodType,
        medicalHistory,
        allergy,
        height,
        weight,
        emergencyContactPhone: normalizedEmergencyPhone || undefined,
      });
      await Promise.all([refreshUser(), refreshFamily()]);
      setIsEditing(false);
      Alert.alert(t('successMessage'), t('infoUpdated'));
    } catch (error) {
      Alert.alert(
        t('failedToSave'),
        error instanceof Error ? error.message : t('anErrorOccurred'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBirthdayChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowBirthdayPicker(false);
    if (!selectedDate) {
      return;
    }

    setBirthdayDate(selectedDate);
    setBirthday(formatBirthdayFromDate(selectedDate));
  };

  return (
    <View style={[styles.root, { backgroundColor: themedColors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: themedColors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow_back" size={26} color={themedColors.onBackground} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: themedColors.onBackground }]}
        >
          {t('accountInfo')}
        </Text>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handlePrimaryAction}
          disabled={isSaving}
        >
          <Text style={[styles.saveBtnText, { color: themedColors.primary }]}>
            {isSaving ? t('loading') : isEditing ? t('save') : t('edit')}
          </Text>
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
              source={{
                uri:
                  avatarUri || `https://i.pravatar.cc/150?u=${user?.id || '1'}`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={[styles.cameraBtn, !isEditing && styles.cameraBtnDisabled]}
              onPress={handleChoosePhoto}
            >
              <Icon name="photo_camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text
            style={[styles.userNameText, { color: themedColors.onBackground }]}
          >
            {fullName}
          </Text>
          <Text
            style={[
              styles.userRoleText,
              { color: themedColors.onSurfaceVariant },
            ]}
          >
            {memberRole}
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.medicalRecordBtn, shadows.sm]}
            onPressIn={() => {
              void getCurrentUserProfile();
            }}
            onPress={() =>
              navigation.navigate('UserMedical', { memberId: user?.profileId })
            }
          >
            <View style={styles.medicalIconWrap}>
              <Icon name="description" size={22} color="#fff" />
            </View>
            <View style={styles.medicalTextWrap}>
              <Text style={styles.medicalTitle}>{t('medicalRecord')}</Text>
              <Text style={styles.medicalSub}>{t('viewMedicalInfo')}</Text>
            </View>
            <Icon name="chevron_right" size={22} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: themedColors.onSurfaceVariant },
            ]}
          >
            {t('personalInfo')}
          </Text>
          <View
            style={[
              styles.formCard,
              shadows.sm,
              { backgroundColor: themedColors.surface },
            ]}
          >
            <InputField
              icon="person"
              label={t('fullName')}
              value={fullName}
              onChangeText={setFullName}
              editable={isEditing}
            />
            <InputField
              icon="mail"
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={isEditing}
            />
            <InputField
              icon="phone"
              label={t('phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={isEditing}
            />
            <InputField
              icon="contact_phone"
              label={t('emergencyPhone')}
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              keyboardType="phone-pad"
              placeholder={t('optionalField')}
              editable={isEditing}
            />
            <View style={styles.inputContainer}>
              <View style={styles.inputIconWrap}>
                <Icon name="calendar_today" size={20} color={colors.primary} />
              </View>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>{t('dateOfBirth')}</Text>
                <TouchableOpacity
                  activeOpacity={isEditing ? 0.75 : 1}
                  onPress={() => {
                    if (!isEditing) {
                      return;
                    }

                    setShowBirthdayPicker(true);
                  }}
                >
                  <Text
                    style={[
                      styles.textInput,
                      !birthday && styles.placeholderText,
                      !isEditing && styles.textInputReadonly,
                    ]}
                  >
                    {birthday || 'dd/mm/yyyy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <SelectField
              icon="wc"
              label={t('gender')}
              value={gender}
              displayValue={formatGender(gender)}
              options={GENDER_OPTIONS}
              onChange={setGender}
              disabled={!isEditing}
            />
            <InputField
              icon="height"
              label={t('height')}
              value={String(height)}
              onChangeText={val => setHeight(Number(val) || 0)}
              keyboardType="numeric"
              editable={isEditing}
            />
            <InputField
              icon="fitness_center"
              label={t('weight')}
              value={String(weight)}
              onChangeText={val => setWeight(Number(val) || 0)}
              keyboardType="numeric"
              editable={isEditing}
            />

            {bmiData && (
              <View style={styles.bmiPreview}>
                <View style={[styles.bmiBadge, { backgroundColor: bmiData.color }]}>
                  <Text style={styles.bmiBadgeText}>BMI: {bmiData.value}</Text>
                </View>
                <Text style={[styles.bmiStatusLabel, { color: bmiData.color }]}>
                  {bmiData.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: themedColors.onSurfaceVariant },
            ]}
          >
            {t('notificationSettings')}
          </Text>
          <View
            style={[
              styles.formCard,
              shadows.sm,
              { backgroundColor: themedColors.surface },
            ]}
          >
            <View
              style={[
                styles.settingsRow,
                { borderBottomColor: themedColors.surfaceVariant },
              ]}
            >
              <View
                style={[styles.rowIconWrap, { backgroundColor: '#F0F9FF' }]}
              >
                <Icon name="medication" size={20} color="#0EA5E9" />
              </View>
              <Text
                style={[styles.rowLabelText, { color: themedColors.onSurface }]}
              >
                {t('medicineReminder')}
              </Text>
              <Switch
                value={medReminder}
                onValueChange={setMedReminder}
                trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
                thumbColor="#fff"
              />
            </View>
            <View
              style={[
                styles.settingsRow,
                { borderBottomColor: themedColors.surfaceVariant },
              ]}
            >
              <View
                style={[styles.rowIconWrap, { backgroundColor: '#FDF2F8' }]}
              >
                <Icon name="calendar_month" size={20} color="#DB2777" />
              </View>
              <Text
                style={[styles.rowLabelText, { color: themedColors.onSurface }]}
              >
                {t('appointmentReminder')}
              </Text>
              <Switch
                value={apptReminder}
                onValueChange={setApptReminder}
                trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: themedColors.onSurfaceVariant },
            ]}
          >
            {t('appSettings')}
          </Text>
          <View
            style={[
              styles.formCard,
              shadows.sm,
              { backgroundColor: themedColors.surface },
            ]}
          >
            <TouchableOpacity
              style={[styles.settingsRow, { borderBottomColor: 'transparent' }]}
              onPress={() => navigation.navigate('LanguageSelection')}
            >
              <View
                style={[styles.rowIconWrap, { backgroundColor: '#F5F3FF' }]}
              >
                <Icon name="language" size={20} color="#7C3AED" />
              </View>
              <Text
                style={[styles.rowLabelText, { color: themedColors.onSurface }]}
              >
                {t('language')}
              </Text>
              <Text
                style={[
                  styles.rowValueText,
                  { color: themedColors.onSurfaceVariant },
                ]}
              >
                {language === 'vi' ? t('vietnamese') : t('english')}
              </Text>
              <Icon
                name="chevron_right"
                size={20}
                color={themedColors.outline}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: themedColors.onSurfaceVariant },
            ]}
          >
            {t('support')}
          </Text>
          <View
            style={[
              styles.formCard,
              shadows.sm,
              { backgroundColor: themedColors.surface },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.settingsRow,
                { borderBottomColor: themedColors.surfaceVariant },
              ]}
            >
              <View
                style={[styles.rowIconWrap, { backgroundColor: '#FFF7ED' }]}
              >
                <Icon name="help_center" size={20} color="#EA580C" />
              </View>
              <Text
                style={[styles.rowLabelText, { color: themedColors.onSurface }]}
              >
                {t('supportCenter')}
              </Text>
              <Icon name="chevron_right" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingsRow,
                { borderBottomColor: themedColors.surfaceVariant },
              ]}
            >
              <View
                style={[styles.rowIconWrap, { backgroundColor: '#EFF6FF' }]}
              >
                <Icon name="bug_report" size={20} color="#2563EB" />
              </View>
              <Text
                style={[styles.rowLabelText, { color: themedColors.onSurface }]}
              >
                {t('reportBug')}
              </Text>
              <Icon name="chevron_right" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingsRow,
                { borderBottomColor: 'transparent' },
              ]}
              onPress={() => navigation.navigate('Policy')}
            >
              <View
                style={[styles.rowIconWrap, { backgroundColor: '#F0FDF4' }]}
              >
                <Icon name="policy" size={20} color="#22C55E" />
              </View>
              <Text
                style={[styles.rowLabelText, { color: themedColors.onSurface }]}
              >
                {t('privacyPolicy')}
              </Text>
              <Icon name="chevron_right" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              backgroundColor: '#FEF2F2',
            },
          ]}
          onPress={() => void logout()}
        >
          <Icon name="logout" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {showBirthdayPicker ? (
        <DateTimePicker
          value={birthdayDate || new Date(2000, 0, 1)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handleBirthdayChange}
        />
      ) : null}
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
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Manrope',
    fontWeight: '800',
    color: '#1E3A8A',
  },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#3B82F6',
  },
  scroll: { paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    backgroundColor: '#fff',
    padding: 4,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 56 },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraBtnDisabled: {
    opacity: 0.7,
  },
  userNameText: {
    fontSize: 22,
    fontFamily: 'Manrope',
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
  },
  userRoleText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#64748B',
    marginTop: 4,
  },
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
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 2,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#1E293B',
    padding: 0,
  },
  textInputReadonly: {
    color: '#1E293B',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 16,
  },
  rowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabelText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#1E293B',
  },
  rowValueText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#64748B',
    marginRight: 4,
  },
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
  medicalTitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#1E293B',
  },
  medicalSub: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#64748B',
    marginTop: 2,
  },
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
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#EF4444',
  },
  bmiPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  bmiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bmiBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Inter',
  },
  bmiStatusLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

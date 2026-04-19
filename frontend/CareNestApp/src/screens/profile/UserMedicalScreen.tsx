import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ProfileStackParamList } from '../../navigation/navigationTypes';
import Icon from '../../components/common/Icon';
import { getCurrentUserProfile } from '../../api/auth';
import { getFamilyProfile } from '../../api/family';
import { formatBloodType, formatGender } from '../../utils/healthOptions';

type MedicalProfile = {
  fullName: string;
  roleLabel: string;
  age?: number | null;
  birthday?: string | null;
  gender?: string | null;
  bloodType?: string | null;
  height?: number | null;
  weight?: number | null;
  allergy?: string | null;
  medicalHistory?: string | null;
};

export default function UserMedicalScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'UserMedical'>>();
  const { memberId } = route.params || {};
  const [profile, setProfile] = useState<MedicalProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        if (memberId) {
          const response = await getFamilyProfile(Number(memberId));
          setProfile({
            ...response,
            roleLabel: 'Thanh vien gia dinh',
          });
          return;
        }

        const response = await getCurrentUserProfile();
        const birthday = response.birthday || null;
        const age = birthday ? calculateAge(birthday) : null;
        setProfile({
          ...response,
          age,
          roleLabel: 'Tai khoan cua ban',
        });
      } catch {
        setProfile(null);
      }
    }

    void loadProfile();
  }, [memberId]);

  const stats = useMemo(() => {
    return [
      { label: 'Nhom mau', value: formatBloodType(profile?.bloodType) },
      { label: 'Gioi tinh', value: formatGender(profile?.gender) },
      { label: 'Chieu cao', value: profile?.height ? `${profile.height} cm` : 'Chua cap nhat' },
      { label: 'Can nang', value: profile?.weight ? `${profile.weight} kg` : 'Chua cap nhat' },
    ];
  }, [profile]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CareNest</Text>
        <View style={styles.circleBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: `https://i.pravatar.cc/300?u=${encodeURIComponent(profile?.fullName || 'carenest')}` }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{profile?.fullName || 'Dang tai...'}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>{profile?.roleLabel || 'Ho so y te'}</Text>
          </View>
          <Text style={styles.userMeta}>
            {profile?.age != null ? `${profile.age} tuoi` : 'Chua ro tuoi'}
          </Text>
        </View>

        <View style={styles.grid}>
          {stats.map(stat => (
            <View key={stat.label} style={styles.healthCard}>
              <Text style={styles.cardTitle}>{stat.label}</Text>
              <Text style={styles.cardValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="history" size={20} color="#666" />
          <Text style={styles.sectionTitle}>Tien su benh ly</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoBody}>{profile?.medicalHistory || 'Chua co thong tin'}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="warning" size={20} color="#666" />
          <Text style={styles.sectionTitle}>Di ung</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoBody}>{profile?.allergy || 'Khong co di ung'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFDFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  circleBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E3A8A', fontFamily: 'Inter' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },
  profileSection: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    backgroundColor: '#fff',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 60 },
  userName: { fontSize: 28, fontWeight: '800', color: '#1E293B', marginTop: 16, fontFamily: 'Inter' },
  roleChip: {
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: { color: '#3B82F6', fontSize: 13, fontWeight: '800', fontFamily: 'Inter' },
  userMeta: { fontSize: 15, color: '#64748B', marginTop: 8, fontFamily: 'Inter', fontWeight: '500' },
  grid: { gap: 16, marginBottom: 32 },
  healthCard: { padding: 20, borderRadius: 24, backgroundColor: '#F8FAFC' },
  cardTitle: { fontSize: 12, fontWeight: '800', fontFamily: 'Inter', color: '#64748B', marginBottom: 8 },
  cardValue: { fontSize: 24, fontWeight: '800', color: '#1E293B', fontFamily: 'Inter' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#444', fontFamily: 'Inter' },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  infoBody: { fontSize: 14, color: '#64748B', lineHeight: 20, fontFamily: 'Inter' },
});

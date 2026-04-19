import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/spacing';
import { TOP_BAR_HEIGHT, BOTTOM_NAV_HEIGHT } from '../../utils/constants';
import Icon from '../../components/common/Icon';
import Avatar from '../../components/common/Avatar';
import TopAppBar from '../../components/layout/TopAppBar';
import type { FamilyStackParamList } from '../../navigation/navigationTypes';
import { getFamilyProfile, type ProfileDetails } from '../../api/family';
import { formatBloodType, formatGender } from '../../utils/healthOptions';

type NavProp = NativeStackNavigationProp<FamilyStackParamList, 'HealthProfileDetail'>;

export default function HealthProfileDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProp<FamilyStackParamList, 'HealthProfileDetail'>>();
  const [member, setMember] = useState<ProfileDetails | null>(null);

  useEffect(() => {
    const profileId = Number(route.params.memberId);
    void getFamilyProfile(profileId).then(setMember).catch(() => setMember(null));
  }, [route.params.memberId]);

  const statusColor = member?.healthStatus?.includes('THEO') ? '#E65100' : '#2E7D32';
  const statusLabel = member?.healthStatus || 'Suc khoe tot';

  function formatBirthday(dateValue?: string) {
    if (!dateValue) return 'Chua cap nhat';
    const [year, month, day] = dateValue.split('-');
    return `${day}/${month}/${year}`;
  }

  return (
    <View style={styles.root}>
      <TopAppBar variant="detail" title={member?.fullName || 'Chi tiet ho so'} />
      <ScrollView
        contentContainerStyle={{ paddingTop: TOP_BAR_HEIGHT + insets.top + 16, paddingBottom: BOTTOM_NAV_HEIGHT + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Avatar name={member?.fullName || 'Thanh vien'} size="xl" />
          <Text style={styles.heroName}>{member?.fullName || 'Dang tai...'}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Thanh vien</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>Thong tin co ban</Text>
          <View style={styles.infoGrid}>
            <InfoRow label="Nhom mau" value={formatBloodType(member?.bloodType)} icon="healing" />
            <InfoRow label="Ngay sinh" value={formatBirthday(member?.birthday || undefined)} icon="cake" />
            <InfoRow label="Gioi tinh" value={formatGender(member?.gender)} icon="person" />
            <InfoRow
              label="Chieu cao / Can nang"
              value={`${member?.height ?? '--'} cm / ${member?.weight ?? '--'} kg`}
              icon="height"
            />
          </View>
        </View>

        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>Tien su benh</Text>
          <Text style={styles.bodyText}>{member?.medicalHistory || 'Chua co thong tin'}</Text>
        </View>

        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardTitle}>Di ung</Text>
          <Text style={styles.bodyText}>{member?.allergy || 'Khong co di ung'}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('VaccinationTracker', { memberId: String(route.params.memberId) })}
          >
            <Icon name="syringe" size={18} color={colors.onPrimary} />
            <Text style={styles.actionBtnPrimaryText}>Lich tiem chung</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('GrowthTracker', { memberId: String(route.params.memberId) })}
          >
            <Icon name="trending_up" size={18} color={colors.primary} />
            <Text style={styles.actionBtnSecondaryText}>Theo doi phat trien</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.infoItem}>
      <Icon name={icon} size={16} color={colors.primary} />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainerLowest,
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  heroName: { fontSize: 22, fontFamily: 'Manrope', fontWeight: '800', color: colors.onSurface, marginTop: 12 },
  heroBadgeRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  roleBadge: { backgroundColor: colors.secondaryContainer, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  roleText: { fontSize: 12, fontFamily: 'Inter', fontWeight: '700', color: colors.secondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: 'Inter', fontWeight: '600' },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontFamily: 'Manrope', fontWeight: '700', color: colors.onSurface, marginBottom: 12 },
  infoGrid: { gap: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoLabel: { fontSize: 11, fontFamily: 'Inter', color: colors.onSurfaceVariant, marginBottom: 2 },
  infoValue: { fontSize: 14, fontFamily: 'Inter', fontWeight: '600', color: colors.onSurface },
  bodyText: { fontSize: 13, fontFamily: 'Inter', color: colors.onSurfaceVariant, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 14, gap: 8 },
  actionBtnPrimary: { backgroundColor: colors.primary },
  actionBtnPrimaryText: { fontSize: 13, fontFamily: 'Inter', fontWeight: '700', color: colors.onPrimary },
  actionBtnSecondary: { backgroundColor: colors.primaryFixed },
  actionBtnSecondaryText: { fontSize: 13, fontFamily: 'Inter', fontWeight: '700', color: colors.primary },
});

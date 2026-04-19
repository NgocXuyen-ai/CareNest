import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFamily } from '../../context/FamilyContext';
import { useAuth } from '../../context/AuthContext';
import { BOTTOM_NAV_HEIGHT } from '../../utils/constants';
import {
  acceptInvitation,
  type FamilyInvitationItem,
  getFamilyJoinCode,
  getReceivedInvitations,
  getSentInvitations,
  inviteMember,
  joinFamilyByCode,
  rejectInvitation,
  rotateFamilyJoinCode,
  type FamilyJoinCodeResponse,
} from '../../api/family';

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Thanh vien' },
  { value: 'FATHER', label: 'Bo' },
  { value: 'MOTHER', label: 'Me' },
  { value: 'OTHER', label: 'Khac' },
] as const;

export default function FamilyManagementScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { hasFamily, familyName, createFamily, members, refreshFamily } = useFamily();
  const { user } = useAuth();

  const [familyDraftName, setFamilyDraftName] = useState('To am than thuong');
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('MEMBER');
  const [receivedInvitations, setReceivedInvitations] = useState<FamilyInvitationItem[]>([]);
  const [sentInvitations, setSentInvitations] = useState<FamilyInvitationItem[]>([]);
  const [joinCodeData, setJoinCodeData] = useState<FamilyJoinCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentUserRole = useMemo(() => {
    return members.find(member => String(member.profileId) === user?.profileId)?.role;
  }, [members, user?.profileId]);

  const isOwner = currentUserRole === 'OWNER';

  const loadFamilyData = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const [received, sent] = await Promise.all([
        getReceivedInvitations().catch(() => []),
        getSentInvitations().catch(() => []),
      ]);

      setReceivedInvitations(received);
      setSentInvitations(sent);

      if (hasFamily) {
        const codeResponse = await getFamilyJoinCode().catch(() => null);
        setJoinCodeData(codeResponse);
      } else {
        setJoinCodeData(null);
      }
    } catch {
      setReceivedInvitations([]);
      setSentInvitations([]);
      setJoinCodeData(null);
    }
  }, [hasFamily, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadFamilyData();
  }, [loadFamilyData, user]);

  async function handleCreateFamily() {
    if (!familyDraftName.trim()) {
      Alert.alert('Thieu thong tin', 'Vui long nhap ten family.');
      return;
    }

    try {
      setIsLoading(true);
      await createFamily(familyDraftName.trim(), null);
      await refreshFamily();
      await loadFamilyData();
    } catch (error) {
      Alert.alert('Khong the tao family', error instanceof Error ? error.message : 'Da co loi xay ra');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinByCode() {
    if (!joinCode.trim()) {
      Alert.alert('Thieu ma tham gia', 'Vui long nhap ma tham gia family.');
      return;
    }

    try {
      setIsLoading(true);
      await joinFamilyByCode(joinCode.trim().toUpperCase());
      setJoinCode('');
      await refreshFamily();
      await loadFamilyData();
    } catch (error) {
      Alert.alert('Khong the tham gia', error instanceof Error ? error.message : 'Da co loi xay ra');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInviteMember() {
    if (!inviteEmail.trim()) {
      Alert.alert('Thieu email', 'Vui long nhap email nguoi muon moi.');
      return;
    }

    try {
      setIsLoading(true);
      await inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      await loadFamilyData();
    } catch (error) {
      Alert.alert('Khong the gui loi moi', error instanceof Error ? error.message : 'Da co loi xay ra');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAcceptInvitation(inviteId: number) {
    try {
      await acceptInvitation(inviteId);
      await refreshFamily();
      await loadFamilyData();
    } catch (error) {
      Alert.alert('Khong the chap nhan', error instanceof Error ? error.message : 'Da co loi xay ra');
    }
  }

  async function handleRejectInvitation(inviteId: number) {
    try {
      await rejectInvitation(inviteId);
      await loadFamilyData();
    } catch (error) {
      Alert.alert('Khong the tu choi', error instanceof Error ? error.message : 'Da co loi xay ra');
    }
  }

  async function handleRotateCode() {
    try {
      const nextCode = await rotateFamilyJoinCode();
      setJoinCodeData(nextCode);
    } catch (error) {
      Alert.alert('Khong the tao ma moi', error instanceof Error ? error.message : 'Da co loi xay ra');
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{hasFamily ? familyName : 'Gia dinh'}</Text>
      </View>

      <ScrollView
        style={styles.root}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + 32 }}
      >
        {!hasFamily ? (
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tao family moi</Text>
              <TextInput
                style={styles.input}
                value={familyDraftName}
                onChangeText={setFamilyDraftName}
                placeholder="Ten family"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={() => void handleCreateFamily()} disabled={isLoading}>
                <Text style={styles.primaryBtnText}>Tao family</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tham gia bang ma</Text>
              <TextInput
                style={styles.input}
                value={joinCode}
                onChangeText={setJoinCode}
                placeholder="Nhap join code"
                autoCapitalize="characters"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => void handleJoinByCode()} disabled={isLoading}>
                <Text style={styles.secondaryBtnText}>Tham gia family</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thanh vien</Text>
              {members.map(member => (
                <TouchableOpacity
                  key={member.profileId}
                  style={styles.memberRow}
                  onPress={() => navigation.navigate('UserMedical', { memberId: String(member.profileId) })}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{member.fullName.charAt(0)}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.fullName}</Text>
                    <Text style={styles.memberMeta}>{member.role}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Moi qua email</Text>
              <TextInput
                style={styles.input}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.roleRow}>
                {ROLE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.roleChip, inviteRole === option.value && styles.roleChipActive]}
                    onPress={() => setInviteRole(option.value)}
                  >
                    <Text style={[styles.roleChipText, inviteRole === option.value && styles.roleChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => void handleInviteMember()} disabled={isLoading}>
                <Text style={styles.primaryBtnText}>Gui loi moi</Text>
              </TouchableOpacity>
            </View>

            {joinCodeData && isOwner ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Join code / QR</Text>
                <Text style={styles.joinCodeText}>{joinCodeData.joinCode}</Text>
                <Text style={styles.helperText}>Het han: {new Date(joinCodeData.expiresAt).toLocaleString('vi-VN')}</Text>
                <Text style={styles.helperText}>{joinCodeData.joinLink}</Text>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => void handleRotateCode()}>
                  <Text style={styles.secondaryBtnText}>Tao ma moi</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}

        {receivedInvitations.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Loi moi da nhan</Text>
            {receivedInvitations.map(invitation => (
              <View key={invitation.inviteId} style={styles.invitationRow}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{invitation.familyName || 'Family'}</Text>
                  <Text style={styles.memberMeta}>{invitation.senderEmail || 'Khong ro nguoi gui'}</Text>
                </View>
                <View style={styles.invitationActions}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => void handleAcceptInvitation(invitation.inviteId)}>
                    <Text style={styles.miniBtnText}>Nhan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniBtnOutline} onPress={() => void handleRejectInvitation(invitation.inviteId)}>
                    <Text style={styles.miniBtnOutlineText}>Tu choi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {sentInvitations.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Loi moi da gui</Text>
            {sentInvitations.map(invitation => (
              <View key={invitation.inviteId} style={styles.invitationRow}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{invitation.receiverEmail || 'Khong ro email'}</Text>
                  <Text style={styles.memberMeta}>{invitation.status || 'PENDING'}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  topBarTitle: { fontSize: 20, fontWeight: '800', color: '#0369a1' },
  content: { padding: 20, gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    color: '#1E293B',
    fontSize: 15,
  },
  primaryBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: 20,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: '#2563EB', fontSize: 15, fontWeight: '800' },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  roleChipActive: { backgroundColor: '#DBEAFE' },
  roleChipText: { color: '#475569', fontWeight: '700' },
  roleChipTextActive: { color: '#1D4ED8' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 18, fontWeight: '800', color: '#2563EB' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  memberMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  joinCodeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1D4ED8',
    textAlign: 'center',
    letterSpacing: 2,
  },
  helperText: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8 },
  invitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  invitationActions: { flexDirection: 'row', gap: 8 },
  miniBtn: {
    minWidth: 64,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  miniBtnText: { color: '#fff', fontWeight: '800' },
  miniBtnOutline: {
    minWidth: 76,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  miniBtnOutlineText: { color: '#475569', fontWeight: '800' },
});

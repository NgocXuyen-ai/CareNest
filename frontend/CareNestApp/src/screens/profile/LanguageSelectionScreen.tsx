import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { shadows } from '../../theme/spacing';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import Icon from '../../components/common/Icon';
import type { ProfileStackParamList } from '../../navigation/navigationTypes';

type Nav = NativeStackNavigationProp<
  ProfileStackParamList,
  'LanguageSelection'
>;

const LANGUAGES = [
  { code: 'vi' as const, name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
];

export default function LanguageSelectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const themedColors = useThemedColors();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleSelectLanguage = async (lang: (typeof LANGUAGES)[0]['code']) => {
    await setLanguage(lang);
    navigation.goBack();
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
          {t('selectLanguage')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: themedColors.onSurfaceVariant },
            ]}
          >
            {t('language')}
          </Text>

          <View
            style={[
              styles.languageCard,
              shadows.sm,
              { backgroundColor: themedColors.surface },
            ]}
          >
            {LANGUAGES.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  {
                    borderBottomColor:
                      index < LANGUAGES.length - 1
                        ? themedColors.surfaceVariant
                        : 'transparent',
                  },
                ]}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text
                    style={[styles.langName, { color: themedColors.onSurface }]}
                  >
                    {lang.name}
                  </Text>
                </View>

                {language === lang.code && (
                  <View
                    style={[
                      styles.checkmark,
                      { backgroundColor: themedColors.primary },
                    ]}
                  >
                    <Icon name="check" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Icon
              name="info"
              size={20}
              color={themedColors.primary}
              style={styles.infoIcon}
            />
            <Text
              style={[
                styles.infoText,
                { color: themedColors.onSurfaceVariant },
              ]}
            >
              {t('languageChangeInfo')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Manrope',
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  languageCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  langFlag: {
    fontSize: 32,
  },
  langName: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter',
    lineHeight: 18,
  },
});

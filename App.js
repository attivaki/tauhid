
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Coordinates,
  PrayerTimes,
  CalculationMethod,
  Madhab,
} from 'adhan';
import * as Notifications from 'expo-notifications';

const C = {
  bg: '#061C18',
  panel: '#0B2922',
  panelLight: '#10372D',
  gold: '#D8B66A',
  goldLight: '#F0D99C',
  white: '#F5F3EB',
  muted: '#A9BBB2',
  line: '#23443A',
  active: '#183D30',
};

const coordinates = new Coordinates(43.25, 46.58);
const params = CalculationMethod.Other();
params.fajrAngle = 18;
params.ishaAngle = 15;
params.madhab = Madhab.Shafi;

const formatTime = (date) =>
  date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const prayerNames = [
  { key: 'fajr', name: 'Фаджр', icon: 'sunny-outline' },
  { key: 'sunrise', name: 'Восход', icon: 'sunny-outline' },
  { key: 'dhuhr', name: 'Зухр', icon: 'sunny' },
  { key: 'asr', name: 'Аср', icon: 'partly-sunny-outline' },
  { key: 'maghrib', name: 'Магриб', icon: 'moon-outline' },
  { key: 'isha', name: 'Иша', icon: 'moon' },
];

const surahs = [
  { id: 1, name: 'Аль-Фатиха', arabic: 'الفاتحة', count: 7 },
  { id: 2, name: 'Аль-Бакара', arabic: 'البقرة', count: 286 },
  { id: 3, name: 'Аль Имран', arabic: 'آل عمران', count: 200 },
  { id: 112, name: 'Аль-Ихляс', arabic: 'الإخلاص', count: 4 },
  { id: 113, name: 'Аль-Фаляк', arabic: 'الفلق', count: 5 },
  { id: 114, name: 'Ан-Нас', arabic: 'الناس', count: 6 },
];

function SectionTitle({ children }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

function GoldLine() {
  return <View style={s.goldLine} />;
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function setupNotifications() {
      try {
        const permission =
          await Notifications.requestPermissionsAsync();

        if (permission.status !== 'granted') return;

        await Notifications.cancelAllScheduledNotificationsAsync();

        const now = new Date();
        const times = new PrayerTimes(coordinates, now, params);

        const items = [
          { name: 'Фаджр', time: times.fajr },
          { name: 'Зухр', time: times.dhuhr },
          { name: 'Аср', time: times.asr },
          { name: 'Магриб', time: times.maghrib },
          { name: 'Иша', time: times.isha },
        ];

        for (const prayer of items) {
          if (prayer.time > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'TAUHID APP — время намаза',
                body: `Наступило время намаза ${prayer.name}`,
                sound: 'default',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: prayer.time,
              },
            });
          }
        }
      } catch (error) {
        console.warn('TAUHID notifications:', error);
      }
    }

    setupNotifications();
  }, []);

  const now = new Date();
  const times = new PrayerTimes(coordinates, now, params);

  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const nextItems = [
    { name: 'Фаджр', time: times.fajr },
    { name: 'Зухр', time: times.dhuhr },
    { name: 'Аср', time: times.asr },
    { name: 'Магриб', time: times.maghrib },
    { name: 'Иша', time: times.isha },
  ];

  const nextPrayer =
    nextItems.find((p) => p.time > now) || {
      name: 'Фаджр',
      time: new PrayerTimes(coordinates, tomorrow, params).fajr,
    };

  const dateLabel = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function renderHome() {
    return (
      <>
        <View style={s.hero}>
          <View style={s.heroGlow} />
          <Text style={s.mosqueSymbol}>☾</Text>
          <Text style={s.brand}>TAUHID APP</Text>
          <Text style={s.byline}>by ATTIVAKI</Text>
          <GoldLine />
          <Text style={s.heroCaption}>ПУТЬ К ДУХОВНОСТИ</Text>
        </View>

        <View style={s.locationRow}>
          <Ionicons name="location-outline" size={17} color={C.gold} />
          <Text style={s.location}>Хасавюрт, Дагестан</Text>
          <View style={{ flex: 1 }} />
          <Ionicons name="calendar-outline" size={15} color={C.muted} />
          <Text style={s.date}>{dateLabel}</Text>
        </View>

        <View style={s.nextCard}>
          <View style={s.cardTop}>
            <Text style={s.eyebrow}>СЛЕДУЮЩИЙ НАМАЗ</Text>
            <Ionicons name="moon-outline" size={22} color={C.gold} />
          </View>

          <Text style={s.nextName}>{nextPrayer.name}</Text>
          <Text style={s.nextTime}>{formatTime(nextPrayer.time)}</Text>
          <Text style={s.nextHint}>Хасавюрт • Время намаза</Text>

          <View style={s.cardDecoration}>
            <Text style={s.cardCrescent}>☾</Text>
          </View>
        </View>

        <View style={s.scheduleHeader}>
          <SectionTitle>Расписание намаза</SectionTitle>
          <Text style={s.today}>СЕГОДНЯ</Text>
        </View>

        <View style={s.schedule}>
          {prayerNames.map((p) => {
            const isNext = p.name === nextPrayer.name;
            const value = times[p.key];

            return (
              <View
                key={p.key}
                style={[s.prayerRow, isNext && s.prayerRowActive]}
              >
                <View style={[s.prayerIcon, isNext && s.prayerIconActive]}>
                  <Ionicons
                    name={p.icon}
                    size={19}
                    color={isNext ? C.gold : C.muted}
                  />
                </View>
                <Text style={[s.prayerName, isNext && s.prayerNameActive]}>
                  {p.name}
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={[s.prayerTime, isNext && s.prayerTimeActive]}>
                  {formatTime(value)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={s.quoteCard}>
          <Ionicons name="sparkles-outline" size={23} color={C.gold} />
          <View style={{ flex: 1 }}>
            <Text style={s.quoteArabic}>بِسْمِ اللَّهِ</Text>
            <Text style={s.quoteText}>С именем Аллаха, Милостивого, Милосердного</Text>
          </View>
        </View>
      </>
    );
  }

  function renderQuran() {
    return (
      <View style={s.pageContent}>
        <SectionTitle>Священный Коран</SectionTitle>
        <Text style={s.pageSubtitle}>
          Выберите суру для чтения
        </Text>

        <View style={s.quranBanner}>
          <Text style={s.bannerArabic}>القرآن الكريم</Text>
          <Text style={s.bannerTitle}>Благородный Коран</Text>
          <Text style={s.bannerSubtitle}>114 сур • Священное писание</Text>
        </View>

        {surahs.map((surah) => (
          <Pressable
            key={surah.id}
            style={s.surahRow}
            onPress={() =>
              alert(
                `${surah.name}\n${surah.arabic}\n${surah.count} аятов\n\nЧтение полного текста с переводом можно добавить следующим этапом.`
              )
            }
          >
            <View style={s.surahNumber}>
              <Text style={s.surahNumberText}>{surah.id}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.surahName}>{surah.name}</Text>
              <Text style={s.surahCount}>{surah.count} аятов</Text>
            </View>
            <Text style={s.surahArabic}>{surah.arabic}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderQibla() {
    return (
      <View style={s.pageContent}>
        <SectionTitle>Направление Киблы</SectionTitle>
        <Text style={s.pageSubtitle}>
          Направление к Священной Каабе
        </Text>

        <View style={s.compassCard}>
          <View style={s.compassOuter}>
            <View style={s.compassInner}>
              <Ionicons name="navigate" size={68} color={C.gold} />
            </View>
            <Text style={[s.compassLabel, { top: 12 }]}>N</Text>
            <Text style={[s.compassLabel, { bottom: 12 }]}>S</Text>
            <Text style={[s.compassLabel, { left: 13, top: '48%' }]}>W</Text>
            <Text style={[s.compassLabel, { right: 13, top: '48%' }]}>E</Text>
          </View>
          <Text style={s.compassTitle}>Кибла</Text>
          <Text style={s.compassHint}>
            Для точного направления потребуется компас устройства и расчёт азимута.
          </Text>
        </View>

        <View style={s.infoCard}>
          <Ionicons name="information-circle-outline" size={22} color={C.gold} />
          <Text style={s.infoText}>
            Сейчас показан декоративный компас. Он пока не использует датчики
            iPhone и не указывает реальное направление.
          </Text>
        </View>
      </View>
    );
  }

  function renderSettings() {
    return (
      <View style={s.pageContent}>
        <SectionTitle>Настройки</SectionTitle>
        <Text style={s.pageSubtitle}>Настройте приложение под себя</Text>

        <View style={s.settingsCard}>
          <Ionicons name="location-outline" size={22} color={C.gold} />
          <View style={{ flex: 1 }}>
            <Text style={s.settingTitle}>Город</Text>
            <Text style={s.settingSubtitle}>Хасавюрт, Дагестан</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </View>

        <View style={s.settingsCard}>
          <Ionicons name="time-outline" size={22} color={C.gold} />
          <View style={{ flex: 1 }}>
            <Text style={s.settingTitle}>Расчёт времени намаза</Text>
            <Text style={s.settingSubtitle}>Углы Фаджр 18° • Иша 15°</Text>
          </View>
        </View>

        <View style={s.settingsCard}>
          <Ionicons name="notifications-outline" size={22} color={C.gold} />
          <View style={{ flex: 1 }}>
            <Text style={s.settingTitle}>Уведомления</Text>
            <Text style={s.settingSubtitle}>Запланированные уведомления о намазе</Text>
          </View>
        </View>

        <View style={s.aboutCard}>
          <Text style={s.aboutBrand}>TAUHID APP</Text>
          <Text style={s.aboutBy}>by ATTIVAKI</Text>
          <Text style={s.aboutVersion}>Версия 1.0.0</Text>
        </View>
      </View>
    );
  }

  function renderContent() {
    if (tab === 'quran') return renderQuran();
    if (tab === 'qibla') return renderQibla();
    if (tab === 'settings') return renderSettings();
    return renderHome();
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        <Text style={s.footer}>TAUHID APP  •  by ATTIVAKI</Text>
      </ScrollView>

      <View style={s.bottomNav}>
        {[
          { key: 'home', label: 'Главная', icon: 'home-outline' },
          { key: 'quran', label: 'Коран', icon: 'book-outline' },
          { key: 'qibla', label: 'Кибла', icon: 'navigate-outline' },
          { key: 'settings', label: 'Настройки', icon: 'settings-outline' },
        ].map((item) => {
          const active = tab === item.key;

          return (
            <Pressable
              key={item.key}
              style={s.navItem}
              onPress={() => setTab(item.key)}
            >
              <Ionicons
                name={item.icon}
                size={23}
                color={active ? C.gold : C.muted}
              />
              <Text style={[s.navLabel, active && s.navLabelActive]}>
                {item.label}
              </Text>
              {active && <View style={s.navIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {showSplash && (
        <View style={s.splash}>
          <Text style={s.splashMoon}>☾</Text>
          <Text style={s.splashBrand}>TAUHID APP</Text>
          <Text style={s.splashBy}>by ATTIVAKI</Text>
          <GoldLine />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  hero: {
    minHeight: 205,
    borderRadius: 24,
    backgroundColor: C.panel,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 24,
  },
  heroGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#123D30',
    top: -110,
    alignSelf: 'center',
  },
  mosqueSymbol: {
    fontSize: 54,
    color: C.gold,
    marginBottom: 2,
  },
  brand: {
    color: C.goldLight,
    fontSize: 25,
    fontWeight: '600',
    letterSpacing: 5,
  },
  byline: {
    color: C.gold,
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 7,
  },
  goldLine: {
    height: 1,
    width: 45,
    backgroundColor: C.gold,
    marginVertical: 16,
  },
  heroCaption: {
    color: C.muted,
    fontSize: 9,
    letterSpacing: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 15,
    gap: 6,
  },
  location: {
    color: C.white,
    fontSize: 13,
  },
  date: {
    color: C.muted,
    fontSize: 10,
  },
  nextCard: {
    minHeight: 208,
    borderRadius: 22,
    backgroundColor: C.panelLight,
    padding: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#6C5934',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: C.gold,
    fontSize: 10,
    letterSpacing: 2,
  },
  nextName: {
    color: C.white,
    fontSize: 28,
    marginTop: 16,
    fontWeight: '500',
  },
  nextTime: {
    color: C.goldLight,
    fontSize: 46,
    fontWeight: '300',
    letterSpacing: 1,
    marginTop: 2,
  },
  nextHint: {
    color: C.muted,
    fontSize: 12,
    marginTop: 6,
  },
  cardDecoration: {
    position: 'absolute',
    right: 15,
    bottom: -23,
    opacity: 0.12,
  },
  cardCrescent: {
    color: C.gold,
    fontSize: 115,
  },
  scheduleHeader: {
    marginTop: 29,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: '600',
  },
  today: {
    color: C.gold,
    fontSize: 9,
    letterSpacing: 2,
  },
  schedule: {
    borderRadius: 20,
    backgroundColor: C.panel,
    padding: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  prayerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  prayerRowActive: {
    backgroundColor: C.active,
    borderBottomColor: 'transparent',
  },
  prayerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#14352C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prayerIconActive: {
    backgroundColor: '#274633',
  },
  prayerName: {
    color: C.white,
    fontSize: 15,
  },
  prayerNameActive: {
    color: C.goldLight,
    fontWeight: '600',
  },
  prayerTime: {
    color: C.white,
    fontSize: 15,
    fontWeight: '500',
  },
  prayerTimeActive: {
    color: C.goldLight,
  },
  quoteCard: {
    marginTop: 22,
    padding: 17,
    borderRadius: 18,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quoteArabic: {
    color: C.goldLight,
    fontSize: 23,
    marginBottom: 5,
  },
  quoteText: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
  },
  pageContent: {
    paddingTop: 18,
    minHeight: 550,
  },
  pageSubtitle: {
    color: C.muted,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 22,
  },
  quranBanner: {
    backgroundColor: C.panelLight,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C5934',
    marginBottom: 22,
  },
  bannerArabic: {
    color: C.goldLight,
    fontSize: 34,
    marginBottom: 12,
  },
  bannerTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '600',
  },
  bannerSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 8,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.panel,
    borderRadius: 15,
    padding: 14,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: C.line,
  },
  surahNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.active,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  surahNumberText: {
    color: C.gold,
    fontSize: 13,
  },
  surahName: {
    color: C.white,
    fontSize: 14,
    fontWeight: '500',
  },
  surahCount: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
  },
  surahArabic: {
    color: C.goldLight,
    fontSize: 23,
  },
  compassCard: {
    backgroundColor: C.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.line,
    padding: 25,
    alignItems: 'center',
  },
  compassOuter: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: '#806B40',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassLabel: {
    position: 'absolute',
    color: C.gold,
    fontSize: 12,
  },
  compassTitle: {
    color: C.goldLight,
    fontSize: 25,
    marginTop: 25,
  },
  compassHint: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 10,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: C.panel,
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: C.line,
  },
  infoText: {
    flex: 1,
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.panel,
    borderRadius: 16,
    padding: 17,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: C.line,
  },
  settingTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: '500',
  },
  settingSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 17,
  },
  aboutCard: {
    alignItems: 'center',
    padding: 25,
    marginTop: 20,
    backgroundColor: C.panelLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.line,
  },
  aboutBrand: {
    color: C.goldLight,
    fontSize: 22,
    letterSpacing: 4,
  },
  aboutBy: {
    color: C.gold,
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 8,
  },
  aboutVersion: {
    color: C.muted,
    fontSize: 11,
    marginTop: 15,
  },
  footer: {
    textAlign: 'center',
    color: '#668075',
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 30,
    marginBottom: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#081F1A',
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 49,
    gap: 4,
    position: 'relative',
  },
  navLabel: {
    color: C.muted,
    fontSize: 10,
  },
  navLabelActive: {
    color: C.gold,
    fontWeight: '600',
  },
  navIndicator: {
    position: 'absolute',
    top: -10,
    width: 22,
    height: 2,
    backgroundColor: C.gold,
    borderRadius: 2,
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashMoon: {
    color: C.goldLight,
    fontSize: 82,
    marginBottom: 20,
  },
  splashBrand: {
    color: C.goldLight,
    fontSize: 28,
    letterSpacing: 5,
  },
  splashBy: {
    color: C.gold,
    fontSize: 13,
    letterSpacing: 3,
    marginTop: 12,
  },
});

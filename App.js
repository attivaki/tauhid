
import React, { useEffect, useState, useRef } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';

import {
  Coordinates,
  PrayerTimes,
  CalculationMethod,
  Madhab,
} from 'adhan';

import * as Notifications from 'expo-notifications';

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

const quranSurahs = [
  { id: 1, name: 'Аль-Фатиха', arabic: 'الفاتحة', count: 7 },
  { id: 2, name: 'Аль-Бакара', arabic: 'البقرة', count: 286 },
  { id: 3, name: 'Аль Имран', arabic: 'آل عمران', count: 200 },
  { id: 112, name: 'Аль-Ихляс', arabic: 'الإخلاص', count: 4 },
  { id: 113, name: 'Аль-Фаляк', arabic: 'الفلق', count: 5 },
  { id: 114, name: 'Ан-Нас', arabic: 'الناس', count: 6 },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function setupNotifications() {
      const permission =
        await Notifications.requestPermissionsAsync();

      console.log(
        'TAUHID: разрешение на уведомления:',
        permission.status
      );

      if (permission.status !== 'granted') {
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();
      const times = new PrayerTimes(coordinates, now, params);

      const prayers = [
        { name: 'Фаджр', time: times.fajr },
        { name: 'Зухр', time: times.dhuhr },
        { name: 'Аср', time: times.asr },
        { name: 'Магриб', time: times.maghrib },
        { name: 'Иша', time: times.isha },
      ];

      for (const prayer of prayers) {
        if (prayer.time > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'TAUHID — время намаза',
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
    }

    setupNotifications().catch(console.warn);
  }, []);

  const now = new Date();
  const prayerTimes = new PrayerTimes(
    coordinates,
    now,
    params
  );

  const upcomingPrayers = [
    ['Фаджр', prayerTimes.fajr],
    ['Зухр', prayerTimes.dhuhr],
    ['Аср', prayerTimes.asr],
    ['Магриб', prayerTimes.maghrib],
    ['Иша', prayerTimes.isha],
  ];

  const nextPrayer = upcomingPrayers.find(
    ([name, time]) => time > now
  );

  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const nextPrayerName = nextPrayer
    ? nextPrayer[0]
    : 'Фаджр';

  const nextPrayerTime = nextPrayer
    ? nextPrayer[1]
    : new PrayerTimes(coordinates, tomorrow, params).fajr;

  const prayers = [
    ['Фаджр', formatTime(prayerTimes.fajr)],
    ['Восход', formatTime(prayerTimes.sunrise)],
    ['Зухр', formatTime(prayerTimes.dhuhr)],
    ['Аср', formatTime(prayerTimes.asr)],
    ['Магриб', formatTime(prayerTimes.maghrib)],
    ['Иша', formatTime(prayerTimes.isha)],
  ];

  return (
    <View style={s.root}>
      <ScrollView style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>TAUHID</Text>
          <Text style={s.subtitle}>Время намаза</Text>
          <Text style={s.city}>
            ⌖ Хасавюрт, Дагестан
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.label}>СЛЕДУЮЩИЙ НАМАЗ</Text>
          <Text style={s.maghrib}>{nextPrayerName}</Text>
          <Text style={s.time}>
            {formatTime(nextPrayerTime)}
          </Text>
          <Text style={s.date}>
            Хасавюрт, Дагестан
          </Text>
        </View>

        <Text style={s.heading}>
          Расписание на сегодня
        </Text>

        {prayers.map(([name, time]) => (
          <View key={name} style={s.row}>
            <Text style={s.prayer}>{name}</Text>
            <Text style={s.prayerTime}>{time}</Text>
          </View>
        ))}

        <View style={s.footer}>
          <Pressable
            style={s.quranButton}
            onPress={() => {
              alert(
                quranSurahs
                  .map(
                    (surah) =>
                      `${surah.id}. ${surah.name} — ${surah.arabic} (${surah.count} аятов)`
                  )
                  .join('\n')
              );
            }}
          >
            <Text style={s.quranButtonText}>
              📖 Коран
            </Text>
          </Pressable>

          <Text style={s.footerText}>
            КИБЛА • КОРАН • НАСТРОЙКИ
          </Text>

          <Text style={s.note}>ATTIVAKI</Text>
        </View>
      </ScrollView>

      {showSplash && (
        <View style={s.splash}>
          <View style={s.ornament}>
            <Text style={s.crescent}>☾</Text>
            <View style={s.ornamentLine} />
            <Text style={s.ornamentDot}>✦</Text>
          </View>

          <Text style={s.splashBrand}>
            TAUHID
          </Text>

          <Text style={s.splashApp}>
            A P P
          </Text>

          <View style={s.splashDivider} />

          <Text style={s.splashSubtitle}>
            ВРЕМЯ НАМАЗА
          </Text>

          <Text style={s.splashBy}>
            by ATTIVAKI
          </Text>

          <View style={s.bottomOrnament}>
            <Text style={s.bottomStar}>✦</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#071B18',
  },

  page: {
    flex: 1,
    backgroundColor: '#071B18',
    paddingHorizontal: 22,
  },

  header: {
    paddingTop: 55,
    paddingBottom: 28,
  },

  brand: {
    textAlign: 'center',
    color: '#D8C18A',
    fontSize: 25,
    fontWeight: '500',
    letterSpacing: 5,
  },

  subtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 8,
  },

  city: {
    color: '#B5C9BF',
    marginTop: 14,
    fontSize: 14,
  },

  card: {
    backgroundColor: '#12352C',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },

  label: {
    color: '#D8C18A',
    fontSize: 11,
    letterSpacing: 2,
  },

  maghrib: {
    color: '#FFFFFF',
    fontSize: 25,
    marginTop: 18,
  },

  time: {
    color: '#D8C18A',
    fontSize: 48,
    fontWeight: '300',
    marginTop: 6,
  },

  date: {
    color: '#B5C9BF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#244039',
  },

  prayer: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  prayerTime: {
    color: '#D8C18A',
    fontSize: 16,
    fontWeight: '600',
  },

  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },

  footerText: {
    color: '#B5C9BF',
    fontSize: 10,
    letterSpacing: 1,
  },

  note: {
    color: '#D8C18A',
    marginTop: 18,
    letterSpacing: 3,
  },

  quranButton: {
    backgroundColor: '#174D3A',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },

  quranButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  splash: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 100,
  top: -60,
  bottom: -60,
  backgroundColor: '#063D32',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
},

  ornament: {
    alignItems: 'center',
    marginBottom: 30,
  },

  crescent: {
    color: '#E6C778',
    fontSize: 76,
    lineHeight: 90,
  },

  ornamentLine: {
    width: 90,
    height: 1,
    backgroundColor: '#B99A54',
    marginTop: 12,
  },

  ornamentDot: {
    color: '#E6C778',
    fontSize: 19,
    marginTop: 12,
  },

  splashBrand: {
    color: '#E6C778',
    fontSize: 34,
    fontWeight: '500',
    letterSpacing: 8,
    marginLeft: 8,
  },

  splashApp: {
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 7,
    marginTop: 12,
    marginLeft: 7,
  },

  splashDivider: {
    width: 45,
    height: 1,
    backgroundColor: '#B99A54',
    marginTop: 30,
    marginBottom: 22,
  },

  splashSubtitle: {
    color: '#D4E0D9',
    fontSize: 11,
    letterSpacing: 3,
  },

  splashBy: {
    color: '#E6C778',
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 65,
  },

  bottomOrnament: {
    position: 'absolute',
    bottom: 45,
  },

  bottomStar: {
    color: '#B99A54',
    fontSize: 20,
  },
});

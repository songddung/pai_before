// app/(parents)/analytics/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../domains/user/hooks/useAuth';
import { profileApi } from '../../../domains/user/api/userApi';

export default function AnalyticsChildList() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();

  useEffect(() => {
    const loadProfiles = async () => {
      if (!isAuthenticated || !accessToken) {
        router.replace('/login');
        return;
      }

      setLoading(true);
      try {
        console.log('분석용 아이 프로필 목록 조회 시작');

        // 실제 API 호출
        const profiles = await profileApi.getAllProfiles();
        console.log('조회된 전체 프로필:', profiles);

        // child 프로필만 필터링
        const childProfiles = profiles.filter((p: any) => p.profile_type === 'CHILD');
        console.log('아이 프로필만 필터링:', childProfiles);

        setChildren(childProfiles);
      } catch (err: any) {
        console.error('프로필 불러오기 실패:', err);

        if (err.response?.status === 401) {
          Alert.alert('인증 오류', '다시 로그인해주세요.', [
            { text: '확인', onPress: () => router.replace('/login') },
          ]);
        } else {
          Alert.alert('오류', '프로필을 불러오는 중 오류가 발생했습니다.');

          // 실패 시 mock 데이터 fallback
          const mockProfiles = [
            {
              profile_id: 11,
              user_id: 1,
              profile_type: 'CHILD',
              name: '민준',
              birth_date: '2018-05-12',
              gender: 'MALE',
              avatar_media_id: null,
            },
            {
              profile_id: 12,
              user_id: 1,
              profile_type: 'CHILD',
              name: '유진',
              birth_date: '2020-09-07',
              gender: 'FEMALE',
              avatar_media_id: null,
            },
          ];
          setChildren(mockProfiles);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [isAuthenticated, accessToken]);

  if (loading)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>불러오는 중...</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profile-select')}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자녀 선택</Text>
        <View style={{ width: 24 }} /> {/* 오른쪽 여백 맞춤 */}
      </View>

      {/* 🔹 Child List */}
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={children}
        keyExtractor={(item) => item.profile_id.toString()}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#6b7280', textAlign: 'center' }}>
              등록된 아이 프로필이 없습니다.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              console.log('분석 리포트 이동:', {
                childId: item.profile_id.toString(),
                name: item.name,
                pathname: '/(parents)/analytics/[childId]'
              });

              router.push({
                pathname: '/(parents)/analytics/[childId]',
                params: {
                  childId: item.profile_id.toString(),
                  name: item.name,
                },
              });
            }}
          >
            <Image
              source={item.avatar_media_id
                ? { uri: `https://j13c101.p.ssafy.io/api/media/${item.avatar_media_id}` }
                : require('../../../../assets/default-avatar.png')
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subText}>
                {item.birth_date} · {item.gender}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  subText: { fontSize: 12, color: '#6b7280' },
});

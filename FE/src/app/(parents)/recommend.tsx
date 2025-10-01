import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useAuth } from "../../domains/user/hooks/useAuth";
import { arkApi } from "../../domains/ark/api/arkApi";
import { profileApi } from "../../domains/user/api/userApi";
import { tokenUtils } from "../../shared/utils/token";

export default function RecommendScreen() {
  const [activeTab, setActiveTab] = useState("personalized");
  const [festivals, setFestivals] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();
  

  // 아이 프로필 목록 로드
  useEffect(() => {
    const loadChildren = async () => {
      if (!isAuthenticated || !accessToken) {
        router.replace('/login');
        return;
      }

      try {
        const profiles = await profileApi.getAllProfiles();
        const childProfiles = profiles.filter((p: any) => p.profile_type === 'CHILD');
        setChildren(childProfiles);

        // 첫 번째 아이를 기본 선택
        if (childProfiles.length > 0) {
          setSelectedChildId(childProfiles[0].profile_id.toString());
        }
      } catch (err: any) {
        console.error('아이 프로필 조회 실패:', err);
        if (err.response?.status === 401) {
          router.replace('/login');
        }
      }
    };

    loadChildren();
  }, [isAuthenticated, accessToken]);

  // Mock 데이터 정의
  const getMockData = () => [
    {
      title: "불란지야시장",
      address: "제주특별자치도 서귀포시 중문상로17번길 4 (중문동)",
      lat: 33.2503257899,
      lon: 126.4240207301,
      distance_km: 0.06,
      first_image:
        "http://tong.visitkorea.or.kr/cms/resource/88/2800688_image2_1.jpg",
      tel: "",
    },
    {
      title: "서울숲",
      address: "서울특별시 성동구 성수동",
      lat: 37.5446,
      lon: 127.0379,
      distance_km: 5.2,
      first_image:
        "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=9f1c2b0e-25a7-4d02-8c65-123412341234",
      tel: "02-123-4567",
    },
    {
      title: "국립과천과학관",
      address: "경기도 과천시 상하벌로 110",
      lat: 37.4292,
      lon: 126.9877,
      distance_km: 12.3,
      first_image:
        "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=1b1c2b0e-25a7-4d02-8c65-555555555555",
      tel: "031-123-4567",
    },
  ];

  // 추천 데이터 로드
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedChildId || !isAuthenticated || !accessToken) {
        console.log('추천 조회 조건 미충족:', { selectedChildId, isAuthenticated, accessToken: !!accessToken });
        return;
      }

      setLoading(true);
      try {
        console.log('추천 데이터 조회 시작:', { selectedChildId, activeTab });

        // 카테고리 매핑
        let category = "tree";
        if (activeTab === "developmental") category = "logic";
        if (activeTab === "improvement") category = "science";

        // 실제 API 호출 - arkApi.getRecommendations는 childId만 받음
        const recommendations = await arkApi.getRecommendations(selectedChildId);

        console.log('추천 데이터 전체 응답:', JSON.stringify(recommendations, null, 2));

        // 새로운 응답 구조에 맞게 데이터 처리
        if (recommendations && recommendations.recommendations) {
          // AI 추천 결과가 있는 경우
          console.log('AI 추천 결과 발견:', recommendations.recommendations);
          const aiRecommendations = recommendations.recommendations;
          if (aiRecommendations.festivals && Array.isArray(aiRecommendations.festivals)) {
            console.log('축제 데이터 설정:', aiRecommendations.festivals.length, '개');
            setFestivals(aiRecommendations.festivals);
          } else {
            console.log('축제 데이터 없음, Mock 데이터 사용');
            setFestivals(getMockData());
          }
        } else if (recommendations && recommendations.interests) {
          // 관심사 데이터만 있는 경우
          console.log('관심사 데이터만 존재, Mock 데이터 사용:', recommendations.interests);
          if (recommendations.message) {
            console.log('백엔드 메시지:', recommendations.message);
          }
          setFestivals(getMockData());
        } else {
          // 빈 응답 - Mock 데이터 사용
          console.log('빈 응답, Mock 데이터 사용');
          setFestivals(getMockData());
        }

      } catch (err: any) {
        console.error("추천 API 호출 실패:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message,
        });

        // API 호출 실패 시 Mock 데이터 표시
        console.log('API 호출 실패 - Mock 데이터 사용');
        setFestivals(getMockData());

        // 401 에러는 여전히 로그인 페이지로 이동
        if (err.response?.status === 401) {
          router.replace('/login');
        }
        // 다른 에러들은 조용히 처리하고 Mock 데이터만 표시
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [activeTab, selectedChildId, isAuthenticated, accessToken]);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/profile-select")}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>아이 발달 맞춤 추천</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.headerSub}>
          아이의 학습 패턴과 관심사를 분석한 개인화된 추천
        </Text>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "personalized" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("personalized")}
          >
            <Text
              style={
                activeTab === "personalized"
                  ? styles.tabTextActive
                  : styles.tabText
              }
            >
              개인화 추천
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text>추천 데이터를 불러오는 중...</Text>
          </View>
        )}

        {!loading && festivals.length === 0 && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280' }}>추천 데이터가 없습니다.</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
              아이가 대화를 더 많이 나눠보세요!
            </Text>
          </View>
        )}

        {!loading && festivals.map((item, idx) => (
          <View key={idx} style={styles.cardWrapper}>
            {/* 카드 본체 */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => toggleExpand(idx)}
              activeOpacity={0.8}
            >
              {/* 왼쪽 이미지 */}
              {item.first_image ? (
                <Image
                  source={{ uri: item.first_image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[styles.cardImage, { backgroundColor: "#e5e7eb" }]}
                />
              )}

              {/* 오른쪽 정보 */}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.address}
                </Text>
                <Text style={styles.cardDistance}>
                  거리: {item.distance_km} km
                </Text>
              </View>
            </TouchableOpacity>

            {/* 확장 지도 */}
            {expandedIndex === idx && (
              <View style={styles.mapContainer}>
                <WebView
                  source={{
                    uri: `https://map.kakao.com/link/map/${encodeURIComponent(
                      item.title || "장소"
                    )},${item.lat},${item.lon}`,
                  }}
                  style={{ height: 400, borderRadius: 12 }}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: "#2563eb" },
  tabText: { textAlign: "center", color: "#374151", fontSize: 12 },
  tabTextActive: {
    textAlign: "center",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardWrapper: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
  card: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  cardDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cardDistance: {
    fontSize: 12,
    color: "#16a34a",
    marginTop: 4,
  },
  mapContainer: {
    height: 500,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
});

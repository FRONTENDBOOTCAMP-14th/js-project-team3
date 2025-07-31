const API_BASE_URL = "/.netlify/functions";
const NEXON_API_BASE_URL = "https://open.api.nexon.com/suddenattack/v1";

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.isDevelopment = import.meta.env.DEV;
        
        // 초기화 시 API 키 상태 확인
        if (this.isDevelopment) {
            this.checkApiKeys();
        }
    }
    
    // API 키 상태 확인
    checkApiKeys() {
        const keys = [
            import.meta.env.VITE_NEXON_OPEN_API_KEY1,
            import.meta.env.VITE_NEXON_OPEN_API_KEY2,
            import.meta.env.VITE_NEXON_OPEN_API_KEY3,
            import.meta.env.VITE_NEXON_OPEN_API_KEY4
        ].filter(key => key && key.trim() !== "");
        
        console.log(`[API] 설정된 API 키 개수: ${keys.length}/4`);
        
        if (keys.length === 0) {
            console.error(`
[API] ⚠️  API 키가 설정되지 않았습니다!

.env 파일을 프로젝트 루트에 생성하고 다음과 같이 설정하세요:

VITE_NEXON_OPEN_API_KEY1=your-nexon-api-key-here
VITE_NEXON_OPEN_API_KEY2=your-nexon-api-key-here
VITE_NEXON_OPEN_API_KEY3=your-nexon-api-key-here
VITE_NEXON_OPEN_API_KEY4=your-nexon-api-key-here

Nexon Open API 키는 https://openapi.nexon.com/ 에서 발급받을 수 있습니다.
            `);
        } else {
            console.log(`[API] ✅ API 키 설정 완료 (${keys.length}개)`);
        }
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("API 요청 실패:", error);
            throw error;
        }
    }

    // API 키 로테이션 (개발 환경용)
    getApiKey() {
        const apiKeys = [
            import.meta.env.VITE_NEXON_OPEN_API_KEY1,
            import.meta.env.VITE_NEXON_OPEN_API_KEY2,
            import.meta.env.VITE_NEXON_OPEN_API_KEY3,
            import.meta.env.VITE_NEXON_OPEN_API_KEY4
        ].filter(key => key && key.trim() !== ""); // 빈 키 제거
        
        if (apiKeys.length === 0) {
            console.error("[API] 사용 가능한 API 키가 없습니다. .env 파일을 확인하세요.");
            console.error("필요한 환경 변수: VITE_NEXON_OPEN_API_KEY1, VITE_NEXON_OPEN_API_KEY2, VITE_NEXON_OPEN_API_KEY3, VITE_NEXON_OPEN_API_KEY4");
            return null;
        }
        
        const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
        console.log(`[API] 사용 가능한 키 개수: ${apiKeys.length}, 선택된 키: ${selectedKey ? selectedKey.substring(0, 10) + "..." : "없음"}`);
        return selectedKey;
    }

    // 닉네임으로 OUID 조회
    async getOuidByNickname(nickname) {
        console.log(`[API] OUID 조회 시작 - 닉네임: ${nickname}`);
        
        if (this.isDevelopment) {
            // 개발 환경: 직접 API 호출
            const apiKey = this.getApiKey();
            
            if (!apiKey) {
                console.error("[API] API 키가 설정되지 않았습니다.");
                throw new Error("API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
            }
            
            const url = `${NEXON_API_BASE_URL}/id?user_name=${encodeURIComponent(nickname)}`;
            
            console.log(`[API] 요청 URL: ${url}`);
            console.log(`[API] API 키 사용: ${apiKey.substring(0, 10)}...`);
            
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 응답 상태: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 에러 응답: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log(`[API] 성공 응답:`, data);
            
            if (!data.ouid) {
                throw new Error("OUID가 응답에 없습니다.");
            }
            
            return {
                success: true,
                data: {
                    ouid: data.ouid,
                    nickname: nickname
                }
            };
        } else {
            // 프로덕션: 서버리스 함수 사용
            console.log(`[API] 서버리스 함수로 요청`);
            return this.request(`/get-ouid?nickname=${encodeURIComponent(nickname)}`, {
                method: "GET"
            });
        }
    }

    // 사용자 기본 정보 조회
    async getUserInfo(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const response = await fetch(`${NEXON_API_BASE_URL}/user/basic?ouid=${ouid}`, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 기본정보 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 기본정보 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-user-info?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }

    // 매치 목록 조회
    async getMatchList(ouid, match_mode = "폭파미션", match_type = "일반전") {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/match?ouid=${ouid}&match_mode=${encodeURIComponent(match_mode)}&match_type=${encodeURIComponent(match_type)}`;
            console.log(`[API] 매치목록 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 매치목록 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 매치목록 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-match-list?ouid=${ouid}&match_mode=${encodeURIComponent(match_mode)}&match_type=${encodeURIComponent(match_type)}`, {
                method: "GET"
            });
        }
    }

    // 매치 상세 정보 조회
    async getMatchDetail(match_id) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/match-detail?match_id=${match_id}`;
            console.log(`[API] 매치상세 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 매치상세 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 매치상세 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-match-detail?match_id=${match_id}`, {
                method: "GET"
            });
        }
    }

    // 사용자 계급 정보 조회
    async getUserStats(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/user/rank?ouid=${ouid}`;
            console.log(`[API] 계급정보 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 계급정보 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 계급정보 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-user-stats?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }

    // 사용자 티어 정보 조회
    async getUserTier(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/user/tier?ouid=${ouid}`;
            console.log(`[API] 티어정보 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 티어정보 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 티어정보 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-user-tier?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }

    // 사용자 최근 동향 정보 조회
    async getUserRecentInfo(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/user/recent-info?ouid=${ouid}`;
            console.log(`[API] 최근동향 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 최근동향 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 최근동향 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-user-recent-info?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }

    // 사용자 상세 전적 조회
    async getUserDetailStats(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/user/detail-stats?ouid=${ouid}`;
            console.log(`[API] 상세전적 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 상세전적 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 상세전적 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-user-detail-stats?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }

    // 사용자 총 통계 조회
    async getUserTotalStats(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/user/total-stats?ouid=${ouid}`;
            console.log(`[API] 총통계 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 총통계 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 총통계 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-user-total-stats?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }

    // 시즌 등급 조회
    async getSeasonGrade(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/user/season-grade?ouid=${ouid}`;
            console.log(`[API] 시즌등급 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 시즌등급 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 시즌등급 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-season-grade?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }

    // 랭크 티어 조회
    async getRankTier(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/user/rank-tier?ouid=${ouid}`;
            console.log(`[API] 랭크티어 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 랭크티어 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 랭크티어 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-rank-tier?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }

    // 전체 등급 조회
    async getTotalGrade(ouid) {
        if (this.isDevelopment) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error("API 키가 설정되지 않았습니다.");
            }

            const url = `${NEXON_API_BASE_URL}/user/total-grade?ouid=${ouid}`;
            console.log(`[API] 전체등급 조회 URL: ${url}`);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            });

            console.log(`[API] 전체등급 조회 - 응답 상태: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] 전체등급 조회 에러: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return this.request(`/get-total-grade?ouid=${ouid}`, {
                method: "GET"
            });
        }
    }
}

// 싱글톤 인스턴스 생성
export const apiService = new ApiService(); 
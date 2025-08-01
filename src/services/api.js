const API_BASE_URL = "/.netlify/functions/api-proxy";
const NEXON_API_BASE_URL = "https://open.api.nexon.com/suddenattack/v1";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isDevelopment = import.meta.env.DEV;

    // 초기화 시 API 키 상태 확인 (개발 환경에서만)
    if (this.isDevelopment) {
      this.checkApiKeys();
    }
  }

  // API 키 상태 확인 (개발 환경용)
  checkApiKeys() {
    const keys = [
      import.meta.env.VITE_NEXON_OPEN_API_KEY1,
      import.meta.env.VITE_NEXON_OPEN_API_KEY2,
      import.meta.env.VITE_NEXON_OPEN_API_KEY3,
      import.meta.env.VITE_NEXON_OPEN_API_KEY4,
    ].filter((key) => key && key.trim() !== "");

    console.log(`[API] 설정된 API 키 개수: ${keys.length}/4`);

    if (keys.length === 0) {
      console.warn(`
[API] ⚠️  개발 환경에서 API 키가 설정되지 않았습니다.

.env 파일을 프로젝트 루트에 생성하고 다음과 같이 설정하세요:

VITE_NEXON_OPEN_API_KEY1=your-nexon-api-key-here
VITE_NEXON_OPEN_API_KEY2=your-nexon-api-key-here
VITE_NEXON_OPEN_API_KEY3=your-nexon-api-key-here
VITE_NEXON_OPEN_API_KEY4=your-nexon-api-key-here

Nexon Open API 키는 https://openapi.nexon.com/ 에서 발급받을 수 있습니다.
            `);
    } else {
      console.log(`[API] ✅ 개발 환경 API 키 설정 완료 (${keys.length}개)`);
    }
  }

  // 통합된 API 요청 메서드
  async request(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}/${endpoint}${queryString ? `?${queryString}` : ""}`;

      console.log(`[API] 요청 URL: ${url}`);
      console.log(`[API] 엔드포인트: ${endpoint}`);
      console.log(`[API] 파라미터:`, params);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`[API] 응답 상태: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[API] 응답 에러:`, errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[API] 응답 성공:`, result);

      if (!result.success) {
        throw new Error(result.error || "API 요청 실패");
      }

      return result;
    } catch (error) {
      console.error(`[API] ${endpoint} 요청 실패:`, error.message);
      throw error;
    }
  }

  // 개발 환경용 직접 API 호출 (백업용)
  async directRequest(endpoint, params = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("API 키가 설정되지 않았습니다.");
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${NEXON_API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-nxopen-api-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  }

  // API 키 로테이션 (개발 환경용)
  getApiKey() {
    const apiKeys = [
      import.meta.env.VITE_NEXON_OPEN_API_KEY1,
      import.meta.env.VITE_NEXON_OPEN_API_KEY2,
      import.meta.env.VITE_NEXON_OPEN_API_KEY3,
      import.meta.env.VITE_NEXON_OPEN_API_KEY4,
    ].filter((key) => key && key.trim() !== "");

    if (apiKeys.length === 0) {
      return null;
    }

    return apiKeys[Math.floor(Math.random() * apiKeys.length)];
  }

  // 닉네임으로 OUID 조회
  async getOuidByNickname(nickname) {
    try {
      if (this.isDevelopment) {
        // 개발 환경: API 키가 있으면 직접 호출, 없으면 서버리스 함수 사용
        const apiKey = this.getApiKey();
        if (apiKey) {
          return await this.directRequest("/id", { user_name: nickname });
        } else {
          return await this.request("ouid", { nickname });
        }
      } else {
        // 프로덕션: 서버리스 함수 사용
        return await this.request("ouid", { nickname });
      }
    } catch (error) {
      // 개발 환경에서 직접 호출 실패 시 서버리스 함수로 폴백
      if (this.isDevelopment) {
        return await this.request("ouid", { nickname });
      }
      throw error;
    }
  }

  // 사용자 기본 정보 조회
  async getUserInfo(ouid) {
    try {
      if (this.isDevelopment) {
        const apiKey = this.getApiKey();
        if (apiKey) {
          return await this.directRequest("/user/basic", { ouid });
        } else {
          return await this.request("user-basic", { ouid });
        }
      } else {
        return await this.request("user-basic", { ouid });
      }
    } catch (error) {
      if (this.isDevelopment) {
        return await this.request("user-basic", { ouid });
      }
      throw error;
    }
  }

  // 매치 목록 조회
  async getMatchList(ouid, match_mode = "폭파미션") {
    try {
      if (this.isDevelopment) {
        const apiKey = this.getApiKey();
        if (apiKey) {
          return await this.directRequest("/match", {
            ouid,
            match_mode,
          });
        } else {
          return await this.request("match", {
            ouid,
            match_mode,
          });
        }
      } else {
        return await this.request("match", {
          ouid,
          match_mode,
        });
      }
    } catch (error) {
      if (this.isDevelopment) {
        return await this.request("match", {
          ouid,
          match_mode,
        });
      }
      throw error;
    }
  }

  // 매치 상세 정보 조회
  async getMatchDetail(match_id) {
    try {
      if (this.isDevelopment) {
        const apiKey = this.getApiKey();
        if (apiKey) {
          return await this.directRequest("/match-detail", { match_id });
        } else {
          return await this.request("match-detail", { match_id });
        }
      } else {
        return await this.request("match-detail", { match_id });
      }
    } catch (error) {
      if (this.isDevelopment) {
        return await this.request("match-detail", { match_id });
      }
      throw error;
    }
  }

  // 사용자 계급 정보 조회
  async getUserStats(ouid) {
    try {
      if (this.isDevelopment) {
        const apiKey = this.getApiKey();
        if (apiKey) {
          return await this.directRequest("/user/rank", { ouid });
        } else {
          return await this.request("user-rank", { ouid });
        }
      } else {
        return await this.request("user-rank", { ouid });
      }
    } catch (error) {
      if (this.isDevelopment) {
        return await this.request("user-rank", { ouid });
      }
      throw error;
    }
  }

  // 사용자 티어 정보 조회
  async getUserTier(ouid) {
    try {
      if (this.isDevelopment) {
        const apiKey = this.getApiKey();
        if (apiKey) {
          return await this.directRequest("/user/tier", { ouid });
        } else {
          return await this.request("user-tier", { ouid });
        }
      } else {
        return await this.request("user-tier", { ouid });
      }
    } catch (error) {
      if (this.isDevelopment) {
        return await this.request("user-tier", { ouid });
      }
      throw error;
    }
  }

  // 사용자 최근 동향 정보 조회
  async getUserRecentInfo(ouid) {
    try {
      if (this.isDevelopment) {
        const apiKey = this.getApiKey();
        if (apiKey) {
          return await this.directRequest("/user/recent-info", { ouid });
        } else {
          return await this.request("user-recent-info", { ouid });
        }
      } else {
        return await this.request("user-recent-info", { ouid });
      }
    } catch (error) {
      if (this.isDevelopment) {
        return await this.request("user-recent-info", { ouid });
      }
      throw error;
    }
  }

  // 치지직 라이브 조회
  async getChzzkLives(size = 20, next = null) {
    const params = { size };
    if (next) {
      params.next = next;
    }

    return await this.request("chzzk-lives", params);
  }

  // 유튜브 라이브 조회
  async getYoutubeLives(query = "서든어택", maxResults = 10) {
    return await this.request("youtube-lives", { query, maxResults });
  }
}

// 싱글톤 인스턴스 생성
export const apiService = new ApiService();

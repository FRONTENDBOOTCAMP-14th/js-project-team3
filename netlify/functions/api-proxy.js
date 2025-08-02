// 이 파일은 Netlify 서버에서만 실행됩니다.
// 클라이언트(브라우저)에는 노출되지 않습니다.

// API 키를 순서대로 사용하기 위한 카운터
let keyIndex = 0;

// CORS 헤더 설정
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Client-Id, Client-Secret, X-Requested-With",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

// API 엔드포인트 매핑
const API_ENDPOINTS = {
  // Nexon API - 공식 문서 기준 (7개 엔드포인트)
  ouid: "/id",
  "user-basic": "/user/basic",
  "user-rank": "/user/rank",
  "user-tier": "/user/tier",
  "user-recent-info": "/user/recent-info",
  match: "/match",
  "match-detail": "/match-detail",

  // Live APIs
  "chzzk-lives": "/open/v1/lives",
  "youtube-lives": "youtube",
};

// API 키 관리
class ApiKeyManager {
  constructor() {
    this.keys = [
      process.env.VITE_NEXON_OPEN_API_KEY1 || process.env.NEXON_OPEN_API_KEY1,
      process.env.VITE_NEXON_OPEN_API_KEY2 || process.env.NEXON_OPEN_API_KEY2,
      process.env.VITE_NEXON_OPEN_API_KEY3 || process.env.NEXON_OPEN_API_KEY3,
      process.env.VITE_NEXON_OPEN_API_KEY4 || process.env.NEXON_OPEN_API_KEY4,
    ].filter((key) => key && key.trim() !== "");

    this.currentIndex = 0;
  }

  getNextKey() {
    if (this.keys.length === 0) {
      throw new Error("사용 가능한 API 키가 없습니다.");
    }

    const key = this.keys[this.currentIndex % this.keys.length];
    this.currentIndex++;
    return key;
  }

  getKeyCount() {
    return this.keys.length;
  }
}

// 요청 검증
function validateRequest(event) {
  console.log("=== 요청 검증 시작 ===");
  console.log("event.path:", event.path);
  console.log("event.rawPath:", event.rawPath);
  console.log("event.queryStringParameters:", event.queryStringParameters);
  console.log("event.multiValueQueryStringParameters:", event.multiValueQueryStringParameters);

  if (event.httpMethod === "OPTIONS") {
    return { isValid: true, isPreflight: true };
  }

  if (event.httpMethod !== "GET") {
    return {
      isValid: false,
      error: { statusCode: 405, message: "Method not allowed" },
    };
  }

  // 경로 파싱 개선
  let path;
  if (event.rawPath) {
    // Netlify Functions v2
    path = event.rawPath.replace("/.netlify/functions/api-proxy", "");
  } else {
    // Netlify Functions v1
    path = event.path.replace("/.netlify/functions/api-proxy/", "");
  }

  console.log("파싱된 경로:", path);

  // 빈 경로 처리
  if (!path || path === "/") {
    return {
      isValid: false,
      error: { statusCode: 400, message: "Endpoint not specified" },
    };
  }

  // 앞의 슬래시 제거
  path = path.replace(/^\/+/, "");
  console.log("정리된 경로:", path);

  const endpoint = path.split("/")[0];
  console.log("엔드포인트:", endpoint);

  if (!API_ENDPOINTS[endpoint]) {
    console.error("알 수 없는 엔드포인트:", endpoint);
    console.error("사용 가능한 엔드포인트:", Object.keys(API_ENDPOINTS));
    return {
      isValid: false,
      error: { statusCode: 404, message: "Endpoint not found" },
    };
  }

  return { isValid: true, endpoint, path };
}

// API URL 생성 (Nexon + Chzzk)
function buildApiUrl(endpoint, queryParams) {
  let baseUrl, apiPath;
  
  if (endpoint === "chzzk-lives") {
    baseUrl = "https://openapi.chzzk.naver.com";
    apiPath = API_ENDPOINTS[endpoint];
  } else {
    // Nexon API
    baseUrl = process.env.VITE_NEXON_OPEN_API_URL || "https://open.api.nexon.com/suddenattack/v1";
    apiPath = API_ENDPOINTS[endpoint];
  }

  if (!apiPath) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  const queryString = queryParams ? `?${queryParams}` : "";
  return `${baseUrl}${apiPath}${queryString}`;
}

// Nexon API 호출
async function callNexonApi(url, apiKey) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-nxopen-api-key": apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// 치지직 라이브 API 호출
async function callChzzkApi(params) {
  const clientId = process.env.VITE_NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.VITE_NAVER_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET;

  console.log("치지직 API 환경 변수 확인:");
  console.log("- VITE_NAVER_CLIENT_ID:", !!process.env.VITE_NAVER_CLIENT_ID);
  console.log("- VITE_NAVER_CLIENT_SECRET:", !!process.env.VITE_NAVER_CLIENT_SECRET);

  if (!clientId || !clientSecret) {
    console.error("치지직 API credentials not configured");
    console.error("환경 변수 확인:");
    console.error("- VITE_NAVER_CLIENT_ID:", !!process.env.VITE_NAVER_CLIENT_ID);
    console.error("- VITE_NAVER_CLIENT_SECRET:", !!process.env.VITE_NAVER_CLIENT_SECRET);
    console.error("- NAVER_CLIENT_ID:", !!process.env.NAVER_CLIENT_ID);
    console.error("- NAVER_CLIENT_SECRET:", !!process.env.NAVER_CLIENT_SECRET);
    throw new Error("치지직 API credentials not configured");
  }

  const size = params.size || 20;
  const next = params.next;

  // buildApiUrl 함수를 사용하여 URL 생성
  let queryParams = `size=${size}`;
  if (next) {
    queryParams += `&next=${next}`;
  }
  
  const url = buildApiUrl("chzzk-lives", queryParams);

  console.log("치지직 API 요청 URL:", url);
  console.log("치지직 API 요청 헤더:", {
    "Client-Id": clientId.substring(0, 8) + "...",
    "Client-Secret": clientSecret.substring(0, 8) + "..."
  });

  const controller = new AbortController();

  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초로 증가

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Client-Id": clientId,
        "Client-Secret": clientSecret,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    console.log("치지직 API 응답 상태:", response.status);
    console.log("치지직 API 응답 헤더:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("치지직 API 에러 응답:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log("치지직 API 응답 데이터 구조:", {
      hasContent: !!responseData.content,
      contentLength: responseData.content ? responseData.content.length : 0,
      hasCode: !!responseData.code,
      hasMessage: !!responseData.message
    });

    // 치지직 API 응답 구조 확인 및 변환
    if (responseData.code && responseData.code !== "SUCCESS") {
      throw new Error(`치지직 API 오류: ${responseData.message || responseData.code}`);
    }

    // 응답 데이터를 클라이언트가 기대하는 형태로 변환
    const transformedData = {
      content: responseData.content || [],
      next: responseData.next || null
    };

    // 각 라이브 항목을 클라이언트가 기대하는 형태로 변환
    if (transformedData.content && Array.isArray(transformedData.content)) {
      transformedData.content = transformedData.content.map(live => ({
        platform: "chzzk",
        liveTitle: live.liveTitle || live.title || "제목 없음",
        liveThumbnailImageUrl: live.liveThumbnailImageUrl || live.thumbnailImageUrl || "",
        channelId: live.channelId || "",
        channelName: live.channelName || live.authorName || "채널명 없음",
        channelImageUrl: live.channelImageUrl || live.authorImageUrl || "https://via.placeholder.com/30",
        concurrentUserCount: live.concurrentUserCount || live.viewerCount || 0,
        liveStreamUrl: live.liveStreamUrl || `https://chzzk.naver.com/live/${live.liveId || live.id}`,
        categoryType: live.categoryType || "GAME",
        liveId: live.liveId || live.id
      }));
    }

    console.log("치지직 API 변환된 데이터:", {
      contentLength: transformedData.content.length,
      hasNext: !!transformedData.next,
      sampleItem: transformedData.content[0]
    });

    return transformedData;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error("치지직 API 요청 시간 초과 (10초)");
      throw new Error("치지직 API 요청 시간 초과");
    }
    
    console.error("치지직 API 호출 중 오류:", error.message);
    throw error;
  }
}

// 유튜브 라이브 API 호출
async function callYoutubeApi(params) {
  const youtubeApiKey = process.env.VITE_YOUTUBE_OPEN_API_KEY || process.env.YOUTUBE_OPEN_API_KEY;

  if (!youtubeApiKey) {
    throw new Error("YouTube API key not configured");
  }

  const query = params.query || "서든어택";
  const maxResults = params.maxResults || 10;

  // YouTube Search API 호출
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&eventType=live&key=${youtubeApiKey}&maxResults=${maxResults}`;

  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();

  if (!searchResponse.ok) {
    throw new Error(`YouTube Search API error: ${searchResponse.status}`);
  }

  const videoIds = searchData.items.map((item) => item.id.videoId).filter((id) => id);

  if (videoIds.length === 0) {
    return [];
  }

  // YouTube Videos API 호출
  const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds.join(",")}&key=${youtubeApiKey}`;

  const videoDetailsResponse = await fetch(videoDetailsUrl);
  const videoDetailsData = await videoDetailsResponse.json();

  if (!videoDetailsResponse.ok) {
    throw new Error(`YouTube Videos API error: ${videoDetailsResponse.status}`);
  }

  // 채널 정보 가져오기
  const channelsToFetch = new Set();
  videoDetailsData.items.forEach((video) => {
    channelsToFetch.add(video.snippet.channelId);
  });

  const channelIds = Array.from(channelsToFetch).filter((id) => id);
  let channelDetails = {};

  if (channelIds.length > 0) {
    const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds.join(",")}&key=${youtubeApiKey}`;

    const channelDetailsResponse = await fetch(channelDetailsUrl);
    const channelDetailsData = await channelDetailsResponse.json();

    if (channelDetailsResponse.ok) {
      channelDetailsData.items.forEach((channel) => {
        channelDetails[channel.id] = channel.snippet.thumbnails.default.url;
      });
    }
  }

  // 응답 데이터 구성
  return videoDetailsData.items.map((video) => ({
    platform: "youtube",
    liveTitle: video.snippet.title,
    liveThumbnailImageUrl:
      video.snippet.thumbnails.high?.url ||
      video.snippet.thumbnails.medium?.url ||
      video.snippet.thumbnails.default?.url,
    channelId: video.snippet.channelId,
    channelName: video.snippet.channelTitle,
    channelImageUrl: channelDetails[video.snippet.channelId] || "https://via.placeholder.com/30",
    concurrentUserCount: video.liveStreamingDetails?.concurrentViewers || 0,
    liveStreamUrl: `https://www.youtube.com/watch?v=${video.id}`,
  }));
}

exports.handler = async function (event, context) {
  console.log("--- Netlify API 프록시 실행 시작 ---");
  console.log("요청 경로:", event.path);
  console.log("rawPath:", event.rawPath);
  console.log("HTTP 메서드:", event.httpMethod);
  console.log("rawQuery:", event.rawQuery);
  console.log("queryStringParameters:", event.queryStringParameters);

  // 타임아웃 설정 (10초)
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // 1. 요청 검증
    const validation = validateRequest(event);
    if (!validation.isValid) {
      console.error("요청 검증 실패:", validation.error);
      return {
        statusCode: validation.error.statusCode,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: validation.error.message,
        }),
      };
    }

    if (validation.isPreflight) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      };
    }

    const { endpoint, path } = validation;

    // 쿼리 파라미터 처리 개선
    let queryParams = "";
    if (event.rawQuery) {
      queryParams = event.rawQuery;
    } else if (event.queryStringParameters) {
      const params = new URLSearchParams();
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        params.append(key, value);
      });
      queryParams = params.toString();
    }

    console.log("엔드포인트:", endpoint);
    console.log("경로:", path);
    console.log("쿼리 파라미터:", queryParams);



    if (endpoint === "youtube-lives") {
      const params = new URLSearchParams(queryParams);
      const data = await callYoutubeApi({
        query: params.get("query"),
        maxResults: params.get("maxResults"),
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: data,
        }),
      };
    }

    // 3. Nexon API 처리
    const keyManager = new ApiKeyManager();
    console.log(`사용 가능한 API 키 개수: ${keyManager.getKeyCount()}`);

    if (keyManager.getKeyCount() === 0) {
      console.error("치명적 오류: API 키가 서버에 설정되지 않았습니다.");
      console.error("환경 변수 확인:");
      console.error("- VITE_NEXON_OPEN_API_KEY1:", !!process.env.VITE_NEXON_OPEN_API_KEY1);
      console.error("- VITE_NEXON_OPEN_API_KEY2:", !!process.env.VITE_NEXON_OPEN_API_KEY2);
      console.error("- VITE_NEXON_OPEN_API_KEY3:", !!process.env.VITE_NEXON_OPEN_API_KEY3);
      console.error("- VITE_NEXON_OPEN_API_KEY4:", !!process.env.VITE_NEXON_OPEN_API_KEY4);
      console.error("- NEXON_OPEN_API_KEY1:", !!process.env.NEXON_OPEN_API_KEY1);
      console.error("- NEXON_OPEN_API_KEY2:", !!process.env.NEXON_OPEN_API_KEY2);
      console.error("- NEXON_OPEN_API_KEY3:", !!process.env.NEXON_OPEN_API_KEY3);
      console.error("- NEXON_OPEN_API_KEY4:", !!process.env.NEXON_OPEN_API_KEY4);

      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "API 키가 서버에 설정되지 않았습니다.",
        }),
      };
    }

    // 4. API 키 선택
    const apiKey = keyManager.getNextKey();
    console.log(`선택된 API 키 (앞 8자리): ${apiKey.substring(0, 8)}...`);

    // 5. URL 및 파라미터 파싱
    const remainingPath = path.replace(endpoint, "").replace(/^\/+/, "");

    // URL 구성
    let apiUrl;
    if (endpoint === "ouid") {
      // OUID 조회는 특별 처리
      const nickname = new URLSearchParams(queryParams).get("nickname");
      console.log("닉네임:", nickname);

      if (!nickname) {
        console.error("닉네임 파라미터 누락");
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            error: "닉네임 파라미터가 필요합니다.",
          }),
        };
      }
      apiUrl = buildApiUrl(endpoint, `user_name=${encodeURIComponent(nickname)}`);
    } else {
      // 나머지 엔드포인트는 OUID 기반
      const ouid = new URLSearchParams(queryParams).get("ouid");
      console.log("OUID:", ouid);

      if (!ouid && endpoint !== "match") {
        console.error("OUID 파라미터 누락");
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            error: "OUID 파라미터가 필요합니다.",
          }),
        };
      }

      let params = queryParams;
      if (endpoint === "match") {
        // 🔥 매치 목록 조회는 match_type 파라미터 제거 (모든 타입 가져오기)
        const matchMode = new URLSearchParams(queryParams).get("match_mode") || "폭파미션";

        // 🔥 match_type 파라미터를 제거하여 모든 타입의 매치를 가져옴
        params = `ouid=${ouid}&match_mode=${encodeURIComponent(matchMode)}`;

        console.log("🔄 모든 매치 타입 조회 설정:", params);
      }

      apiUrl = buildApiUrl(endpoint, params);
    }

    console.log("최종 요청 URL:", apiUrl);

    // 6. API 호출 (Nexon 또는 Chzzk)
    try {
      let data;
      if (endpoint === "chzzk-lives") {
        // 치지직 API는 별도 처리 (API 키 불필요)
        const params = new URLSearchParams(queryParams);
        data = await callChzzkApi({
          size: params.get('size'),
          next: params.get('next')
        });
      } else {
        // Nexon API 호출
        data = await callNexonApi(apiUrl, apiKey);
      }
      
      console.log("API 응답 성공");
      console.log("--- Netlify API 프록시 실행 종료 (성공) ---");

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: data,
        }),
      };
    } catch (apiError) {
      console.error("API 호출 실패:", apiError.message);
      console.error("API URL:", apiUrl);
      if (endpoint !== "chzzk-lives") {
        console.error("API 키 (앞 8자리):", apiKey.substring(0, 8) + "...");
      }

      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "API 호출 실패",
          details: apiError.message,
        }),
      };
    }
  } catch (error) {
    console.error("[API 프록시] 예상치 못한 오류:", error.message);
    console.error("스택 트레이스:", error.stack);
    console.log("--- Netlify API 프록시 실행 종료 (실패) ---");

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: "서버 내부 오류가 발생했습니다.",
        details: error.message,
      }),
    };
  }
};

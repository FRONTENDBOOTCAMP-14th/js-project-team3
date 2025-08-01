// 이 파일은 Netlify 서버에서만 실행됩니다.
// 클라이언트(브라우저)에는 노출되지 않습니다.

// API 키를 순서대로 사용하기 위한 카운터
let keyIndex = 0;

// CORS 헤더 설정
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Client-Id, Client-Secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

// API 엔드포인트 매핑
const API_ENDPOINTS = {
  // Nexon API - 공식 문서 기준 (7개 엔드포인트)
  'ouid': '/id',
  'user-basic': '/user/basic',
  'user-rank': '/user/rank',
  'user-tier': '/user/tier',
  'user-recent-info': '/user/recent-info',
  'match': '/match',
  'match-detail': '/match-detail',
  
  // Live APIs
  'chzzk-lives': 'chzzk',
  'youtube-lives': 'youtube'
};

// API 키 관리
class ApiKeyManager {
  constructor() {
    this.keys = [
      process.env.VITE_NEXON_OPEN_API_KEY1 || process.env.NEXON_OPEN_API_KEY1,
      process.env.VITE_NEXON_OPEN_API_KEY2 || process.env.NEXON_OPEN_API_KEY2,
      process.env.VITE_NEXON_OPEN_API_KEY3 || process.env.NEXON_OPEN_API_KEY3,
      process.env.VITE_NEXON_OPEN_API_KEY4 || process.env.NEXON_OPEN_API_KEY4,
    ].filter(key => key && key.trim() !== '');
    
    this.currentIndex = 0;
  }

  getNextKey() {
    if (this.keys.length === 0) {
      throw new Error('사용 가능한 API 키가 없습니다.');
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
  if (event.httpMethod === "OPTIONS") {
    return { isValid: true, isPreflight: true };
  }

  if (event.httpMethod !== "GET") {
    return { 
      isValid: false, 
      error: { statusCode: 405, message: "Method not allowed" }
    };
  }

  const path = event.path.replace("/.netlify/functions/api-proxy/", "");
  const endpoint = path.split('/')[0];
  
  if (!API_ENDPOINTS[endpoint]) {
    return { 
      isValid: false, 
      error: { statusCode: 404, message: "Endpoint not found" }
    };
  }

  return { isValid: true, endpoint, path };
}

// Nexon API URL 생성
function buildNexonApiUrl(endpoint, queryParams) {
  const baseUrl = process.env.VITE_NEXON_OPEN_API_URL || "https://open.api.nexon.com/suddenattack/v1";
  const apiPath = API_ENDPOINTS[endpoint];
  
  if (!apiPath) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  const queryString = queryParams ? `?${queryParams}` : '';
  return `${baseUrl}${apiPath}${queryString}`;
}

// Nexon API 호출
async function callNexonApi(url, apiKey) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-nxopen-api-key": apiKey,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
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

  if (!clientId || !clientSecret) {
    throw new Error("치지직 API credentials not configured");
  }

  const size = params.size || 20;
  const next = params.next;
  
  let url = `https://api.chzzk.naver.com/service/v1/lives?size=${size}`;
  if (next) {
    url += `&next=${next}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Client-Id": clientId,
        "Client-Secret": clientSecret,
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error("API request timeout");
    }
    
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

  const videoIds = searchData.items.map(item => item.id.videoId).filter(id => id);
  
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
  videoDetailsData.items.forEach(video => {
    channelsToFetch.add(video.snippet.channelId);
  });

  const channelIds = Array.from(channelsToFetch).filter(id => id);
  let channelDetails = {};
  
  if (channelIds.length > 0) {
    const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds.join(",")}&key=${youtubeApiKey}`;
    
    const channelDetailsResponse = await fetch(channelDetailsUrl);
    const channelDetailsData = await channelDetailsResponse.json();

    if (channelDetailsResponse.ok) {
      channelDetailsData.items.forEach(channel => {
        channelDetails[channel.id] = channel.snippet.thumbnails.default.url;
      });
    }
  }
  
  // 응답 데이터 구성
  return videoDetailsData.items.map(video => ({
    platform: "youtube", 
    liveTitle: video.snippet.title,
    liveThumbnailImageUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
    channelId: video.snippet.channelId,
    channelName: video.snippet.channelTitle,
    channelImageUrl: channelDetails[video.snippet.channelId] || "https://via.placeholder.com/30", 
    concurrentUserCount: video.liveStreamingDetails?.concurrentViewers || 0, 
    liveStreamUrl: `https://www.youtube.com/watch?v=${video.id}`
  }));
}

exports.handler = async function (event, context) {
  console.log("--- Netlify API 프록시 실행 시작 ---");
  console.log("요청 경로:", event.path);
  console.log("HTTP 메서드:", event.httpMethod);

  try {
    // 1. 요청 검증
    const validation = validateRequest(event);
    if (!validation.isValid) {
      return {
        statusCode: validation.error.statusCode,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false,
          error: validation.error.message 
        })
      };
    }

    if (validation.isPreflight) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ""
      };
    }

    const { endpoint, path } = validation;
    const queryParams = event.rawQuery || '';

    // 2. 라이브 API 처리
    if (endpoint === 'chzzk-lives') {
      const params = new URLSearchParams(queryParams);
      const data = await callChzzkApi({
        size: params.get('size'),
        next: params.get('next')
      });
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: data
        })
      };
    }

    if (endpoint === 'youtube-lives') {
      const params = new URLSearchParams(queryParams);
      const data = await callYoutubeApi({
        query: params.get('query'),
        maxResults: params.get('maxResults')
      });
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: data
        })
      };
    }

    // 3. Nexon API 처리
    const keyManager = new ApiKeyManager();
    console.log(`사용 가능한 API 키 개수: ${keyManager.getKeyCount()}`);

    if (keyManager.getKeyCount() === 0) {
      console.error("치명적 오류: API 키가 서버에 설정되지 않았습니다.");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false,
          error: "API 키가 서버에 설정되지 않았습니다." 
        })
      };
    }

    // 4. API 키 선택
    const apiKey = keyManager.getNextKey();
    console.log(`선택된 API 키 (앞 8자리): ${apiKey.substring(0, 8)}...`);

    // 5. URL 및 파라미터 파싱
    const remainingPath = path.replace(endpoint, '').replace(/^\/+/, '');
    
    // URL 구성
    let apiUrl;
    if (endpoint === 'ouid') {
      // OUID 조회는 특별 처리
      const nickname = new URLSearchParams(queryParams).get('nickname');
      if (!nickname) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: false,
            error: "닉네임 파라미터가 필요합니다." 
          })
        };
      }
      apiUrl = buildNexonApiUrl(endpoint, `user_name=${encodeURIComponent(nickname)}`);
    } else {
      // 나머지 엔드포인트는 OUID 기반
      const ouid = new URLSearchParams(queryParams).get('ouid');
      if (!ouid && endpoint !== 'match') {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: false,
            error: "OUID 파라미터가 필요합니다." 
          })
        };
      }
      
      let params = queryParams;
      if (endpoint === 'match') {
        // 매치 목록 조회는 추가 파라미터 처리
        const matchMode = new URLSearchParams(queryParams).get('match_mode') || '폭파미션';
        const matchType = new URLSearchParams(queryParams).get('match_type') || '일반전';
        params = `ouid=${ouid}&match_mode=${encodeURIComponent(matchMode)}&match_type=${encodeURIComponent(matchType)}`;
      }
      
      apiUrl = buildNexonApiUrl(endpoint, params);
    }

    console.log("최종 요청 URL:", apiUrl);

    // 6. Nexon API 호출
    const data = await callNexonApi(apiUrl, apiKey);
    console.log("--- Netlify API 프록시 실행 종료 (성공) ---");
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: data
      })
    };

  } catch (error) {
    console.error("[API 프록시] 오류:", error.message);
    console.log("--- Netlify API 프록시 실행 종료 (실패) ---");
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: "서버 내부 오류가 발생했습니다.",
        details: error.message
      })
    };
  }
}; 
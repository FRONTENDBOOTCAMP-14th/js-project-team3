const THUMBNAIL_TYPES_TO_TRY = ["1080", "720"];

window.tryNextThumbnailType = function(imgElement) {
    const originalUrlPattern = imgElement.dataset.originalUrlPattern;
    let currentIndex = parseInt(imgElement.dataset.currentIndex || "-1");

    currentIndex++;

    if (currentIndex < THUMBNAIL_TYPES_TO_TRY.length) {
        const nextType = THUMBNAIL_TYPES_TO_TRY[currentIndex];
        const newSrc = originalUrlPattern.replace("{type}", nextType);
        
        imgElement.dataset.currentIndex = currentIndex;
        imgElement.src = newSrc;
    } else {
        imgElement.onerror = null;
    }
};

async function fetchLiveList(size = 20, next = null) {
    try {
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
            // 개발 환경에서는 직접 치지직 API 호출 (환경 변수 필요)
            const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
            const clientSecret = import.meta.env.VITE_NAVER_CLIENT_SECRET;
            
            if (!clientId || !clientSecret) {
                console.warn("개발 환경에서 치지직 API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
                return null;
            }
            
            let url = `https://openapi.chzzk.naver.com/open/v1/lives?size=${size}`;
            if (next) {
                url += `&next=${next}`;
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
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
                    throw new Error(`치지직 API 오류: ${response.status} - ${errorText}`);
                }
                
                const responseData = await response.json();
                
                // 치지직 API 응답 구조 디버깅
                console.log("치지직 API 원본 응답:", responseData);
                console.log("치지직 API 응답 구조 분석:", {
                    hasContent: !!responseData.content,
                    contentType: typeof responseData.content,
                    hasContentData: !!responseData.content?.data,
                    contentDataLength: responseData.content?.data ? responseData.content.data.length : 0,
                    hasCode: !!responseData.code,
                    code: responseData.code,
                    hasMessage: !!responseData.message,
                    message: responseData.message,
                    sampleItem: responseData.content?.data?.[0] || responseData.content?.[0] || null
                });
                
                // 치지직 API 응답 구조 확인 및 변환
                if (responseData.code && responseData.code !== "SUCCESS") {
                    throw new Error(`치지직 API 오류: ${responseData.message || responseData.code}`);
                }
                
                // 응답 데이터를 클라이언트가 기대하는 형태로 변환
                // 치지직 API 응답 구조: {content: {data: Array, page: Object}, next: null}
                const transformedData = {
                    content: responseData.content?.data || responseData.content || [],
                    next: responseData.next || responseData.content?.page?.next || null
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
                
                return transformedData;
            } catch (fetchError) {
                clearTimeout(timeoutId);
                
                if (fetchError.name === 'AbortError') {
                    throw new Error('치지직 API 요청 시간 초과 (8초)');
                }
                
                throw fetchError;
            }
        } else {
            // 프로덕션 환경에서는 Netlify Functions 사용
            let url = `/.netlify/functions/api-proxy/chzzk-lives?size=${size}`;
            if (next) {
                url += `&next=${next}`;
            }

            const headers = {
                "Content-Type": "application/json"
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            try {
                const response = await fetch(url, {
                    method: "GET",
                    headers: headers,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const data = await response.json(); 
                
                if (!response.ok) { 
                    throw new Error(`HTTP 요청 실패 : ${response.status} - ${data.error || response.statusText}`);
                }

                if (!data.success) {
                    throw new Error(`API 내부 오류 : ${data.error || "알 수 없는 오류"}`);
                }

                return data.data;
            } catch (fetchError) {
                clearTimeout(timeoutId);
                
                if (fetchError.name === 'AbortError') {
                    throw new Error('치지직 API 요청 시간 초과 (8초)');
                }
                
                throw fetchError;
            }
        }
    } catch (error) {
        console.error("치지직 라이브 목록 조회 중 오류 발생 :", error); 
        console.error("오류 상세 정보:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return null;
    }
}

async function fetchYoutubeLiveList(query, maxResults = 10) {
    try {
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
            // 개발 환경에서는 직접 YouTube API 호출 (환경 변수 필요)
            const youtubeApiKey = import.meta.env.VITE_YOUTUBE_OPEN_API_KEY;
            
            if (!youtubeApiKey) {
                console.warn("개발 환경에서 YouTube API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
                return null;
            }
            
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
        } else {
            // 프로덕션 환경에서는 Netlify Functions 사용
            const url = `/.netlify/functions/api-proxy/youtube-lives?query=${encodeURIComponent(query)}&maxResults=${maxResults}`;

            const headers = {
                "Content-Type": "application/json"
            };

            const response = await fetch(url, {
                method: "GET",
                headers: headers
            });

            const data = await response.json();
            
            if (!response.ok) { 
                throw new Error(`HTTP 요청 실패 : ${response.status} - ${data.error || response.statusText}`);
            }

            if (!data.success) {
                throw new Error(`API 내부 오류 : ${data.error || "알 수 없는 오류"}`);
            }

            return data.data;
        }
    } catch (error) {
        console.error("유튜브 라이브 목록 조회 중 오류 발생 :", error); 
        return null;
    }
}

function createLiveBox(liveData) {
    let thumbnailUrl = liveData.liveThumbnailImageUrl;
    let originalPatternForRetry = "";

    if (liveData.platform !== "youtube" && thumbnailUrl && thumbnailUrl.includes("{type}")) {
        originalPatternForRetry = thumbnailUrl;
        thumbnailUrl = thumbnailUrl.replace("{type}", THUMBNAIL_TYPES_TO_TRY[0]); 
    } 
    
    const liveStreamUrl = liveData.liveStreamUrl; 

    const thumbnailClass = liveData.platform === "youtube" ? "live-box__thumbnail youtube-thumbnail" : "live-box__thumbnail";

    return `
        <a href="${liveStreamUrl}" target="_blank" rel="noopener noreferrer" class="live-box">
            <img 
                class="${thumbnailClass}"
                src="${thumbnailUrl}" 
                alt=""
                ${originalPatternForRetry ? `onerror="window.tryNextThumbnailType(this);" data-original-url-pattern="${originalPatternForRetry}" data-current-type-index="0"` : ""}
            />
            <div class="live-box__title">
                <span class="live-box__title__mark">${liveData.platform === "youtube" ? "LIVE" : "Live"}</span>
                <p class="live-box__title__text">${liveData.liveTitle}</p>
            </div>
            <div class="live-box__profile-box">
                <img class="live-box__profile-box__image" src="${liveData.channelImageUrl}" alt=""/>
                <p class="live-box__profile-box__nickname">${liveData.channelName}</p>
                <p class="live-box__profile-box__viewers">${liveData.concurrentUserCount === 0 ? "시청 정보 없음" : `${liveData.concurrentUserCount}명 시청중`}</p>
            </div>
            <div class="live-box__overlay">
                <p class="live-box__overlay-text">방송 시청하기</p>
            </div>
        </a>
    `;
}

function renderLiveList(containerSelector, liveDataArray) {
    const liveContainer = document.querySelector(containerSelector);
    
    if (!liveContainer) {
        console.error(`${containerSelector} DOM 할당 실패`);
        return;
    }

    liveContainer.innerHTML = "";

    liveDataArray.forEach(function(liveData) {
        liveContainer.innerHTML += createLiveBox(liveData);
    });
}

async function initializeLiveList() {
    const chzzkLiveContainer = document.querySelector(".live-container");
    const youtubeLiveContainer = document.querySelector(".youtube-live-container"); 

    if (!chzzkLiveContainer || !youtubeLiveContainer) { 
        console.error("하나 이상의 라이브 컨테이너 요소를 찾을 수 없습니다. HTML을 확인해주세요.");
        return; 
    }
    
    chzzkLiveContainer.innerHTML = `
        <div class="live-status-wrapper">
            <p>치지직 라이브 방송을 가져오는 중...</p>
        </div>`; 
    youtubeLiveContainer.innerHTML = `
        <div class="live-status-wrapper">
            <p>유튜브 라이브 방송을 가져오는 중...</p>
        </div>`;

    const chzzkResult = await fetchLiveList(20);
    console.log("치지직 API 응답 결과:", chzzkResult);
    
    if (chzzkResult && chzzkResult.content) {
        console.log("치지직 라이브 목록 구조:", {
            totalCount: chzzkResult.content.length,
            sampleItem: chzzkResult.content[0]
        });
        
        // GAME 카테고리만 필터링
        const chzzkGameLives = chzzkResult.content.filter(function(live) { 
            return live.categoryType === "GAME"; 
        });
        
        console.log("치지직 게임 라이브 필터링 결과:", {
            totalLives: chzzkResult.content.length,
            gameLives: chzzkGameLives.length
        });
        
        const chzzkLivesToRender = chzzkGameLives.slice(0, 10);

        if (chzzkLivesToRender.length > 0) {
            console.log("치지직 게임 라이브 목록 조회 성공:", chzzkLivesToRender);
            renderLiveList(".live-container", chzzkLivesToRender); 
        } else {
            console.warn("치지직 게임 라이브를 찾을 수 없습니다.");
            chzzkLiveContainer.innerHTML = `
                <div class="live-status-wrapper">
                    <p>현재 치지직 GAME 카테고리 라이브를 찾을 수 없습니다.</p>
                </div>`;
        }
    } else {
        console.error("치지직 라이브 목록을 가져올 수 없습니다.");
        console.error("응답 구조:", chzzkResult);
        chzzkLiveContainer.innerHTML = `
            <div class="live-status-wrapper">
                <p>치지직 라이브 목록을 가져오는데 실패했습니다.</p>
            </div>`;
    }

    const youtubeLives = await fetchYoutubeLiveList("서든어택", 10);
    if (youtubeLives) {
        if (youtubeLives.length > 0) {
            console.log("유튜브 서든어택 라이브 목록 조회 성공:", youtubeLives);
            renderLiveList(".youtube-live-container", youtubeLives); 
        } else {
            console.warn("유튜브 서든어택 라이브를 찾을 수 없습니다.");
            youtubeLiveContainer.innerHTML = `
                <div class="live-status-wrapper">
                    <p>현재 유튜브에서 "서든어택" 라이브를 찾을 수 없습니다.</p>
                </div>`;
        }
    } else {
        console.error("유튜브 라이브 목록을 가져올 수 없습니다.");
        youtubeLiveContainer.innerHTML = `
            <div class="live-status-wrapper">
                <p>유튜브 라이브 목록을 가져오는데 실패했습니다.</p>
            </div>`;
    }
}

export async function renderLivePage(targetElement) {
    if (!targetElement) return;
    
    const html = `
    <div class="container">
      <div class="live-title-box">
        <img class="live-title-box__chzzk" src="/images/chzzk-icon.png" alt=""/>
        <h3 class="live-title-box__title">치지직 라이브</h3>
      </div>

      <div class="live-container"></div>

      <div class="live-title-box">
        <img class="live-title-box__youtube" src="/images/youtube-icon.png" alt=""/>
        <h3 class="live-title-box__title">유튜브 라이브</h3>
      </div>

      <div class="youtube-live-container footer-margin"></div>
    </div>
    `;
    
    targetElement.innerHTML = html;
    
    await initializeLiveList();
}

window.liveModule = {
    fetchLiveList,
    fetchYoutubeLiveList,
    renderLiveList,
    initializeLiveList
};
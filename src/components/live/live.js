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
        // 치지직 API를 통합 프록시를 통해 호출
        let url = `/.netlify/functions/api-proxy/chzzk-lives?size=${size}`;
        if (next) {
            url += `&next=${next}`;
        }

        const headers = {
            "Content-Type": "application/json"
        };

        // 클라이언트에서도 타임아웃 설정 (8초)
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

            // 서버 응답 구조 확인
            if (!data.success) {
                throw new Error(`API 내부 오류 : ${data.error || "알 수 없는 오류"}`);
            }

            // 서버에서 { success: true, data: ... } 형태로 응답하므로 data.data를 반환
            return data.data;
        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                throw new Error('치지직 API 요청 시간 초과 (8초)');
            }
            
            throw fetchError;
        }
    } catch (error) {
        console.error("치지직 라이브 목록 조회 중 오류 발생 :", error); 
        return null;
    }
}

async function fetchYoutubeLiveList(query, maxResults = 10) {
    try {
        // 유튜브 API를 통합 프록시를 통해 호출
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

        // 서버 응답 구조 확인
        if (!data.success) {
            throw new Error(`API 내부 오류 : ${data.error || "알 수 없는 오류"}`);
        }

        // 서버에서 { success: true, data: ... } 형태로 응답하므로 data.data를 반환
        return data.data;
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
    if (chzzkResult && chzzkResult.content) {
        const chzzkGameLives = chzzkResult.content.filter(function(live) { return live.categoryType === "GAME"; });
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
        chzzkLiveContainer.innerHTML = `
            <div class="live-status-wrapper">
                <p>치지직 라이브 목록을 가져오는데 실패했습니다.</p>
                <p style="font-size: 12px; color: #666; margin-top: 8px;">일시적인 서버 문제일 수 있습니다. 잠시 후 다시 시도해주세요.</p>
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
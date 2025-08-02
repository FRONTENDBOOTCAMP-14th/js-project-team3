import "./score.css";
import { renderSearchBar } from "../searchbar/search-Bar.js";
import { renderRecordComponents } from "../record/record.js";
import { apiService } from "../../services/api.js";

function extractBodyContent(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const bodyElement = tempDiv.querySelector("body");
  return bodyElement ? bodyElement.innerHTML : html;
}

// 검색 가이드 표시
function showSearchGuide() {
  const searchGuide = document.getElementById("search-guide");
  const recordSection = document.getElementById("record-section");

  if (searchGuide) searchGuide.style.display = "block";
  if (recordSection) recordSection.style.display = "none";
}

// 검색 결과 표시
function showRecordSection() {
  const searchGuide = document.getElementById("search-guide");
  const recordSection = document.getElementById("record-section");

  if (searchGuide) {
    searchGuide.style.display = "none";
  }

  if (recordSection) {
    recordSection.style.display = "block";
  } else {
    console.error(`[SCORE] record-section 요소를 찾을 수 없습니다.`);
  }
}

// 로딩 상태 표시
function showLoading() {
  const contentSection = document.getElementById("content-section");
  if (contentSection) {
    // 기존 로딩 요소가 있다면 제거
    const existingLoading = contentSection.querySelector(".loading-overlay");
    if (existingLoading) {
      existingLoading.remove();
    }

    // 기존 컴포넌트들 숨기기
    const searchGuide = document.getElementById("search-guide");
    const recordSection = document.getElementById("record-section");

    if (searchGuide) searchGuide.style.display = "none";
    if (recordSection) recordSection.style.display = "none";

    // 로딩 오버레이 생성
    const loadingOverlay = document.createElement("div");
    loadingOverlay.className = "loading-overlay";
    loadingOverlay.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    contentSection.appendChild(loadingOverlay);
  }
}

// 로딩 상태 제거
function hideLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

// 에러 메시지 표시
function showError(message) {
  const contentSection = document.getElementById("content-section");
  if (contentSection) {
    // 기존 에러 메시지가 있다면 제거
    const existingError = contentSection.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    // 에러 메시지 생성
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.innerHTML = `<p>${message}</p>`;
    contentSection.appendChild(errorMessage);

    // 3초 후 자동으로 제거
    setTimeout(() => {
      if (errorMessage.parentNode) {
        errorMessage.remove();
      }
    }, 3000);
  }
}

// 검색 결과 없음 표시
function showNoResults() {
  const contentSection = document.getElementById("content-section");
  if (contentSection) {
    // 기존 결과 없음 메시지가 있다면 제거
    const existingNoResults = contentSection.querySelector(".no-results");
    if (existingNoResults) {
      existingNoResults.remove();
    }

    // 검색 가이드 숨기기
    const searchGuide = document.getElementById("search-guide");
    if (searchGuide) {
      searchGuide.style.display = "none";
    }

    // 결과 없음 메시지 생성
    const noResultsMessage = document.createElement("div");
    noResultsMessage.className = "no-results";
    contentSection.appendChild(noResultsMessage);
  }
}

// 사용자 데이터 검색 및 렌더링
async function searchAndRenderUser(nickname) {
  try {
    if (!nickname || nickname.trim() === "") {
      showError("유효한 닉네임을 입력해주세요.");
      return;
    }

    showLoading();

    // 1. 닉네임으로 OUID 조회
    const ouidResponse = await apiService.getOuidByNickname(nickname);

    if (!ouidResponse.success || !ouidResponse.data || !ouidResponse.data.ouid) {
      hideLoading();
      showNoResults();
      return;
    }

    const ouid = ouidResponse.data.ouid;

    // 2. 사용자 기본 정보 조회
    const userInfo = await apiService.getUserInfo(ouid);

    if (!userInfo.success || !userInfo.data) {
      hideLoading();
      showNoResults();
      return;
    }

    // 3. 매치 목록 조회
    const matchList = await apiService.getMatchList(ouid, "폭파미션", "일반전");

    // 4. 나머지 사용자 데이터 병렬로 조회 (에러가 나도 계속 진행)
    const [userStats, userTier, userRecentInfo] = await Promise.allSettled([
      apiService.getUserStats(ouid),
      apiService.getUserTier(ouid),
      apiService.getUserRecentInfo(ouid),
    ]);

    // 5. Record 컴포넌트들 렌더링 (성공한 데이터만 사용)
    const renderData = {
      userInfo: {
        basicInfo: userInfo.data,
        rankInfo: userTier.status === "fulfilled" ? userTier.value?.data : null,
        recentInfo: userRecentInfo.status === "fulfilled" ? userRecentInfo.value?.data : null,
      },
      userStats: userStats.status === "fulfilled" ? userStats.value?.data : null,
      userTier: userTier.status === "fulfilled" ? userTier.value?.data : null,
      userRecentInfo: userRecentInfo.status === "fulfilled" ? userRecentInfo.value?.data : null,
      matchList: matchList.success ? matchList.data : null,
    };

    try {
      await renderRecordComponents(renderData);
      hideLoading();
      showRecordSection();

      // 전적 갱신 버튼에 이벤트 리스너 추가
      const refreshButton = document.querySelector(".user-profile__header__right__refresh-button");
      if (refreshButton) {
        refreshButton.addEventListener("click", async () => {
          // 버튼 비활성화 및 텍스트 변경
          refreshButton.disabled = true;
          refreshButton.textContent = "갱신 중...";

          // 동일한 닉네임으로 데이터 다시 검색 및 렌더링
          await searchAndRenderUser(nickname);
        });
      }
    } catch (renderError) {
      console.error(`[SCORE] Record 컴포넌트 렌더링 실패:`, renderError);
      hideLoading();
      showError(`렌더링 중 오류가 발생했습니다: ${renderError.message}`);
    }
  } catch (error) {
    console.error("[SCORE] 사용자 검색 실패:", error);
    hideLoading();
    showNoResults();
  }
}

export async function renderScorePage(targetElement, params = {}) {
  if (!targetElement) return;

  const html = `
    <div class="score-container container">
        <div id="searchbar-section" class="searchbar-margin"></div>
        <div id="content-section">
            <div id="search-guide" 
                 class="search-guide" 
                 role="img" 
                 aria-label="GGATTACK 전적 검색. 검색창에 유저 닉네임을 입력해주세요. 최근 전적이 1,000경기를 넘는 경우 마지막 전적이 표시되지 않으며, 금일 데이터는 조회되지 않습니다.">
            </div>
            <div id="record-section" class="record-section" style="display: none;"></div>
        </div>
    </div>
    `;

  targetElement.innerHTML = html;

  try {
    // 검색바 렌더링
    const searchbarSection = document.getElementById("searchbar-section");
    if (searchbarSection) {
      await renderSearchBar(searchbarSection);
    }

    // URL 파라미터에서 nickname 확인
    const nickname = params.nickname;

    if (nickname) {
      // 검색어가 있으면 검색 실행
      await searchAndRenderUser(nickname);
    } else {
      // 검색어가 없으면 가이드 표시
      showSearchGuide();
    }

    console.log("Score 페이지 렌더링 완료");
  } catch (error) {
    console.error("Score 페이지 컴포넌트 렌더링 중 오류 :", error);
    showError("페이지 로딩 중 오류가 발생했습니다.");
  }
}

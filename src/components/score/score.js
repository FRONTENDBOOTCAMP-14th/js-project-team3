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
    const contentSection = document.getElementById("content-section");
    
    if (searchGuide) searchGuide.style.display = "none";
    if (recordSection) {
        recordSection.style.display = "block";
        console.log(`[SCORE] Record 섹션 표시됨`);
    }
    
    // content-section의 로딩 상태 제거
    if (contentSection) {
        contentSection.innerHTML = "";
    }
}

// 로딩 상태 표시
function showLoading() {
    const contentSection = document.getElementById("content-section");
    if (contentSection) {
        contentSection.innerHTML = `
            <div class="loading">
                <p>검색 중입니다...</p>
            </div>
        `;
    }
}

// 에러 메시지 표시
function showError(message) {
    const contentSection = document.getElementById("content-section");
    if (contentSection) {
        contentSection.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }
}

// 검색 결과 없음 표시
function showNoResults() {
    const contentSection = document.getElementById("content-section");
    if (contentSection) {
        contentSection.innerHTML = `
            <div class="no-results">
                <p>검색 결과가 없습니다. 다른 닉네임을 입력해보세요.</p>
            </div>
        `;
    }
}

// 사용자 데이터 검색 및 렌더링
async function searchAndRenderUser(nickname) {
    try {
        console.log(`[SCORE] 사용자 검색 시작: ${nickname}`);
        console.log(`[SCORE] 닉네임 타입: ${typeof nickname}, 길이: ${nickname?.length}`);
        
        if (!nickname || nickname.trim() === "") {
            console.log(`[SCORE] 유효하지 않은 닉네임: "${nickname}"`);
            showError("유효한 닉네임을 입력해주세요.");
            return;
        }
        
        showLoading();
        
        // 1. 닉네임으로 OUID 조회
        console.log(`[SCORE] OUID 조회 중...`);
        const ouidResponse = await apiService.getOuidByNickname(nickname);
        console.log(`[SCORE] OUID 응답:`, ouidResponse);
        
        if (!ouidResponse.success || !ouidResponse.data || !ouidResponse.data.ouid) {
            console.log(`[SCORE] OUID 조회 실패 또는 데이터 없음`);
            showNoResults();
            return;
        }
        
        const ouid = ouidResponse.data.ouid;
        console.log(`[SCORE] OUID 획득: ${ouid}`);
        
        // 2. 사용자 기본 정보 먼저 조회
        console.log(`[SCORE] 사용자 기본 정보 조회 중...`);
        const userInfo = await apiService.getUserInfo(ouid);
        console.log(`[SCORE] 사용자 기본 정보:`, userInfo);
        
        if (!userInfo.success || !userInfo.data) {
            console.log(`[SCORE] 사용자 기본 정보 조회 실패`);
            showError("사용자 정보를 찾을 수 없습니다.");
            return;
        }
        
        // 3. 매치 리스트 조회 (새로 추가)
        console.log(`[SCORE] 매치 리스트 조회 중...`);
        const matchList = await apiService.getMatchList(ouid, "폭파미션", "일반전");
        console.log(`[SCORE] 매치 리스트:`, matchList);
        
        // 4. 나머지 사용자 데이터 병렬로 조회 (에러가 나도 계속 진행)
        console.log(`[SCORE] 추가 사용자 데이터 조회 중...`);
        const [
            userStats,
            userDetailStats,
            userTotalStats,
            seasonGrade,
            rankTier,
            totalGrade
        ] = await Promise.allSettled([
            apiService.getUserStats(ouid),
            apiService.getUserDetailStats(ouid),
            apiService.getUserTotalStats(ouid),
            apiService.getSeasonGrade(ouid),
            apiService.getRankTier(ouid),
            apiService.getTotalGrade(ouid)
        ]);
        
        console.log(`[SCORE] 모든 API 조회 완료`);
        
        // 5. 검색 결과 표시
        console.log(`[SCORE] 검색 결과 표시 시작`);
        showRecordSection();
        
        // 6. Record 컴포넌트들 렌더링 (성공한 데이터만 사용)
        console.log(`[SCORE] Record 컴포넌트 렌더링 시작`);
        
        const renderData = {
            userInfo: userInfo.data,
            userStats: userStats.status === "fulfilled" ? userStats.value?.data : null,
            userDetailStats: userDetailStats.status === "fulfilled" ? userDetailStats.value?.data : null,
            userTotalStats: userTotalStats.status === "fulfilled" ? userTotalStats.value?.data : null,
            seasonGrade: seasonGrade.status === "fulfilled" ? seasonGrade.value?.data : null,
            rankTier: rankTier.status === "fulfilled" ? rankTier.value?.data : null,
            totalGrade: totalGrade.status === "fulfilled" ? totalGrade.value?.data : null,
            matchList: matchList.success ? matchList.data : null
        };
        
        console.log(`[SCORE] 전달할 데이터:`, renderData);
        
        await renderRecordComponents(renderData);
        
        console.log(`[SCORE] 렌더링 완료`);
        
    } catch (error) {
        console.error("[SCORE] 사용자 검색 실패:", error);
        showError(`검색 중 오류가 발생했습니다: ${error.message}`);
    }
}

export async function renderScorePage(targetElement, params = {}) {
    if (!targetElement) return;
    
    const html = await fetch("src/components/score/score.html").then(function(res) { 
        return res.text(); 
    });
    
    const bodyContent = extractBodyContent(html);
    targetElement.innerHTML = bodyContent;
    
    try {
        // 검색바 렌더링
        const searchbarSection = document.getElementById("searchbar-section");
        if (searchbarSection) {
            await renderSearchBar(searchbarSection);
        }
        
        // URL 파라미터에서 nickname 확인
        const nickname = params.nickname;
        console.log(`[SCORE] URL 파라미터:`, params);
        console.log(`[SCORE] 닉네임: "${nickname}"`);
        
        if (nickname) {
            // 검색어가 있으면 검색 실행
            console.log(`[SCORE] 검색 실행: ${nickname}`);
            await searchAndRenderUser(nickname);
        } else {
            // 검색어가 없으면 가이드 표시
            console.log(`[SCORE] 검색어 없음 - 가이드 표시`);
            showSearchGuide();
        }
        
        console.log("Score 페이지 렌더링 완료");
        
    } catch (error) {
        console.error("Score 페이지 컴포넌트 렌더링 중 오류 :", error);
        showError("페이지 로딩 중 오류가 발생했습니다.");
    }
} 
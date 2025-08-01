import "./record.css";
import { UserInfo } from "../userinfo/user-Info.js";
import { renderScoreInfo } from "../score-info/score-info.js";
import { renderScoreDetail } from "../score-detail/score-detail.js";
import { renderTotalStatistics } from "../total-statistics/total-statistics.js";

export async function renderRecordComponents(userData) {
  console.log("🚀 Record 컴포넌트 렌더링 시작 (userData 포함)");
  console.log("📦 받은 사용자 데이터:", userData);

  const recordSection = document.getElementById("record-section");
  if (!recordSection) {
    console.error(`[RECORD] record-section 요소를 찾을 수 없습니다.`);

    // record-section을 동적으로 생성
    const contentSection = document.getElementById("content-section");
    if (contentSection) {
      const newRecordSection = document.createElement("div");
      newRecordSection.id = "record-section";
      newRecordSection.className = "record-section";
      newRecordSection.style.display = "none";
      contentSection.appendChild(newRecordSection);

      // 새로 생성된 요소로 다시 시도
      const newRecordSectionElement = document.getElementById("record-section");
      if (newRecordSectionElement) {
        return await renderRecordComponents(userData); // 재귀 호출
      }
    }

    throw new Error("record-section 요소를 찾을 수 없고 생성할 수도 없습니다.");
  }

  const html = `
    <div class="record-container">
        <section class="section-margin" id="searchbar-section"></section>
        
        <section class="section-margin" id="user-info-section"></section>
        
        <section class="section-margin" id="score-info-section"></section>
        
        <section class="section-margin" id="total-statistics-section"></section>
        
        <section class="section-margin" id="score-detail-section"></section>
    </div>
    `;

  recordSection.innerHTML = html;

  try {
    // UserInfo 컴포넌트 렌더링
    const userInfoSection = document.getElementById("user-info-section");
    if (userInfoSection) {
      try {
        UserInfo(userInfoSection, { data: userData.userInfo || null });
      } catch (error) {
        console.error(`[RECORD] UserInfo 컴포넌트 렌더링 실패:`, error);
      }
    }

    // ScoreInfo 컴포넌트 렌더링
    const scoreInfoSection = document.getElementById("score-info-section");
    if (scoreInfoSection) {
      try {
        await renderScoreInfo(scoreInfoSection);
      } catch (error) {
        console.error(`[RECORD] ScoreInfo 컴포넌트 렌더링 실패:`, error);
      }
    }

    // TotalStatistics 컴포넌트 렌더링
    const totalStatisticsSection = document.getElementById("total-statistics-section");
    if (totalStatisticsSection) {
      try {
        console.log("📈 TotalStatistics 컴포넌트 렌더링");

        // 🔥 올바른 매치 데이터 경로로 수정
        const matchData = userData?.matchList?.match || [];

        console.log("📦 전달할 매치 데이터:", matchData);
        console.log("📦 매치 데이터 길이:", matchData.length);
        console.log("📦 첫 번째 매치:", matchData[0]);
        console.log("📦 매치 데이터 샘플 (첫 3개):", matchData.slice(0, 3));

        await renderTotalStatistics(totalStatisticsSection, {
          matchInfo: matchData, // 🔥 올바른 데이터 전달
        });
      } catch (error) {
        console.error(`[RECORD] TotalStatistics 컴포넌트 렌더링 실패:`, error);
      }
    }

    // ScoreDetail 컴포넌트 렌더링
    const scoreDetailSection = document.getElementById("score-detail-section");
    if (scoreDetailSection) {
      try {
        await renderScoreDetail(scoreDetailSection, { matchList: userData.matchList });
      } catch (error) {
        console.error(`[RECORD] ScoreDetail 컴포넌트 렌더링 실패:`, error);
      }
    }
  } catch (error) {
    console.error(`[RECORD] Record 컴포넌트 렌더링 중 오류:`, error);
    throw error;
  }
}

// 기존 함수는 호환성을 위해 유지
export async function renderRecordPage(targetElement, userData = null) {
  console.log("🚀 Record 페이지 렌더링 시작 (빈 데이터용)");
  console.log("📦 받은 사용자 데이터:", userData);

  if (!targetElement) {
    console.error("❌ 타겟 엘리먼트가 없음");
    return;
  }

  const html = `
    <div class="record-container">
        <section class="section-margin" id="searchbar-section"></section>
        
        <section class="section-margin" id="user-info-section"></section>
        
        <section class="section-margin" id="score-info-section"></section>
        
        <section class="section-margin" id="total-statistics-section"></section>
        
        <section class="section-margin" id="score-detail-section"></section>
    </div>
    `;

  targetElement.innerHTML = html;

  try {
    const userInfoSection = document.getElementById("user-info-section");
    if (userInfoSection) {
      UserInfo(userInfoSection, { data: null });
    }

    const scoreInfoSection = document.getElementById("score-info-section");
    if (scoreInfoSection) {
      await renderScoreInfo(scoreInfoSection);
    }

    const totalStatisticsSection = document.getElementById("total-statistics-section");
    if (totalStatisticsSection) {
      console.log("📈 TotalStatistics 컴포넌트 렌더링 (빈 데이터)");

      // 🔥 올바른 매치 데이터 경로로 수정
      const matchData = userData?.matchList?.match || [];

      console.log("📦 전달할 매치 데이터:", matchData);
      console.log("📦 매치 데이터 길이:", matchData.length);

      await renderTotalStatistics(totalStatisticsSection, {
        matchInfo: matchData, // 🔥 올바른 데이터 전달
      });
    }

    const scoreDetailSection = document.getElementById("score-detail-section");
    if (scoreDetailSection) {
      await renderScoreDetail(scoreDetailSection);
    }

    console.log("전적 페이지 렌더링 완료");
  } catch (error) {
    console.error("전적 페이지 컴포넌트 렌더링 중 오류 :", error);
  }
}

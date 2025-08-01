import "./record.css";
import { UserInfo } from "../userinfo/user-Info.js";
import { renderScoreInfo } from "../score-info/score-info.js";
import { renderScoreDetail } from "../score-detail/score-detail.js";
import { renderTotalStatistics } from "../total-statistics/total-statistics.js";

export async function renderRecordComponents(userData) {
    const recordSection = document.getElementById("record-section");
    if (!recordSection) return;
    
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
        console.log(`[RECORD] 렌더링 시작 - 받은 데이터:`, userData);
        
        const userInfoSection = document.getElementById("user-info-section");
        if (userInfoSection) {
            console.log(`[RECORD] UserInfo 컴포넌트 렌더링 - 데이터:`, userData.userInfo);
            UserInfo(userInfoSection, { data: userData.userInfo || null }); 
        }

        const scoreInfoSection = document.getElementById("score-info-section");
        if (scoreInfoSection) {
            console.log(`[RECORD] ScoreInfo 컴포넌트 렌더링`);
            await renderScoreInfo(scoreInfoSection);
        }

        const totalStatisticsSection = document.getElementById("total-statistics-section");
        if (totalStatisticsSection) {
            console.log(`[RECORD] TotalStatistics 컴포넌트 렌더링`);
            await renderTotalStatistics(totalStatisticsSection);
        }
        
        const scoreDetailSection = document.getElementById("score-detail-section");
        if (scoreDetailSection) {
            console.log(`[RECORD] ScoreDetail 컴포넌트 렌더링`);
            await renderScoreDetail(scoreDetailSection);
        }
        
        console.log("Record 컴포넌트 렌더링 완료");
        
    } catch (error) {
        console.error("Record 컴포넌트 렌더링 중 오류 :", error);
    }
}

// 기존 함수는 호환성을 위해 유지
export async function renderRecordPage(targetElement) {
    if (!targetElement) return;
    
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
            await renderTotalStatistics(totalStatisticsSection);
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
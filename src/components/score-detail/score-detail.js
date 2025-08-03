import { apiService } from "../../services/api.js";
import "./score-detail.css";

// --- 상수 및 상태 변수 ---
const RESULT_KEY_VALUE = { "1": "승리", "2": "패배", "3": "무승부", DEFAULT: "-" };
const MATCHES_PER_PAGE = 5;
let currentPage = 1;
let allMatches = [];
let currentUserOuid = null;
let currentNickname = null;
let isLoadingMore = false;

let reCallProps = null;
let reCallTargetElement = null;

// --- 순수 헬퍼 함수 ---
function getTimeAgo(dateMatchString) {
    if (!dateMatchString) return "-";
    const matchDate = new Date(dateMatchString);
    const now = new Date();
    const diffMilliseconds = now.getTime() - matchDate.getTime();
    const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;

    const year = matchDate.getFullYear();
    const month = (matchDate.getMonth() + 1).toString().padStart(2, "0");
    const day = matchDate.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}.`;
}

function getRankIcon(seasonGrade) {
    const icons = { "특등이병": "class_00.png", "특등일병": "class_01.png", "특등상병": "class_02.png", "특급병장": "class_03.png", "특전하사 1호봉": "class_04.png", "특전하사 2호봉": "class_05.png", "특전하사 3호봉": "class_06.png", "특전하사 4호봉": "class_07.png", "특전하사 5호봉": "class_08.png", "특전중사 1호봉": "class_09.png", "특전중사 2호봉": "class_10.png", "특전중사 3호봉": "class_11.png", "특전중사 4호봉": "class_12.png", "특전중사 5호봉": "class_13.png", "특전상사 1호봉": "class_14.png", "특전상사 2호봉": "class_15.png", "특전상사 3호봉": "class_16.png", "특전상사 4호봉": "class_17.png", "특전상사 5호봉": "class_18.png", "특임소위 1호봉": "class_19.png", "특임소위 2호봉": "class_20.png", "특임소위 3호봉": "class_21.png", "특임소위 4호봉": "class_22.png", "특임소위 5호봉": "class_23.png", "특임중위 1호봉": "class_24.png", "특임중위 2호봉": "class_25.png", "특임중위 3호봉": "class_26.png", "특임중위 4호봉": "class_27.png", "특임중위 5호봉": "class_28.png", "특임대위 1호봉": "class_29.png", "특임대위 2호봉": "class_30.png", "특임대위 3호봉": "class_31.png", "특임대위 4호봉": "class_32.png", "특임대위 5호봉": "class_33.png", "특공소령 1호봉": "class_34.png", "특공소령 2호봉": "class_35.png", "특공소령 3호봉": "class_36.png", "특공소령 4호봉": "class_37.png", "특공소령 5호봉": "class_38.png", "특공중령 1호봉": "class_39.png", "특공중령 2호봉": "class_40.png", "특공중령 3호봉": "class_41.png", "특공중령 4호봉": "class_42.png", "특공중령 5호봉": "class_43.png", "특공대령 1호봉": "class_44.png", "특공대령 2호봉": "class_45.png", "특공대령 3호봉": "class_46.png", "특공대령 4호봉": "class_47.png", "특공대령 5호봉": "class_48.png", "특급준장": "class_49.png", "특급소장": "class_50.png", "특급중장": "class_51.png", "특급대장": "class_52.png", "부사령관": "class_53.png", "사령관": "class_54.png", "총사령관": "class_55.png" };
    return `/images/${icons[seasonGrade] || 'class_00.png'}`;
}

// --- HTML 생성 함수 ---
function createMatchDetailPlayer(player) {
    const kdRatio = player.death === 0 ? player.kill.toFixed(2) : (player.kill / player.death).toFixed(2);
    const li = document.createElement("li");
    li.className = "match-team-item";
    li.innerHTML = `
        <a href="/score?nickname=${encodeURIComponent(player.user_name)}" class="btn-search-player" data-link>
            <img class="img-grade" src="${getRankIcon(player.season_grade)}" alt="${player.season_grade}" />
            <p class="match-team-text">${player.user_name}</p>
            <p class="match-team-text">${kdRatio}</p>
            <p class="match-team-text">${player.kill} / ${player.death} / ${player.assist}</p>
            <p class="match-team-text">${player.headshot}</p>
            <p class="match-team-text">${player.damage.toLocaleString("ko-KR")}</p>
        </a>`;
    return li;
}

function createMatchItemElement(matchData) {
  console.log("createMatchItemElement matchData", matchData);
    const li = document.createElement("li");
    li.className = "match-history-item";

    // KDA, result 등은 요약 정보(matchData 최상위)에 정확히 있음
    const { kill = 0, death = 0, assist = 0, match_result } = matchData;

    // Headshot, Damage는 상세 정보(match_detail)에서 현재 닉네임 기준으로 찾아야 함
    const matchDetailArray = matchData.match_detail || [];
    const myPlayerDetail = matchDetailArray.find(p => p.user_name === currentNickname) || {};

    const headshot = myPlayerDetail.headshot !== undefined ? myPlayerDetail.headshot : 0;
    const damage = myPlayerDetail.damage !== undefined ? myPlayerDetail.damage : 0;
    
    const matchResultText = RESULT_KEY_VALUE[match_result] || RESULT_KEY_VALUE.DEFAULT;
    const resultClass = matchResultText === "승리" ? "win" : matchResultText === "패배" ? "lose" : "draw";
    const kdRatio = death === 0 ? kill.toFixed(2) : (kill / death).toFixed(2);

    li.innerHTML = `
        <section class="match-preview-section" data-match-id="${matchData.match_id}">
             <div class="match-result-box ${resultClass}"></div>
            <section class="match-padding-section">
                <div class="match-type-box">
                    <p class="match-result-text ${resultClass}">${matchResultText}</p>
                    <p class="match-type-text">${matchData.match_type}</p>
                    <p class="match-date-text">${getTimeAgo(matchData.date_match)}</p>
                </div>
                <div class="match-map-box">
                    <p class="match-map-text">${matchData.match_map || '맵 정보 없음'}</p>
                </div>
                <section class="match-stats-section grid-full-width-section">
                    <div class="match-stats-box">
                        <p class="match-stats-label-text"><img class="icon-stat" src="/icon/user_score.svg" alt="" />K/D</p>
                        <p class="match-stats-value">${kdRatio}</p>
                    </div>
                    <div class="match-stats-box">
                        <p class="match-stats-label-text"><img class="icon-stat" src="/icon/user_score.svg" alt="" />KDA</p>
                        <p class="match-stats-value">${kill} / ${death} / ${assist}</p>
                    </div>
                    <div class="match-stats-box">
                        <p class="match-stats-label-text"><img class="icon-stat" src="/icon/user_crits_shot.svg" alt="" />헤드샷</p>
                        <p class="match-stats-value">${headshot}</p>
                    </div>
                    <div class="match-stats-box">
                        <p class="match-stats-label-text"><img class="icon-stat" src="/icon/user_dealing.svg" alt="" />딜량</p>
                        <p class="match-stats-value">${damage}</p>
                    </div>
                </section>
                <button class="btn-match-detail grid-full-width-section" type="button">▼</button>
            </section>
        </section>
        <section class="user-match-detail-wrapper" style="display:none">
            <!-- 상세 정보가 여기에 로드됩니다 -->
        </section>`;
    return li;
}

// --- 데이터 로딩 및 렌더링 함수 ---
async function loadAndRenderMatches(page, listElement, buttonElement) { // 👈 [수정 2] 요소들을 인자로 받음
    if (isLoadingMore) return;
    isLoadingMore = true;

    if (buttonElement) {
        buttonElement.textContent = '불러오는 중...';
        buttonElement.disabled = true;
    }

    const startIndex = (page - 1) * MATCHES_PER_PAGE;
    const endIndex = page * MATCHES_PER_PAGE;
    const matchesToFetch = allMatches.slice(startIndex, endIndex);

    if (page === 1) {
        listElement.innerHTML = ''; // 첫 페이지일 경우, 기존 내용 삭제
    }

    if (matchesToFetch.length === 0 && page > 1) {
        if(buttonElement) buttonElement.textContent = '더 이상 기록이 없습니다.';
        isLoadingMore = false;
        return;
    }

    try {
        const detailPromises = matchesToFetch.map(match => apiService.getMatchDetail(match.match_id));
        const detailResults = await Promise.allSettled(detailPromises);

        detailResults.forEach((result, index) => {
            const summaryData = matchesToFetch[index];
            if (result.status === 'fulfilled' && result.value.success) {
                const combinedData = { ...summaryData, ...result.value.data };
                const matchItemElement = createMatchItemElement(combinedData);
                listElement.appendChild(matchItemElement);
            } else {
                const matchItemElement = createMatchItemElement(summaryData);
                listElement.appendChild(matchItemElement);
                console.warn(`Failed to fetch detail for match ${summaryData.match_id}`, result.reason);
            }
        });

    } catch (error) {
        console.error("Error fetching match details:", error);
        if (listElement.lastChild) {
            listElement.lastChild.innerHTML = '<p>기록을 불러오는 중 오류가 발생했습니다.</p>';
        }
    } finally {
        isLoadingMore = false;
        if (buttonElement) {
            if (endIndex >= allMatches.length) {
                buttonElement.style.display = 'none';
            } else {
                buttonElement.textContent = '기록 더 보기';
                buttonElement.disabled = false;
            }
        }
    }

    const matchTypeUl = document.getElementById("matchType");

    // 매치 타입 클릭이벤트
    Array.from(matchTypeUl.querySelectorAll(".match-type-item button")).forEach(
    function (button) {
      button.addEventListener("click", async function () {
        const li = button.closest(".match-type-item");
        const matchList = await apiService.getMatchListFilterByType(
            reCallProps.userOuid, 
            "폭파미션",
            li.dataset.value // 카테고리 넣어줌 클랜전, 개인전, 토너먼트
        )
        
        reCallProps.matchList = matchList.data
        await renderScoreDetail(reCallTargetElement, reCallProps);


        const alreadySelected = matchTypeUl.querySelector(".active");
        alreadySelected.classList.remove("active");

        const targetLi = matchTypeUl.querySelector(`li[data-value="${li.dataset.value}"`);
        targetLi.firstElementChild.classList.add("active");

      });
    }
  );
}

// --- 이벤트 핸들러 ---
async function handleDetailToggle(e) {
    const detailButton = e.target.closest('.btn-match-detail');
    if (!detailButton) return;
    
    const matchItem = detailButton.closest('.match-history-item');
    const detailWrapper = matchItem.querySelector('.user-match-detail-wrapper');
    const isHidden = detailWrapper.style.display === 'none';

    document.querySelectorAll('.user-match-detail-wrapper').forEach(el => el.style.display = 'none');
    
    if (isHidden) {
        detailWrapper.style.display = 'block';
        if (!detailWrapper.dataset.loaded) {
            const matchId = matchItem.querySelector('.match-preview-section').dataset.matchId;
            await loadMatchDetail(matchId, detailWrapper);
        }
    }
}

async function loadMatchDetail(matchId, wrapperElement) {
    wrapperElement.innerHTML = `<section class="match-detail-loading"><p>상세 정보를 불러오는 중입니다...</p></section>`;
    wrapperElement.dataset.loaded = "true";

    try {
        const result = await apiService.getMatchDetail(matchId);
        if (result.success && result.data.match_detail) {
            const winPlayers = result.data.match_detail.filter(p => p.match_result === "1");
            const losePlayers = result.data.match_detail.filter(p => p.match_result !== "1");
            
            wrapperElement.innerHTML = `
                <section class="match-detail-section">
                    <section class="match-team-section win">
                        <section class="match-team-header-section win"><p class="match-header-text win">승리</p></section>
                        <ul class="match-team-body-section">${winPlayers.map(createMatchDetailPlayer).map(el => el.outerHTML).join('')}</ul>
                    </section>
                    <section class="match-team-section lose">
                        <section class="match-team-header-section lose"><p class="match-header-text lose">패배</p></section>
                        <ul class="match-team-body-section">${losePlayers.map(createMatchDetailPlayer).map(el => el.outerHTML).join('')}</ul>
                    </section>
                </section>`;
        } else {
            wrapperElement.innerHTML = `<p>상세 정보가 없습니다.</p>`;
        }
    } catch (error) {
        console.error(`Error fetching match detail for ${matchId}:`, error);
        wrapperElement.innerHTML = `<p>상세 정보를 불러오는 데 실패했습니다.</p>`;
    }
}

// --- 메인 컴포넌트 함수 ---
export async function renderScoreDetail(targetElement, props = {}) {
    
    reCallProps = props;
    reCallTargetElement = targetElement;

    currentPage = 1;
    const { matchList, userOuid, nickname } = props;
    allMatches = matchList?.match || [];
    currentUserOuid = userOuid;
    currentNickname = nickname;

    if (!targetElement) return;

    const baseHtml = `
        <section class="card-component-wrapper">
            <section class="card-header-section">
                <ul class="match-type-list" id="matchType">
                    <li class="match-type-item" data-value=""><button class="btn-match-type">전체</button></li>
                    <li class="match-type-item" data-value="퀵매치 클랜전"><button class="btn-match-type">클랜전</button></li>
                    <li class="match-type-item" data-value="랭크전 솔로"><button class="btn-match-type">솔로 랭크</button></li>
                    <li class="match-type-item" data-value="랭크전 파티"><button class="btn-match-type">파티 랭크</button></li>
                    <li class="match-type-item" data-value="토너먼트"><button class="btn-match-type">토너먼트</button></li>
                </ul>
            </section>
            <section class="card-body-section">
                <ul class="match-history-list">
                    <li class="match-history-item"><p>매치 정보를 불러오는 중입니다...</p></li>
                </ul>
            </section>
            <button class="btn-more-match-history">기록 더 보기</button>
        </section>`;
    targetElement.innerHTML = baseHtml;

    const matchHistoryListUl = targetElement.querySelector(".match-history-list");
    const loadMoreButton = targetElement.querySelector('.btn-more-match-history');

    if (allMatches.length === 0) {
        matchHistoryListUl.innerHTML = '<li class="match-history-item"><p>표시할 매치 기록이 없습니다.</p></li>';
        loadMoreButton.style.display = 'none';
        return;
    }

    // 첫 페이지 로드
    await loadAndRenderMatches(currentPage, matchHistoryListUl, loadMoreButton); // 👈 [수정 3] 인자 전달

    // 이벤트 리스너 설정
    loadMoreButton.addEventListener('click', () => {
        currentPage++;
        loadAndRenderMatches(currentPage, matchHistoryListUl, loadMoreButton); // 👈 [수정 3] 인자 전달
    });

    matchHistoryListUl.addEventListener('click', handleDetailToggle);
}

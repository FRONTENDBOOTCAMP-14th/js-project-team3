// HTML에서 body만 추출
function extractBodyContent(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const bodyElement = tempDiv.querySelector("body");
  return bodyElement ? bodyElement.innerHTML : html;
}

// 기본 설정
const CONFIG = {
  initialLoadDelay: 100,
};

// 날짜 유틸리티
function getDateText(date) {
  const today = new Date();
  const target = new Date(date);
  const diff = Math.floor((today - target) / (1000 * 60 * 60 * 24));
  return `(${diff}일전)`;
}

// 상태 변수
const dailyState = {
  date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
};

const compareState = {
  startDate: new Date(Date.now() - 172800000).toISOString().split("T")[0],
  endDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
  mode: "전체",
};

// 매치 타입 매핑
const MATCH_TYPE_MAP = {
  클랜전: "퀵매치 클랜전",
  "솔로 랭크": "랭크전 솔로",
  "파티 랭크": "랭크전 파티",
};

const TYPE_LIST = ["퀵매치 클랜전", "랭크전 솔로", "랭크전 파티"];

function getTypeLabel(type) {
  switch (type) {
    case "퀵매치 클랜전":
      return "clan";
    case "랭크전 솔로":
      return "solo";
    case "랭크전 파티":
      return "party";
    default:
      return "etc";
  }
}

// 원하는 매치 타입만 필터링하는 함수
function filterValidMatchTypes(matches) {
  const validTypes = ["퀵매치 클랜전", "랭크전 솔로", "랭크전 파티"];
  return matches.filter((match) => validTypes.includes(match.match_type));
}

// UI 동기화 함수들
function syncDailyDateUI() {
  const devices = ["web", "mobile"];

  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile";
    const dailyDateInputs = document.querySelectorAll(`${prefix} .statistics-item:first-child .input-list-item`);

    dailyDateInputs.forEach((item) => {
      const input = item.querySelector('input[type="date"], .input-item');
      const text = item.querySelector(".input-date-text");

      if (input && text) {
        input.value = dailyState.date;
        text.textContent = getDateText(dailyState.date);
      }
    });
  });
}

function syncComparisonDateUI() {
  const devices = ["web", "mobile"];

  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile";
    const compareSection = document.querySelector(`${prefix} .statistics-item:nth-child(2)`);

    if (!compareSection) return;

    const compareDateInputs = compareSection.querySelectorAll(".input-list-item");
    const actualDateInputs = Array.from(compareDateInputs).filter((item) => {
      const input = item.querySelector('input[type="date"]');
      const hasDropdown = item.querySelector(".match-type-list");
      return input && !hasDropdown;
    });

    actualDateInputs.forEach((item, dateIndex) => {
      const input = item.querySelector('input[type="date"]');
      const text = item.querySelector(".input-date-text");

      if (!input || !text) return;

      if (dateIndex === 0) {
        input.value = compareState.startDate;
        text.textContent = getDateText(compareState.startDate);
      } else if (dateIndex === 1) {
        input.value = compareState.endDate;
        text.textContent = getDateText(compareState.endDate);
      }
    });
  });
}

function syncComparisonModeUI() {
  const devices = ["web", "mobile"];

  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile";
    const compareSection = document.querySelector(`${prefix} .statistics-item:nth-child(2)`);

    if (!compareSection) return;

    const modeLabels = compareSection.querySelectorAll(".match-type-label-text");
    modeLabels.forEach((label) => {
      label.textContent = compareState.mode;
    });
  });
}

// 데이터 처리 함수들
function getMatchesByDate(allMatches, targetDate) {
  if (!targetDate || !allMatches) return [];

  return allMatches.filter((match) => {
    if (!match.date_match) return false;
    const matchDate = match.date_match.split("T")[0];
    return matchDate === targetDate;
  });
}

function classifyMatchesByType(matches) {
  const classified = {
    "퀵매치 클랜전": [],
    "랭크전 솔로": [],
    "랭크전 파티": [],
  };

  matches.forEach((match) => {
    const matchType = match.match_type;
    if (classified[matchType]) {
      classified[matchType].push(match);
    }
  });

  return classified;
}

function calculateUserStatsFromMatches(matches) {
  if (!matches.length) {
    return {
      record: "0전 0승(0%)",
      killRate: 0,
      assistCount: 0,
      matchCount: 0,
    };
  }

  let wins = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  const matchCount = matches.length;

  matches.forEach((match) => {
    const isWin = match.match_result === "1";
    if (isWin) wins++;

    const kills = match.kill || 0;
    const deaths = match.death || 0;
    const assists = match.assist || 0;

    totalKills += kills;
    totalDeaths += deaths;
    totalAssists += assists;
  });

  const winRate = matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0;
  const record = `${matchCount}전 ${wins}승(${winRate}%)`;

  const totalKD = totalKills + totalDeaths;
  const killRate = totalKD > 0 ? Math.round((totalKills / totalKD) * 100) : 0;

  return {
    record,
    killRate,
    assistCount: totalAssists,
    matchCount,
  };
}

// DOM 업데이트 함수들
function updateStatisticsDisplay(device, mode, stats) {
  const prefix = device === "web" ? ".web" : ".mobile";

  const elements = {
    win: document.querySelector(`${prefix} .record-list-item[data-mode="${mode}"][data-type="win"]`),
    kd: document.querySelector(`${prefix} .record-list-item[data-mode="${mode}"][data-type="kd"]`),
    assist: document.querySelector(`${prefix} .record-list-item[data-mode="${mode}"][data-type="assist"]`),
  };

  // 승률 업데이트
  if (elements.win) {
    const record = stats.record || "0전 0승(0%)";

    if (stats.matchCount === 0) {
      elements.win.innerHTML = "-";
    } else {
      const percentMatch = record.match(/\((\d+%)\)/);

      if (percentMatch) {
        const percentPart = percentMatch[1];
        const recordWithoutPercent = record.replace(/\(\d+%\)/, "");
        elements.win.innerHTML = `${recordWithoutPercent}<span style="color: var(--main-color)">(${percentPart})</span>`;
      } else {
        elements.win.textContent = record;
      }
    }
  }

  // K/D 비율 업데이트
  if (elements.kd) {
    const kdValue = stats.matchCount === 0 ? "-" : `${stats.killRate || 0}%`;
    elements.kd.textContent = kdValue;
  }

  // 어시스트 업데이트
  if (elements.assist) {
    const assistValue = stats.matchCount === 0 ? "-" : `${stats.assistCount || 0}`;
    elements.assist.textContent = assistValue;
  }
}

function updateCompareDisplay(device, index, stats) {
  const prefix = device === "web" ? ".web" : ".mobile";
  const compareSection = `${prefix} .statistics-item:nth-child(2)`;

  const record = stats.record || "0전 0승(0%)";
  let formattedRecord = record;

  if (stats.matchCount === 0) {
    formattedRecord = "-";
  } else {
    const percentMatch = record.match(/\((\d+%)\)/);
    if (percentMatch) {
      const percentPart = percentMatch[1];
      const recordWithoutPercent = record.replace(/\(\d+%\)/, "");
      formattedRecord = `${recordWithoutPercent}<span style="color: var(--main-color)">(${percentPart})</span>`;
    }
  }

  const types = ["win", "kd", "assist"];
  const values = [
    formattedRecord,
    stats.matchCount === 0 ? "-" : `${stats.killRate || 0}%`,
    stats.matchCount === 0 ? "-" : `${stats.assistCount || 0}`,
  ];

  types.forEach((type, i) => {
    const elements = document.querySelectorAll(`${compareSection} .record-list-item[data-type="${type}"]`);

    if (elements[index]) {
      if (type === "win") {
        elements[index].innerHTML = values[i];
      } else {
        elements[index].textContent = values[i];
      }
    }
  });
}

// 리셋 함수들
function resetDailyValues(devices = ["web", "mobile"]) {
  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile";
    const elements = document.querySelectorAll(`${prefix} .statistics-item:first-child .record-list-item[data-type]`);

    elements.forEach((element) => {
      if (!element.classList.contains("input-list-item")) {
        if (element.dataset.type === "win") {
          element.innerHTML = "-";
        } else {
          element.textContent = "-";
        }
      }
    });
  });
}

function resetCompareValues(devices = ["web", "mobile"]) {
  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile";
    const elements = document.querySelectorAll(`${prefix} .statistics-item:nth-child(2) .record-list-item[data-type]`);

    elements.forEach((element) => {
      if (!element.classList.contains("input-list-item")) {
        if (element.dataset.type === "win") {
          element.innerHTML = "-";
        } else {
          element.textContent = "-";
        }
      }
    });
  });
}

// 통계 업데이트 함수들
function updateDailyStatistics(matchData) {
  if (!matchData || !matchData.length) {
    resetDailyValues();
    return;
  }

  resetDailyValues();

  try {
    const validMatches = filterValidMatchTypes(matchData);

    if (!validMatches.length) {
      resetDailyValues();
      return;
    }

    const dayMatches = getMatchesByDate(validMatches, dailyState.date);
    const classifiedMatches = classifyMatchesByType(dayMatches);

    TYPE_LIST.forEach((matchType) => {
      const typeMatches = classifiedMatches[matchType] || [];
      const stats = calculateUserStatsFromMatches(typeMatches);
      const mode = getTypeLabel(matchType);

      updateStatisticsDisplay("web", mode, stats);
      updateStatisticsDisplay("mobile", mode, stats);
    });
  } catch (error) {
    console.error("일일 통계 업데이트 에러:", error);
  }
}

function updateDailyComparison(matchData) {
  if (!matchData || !matchData.length) {
    resetCompareValues();
    return;
  }

  resetCompareValues();

  try {
    const validMatches = filterValidMatchTypes(matchData);

    if (!validMatches.length) {
      resetCompareValues();
      return;
    }

    const dates = [compareState.startDate, compareState.endDate];

    dates.forEach((date, i) => {
      const dayMatches = getMatchesByDate(validMatches, date);
      const classifiedMatches = classifyMatchesByType(dayMatches);

      let combinedStats = {
        record: "0전 0승(0%)",
        killRate: 0,
        assistCount: 0,
        matchCount: 0,
      };

      if (compareState.mode === "전체") {
        const allDayMatches = TYPE_LIST.reduce((acc, matchType) => {
          return acc.concat(classifiedMatches[matchType] || []);
        }, []);
        combinedStats = calculateUserStatsFromMatches(allDayMatches);
      } else {
        const matchType = MATCH_TYPE_MAP[compareState.mode];
        const typeMatches = classifiedMatches[matchType] || [];
        combinedStats = calculateUserStatsFromMatches(typeMatches);
      }

      updateCompareDisplay("web", i, combinedStats);
      updateCompareDisplay("mobile", i, combinedStats);
    });
  } catch (error) {
    console.error("일일 비교 업데이트 에러:", error);
  }
}

// 이벤트 리스너 설정
function setupDailyDateEvents(matchData) {
  const devices = ["web", "mobile"];

  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile";
    const dailyDateInputs = document.querySelectorAll(`${prefix} .statistics-item:first-child .input-list-item`);

    dailyDateInputs.forEach((item) => {
      const input = item.querySelector('input[type="date"], .input-item');
      const text = item.querySelector(".input-date-text");

      if (!input || !text) return;

      input.value = dailyState.date;
      text.textContent = getDateText(dailyState.date);

      // 클릭 이벤트
      item.addEventListener("click", (e) => {
        if (e.target !== input) {
          if (input.showPicker) {
            input.showPicker();
          } else {
            input.click();
          }
        }
      });

      // 날짜 변경 이벤트
      input.addEventListener("change", (e) => {
        dailyState.date = e.target.value;
        syncDailyDateUI();
        updateDailyStatistics(matchData);
      });
    });
  });
}

function setupComparisonEvents(device, matchData) {
  const prefix = device === "web" ? ".web" : ".mobile";
  const compareSection = document.querySelector(`${prefix} .statistics-item:nth-child(2)`);

  if (!compareSection) return;

  // 날짜 입력 이벤트 설정
  const compareDateInputs = compareSection.querySelectorAll(".input-list-item");
  const actualDateInputs = Array.from(compareDateInputs).filter((item) => {
    const input = item.querySelector('input[type="date"]');
    const hasDropdown = item.querySelector(".match-type-list");
    return input && !hasDropdown;
  });

  actualDateInputs.forEach((item, dateIndex) => {
    const input = item.querySelector('input[type="date"]');
    const text = item.querySelector(".input-date-text");

    if (!input || !text) return;

    // 초기값 설정
    if (dateIndex === 0) {
      input.value = compareState.startDate;
      text.textContent = getDateText(compareState.startDate);
    } else if (dateIndex === 1) {
      input.value = compareState.endDate;
      text.textContent = getDateText(compareState.endDate);
    }

    // 클릭 이벤트
    item.addEventListener("click", (e) => {
      if (e.target !== input) {
        if (input.showPicker) {
          input.showPicker();
        } else {
          input.click();
        }
      }
    });

    // 날짜 변경 이벤트
    input.addEventListener("change", (e) => {
      const newDate = e.target.value;

      if (dateIndex === 0) {
        compareState.startDate = newDate;
      } else if (dateIndex === 1) {
        compareState.endDate = newDate;
      }

      syncComparisonDateUI();
      updateDailyComparison(matchData);
    });
  });

  // 드롭다운 이벤트 설정
  const dropdownItems = compareSection.querySelectorAll(".match-type-list-item");
  const actualDropdowns = Array.from(dropdownItems).filter((item) => {
    const hasDateInput = item.querySelector('input[type="date"]');
    const hasDropdown = item.querySelector(".match-type-list");
    return !hasDateInput && hasDropdown;
  });

  actualDropdowns.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();

      const dropdown = item.querySelector(".match-type-list");
      if (dropdown) {
        const isVisible = dropdown.style.display === "block";

        // 다른 드롭다운 닫기
        actualDropdowns.forEach((otherItem) => {
          if (otherItem !== item) {
            const otherDropdown = otherItem.querySelector(".match-type-list");
            if (otherDropdown) {
              otherDropdown.style.display = "none";
            }
          }
        });

        dropdown.style.display = isVisible ? "none" : "block";
      }
    });
  });

  // 드롭다운 아이템 클릭 이벤트
  const matchItems = compareSection.querySelectorAll(".match-type-list .match-item");

  matchItems.forEach((matchItem) => {
    matchItem.addEventListener("click", (e) => {
      e.stopPropagation();

      const text = matchItem.querySelector(".match-type-text")?.textContent || matchItem.textContent.trim();
      const parent = matchItem.closest(".match-type-list-item");

      if (parent) {
        const dropdown = parent.querySelector(".match-type-list");
        if (dropdown) {
          dropdown.style.display = "none";
        }

        compareState.mode = text;
        syncComparisonModeUI();
        updateDailyComparison(matchData);
      }
    });
  });

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(`${prefix} .match-type-list-item`) && !e.target.closest(`${prefix} .match-type-list`)) {
      actualDropdowns.forEach((item) => {
        const dropdown = item.querySelector(".match-type-list");
        if (dropdown && dropdown.style.display === "block") {
          dropdown.style.display = "none";
        }
      });
    }
  });
}

// 컴포넌트 렌더링 함수
export async function renderTotalStatistics(targetElement, props) {
  if (!targetElement) {
    console.error("타겟 엘리먼트가 없음");
    return;
  }

  const matchInfo = props?.matchInfo || [];

  try {
    // HTML 템플릿 로드
    const html = await fetch("src/components/total-statistics/total-statistics.html").then((res) => {
      if (!res.ok) {
        throw new Error(`HTML 로드 실패: ${res.status}`);
      }
      return res.text();
    });

    // DOM에 삽입
    const bodyContent = extractBodyContent(html);
    targetElement.innerHTML = bodyContent;

    // 이벤트 리스너 및 초기화 설정
    setTimeout(() => {
      try {
        // 이벤트 리스너 설정
        setupDailyDateEvents(matchInfo);
        setupComparisonEvents("web", matchInfo);
        setupComparisonEvents("mobile", matchInfo);

        // UI 동기화
        syncDailyDateUI();
        syncComparisonDateUI();
        syncComparisonModeUI();

        // 초기 데이터로 통계 업데이트
        if (matchInfo && matchInfo.length > 0) {
          updateDailyStatistics(matchInfo);
          updateDailyComparison(matchInfo);
        } else {
          resetDailyValues();
          resetCompareValues();
        }
      } catch (initError) {
        console.error("초기화 중 에러:", initError);
      }
    }, CONFIG.initialLoadDelay);
  } catch (error) {
    console.error("Total Statistics 렌더링 에러:", error);
    targetElement.innerHTML = `
      <div class="error-message">
        <p>통계를 불러오는 중 오류가 발생했습니다.</p>
        <p>새로고침 후 다시 시도해주세요.</p>
      </div>
    `;
  }
}

// 컴포넌트 정리
export function cleanupTotalStatistics() {
  // 향후 이벤트 리스너 정리 로직 추가 예정
}

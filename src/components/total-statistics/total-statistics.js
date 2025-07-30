const API_KEY = import.meta.env.VITE_NEXON_OPEN_API_KEY
const NIC_NAME = "오리"

// 초고속 설정 (딜레이 완전 제거)
const CONFIG = {
  dateDelay: 50,
  initialLoadDelay: 10,
  compareDelay: 0, // 완전 제거!
  retryDelay: 500,
  maxRetries: 1,
}

// 전역 캐시 시스템
const cache = {
  ouid: null,
  allMatches: null,
}

// 로딩 상태 관리
const loadingState = {
  daily: false,
  compare: false,
  initialLoad: false,

  setLoading: function (type, isLoading) {
    this[type] = isLoading
    const devices = ["web", "mobile"]

    devices.forEach((device) => {
      const prefix = device === "web" ? ".web" : ".mobile"
      const selector =
        type === "daily"
          ? `${prefix} .statistics-item:first-child .loading`
          : type === "compare"
          ? `${prefix} .statistics-item:nth-child(2) .loading`
          : `${prefix} .loading`

      const loader = document.querySelector(selector)
      if (loader) {
        loader.style.display = isLoading ? "block" : "none"
      }
    })
  },
}

// 요청 취소를 위한 AbortController 관리
const requestControllers = {
  daily: null,
  compare: null,
  initial: null,

  abort: function (type) {
    if (this[type]) {
      this[type].abort()
    }
  },

  create: function (type) {
    this.abort(type)
    this[type] = new AbortController()
    return this[type].signal
  },
}

// 전역 초기화 상태 관리 (중복 방지)
const initState = {
  isInitializing: false,
  dataLoaded: false,
}

// 날짜 유틸리티
function getToday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 2)
  return d.toISOString().split("T")[0]
}

function getDateText(date) {
  const today = new Date()
  const target = new Date(date)
  const diff = Math.floor((today - target) / (1000 * 60 * 60 * 24))
  return `(${diff}일전)`
}

// 상태 변수
const dailyState = { date: getToday() }
const compareState = {
  startDate: getYesterday(),
  endDate: getToday(),
  mode: "전체",
}

// 매치 타입 매핑
const MATCH_TYPE_MAP = {
  클랜전: "퀵매치 클랜전",
  "솔로 랭크": "랭크전 솔로",
  "파티 랭크": "랭크전 파티",
}

const TYPE_LIST = ["퀵매치 클랜전", "랭크전 솔로", "랭크전 파티"]

function getTypeLabel(type) {
  switch (type) {
    case "퀵매치 클랜전":
      return "clan"
    case "랭크전 솔로":
      return "solo"
    case "랭크전 파티":
      return "party"
    default:
      return "etc"
  }
}

// API 함수들 (총 2회만 호출!)
async function getOuidByNickname(nickname, signal) {
  if (cache.ouid) {
    return cache.ouid
  }

  try {
    const url = `https://open.api.nexon.com/suddenattack/v1/id?user_name=${encodeURIComponent(
      nickname
    )}`

    const response = await fetch(url, {
      headers: { "x-nxopen-api-key": API_KEY },
      signal,
    })

    if (!response.ok) {
      throw new Error(`OUID 조회 실패: ${response.status}`)
    }

    const data = await response.json()
    cache.ouid = data.ouid
    return data.ouid
  } catch (error) {
    console.error(`❌ OUID 조회 에러:`, error)
    if (error.name === "AbortError") {
      return null
    }
    return null
  }
}

// 전체 매치 목록을 한 번에 로드
async function loadAllMatches(ouid, signal) {
  if (cache.allMatches) {
    return cache.allMatches
  }

  try {
    const url = `https://open.api.nexon.com/suddenattack/v1/match?ouid=${ouid}&match_mode=폭파미션`

    const response = await fetch(url, {
      headers: { "x-nxopen-api-key": API_KEY },
      signal,
    })

    if (!response.ok) {
      throw new Error(`전체 매치 조회 실패: ${response.status}`)
    }

    const data = await response.json()
    let matches = data.match || []

    // 원하는 매치 타입만 필터링
    const targetMatchTypes = ["퀵매치 클랜전", "랭크전 솔로", "랭크전 파티"]
    matches = matches.filter((match) => {
      return targetMatchTypes.includes(match.match_type)
    })

    // 시간순 정렬 (최신순)
    matches = matches.sort((a, b) => {
      const timeCompare = new Date(b.date_match) - new Date(a.date_match)
      if (timeCompare !== 0) return timeCompare
      return b.match_id.localeCompare(a.match_id)
    })

    cache.allMatches = matches
    return matches
  } catch (error) {
    console.error(`❌ 전체 매치 조회 에러:`, error)
    return []
  }
}

// 날짜별 매치 필터링
function getMatchesByDate(allMatches, targetDate) {
  if (!targetDate || !allMatches) return []

  const filteredMatches = allMatches.filter((match) => {
    if (!match.date_match) return false
    const matchDate = match.date_match.split("T")[0]
    return matchDate === targetDate
  })

  return filteredMatches
}

// 매치 타입별 분류
function classifyMatchesByType(matches) {
  const classified = {
    "퀵매치 클랜전": [],
    "랭크전 솔로": [],
    "랭크전 파티": [],
  }

  matches.forEach((match) => {
    const matchType = match.match_type
    if (classified[matchType]) {
      classified[matchType].push(match)
    }
  })

  return classified
}

// 매치 목록 데이터만으로 통계 계산
function calculateUserStatsFromMatches(matches) {
  if (!matches.length) {
    return {
      record: "0전 0승(0%)",
      killRate: 0,
      assistCount: 0,
      matchCount: 0,
      _debug: {
        wins: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
      },
    }
  }

  let wins = 0
  let totalKills = 0
  let totalDeaths = 0
  let totalAssists = 0
  let matchCount = 0

  for (const match of matches) {
    const isWin = match.match_result === "1"
    wins += isWin ? 1 : 0

    const kills = match.kill || 0
    const deaths = match.death || 0
    const assists = match.assist || 0

    totalKills += kills
    totalDeaths += deaths
    totalAssists += assists
    matchCount++
  }

  // 승률 계산
  const winRate = matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0
  const record = `${matchCount}전 ${wins}승(${winRate}%)`

  // 킬데스 비율 계산
  const totalKD = totalKills + totalDeaths
  const killRate = totalKD > 0 ? Math.round((totalKills / totalKD) * 100) : 0

  // 어시스트 총 횟수
  const assistCount = totalAssists

  return {
    record,
    killRate,
    assistCount,
    matchCount,
    _debug: {
      wins,
      totalKills,
      totalDeaths,
      totalAssists,
    },
  }
}

// DOM 업데이트 함수들
function updateStatisticsDisplay(device, mode, stats) {
  const prefix = device === "web" ? ".web" : ".mobile"

  const elements = {
    win: document.querySelector(
      `${prefix} .record-list-item[data-mode="${mode}"][data-type="win"]`
    ),
    kd: document.querySelector(
      `${prefix} .record-list-item[data-mode="${mode}"][data-type="kd"]`
    ),
    assist: document.querySelector(
      `${prefix} .record-list-item[data-mode="${mode}"][data-type="assist"]`
    ),
  }

  // 전적 업데이트 (퍼센트 부분 색상 적용)
  if (elements.win) {
    const record = stats.record || "0전 0승(0%)"

    if (stats.matchCount === 0) {
      elements.win.innerHTML = "-"
    } else {
      const percentMatch = record.match(/\((\d+%)\)/)

      if (percentMatch) {
        const percentPart = percentMatch[1]
        const recordWithoutPercent = record.replace(/\(\d+%\)/, "")
        elements.win.innerHTML = `${recordWithoutPercent}<span style="color: var(--main-color)">(${percentPart})</span>`
      } else {
        elements.win.textContent = record
      }
    }
  }

  if (elements.kd) {
    elements.kd.textContent =
      stats.matchCount === 0 ? "-" : `${stats.killRate || 0}%`
  }

  if (elements.assist) {
    elements.assist.textContent =
      stats.matchCount === 0 ? "-" : `${stats.assistCount || 0}`
  }
}

function updateCompareDisplay(device, index, stats) {
  const prefix = device === "web" ? ".web" : ".mobile"
  const compareSection = `${prefix} .statistics-item:nth-child(2)`

  const record = stats.record || "0전 0승(0%)"

  let formattedRecord = record

  if (stats.matchCount === 0) {
    formattedRecord = "-"
  } else {
    const percentMatch = record.match(/\((\d+%)\)/)
    if (percentMatch) {
      const percentPart = percentMatch[1]
      const recordWithoutPercent = record.replace(/\(\d+%\)/, "")
      formattedRecord = `${recordWithoutPercent}<span style="color: var(--main-color)">(${percentPart})</span>`
    }
  }

  const types = ["win", "kd", "assist"]
  const values = [
    formattedRecord,
    stats.matchCount === 0 ? "-" : `${stats.killRate || 0}%`,
    stats.matchCount === 0 ? "-" : `${stats.assistCount || 0}`,
  ]

  types.forEach((type, i) => {
    const elements = document.querySelectorAll(
      `${compareSection} .record-list-item[data-type="${type}"]`
    )

    if (elements[index]) {
      if (type === "win") {
        elements[index].innerHTML = values[i]
      } else {
        elements[index].textContent = values[i]
      }
    }
  })
}

// 선택적 리셋 함수들 (섹션별 리셋)
function resetDailyValues(devices = ["web", "mobile"]) {
  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile"
    const elements = document.querySelectorAll(
      `${prefix} .statistics-item:first-child .record-list-item[data-type]`
    )

    elements.forEach((element) => {
      if (!element.classList.contains("input-list-item")) {
        if (element.dataset.type === "win") {
          element.innerHTML = "-"
        } else {
          element.textContent = "-"
        }
      }
    })
  })
}

function resetCompareValues(devices = ["web", "mobile"]) {
  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile"
    const elements = document.querySelectorAll(
      `${prefix} .statistics-item:nth-child(2) .record-list-item[data-type]`
    )

    elements.forEach((element) => {
      if (!element.classList.contains("input-list-item")) {
        if (element.dataset.type === "win") {
          element.innerHTML = "-"
        } else {
          element.textContent = "-"
        }
      }
    })
  })
}

// 전체 리셋 함수 (초기화 시 사용)
function resetValues(devices = ["web", "mobile"]) {
  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile"
    const elements = document.querySelectorAll(
      `${prefix} .record-list-item[data-type]`
    )

    elements.forEach((element) => {
      if (!element.classList.contains("input-list-item")) {
        if (element.dataset.type === "win") {
          element.innerHTML = "-"
        } else {
          element.textContent = "-"
        }
      }
    })
  })
}

function showError(message) {
  console.error("에러:", message)
}

// 안전한 동시 실행을 위한 초기화 함수 (API 2회만 호출!)
async function initializeAllData() {
  if (initState.isInitializing || initState.dataLoaded) return

  initState.isInitializing = true

  try {
    const signal = requestControllers.create("initial")
    const ouid = await getOuidByNickname(NIC_NAME, signal)
    if (!ouid || signal.aborted) return

    const allMatches = await loadAllMatches(ouid, signal)
    if (signal.aborted) return

    await Promise.all([
      updateDailyStatisticsWithData(allMatches),
      updateDailyComparisonWithData(allMatches),
    ])

    initState.dataLoaded = true
  } catch (error) {
    console.error(`❌ 초기화 에러:`, error)
  } finally {
    initState.isInitializing = false
  }
}

// 데이터를 받아서 처리하는 일일통계 함수 (API 호출 없음)
async function updateDailyStatisticsWithData(allMatches) {
  if (loadingState.daily) return

  loadingState.setLoading("daily", true)
  resetDailyValues(["web", "mobile"])

  try {
    const dayMatches = getMatchesByDate(allMatches, dailyState.date)
    const classifiedMatches = classifyMatchesByType(dayMatches)

    for (const matchType of TYPE_LIST) {
      const typeMatches = classifiedMatches[matchType] || []
      const stats = calculateUserStatsFromMatches(typeMatches)
      const mode = getTypeLabel(matchType)

      updateStatisticsDisplay("web", mode, stats)
      updateStatisticsDisplay("mobile", mode, stats)
    }
  } catch (error) {
    console.error(`❌ 일일통계 에러:`, error)
  } finally {
    loadingState.setLoading("daily", false)
  }
}

// 데이터를 받아서 처리하는 일일비교 함수 (API 호출 없음)
async function updateDailyComparisonWithData(allMatches) {
  if (loadingState.compare) return

  loadingState.setLoading("compare", true)
  resetCompareValues(["web", "mobile"])

  try {
    const dates = [compareState.startDate, compareState.endDate]

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]
      const dayMatches = getMatchesByDate(allMatches, date)
      const classifiedMatches = classifyMatchesByType(dayMatches)

      let combinedStats = {
        record: "0전 0승(0%)",
        killRate: 0,
        assistCount: 0,
        matchCount: 0,
      }

      if (compareState.mode === "전체") {
        let allDayMatches = []
        for (const matchType of TYPE_LIST) {
          const typeMatches = classifiedMatches[matchType] || []
          allDayMatches = allDayMatches.concat(typeMatches)
        }
        combinedStats = calculateUserStatsFromMatches(allDayMatches)
      } else {
        const matchType = MATCH_TYPE_MAP[compareState.mode]
        const typeMatches = classifiedMatches[matchType] || []
        combinedStats = calculateUserStatsFromMatches(typeMatches)
      }

      updateCompareDisplay("web", i, combinedStats)
      updateCompareDisplay("mobile", i, combinedStats)
    }
  } catch (error) {
    console.error(`❌ 일일비교 에러:`, error)
  } finally {
    loadingState.setLoading("compare", false)
  }
}

// 기존 함수들 (날짜 변경 시 사용)
async function updateDailyStatistics() {
  if (loadingState.daily) return

  const signal = requestControllers.create("daily")
  loadingState.setLoading("daily", true)
  resetDailyValues(["web", "mobile"])

  try {
    const ouid = await getOuidByNickname(NIC_NAME, signal)
    if (!ouid || signal.aborted) return

    const allMatches = await loadAllMatches(ouid, signal)
    if (signal.aborted) return

    const dayMatches = getMatchesByDate(allMatches, dailyState.date)
    const classifiedMatches = classifyMatchesByType(dayMatches)

    for (const matchType of TYPE_LIST) {
      if (signal.aborted) break

      const typeMatches = classifiedMatches[matchType] || []
      const stats = calculateUserStatsFromMatches(typeMatches)
      const mode = getTypeLabel(matchType)

      updateStatisticsDisplay("web", mode, stats)
      updateStatisticsDisplay("mobile", mode, stats)
    }
  } catch (error) {
    console.error(`❌ 일일 통계 에러:`, error)
    if (error.name !== "AbortError") {
      showError("일일 통계 업데이트 실패: " + error.message)
    }
  } finally {
    loadingState.setLoading("daily", false)
  }
}

// 기존 일일비교 함수 (날짜 변경 시 사용)
async function updateDailyComparison() {
  if (loadingState.compare) return

  const signal = requestControllers.create("compare")
  loadingState.setLoading("compare", true)
  resetCompareValues(["web", "mobile"])

  try {
    const ouid = await getOuidByNickname(NIC_NAME, signal)
    if (!ouid || signal.aborted) return

    const allMatches = await loadAllMatches(ouid, signal)
    if (signal.aborted) return

    const dates = [compareState.startDate, compareState.endDate]

    for (let i = 0; i < dates.length; i++) {
      if (signal.aborted) break

      const date = dates[i]
      const dayMatches = getMatchesByDate(allMatches, date)
      const classifiedMatches = classifyMatchesByType(dayMatches)

      let combinedStats = {
        record: "0전 0승(0%)",
        killRate: 0,
        assistCount: 0,
        matchCount: 0,
      }

      if (compareState.mode === "전체") {
        let allDayMatches = []
        for (const matchType of TYPE_LIST) {
          const typeMatches = classifiedMatches[matchType] || []
          allDayMatches = allDayMatches.concat(typeMatches)
        }
        combinedStats = calculateUserStatsFromMatches(allDayMatches)
      } else {
        const matchType = MATCH_TYPE_MAP[compareState.mode]
        const typeMatches = classifiedMatches[matchType] || []
        combinedStats = calculateUserStatsFromMatches(typeMatches)
      }

      updateCompareDisplay("web", i, combinedStats)
      updateCompareDisplay("mobile", i, combinedStats)

      if (i === 0) {
        await new Promise((resolve) => setTimeout(resolve, CONFIG.dateDelay))
      }
    }
  } catch (error) {
    console.error(`❌ 일일 비교 에러:`, error)
    if (error.name !== "AbortError") {
      showError("일일 비교 업데이트 실패: " + error.message)
    }
  } finally {
    loadingState.setLoading("compare", false)
  }
}

// 즉시 실행 함수들
function immediateUpdateDaily() {
  requestControllers.abort("daily")
  updateDailyStatistics()
}

function immediateUpdateCompare() {
  requestControllers.abort("compare")
  updateDailyComparison()
}

// 일일 통계 날짜 이벤트 설정 (PC + 모바일)
function setupDailyDateEvents() {
  const devices = ["web", "mobile"]

  devices.forEach((device) => {
    const prefix = device === "web" ? ".web" : ".mobile"
    const dailyDateInputs = document.querySelectorAll(
      `${prefix} .statistics-item:first-child .input-list-item`
    )

    dailyDateInputs.forEach((item) => {
      const input = item.querySelector('input[type="date"], .input-item')
      const text = item.querySelector(".input-date-text")

      if (!input || !text) return

      input.value = dailyState.date
      text.textContent = getDateText(dailyState.date)

      item.addEventListener("click", (e) => {
        if (e.target !== input) {
          if (input.showPicker) {
            input.showPicker()
          } else {
            input.click()
          }
        }
      })

      input.addEventListener("change", (e) => {
        const newDate = e.target.value
        text.textContent = getDateText(newDate)
        dailyState.date = newDate
        immediateUpdateDaily()
      })
    })
  })
}

// 일일 비교 이벤트 설정 (PC + 모바일 각각)
function setupComparisonEvents(device) {
  const prefix = device === "web" ? ".web" : ".mobile"
  const compareSection = document.querySelector(
    `${prefix} .statistics-item:nth-child(2)`
  )

  if (!compareSection) return

  // 1. 날짜 입력 이벤트 설정
  const compareDateInputs = compareSection.querySelectorAll(".input-list-item")

  const actualDateInputs = Array.from(compareDateInputs).filter((item) => {
    const input = item.querySelector('input[type="date"]')
    const hasDropdown = item.querySelector(".match-type-list")
    return input && !hasDropdown
  })

  actualDateInputs.forEach((item, dateIndex) => {
    const input = item.querySelector('input[type="date"]')
    const text = item.querySelector(".input-date-text")

    if (!input || !text) return

    if (dateIndex === 0) {
      input.value = compareState.startDate
      text.textContent = getDateText(compareState.startDate)
    } else if (dateIndex === 1) {
      input.value = compareState.endDate
      text.textContent = getDateText(compareState.endDate)
    }

    item.addEventListener("click", (e) => {
      if (e.target !== input) {
        if (input.showPicker) {
          input.showPicker()
        } else {
          input.click()
        }
      }
    })

    input.addEventListener("change", (e) => {
      const newDate = e.target.value
      text.textContent = getDateText(newDate)

      if (dateIndex === 0) {
        compareState.startDate = newDate
      } else if (dateIndex === 1) {
        compareState.endDate = newDate
      }

      immediateUpdateCompare()
    })
  })

  // 2. 드롭다운 이벤트 설정
  const dropdownItems = compareSection.querySelectorAll(".match-type-list-item")

  const actualDropdowns = Array.from(dropdownItems).filter((item) => {
    const hasDateInput = item.querySelector('input[type="date"]')
    const hasDropdown = item.querySelector(".match-type-list")
    return !hasDateInput && hasDropdown
  })

  actualDropdowns.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation()
      const dropdown = this.querySelector(".match-type-list")
      if (dropdown) {
        const isVisible = dropdown.style.display === "block"

        // 같은 디바이스 내의 다른 드롭다운 닫기
        actualDropdowns.forEach((otherItem) => {
          if (otherItem !== this) {
            const otherDropdown = otherItem.querySelector(".match-type-list")
            if (otherDropdown) {
              otherDropdown.style.display = "none"
            }
          }
        })

        dropdown.style.display = isVisible ? "none" : "block"
      }
    })
  })

  // 3. 드롭다운 메뉴 아이템 이벤트 설정
  const matchItems = compareSection.querySelectorAll(
    ".match-type-list .match-item"
  )

  matchItems.forEach((matchItem) => {
    matchItem.addEventListener("click", function (e) {
      e.stopPropagation()

      const text =
        this.querySelector(".match-type-text")?.textContent ||
        this.textContent.trim()
      const parent = this.closest(".match-type-list-item")

      if (parent) {
        const label = parent.querySelector(".match-type-label-text")
        if (label) {
          label.textContent = text
        }

        const dropdown = parent.querySelector(".match-type-list")
        if (dropdown) {
          dropdown.style.display = "none"
        }

        compareState.mode = text
        immediateUpdateCompare()
      }
    })
  })

  // 4. 외부 클릭 시 해당 디바이스의 드롭다운 닫기
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(`${prefix} .match-type-list-item`) &&
      !e.target.closest(`${prefix} .match-type-list`)
    ) {
      actualDropdowns.forEach((item) => {
        const dropdown = item.querySelector(".match-type-list")
        if (dropdown && dropdown.style.display === "block") {
          dropdown.style.display = "none"
        }
      })
    }
  })
}

// 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
  // 1. 일일 통계 날짜 이벤트 설정 (PC + 모바일)
  setupDailyDateEvents()

  // 2. 일일 비교 이벤트 설정 (PC와 모바일 각각)
  setupComparisonEvents("web") // PC 버전
  setupComparisonEvents("mobile") // 모바일 버전

  // 3. 초고속 동시 초기 데이터 로드
  setTimeout(() => {
    initializeAllData()
  }, CONFIG.initialLoadDelay)
})

const API_KEY_LIST = [
    import.meta.env.VITE_NEXON_OPEN_API_KEY1,
    import.meta.env.VITE_NEXON_OPEN_API_KEY2,
    import.meta.env.VITE_NEXON_OPEN_API_KEY3,
    import.meta.env.VITE_NEXON_OPEN_API_KEY4,
  ];
  
  const DETAIL_ARRAY_MAP = {};
  const MATCH_MODE = "폭파미션";
  const DOMAIN = "/.netlify/functions/api-proxy";
  
  const RESULT_KEY_VALUE = { 1: "승리", 2: "패배", 3: "무승부", DEFAULT: "-" };
  
  let recentArrayParameter = []
  let MATCH_DETAIL_ID = "";
  let OUID = null;
  
  let MATCH_TYPE = "";
  
  // 메인 초기화
  function init() {
    const buttonUserInfo = document.querySelector(".search-form__filter-button");
    const matchTypeUl = document.getElementById("matchType");
    const ouidArea = document.getElementById("ouidArea");
    const inputNickName = document.querySelector(".search-form__input");
  
    // buttonUserInfo버튼 클릭 시 ouid 받아서 OUID 변수에 대입
    buttonUserInfo.addEventListener("click", async function () {
      OUID = await fetchOuidData(inputNickName.value);
  
    
      // 전체를 기준으로 데이타 받아옴
      await fetchMatchData("");
    });
  
    //카테고리 클릭시
    Array.from(matchTypeUl.querySelectorAll(".match-type__item button")).forEach(
      function (button) {
        button.addEventListener("click", function () {
          if (!OUID) {
            alert("OUID 가 없습니다.");
            return;
          }
  
          const matchTypeUl = document.getElementById("matchType");
          const alreadySelected = matchTypeUl.querySelector(".active");
          alreadySelected.classList.remove("active");
  
          const li = button.closest(".match-type__item");
          fetchMatchData(li.dataset.value);
        });
      }
    );
  }
  
  // ouid 받아오는 함수
  async function fetchOuidData(inputNickNameValue) {
    // ouid 받아옴
    const ouidResponse = await fetch(`${DOMAIN}/ouid?nickname=${encodeURIComponent(inputNickNameValue)}`);
  
    const ouidResponseData = await ouidResponse.json();
    return ouidResponseData.data.ouid;
  }
  
  async function fetchOuidData2(inputNickNameValue, index) {
    const params = new URLSearchParams();
    params.set("user_name", inputNickNameValue);
  
    const arrayIndex = index % API_KEY_LIST.length;
    let apiKey = API_KEY_LIST[arrayIndex];
  
      try {
        // ouid 받아옴
        const ouidResponse = await fetch(`${DOMAIN}/ouid?nickname=${encodeURIComponent(inputNickNameValue)}`);
  
  
        if (!ouidResponse.ok) {
          // response.status가 400일 때 따로 처리 가능
          if (ouidResponse.status === 400) {
            const errorData = await ouidResponse.json(); // 에러 메시지 body가 JSON인 경우
            throw new Error(`400 오류: ${errorData.message || '잘못된 요청입니다.'}`);
          }
  
          // 그 외 상태 코드
          throw new Error(`HTTP 오류 상태: ${ouidResponse.status}`);
        }
  
  
        const ouidResponseData = await ouidResponse.json();
        return ouidResponseData.ouid;
          
      } catch (error) {
        console.log("ouid 못받아와서 오류 올바른 닉네임이 아님:", error);
      }
  }
  
  
  // 이걸 꼭 해줘야하는 이유 429방지용
  function matchTypeButtonDisabled(disabledValue) {
    const matchTypeUl = document.getElementById("matchType");
    const buttonList = matchTypeUl.querySelectorAll("button");
  
    Array.from(buttonList).forEach(function (button) {
      button.disabled = disabledValue;
    });
  }
  
  // 매치목록 불러옴 1차 뎁스 불러온 다음 2차뎁스 데이터 호출까지 함
  async function fetchMatchData(matchType) {
    const matchHistoryListUl = document.querySelector(".match-history");
    const matchTypeUl = document.getElementById("matchType");
    const targetLi = matchTypeUl.querySelector(`li[data-value="${matchType}"`);
  
  
    matchHistoryListUl.innerHTML = "";
  
   
  
    // 429방지
    matchTypeButtonDisabled(true);
  
    targetLi.firstElementChild.classList.add("active");
  
    const params = new URLSearchParams();
    params.set("ouid", OUID);
    params.set("match_mode", MATCH_MODE);
    params.set("match_type", matchType);
  
    const matchDepth1Response = await fetch(`${DOMAIN}/match?${params.toString()}`);
  
    const matchDepth1ResponseData = await matchDepth1Response.json();
  
    const matchList = matchDepth1ResponseData.data.match
      ? matchDepth1ResponseData.data.match.slice(0, 9)
      : [];
  
    if (!matchList || matchList.length === 0) {
      matchHistoryListUl.innerHTML =
        '<li class="match-history__item"><p>해당 조건의 매치 결과가 없습니다.</p></li>';
      return;
    }
  
    // 매치데이타를 돌면서 상세 매치데이타 조회
    matchList.forEach(async function (item, index) {
      const li = renderMatchItem(item);
      matchHistoryListUl.appendChild(li);
  
      // 자식 데이터 역는 작업!
      await fetchMatchDepth2(item, index);
    });
  
    console.log("바인딩 끝");
    console.log(" 이벤트 핸들러 시작");
  
    // 목록 요청이 모두 끝난 시점에 이벤트 핸들러 등록
    Array.from(document.querySelectorAll(".match-preview__detail-button")).forEach(
      (element) => {
        element.addEventListener("click", () => {
          callDetailFatch(element.parentElement.dataset.matchId);
        });
      }
    );
  
    Array.from(document.querySelectorAll(".match-detail__mode-button")).forEach(
      (element) => {
        element.addEventListener("click", function () {
          const matchId = element.dataset.matchId;
          const section = document.getElementById(`section_${matchId}`);
  
          const detailSection = section.querySelector(".match-detail__teams");
          const recentSection = section.querySelector(".match-recent-section");
  
          const styles = window.getComputedStyle(detailSection);
  
          if (styles.display === "none") {
            detailSection.style.display = "flex";
            recentSection.style.display = "none";
            element.textContent = "최근 동향 조회";
          } else {
            detailSection.style.display = "none";
            recentSection.style.display = "flex";
            element.textContent = "전적 조회";
  
            fetchRecentData();
  
          }
        });
      }
    );
  
  
    // 이걸 꼭 해줘야하는 이유 429방지용
    matchTypeButtonDisabled(false);
  }
  
  async function fetchRecentData() {
    console.log("🎯 닉네임 리스트:", recentArrayParameter);
  
    if (recentArrayParameter.length === 0) {
      console.warn("최근 닉네임 배열이 비어있습니다.");
      return;
    }
  
    const ouidList = [];
    recentArrayParameter.forEach ( async function (nickName, index) {
      const tempOuid = await fetchOuidData2(nickName, index);
      if ( tempOuid !== undefined ) {
        ouidList.push(tempOuid)
      }   
    }) ;
  
  
  
    setTimeout(() => {    
      console.log("🎯 OUID 리스트:", ouidList);
      fetchRecent(ouidList)
    }, 1000);
  
  }
  
  async function fetchRecent(ouidList) {
    ouidList.forEach( async function (ouid, index) {
      const arrayIndex = index % API_KEY_LIST.length;
      let apiKey = API_KEY_LIST[arrayIndex];
  
      try {
        const response = await fetch(`${DOMAIN}/user-recent-info?ouid=${encodeURIComponent(ouid)}`);
        const json = await response.json();
  
        if (!json.success) {
          throw new Error(json.error || "API 응답 실패");
        }
        const recentData = json.data;
        console.log("성공!", recentData);
        recentList();
      } catch (error) {
        console.error("에러 발생", error.message)
      }
    
      // await fetch(`${DOMAIN}/user-recent-info?ouid=${encodeURIComponent(ouid)}`)
  
      // .then(response => {
      //   if (!response.ok) {
      //     throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      //   }
      //   return response.json(); // 또는 response.text(), response.blob()
      // })
      // .then(data => {
      //   console.log('성공적으로 데이터 받아옴:', data);
      //   // 여기서 뿌리면됩니다.
      //   recentList()
      // })
      // .catch(error => {
      //   console.error('에러 발생:', error.message);
      // });
    });
  
  }
  
  async function fetchMatchDepth2(parentItem, index) {
    // const arrayIndex = index % API_KEY_LIST.length;
    // let apiKey = API_KEY_LIST[arrayIndex];
    const targetUserList = parentItem.players || [];
    const enemyUsers = targetUserList.filter(player => player.team !== parentItem.myTeam);
    
    enemyUsers.forEach(player => {
      if (!recentArrayParameter.includes(player.nickname)) {
        recentArrayParameter.push(player.nickname);
      }
    });
  
    const matchDetailCallUrl = `${DOMAIN}/match-detail?match_id=${encodeURIComponent(parentItem["match_id"])}`;
  
    const matchDepth2Response = await fetch(matchDetailCallUrl);
    const matchDepth2Json = await matchDepth2Response.json();
    const matchDepth2ResponseData = matchDepth2Json.data;
  
    const section = document.querySelector(
      `section[data-match-id="${parentItem["match_id"]}"`
    );
  
    const sectionDetailElement = document.getElementById(
      `section_${parentItem["match_id"]}`
    );
  
    // 맵이름 세팅
    section.querySelector(".match-map-text").innerHTML =
      matchDepth2ResponseData["match_map"];
  
    sectionDetailElement.querySelector(".map-name").innerHTML =
      matchDepth2ResponseData["match_map"];
  
    const detailArray = matchDepth2ResponseData["match_detail"];
  
    if (detailArray) {
      const inputNickName = document.querySelector(".search-form__input");
      const myName = inputNickName.value;
      const myData = detailArray.find(function (item) {return myName === item["user_name"]})[0];
  
      if (myData) {
      section.querySelector(".headshot-area").innerHTML = myData.headshot.toLocaleString();
      section.querySelector(".damage-area").innerHTML = myData.damage.toLocaleString();
      }
  
      DETAIL_ARRAY_MAP[parentItem["match_id"]] = detailArray;
    }
  
    /*
    fetch(matchDetailCallUrl, {
      method: "GET",
      headers: getHeader(apiKey),
    })
      .then((response) => response.json())
      .then((matchDetaildata) => {
        const section = document.querySelector(
          `section[data-match-id="${parentItem["match_id"]}"`
        );
  
        const sectionDetailElement = document.getElementById(
          `section_${parentItem["match_id"]}`
        );
  
        section.querySelector(".match-map-text").innerHTML =
          matchDetaildata["match_map"];
        sectionDetailElement.querySelector(".map-name").innerHTML =
          matchDetaildata["match_map"];
  
        const detailArray = matchDetaildata["match_detail"];
        if (detailArray) {
          const myName = document.getElementById("inputNickName").value;
          const myData = detailArray.filter(function (item) {
            return myName === item["user_name"];
          })[0];
  
          section.querySelector(".headshot-area").innerHTML =
            myData.headshot.toLocaleString();
          section.querySelector(".damage-area").innerHTML =
            myData.damage.toLocaleString();
  
          DETAIL_ARRAY_MAP[parentItem["match_id"]] = detailArray;
        }
      });*/
  }
  
  // function getHeader(apiKey) {
  //   return {
  //     accept: "application/json",
  //     "x-nxopen-api-key": apiKey,
  //   };
  // }
  
  function getHeader() {
    return {}; // 또는 필요한 경우 accept만
  }
  
  function callDetailFatch(matchId) {
    const sectionElement = document.getElementById(`section_${matchId}`);
  
    console.log(MATCH_DETAIL_ID);
    console.log(matchId)
  
    if (MATCH_DETAIL_ID === matchId ) {
  
      sectionElement.style.display = "none"; // 닫아버림
      MATCH_DETAIL_ID = "";
    } else {
  
      const alreadySelectedElement = document.getElementById(`section_${MATCH_DETAIL_ID}`);
      if(alreadySelectedElement){
        alreadySelectedElement.style.display = "none"; // 이미 열린걸 닫아버림
      }
  
      sectionElement.style.display = "";
  
      const winSection = sectionElement.querySelector(".win-section");
      const loseSection = sectionElement.querySelector(".lose-section");
  
      winSection.innerHTML = getDetailHeader();
      loseSection.innerHTML = getDetailHeader();
  
      recentArrayParameter = [];
  
      DETAIL_ARRAY_MAP[matchId].forEach((item) => {
  
        // 최근동향을 가져오기 위한 파라미터
        recentArrayParameter.push(item["user_name"])
  
        // 이긴거
        if (item["match_result"] === "1") {
          winSection.appendChild(getDetailList(item));
        } else if (item["match_result"] === "2") {
          loseSection.appendChild(getDetailList(item));
        }
      });
  
      MATCH_DETAIL_ID = matchId;
    }
  }
  
  function getTimeAgo(dateMatchString) {
    const matchDate = new Date(dateMatchString);
    const now = new Date();
    const diffMilliseconds = now.getTime() - matchDate.getTime();
    const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));
  
    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 30) {
      return `${diffDays}일 전`;
    } else {
      const year = matchDate.getFullYear();
      const month = (matchDate.getMonth() + 1).toString().padStart(2, "0");
      const day = matchDate.getDate().toString().padStart(2, "0");
      return `${year}. ${month}. ${day}.`;
    }
  }
  
  // 매치 정보를 렌더링
  function renderMatchItem(matchInfo) {
    const li = document.createElement("li");
    li.classList.add("match-history__item");
  
    const matchResultText =
      RESULT_KEY_VALUE[matchInfo.match_result] || RESULT_KEY_VALUE.DEFAULT;
    const matchDateText = matchInfo.date_match
      ? getTimeAgo(matchInfo.date_match)
      : "-";
  
    const matchTypeText = matchInfo.match_type || "-";
    // const mapNameText = matchInfo.match_map || '-'
    const kill = matchInfo.kill !== undefined ? matchInfo.kill : "-";
    const death = matchInfo.death !== undefined ? matchInfo.death : "-";
    const assist = matchInfo.assist !== undefined ? matchInfo.assist : "-";
    const headshotCount =
      matchInfo.headshot !== undefined ? matchInfo.headshot : "N/A";
    const damageDealt = matchInfo.damage !== undefined ? matchInfo.damage : "N/A";
  
    let kdRatio = "N/A";
    if (kill !== "-" && death !== "-") {
      if (death === 0) {
        kdRatio = kill;
      } else {
        kdRatio = ((kill / (kill + death)) * 100).toFixed(2);
      }
    }
  
    li.innerHTML = `
      <section class="match-preview">
        <div class="match-preview__result-box ${
          matchResultText === "승리"
            ? "win"
            : matchResultText === "패배"
            ? "lose"
            : "draw"
        }">
        </div>
  
        <section class="match-preview__padding" data-match-id="${
          matchInfo["match_id"]
        }">
          <div class="match-preview__type-box">
            <p class="match-detail__result-text ${
              matchResultText === "승리"
                ? "win"
                : matchResultText === "패배"
                ? "lose"
                : "draw"
            }">${matchResultText}</p>
            <p class="match-detail__type-text">${matchTypeText}</p>
            <p class="match-detail__date-text">${matchDateText}</p>
          </div>
  
          <div class="match-preview__map-box">
            <p class="match-map-text"></p>
          </div>
  
          <section class="match-preview__stats grid-full-width">
            <div class="match-stats">
              <p class="match-stats__label">
              <img class="match-stats__icon" src="/icon/user_score.svg" alt="" />
              킬뎃
              </p>
              <p class="match-stats-value">${kdRatio}</p>
            </div>
  
            <div class="match-stats">
              <p class="match-stats__label">
              <img class="match-stats__icon" src="/icon/user_score.svg" alt="" />
              KDA
              </p>
              <p class="match-stats-value">${kill} / ${death} / ${assist}</p>
            </div>
  
            <div class="match-stats">
              <p class="match-stats__label">
              <img class="match-stats__icon" src="/icon/user_crits_shot.svg" alt="" />
              헤드샷
              </p>
              <p class="match-stats-value headshot-area">${headshotCount}</p>
            </div>
  
            <div class="match-stats">
              <p class="match-stats__label">
              <img class="match-stats__icon" src="/icon/user_dealing.svg" alt="" />
              딜량
              </p>
              <p class="match-stats-value damage-area">${damageDealt}</p>
            </div>
          </section>
          <button class="match-preview__detail-button grid-full-width" type="button">
            <!--
            <img src="./src/assets/button_icon/down.svg" alt="상세 보기" style="width: 20px; height: 20px;" />-->
            ▼
          </button>
        </section>
      </section>
  
      <section id="section_${
        matchInfo["match_id"]
      }" class="match-detail" style="display:none">
        <section class="match-detail__header">
          <p class="match-detail__result-text ${
            matchResultText === "승리" ? "win" : "lose"
          }">${matchResultText}</p>
          <p class="match-detail__type-text map-name"></p>
          <p class="match-detail__date-text">${convertToKoreanFormat(
            matchInfo["date_match"]
          )}</p>
          <button class="match-detail__mode-button" data-match-id="${
            matchInfo["match_id"]
          }">최근 동향 조회</button>
        </section>
  
        <section class="match-detail__teams">
          <section class="match-team win">
            <section class="match-team__header win">
              <p class="match-team__title win">승리</p>
            </section>
            <section class="match-team__body win-section">
            </section>
          </section>
          <section class="match-team lose">
            <section class="match-team__header lose">
              <p class="match-team__title lose">패배</p>
            </section>
            <section class="match-team__body lose-section">
            </section>
          </section>
        </section>
        <section class="match-recent-section" style="display:none; border:2px solid red; min-height: 200px; padding:50px">
          최근 동향 조회 영역ㅋㅋㅋ (과제입니다.) 
        </section>
      </section>
    `;
    return li;
  }
  
  // 매치 상세 헤더
  function getDetailHeader() {
    return `
        <ul class="match-team__labels">
                        <li class="match-team__label-item">
                          <p>
                            <span class="match-team__label-text">플레이어</span>
                            <span class="match-team__label-text">킬뎃</span>
                            <span class="match-team__label-text">KDA</span>
                            <span class="match-team__label-text">헤드샷</span>
                            <span class="match-team__label-text">딜량</span>
                          </p>
                        </li>
                      </ul>
        `;
  }
  
  
  function getDetailList(item) {
    const result = document.createElement("ul");
  
    result.classList.add("match-team__list");
  
    result.innerHTML = `
      <li class="match-team__player">
        <p>
          <a href="https://ezscope.gg/match/${item["user_name"]}" class="match-team__link" target="_blank">
            <span class="match-team__text"><img src="${getRankIcon(item["season_grade"])}" alt="" class="match-team__grade-img">${item["user_name"]}</span>
            <span class="match-team__text">${((item.kill / (item.kill + item.death)) * 100).toFixed(2)}%</span>
            <span class="match-team__text">${item.kill} / ${item.death} / ${item.assist}</span>
            <span class="match-team__text">${item.headshot}</span>
            <span class="match-team__text">${item.damage.toLocaleString("ko-KR")}</span>
          </a>
        </p>
      </li>`;
    return result;
  }
  
  function recentList(item) {
    
  }
  
  function getRankIcon(seasonGrade) {
    const prefix = "/images";
    let icon = "";
  
    if (seasonGrade === "특등이병") {
      icon = "/class_00.png";
    } else if (seasonGrade === "특등일병") {
      icon = "/class_01.png";
    } else if (seasonGrade === "특등상병") {
      icon = "/class_02.png";
    } else if (seasonGrade === "특급병장") {
      icon = "/class_03.png";
    } else if (seasonGrade === "특전하사 1호봉") {
      icon = "/class_04.png";
    } else if (seasonGrade === "특전하사 2호봉") {
      icon = "/class_05.png";
    } else if (seasonGrade === "특전하사 3호봉") {
      icon = "/class_06.png";
    } else if (seasonGrade === "특전하사 4호봉") {
      icon = "/class_07.png";
    } else if (seasonGrade === "특전하사 5호봉") {
      icon = "/class_08.png";
    } else if (seasonGrade === "특전중사 1호봉") {
      icon = "/class_09.png";
    } else if (seasonGrade === "특전중사 2호봉") {
      icon = "/class_10.png";
    } else if (seasonGrade === "특전중사 3호봉") {
      icon = "/class_11.png";
    } else if (seasonGrade === "특전중사 4호봉") {
      icon = "/class_12.png";
    } else if (seasonGrade === "특전중사 5호봉") {
      icon = "/class_13.png";
    } else if (seasonGrade === "특전상사 1호봉") {
      icon = "/class_14.png";
    } else if (seasonGrade === "특전상사 2호봉") {
      icon = "/class_15.png";
    } else if (seasonGrade === "특전상사 3호봉") {
      icon = "/class_16.png";
    } else if (seasonGrade === "특전상사 4호봉") {
      icon = "/class_17.png";
    } else if (seasonGrade === "특전상사 5호봉") {
      icon = "/class_18.png";
    } else if (seasonGrade === "특임소위 1호봉") {
      icon = "/class_19.png";
    } else if (seasonGrade === "특임소위 2호봉") {
      icon = "/class_20.png";
    } else if (seasonGrade === "특임소위 3호봉") {
      icon = "/class_21.png";
    } else if (seasonGrade === "특임소위 4호봉") {
      icon = "/class_22.png";
    } else if (seasonGrade === "특임소위 5호봉") {
      icon = "/class_23.png";
    } else if (seasonGrade === "특임중위 1호봉") {
      icon = "/class_24.png";
    } else if (seasonGrade === "특임중위 2호봉") {
      icon = "/class_25.png";
    } else if (seasonGrade === "특임중위 3호봉") {
      icon = "/class_26.png";
    } else if (seasonGrade === "특임중위 4호봉") {
      icon = "/class_27.png";
    } else if (seasonGrade === "특임중위 5호봉") {
      icon = "/class_28.png";
    } else if (seasonGrade === "특임대위 1호봉") {
      icon = "/class_29.png";
    } else if (seasonGrade === "특임대위 2호봉") {
      icon = "/class_30.png";
    } else if (seasonGrade === "특임대위 3호봉") {
      icon = "/class_31.png";
    } else if (seasonGrade === "특임대위 4호봉") {
      icon = "/class_32.png";
    } else if (seasonGrade === "특임대위 5호봉") {
      icon = "/class_33.png";
    } else if (seasonGrade === "특공소령 1호봉") {
      icon = "/class_34.png";
    } else if (seasonGrade === "특공소령 2호봉") {
      icon = "/class_35.png";
    } else if (seasonGrade === "특공소령 3호봉") {
      icon = "/class_36.png";
    } else if (seasonGrade === "특공소령 4호봉") {
      icon = "/class_37.png";
    } else if (seasonGrade === "특공소령 5호봉") {
      icon = "/class_38.png";
    } else if (seasonGrade === "특공중령 1호봉") {
      icon = "/class_39.png";
    } else if (seasonGrade === "특공중령 2호봉") {
      icon = "/class_40.png";
    } else if (seasonGrade === "특공중령 3호봉") {
      icon = "/class_41.png";
    } else if (seasonGrade === "특공중령 4호봉") {
      icon = "/class_42.png";
    } else if (seasonGrade === "특공중령 5호봉") {
      icon = "/class_43.png";
    } else if (seasonGrade === "특공대령 1호봉") {
      icon = "/class_44.png";
    } else if (seasonGrade === "특공대령 2호봉") {
      icon = "/class_45.png";
    } else if (seasonGrade === "특공대령 3호봉") {
      icon = "/class_46.png";
    } else if (seasonGrade === "특공대령 4호봉") {
      icon = "/class_47.png";
    } else if (seasonGrade === "특공대령 5호봉") {
      icon = "/class_48.png";
    } else if (seasonGrade === "특급준장") {
      icon = "/class_49.png";
    } else if (seasonGrade === "특급소장") {
      icon = "/class_50.png";
    } else if (seasonGrade === "특급중장") {
      icon = "/class_51.png";
    } else if (seasonGrade === "특급대장") {
      icon = "/class_52.png";
    } else if (seasonGrade === "부사령관") {
      icon = "/class_53.png";
    } else if (seasonGrade === "사령관") {
      icon = "/class_54.png";
    } else if (seasonGrade === "총사령관") {
      icon = "/class_55.png";
    }
    return prefix + icon;
  }
  
  function convertToKoreanFormat(isoString) {
    // ISO 문자열을 Date 객체로 변환
    const date = new Date(isoString);
  
    // 한국 시간으로 변환 (UTC+9)
    const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  
    const year = koreaTime.getFullYear();
    const month = String(koreaTime.getMonth() + 1).padStart(2, "0");
    const day = String(koreaTime.getDate()).padStart(2, "0");
  
    let hours = koreaTime.getHours();
    const minutes = String(koreaTime.getMinutes()).padStart(2, "0");
    const seconds = String(koreaTime.getSeconds()).padStart(2, "0");
  
    const period = hours >= 12 ? "오후" : "오전";
    hours = hours % 12 || 12; // 0시는 12시로
  
    return `${year}-${month}-${day} ${period} ${hours}시 ${minutes}분 ${seconds}초`;
  }
  
  
  export async function renderScoreDetail(targetElement, props = {}) {
    const { matchList, userOuid } = props;
    console.log("renderScoreDetail matchList", matchList);
    console.log("renderScoreDetail userOuid", userOuid);
    
      if (!targetElement) return;
      
      const html = await fetch("src/components/score-detail/score-detail.html").then(function(res) { 
          return res.text(); 
      });
      
      const bodyContent = extractBodyContent(html);
      targetElement.innerHTML = bodyContent;
      
      init();
  }
  
  function extractBodyContent(html) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const bodyElement = tempDiv.querySelector("body");
      return bodyElement ? bodyElement.innerHTML : html;
  }
  
  
  setTimeout(() => {
    
    addEventListener("DOMContentLoaded", init);
  
  }, 500);
// 통합랭킹 데이터셋
const totalRankingData = [
  { rank: 1, grade: "class_59.png", nickname: "왕자", winRate: "80.2%", kd: "56.2%", record: "110511승 27239패 23무" },
  { rank: 2, grade: "class_58.png", nickname: "19", winRate: "74.1%", kd: "60.8%", record: "59570승 20793패 20무" },
  { rank: 3, grade: "class_58.png", nickname: "상추", winRate: "64.7%", kd: "50.1%", record: "59697승 32547패 80무" },
  { rank: 4, grade: "class_58.png", nickname: "사자", winRate: "78.4%", kd: "57.1%", record: "81401승 22459패 27무" },
  { rank: 5, grade: "class_58.png", nickname: "폭력", winRate: "70.2%", kd: "66.5%", record: "68951승 29302패 25무" },
  { rank: 6, grade: "class_58.png", nickname: "지은", winRate: "71.1%", kd: "54.6%", record: "50379승 20467패 23무" },
  { rank: 7, grade: "class_58.png", nickname: "춘천닭갈비", winRate: "65.2%", kd: "59.4%", record: "55738승 29671패 50무" },
  { rank: 8, grade: "class_58.png", nickname: "먀오먀오", winRate: "80.7%", kd: "59.6%", record: "76647승 18263패 9무" },
  { rank: 9, grade: "class_58.png", nickname: "Onecherry", winRate: "72.0%", kd: "62.4%", record: "92594승 35977패 77무" },
  { rank: 10, grade: "class_58.png", nickname: "더건", winRate: "62.5%", kd: "57.2%", record: "57562승 34341패 167무" },
];

// 시즌랭킹 데이터셋
const seasonRankingData = [
  { rank: 1, grade: "class_55.png", nickname: "오리", winRate: "71.3%", kd: "60.5%", record: "72839승 27702패 1611무" },
  { rank: 2, grade: "class_55.png", nickname: "빼냥엄마시체찾음", winRate: "73.2%", kd: "56.8%", record: "16056승 5879패 2무" },
  { rank: 3, grade: "class_55.png", nickname: "의", winRate: "62.3%", kd: "58.4%", record: "670승 405패 0무" },
  { rank: 4, grade: "class_55.png", nickname: "미소", winRate: "74.4%", kd: "54.3%", record: "11524승 3961패 7무" },
  { rank: 5, grade: "class_55.png", nickname: "지건", winRate: "80.4%", kd: "56.8%", record: "26888승 6538패 12무" },
  { rank: 6, grade: "class_55.png", nickname: "망고", winRate: "64.7%", kd: "57.7%", record: "13183승 7200패 2무" },
  { rank: 7, grade: "class_55.png", nickname: "왕자", winRate: "80.2%", kd: "56.2%", record: "110511승 27239패 23무" },
  { rank: 8, grade: "class_55.png", nickname: "사자", winRate: "78.4%", kd: "57.1%", record: "81401승 22459패 27무" },
  { rank: 9, grade: "class_55.png", nickname: "춘천닭갈비", winRate: "65.2%", kd: "59.4%", record: "55738승 29671패 50무" },
  { rank: 10, grade: "class_55.png", nickname: "엥딩", winRate: "56.1%", kd: "57.2%", record: "5805승 4542패 3무" },
];

function renderRankingTable(data) {
  const tbody = document.getElementById("rankingTableBody");
  if (!tbody) return;
  tbody.innerHTML = data.map(function(row) {
    return `
    <tr>
      <td class="ranking-rank">${row.rank}</td>
      <td><img class="ranking-grade-img" src="/images/${row.grade}" alt="계급" /></td>
      <td class="ranking-nickname">${row.nickname}</td>
      <td>${row.winRate}</td>
      <td>${row.kd}</td>
      <td>${row.record}</td>
    </tr>
  `;
  }).join("");
}

export async function renderNewsPage(targetElement) {
  if (!targetElement) return;
  
  const html = `
  <div class="container">
    <div class="flex-box">
      <div class="news-box">
        <div class="title-box">
          <img class="title-box__title-icon" src="/images/news-icon.png" alt=""/>
          <p class="font-bold">서든 News</p>
        </div>
        <div class="content-box">
          <p class="font-bold news-title" role="heading" aria-level="3">&lt;공지사항&gt;</p>
          <ul class="news-list">
            <li class="news-item"><a href="https://sa.nexon.com/news/notice/view.aspx?ArticleSN=147303" 
              target="_blank" class="news-link" aria-label="[점검] 7/24(목) 넥슨 정기점검 안내, 새 창에서 열림">
              <b>[점검]</b> 7/24(목) 넥슨 정기점검 안내</a></li>
            <li class="news-item"><a href="https://sa.nexon.com/news/notice/view.aspx?ArticleSN=147289" 
              target="_blank" class="news-link" aria-label="[점검] 7/18(금) 서든어택 임시점검 안내(오전 8시), 새 창에서 열림">
              <b>[점검]</b> 7/18(금) 서든어택 임시점검 안내(오전 8시)</a></li>
            <li class="news-item"><a href="https://sa.nexon.com/news/notice/view.aspx?ArticleSN=147267" 
              target="_blank" class="news-link" aria-label="[공지] 7/17(목) 2025 시즌3 2차 공식클랜 발표, 새 창에서 열림">
              <b>[공지]</b> 7/17(목) 2025 시즌3 2차 공식클랜 발표</a></li>
            <li class="news-item"><a href="https://sa.nexon.com/news/notice/view.aspx?ArticleSN=147204" 
              target="_blank" class="news-link" aria-label="[공지] 7/10(목) 2025 시즌3 1차 공식클랜 발표, 새 창에서 열림">
              <b>[공지]</b> 7/10(목) 2025 시즌3 1차 공식클랜 발표</a></li>
            <li class="news-item"><a href="https://sa.nexon.com/news/notice/view.aspx?ArticleSN=147208" 
              target="_blank" class="news-link" aria-label="[공지] 7월 지속 가능한 보안캠페인 진행 안내, 새 창에서 열림">
              <b>[공지]</b> 7월 지속 가능한 보안캠페인 진행 안내</a></li>
          </ul>

          <p class="font-bold news-title" role="heading" aria-level="3">&lt;업데이트&gt;</p>
          <ul class="news-list">
            <li class="news-item"><a href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=810&n4ArticleCategorySN=0" 
              target="_blank" class="news-link" aria-label="(수정) 7/17(목) 오징어 게임 시즌3 콜라보 컨텐츠 2차! 외 10종, 새 창에서 열림">
              <b>(수정)</b> 7/17(목) 오징어 게임 시즌3 콜라보 컨텐츠 2차! 외 10종</a></li>
            <li class="news-item"><a href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=809&n4ArticleCategorySN=0" 
              target="_blank" class="news-link" aria-label="(수정) 7/10(목) 스페셜 아이템으로 꽉 채운, 오늘의 스페셜 아이템 특별 판매 외 9종, 새 창에서 열림">
              <b>(수정)</b> 7/10(목) 스페셜 아이템으로 꽉 채운, 오늘의 스페셜 아이템 특별 판매 외 9종</a></li>
            <li class="news-item"><a href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=808&n4ArticleCategorySN=0" 
              target="_blank" class="news-link" aria-label="(수정) 7/3(목) 기간 한정 &lt;오징어 게임&gt; 미로 계단 업데이트 외 20종!, 새 창에서 열림">
              <b>(수정)</b> 7/3(목) 기간 한정 &lt;오징어 게임&gt; 미로 계단 업데이트 외 20종!</a></li>
            <li class="news-item"><a href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=807&n4ArticleCategorySN=0" 
              target="_blank" class="news-link" aria-label="(수정) 6/26(목) 조유리 캐릭터 출시! 외 12종, 새 창에서 열림">
              <b>(수정)</b> 6/26(목) 조유리 캐릭터 출시! 외 12종</a></li>
            <li class="news-item"><a href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=806&n4ArticleCategorySN=0" 
              target="_blank" class="news-link" aria-label="(수정) 6/19(목) 무기 컬렉션 대표 스킨 무기, 챔피언 무기 출시 외 9종, 새 창에서 열림">
              <b>(수정)</b> 6/19(목) 무기 컬렉션 대표 스킨 무기, 챔피언 무기 출시 외 9종</a></li>
          </ul>
        </div>
      </div>

      <div class="news-box">
        <div class="title-box">
          <img class="title-box__title-icon" src="/images/event-icon.png" alt=""/>
          <p class="font-bold">서든 Event</p>
        </div>
        <div class="content-box">
          <div class="event-list">
            <a class="event-item" target="_blank" aria-labelledby="eventTitle1" 
            href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=810&n4ArticleCategorySN=0&evts=tg_163010">
              <img src="/images/event-image.png" alt="스페셜 패키지 특별판매" class="event-img" aria-hidden="true"/>
              <div class="event-info">
                <div class="event-title" id="eventTitle1">스페셜 패키지 특별판매</div>
                <div class="event-desc">마이건 Lv70기념! Lv100기념 특별판매와 보너스!</div>
                <div class="event-period">기간 : 2025.07.17 ~ 2025.07.24</div>
              </div>
            </a>
            <a class="event-item" target="_blank" aria-labelledby="eventTitle2"
            href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=810&n4ArticleCategorySN=0&evts=tg_182044">
              <img src="/images/event-image2.png" alt="쿨썸머 PC방 파티 이벤트!" class="event-img" aria-hidden="true"/>
              <div class="event-info">
                <div class="event-title" id="eventTitle2">쿨썸머 PC방 파티 이벤트!</div>
                <div class="event-desc">매일 미션 달성 시 Marble 등급과 PC방 파티 상자 지급!</div>
                <div class="event-period">기간 : 2025.07.17 ~ 2025.07.31</div>
              </div>
            </a>
            <a class="event-item" target="_blank" aria-labelledby="eventTitle3"
            href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=809&n4ArticleCategorySN=0&evts=tg_16298">
              <img src="/images/event-image3.png" alt="오늘의 아이템 특별판매" class="event-img" aria-hidden="true"/>
              <div class="event-info">
                <div class="event-title" id="eventTitle3">오늘의 아이템 특별판매</div>
                <div class="event-desc">매일 매일! 스페셜 아이템 단 24시간 한정 특별 판매!</div>
                <div class="event-period">기간 : 2025.07.17 ~ 2025.07.24</div>
              </div>
            </a>
            <a class="event-item" target="_blank" aria-labelledby="eventTitle4"
            href="https://sa.nexon.com/news/update/view.aspx?n4ArticleSN=809&n4ArticleCategorySN=0&evts=tg_163018">
              <img src="/images/event-image4.png" alt="이열치열, 협동 이벤트!" class="event-img" aria-hidden="true"/>
              <div class="event-info">
                <div class="event-title" id="eventTitle4">이열치열, 협동 이벤트!</div>
                <div class="event-desc">일일 미션 달성하고 귀여운 협동 미션 완료하라!</div>
                <div class="event-period">기간 : 2025.07.17 ~ 2025.07.24</div>
              </div>
            </a>
            <a class="event-item" target="_blank" aria-labelledby="eventTitle5"
            href="https://event.sa.nexon.com/250703/intro_season3">
              <img src="/images/event-image5.png" alt="서든어택 시즌3 Revival" class="event-img" aria-hidden="true"/>
              <div class="event-info">
                <div class="event-title" id="eventTitle5">서든어택 시즌3 Revival</div>
                <div class="event-desc">특별 미션! 즉시 수수께끼 기프트 세트 100% 지급!</div>
                <div class="event-period">기간 : 2025.07.17 ~ 2025.07.24</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="ranking-container news-footer-margin">
      <div class="ranking-tabs">
        <button class="ranking-tab active" data-type="total">통합랭킹</button>
        <button class="ranking-tab" data-type="season">시즌랭킹</button>
      </div>
      <div class="ranking-table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>랭킹</th>
              <th>계급</th>
              <th>닉네임</th>
              <th>승률</th>
              <th>킬데스</th>
              <th>전적</th>
            </tr>
          </thead>
          <tbody id="rankingTableBody"></tbody>
        </table>
      </div>
    </div>
  </div>
  `;
  
  targetElement.innerHTML = html;
  
  renderRankingTable(totalRankingData);
  document.querySelectorAll(".ranking-tab").forEach(function(tab) {
    tab.addEventListener("click", function() {
      document.querySelectorAll(".ranking-tab").forEach(function(t) { t.classList.remove("active"); });
      this.classList.add("active");
      if (this.dataset.type === "total") {
        renderRankingTable(totalRankingData);
      } else {
        renderRankingTable(seasonRankingData);
      }
    });
  });
}
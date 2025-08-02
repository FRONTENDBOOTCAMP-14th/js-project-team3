// GSAP 전역 변수 선언
/* global gsap */

// 팀소개 애니메이션
function animateTeamIntroduction() {
  if (typeof gsap !== "undefined") {
    // 초기 숨김 상태 설정
    gsap.set(".team-member", { opacity: 0, x: -100 });

    // 애니메이션 실행
    gsap.to(".team-member", {
      opacity: 1,
      x: 0,
      duration: 1.3,
      ease: "power2.out",
      stagger: 0.2,
    });
  }
}

// 스크롤 감지
function setupScrollAnimation() {
  const teamIntroSection = document.querySelector(".team-intro");
  if (!teamIntroSection) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateTeamIntroduction();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(teamIntroSection);
}

export async function renderTeamIntroduction(targetElement) {
  if (!targetElement) return;

  const html = `
    <section class="team-intro container">
      <div class="team-intro__header">
        <span class="team-intro__team-name">Code Players</span>
        <h2 class="team-intro__title">코드생존을 건 개발, 팀 3보급창고</h2>
        <p class="team-intro__desc">각자 맡은 역할에서 최선을 다해 미션을 수행</p>
      </div>

      <ul class="team-intro__members">
        <li class="team-member">
          <div class="team-member__img-wrap member-img01"></div>
          <strong class="team-member__name">박민성</strong>
          <span class="team-member__info">INFJ / 청도 / 01월 26일</span>
          <p class="team-member__quote">
            "저한테 왜 그랬어요? <br />
            말해봐요."
          </p>
        </li>
        <li class="team-member">
          <div class="team-member__img-wrap member-img02"></div>
          <strong class="team-member__name">심현보</strong>
          <span class="team-member__info">ENFJ / 신림 / 07월 30일</span>
          <p class="team-member__quote">
            " 사람을 화나게 하는 두가지 방법이 있는데 <br />
            첫번쨰는 "
          </p>
        </li>
        <li class="team-member">
          <div class="team-member__img-wrap member-img03"></div>
          <strong class="team-member__name">윤정화</strong>
          <span class="team-member__info">ENFP / 하남 / 12월 24일</span>
          <p class="team-member__quote">
            "가치있는 것을 하는데 있어서 늦었다는 건 없다."
          </p>
        </li>
        <li class="team-member">
          <div class="team-member__img-wrap member-img04"></div>
          <strong class="team-member__name">한우창</strong>
          <span class="team-member__info">ISTP / 서울 / 9월 22일</span>
          <p class="team-member__quote">
            " 뭣이 중헌디! "
          </p>
        </li>
      </ul>
    </section>
  `;

  targetElement.innerHTML = html;

  setTimeout(function () {
    setupScrollAnimation();
  }, 100);
}

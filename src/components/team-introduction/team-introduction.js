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
        <span class="team-intro__team-name">TEAM 3보급창고</span>
        <h2 class="team-intro__title">코드는 깔끔하게, 기능은 탄탄하게</h2>
        <p class="team-intro__desc">팀 3보급창고는 Sudden Attack의 전적을 시원하게 조회하는 웹사이트를 구현했습니다.</p>
      </div>

      <ul class="team-intro__members">
        <li class="team-member">
          <div class="team-member__img-wrap member-img01"></div>
          <strong class="team-member__name">박민성</strong>
          <span class="team-member__info">INFJ/청도/ 01월 26일일</span>
          <p class="team-member__quote">
            " 함께 성장하며, 기술의 흐름 속에<br />
            지속가능한 개발자로 나아갑니다. "
          </p>
        </li>
        <li class="team-member">
          <div class="team-member__img-wrap member-img02"></div>
          <strong class="team-member__name">심현보</strong>
          <span class="team-member__info">ENFJ / 신림 / 07월 30일</span>
          <p class="team-member__quote">
            " 함께 성장하며, 기술의 흐름 속에<br />
            지속가능한 개발자로 나아갑니다. "
          </p>
        </li>
        <li class="team-member">
          <div class="team-member__img-wrap member-img03"></div>
          <strong class="team-member__name">윤정화</strong>
          <span class="team-member__info">ENFP / 하남 / 12월 24일</span>
          <p class="team-member__quote">
            " 함께 성장하며, 기술의 흐름 속에<br />
            지속가능한 개발자로 나아갑니다. "
          </p>
        </li>
        <li class="team-member">
          <div class="team-member__img-wrap member-img04"></div>
          <strong class="team-member__name">한우창</strong>
          <span class="team-member__info">ISTP / 서울 / 9월 22일</span>
          <p class="team-member__quote">
            " 함께 성장하며, 기술의 흐름 속에<br />
            지속가능한 개발자로 나아갑니다. "
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

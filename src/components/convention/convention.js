function extractBodyContent(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const bodyElement = tempDiv.querySelector("body");
    return bodyElement ? bodyElement.innerHTML : html;
}

export async function renderConvention(targetElement) {
    if (!targetElement) return;
    
    const html = `
    <div class="container">
      <div class="convention-container">
        <span class="convention-container__team-name">Our Conventions</span>
        <h2 class="convention-container__title">저희는 이렇게 작업했습니다!</h2>
        <div class="convention-container__box">
            <div class="container__box__tab-container">
                <button class="tab-btn active" data-tab="convention">Convention</button>
                <button class="tab-btn" data-tab="scrum">Scrum</button>
                <button class="tab-btn" data-tab="timeline">Timeline</button>
                <button class="tab-btn" data-tab="retrospect">Retrospect</button>
            </div>
            <div class="container__box__contents-container">
                <div class="tab-content tab-content--convention active">
                    <div class="convention-content">
                        <h1>Coding & Git Convention Guide</h1>
                        <blockquote>
                            <p><strong>프로젝트 일관성과 협업 효율성을 높이기 위한 가이드입니다.</strong></p>
                            <p>코드 스타일, 네이밍, Git 전략 등 팀 전체가 같은 기준을 따르도록 설정한 원칙입니다.</p>
                        </blockquote>

                        <hr>

                        <h2>📌 HTML/CSS 네이밍 규칙</h2>
                        <ul>
                            <li><code>id</code> → <strong>camelCase</strong><br>
                                예: <code>userCard</code>, <code>scrollTarget</code></li>
                            <li><code>class</code> → <strong>kebab-case + BEM 방식</strong><br>
                                예: <code>user-card → block</code><br>
                                <code>user-card__image → block의 하위 element</code><br>
                                <code>user-card--active → block의 상태 modifier</code></li>
                            <li><strong>파일명, 폴더명, 이미지명</strong> → kebab-case<br>
                                예: <code>user-profile.js</code>, <code>img-folder/</code></li>
                        </ul>
                        <p>✅ <code>id</code>보다는 <code>class</code> 사용을 권장합니다.<br>
                        ✅ <code>id</code>는 고유성으로 인해 스타일 재사용 및 유지보수에 불리합니다.</p>

                        <hr>

                        <h2>📌 스타일링 원칙</h2>
                        <ul>
                            <li><strong>색상, 폰트, 크기 등은 변수로 관리</strong><br>
                                → CSS 변수 또는 SCSS 변수 사용</li>
                        </ul>
                        <pre><code>:root {
  --main-color: #1e90ff;
  --font-heading: 'Pretendard', sans-serif;
}</code></pre>
                        <ul>
                            <li><strong>아이콘/일러스트는 <code>.svg</code> + <code>&lt;img&gt;</code> 태그 활용</strong><br>
                                → icon 파일은 .svg 확장자, image 파일은 .png 확장자 사용<br>
                                → 브라우저 최적화 및 동적 스타일링에 유리</li>
                            <li><strong>반응형 이미지 처리</strong>
                                <ul>
                                    <li><code>picture</code> 태그 대신 <code>background-image</code> 속성을 선호</li>
                                    <li>이유: CSS/JS에서 제어 및 리팩토링이 쉬움</li>
                                </ul>
                            </li>
                        </ul>

                        <hr>

                        <h2>📌 JavaScript 네이밍 규칙</h2>
                        <ul>
                            <li><strong>변수명, 함수명</strong> → <strong>camelCase</strong><br>
                                예: <code>currentPage</code>, <code>getTimeAgo()</code>, <code>loadAndRenderMatches()</code></li>
                            <li><strong>상수명</strong> → <strong>UPPER_SNAKE_CASE</strong><br>
                                예: <code>RESULT_KEY_VALUE</code>, <code>MATCHES_PER_PAGE</code>, <code>API_BASE_URL</code></li>
                            <li><strong>클래스명</strong> → <strong>PascalCase</strong><br>
                                예: <code>ApiService</code></li>
                            <li><strong>파일명</strong> → <strong>kebab-case</strong><br>
                                예: <code>score-detail.js</code>, <code>api-proxy.js</code></li>
                        </ul>

                        <hr>

                        <h2>📌 코드 구조 및 스타일</h2>
                        <h3>함수 및 변수 선언 순서</h3>
                        <pre><code>// 1. 상수 선언
const RESULT_KEY_VALUE = { "1": "승리", "2": "패배" };
const MATCHES_PER_PAGE = 5;

// 2. 전역 변수 선언
let currentPage = 1;
let allMatches = [];

// 3. 헬퍼 함수들
function getTimeAgo(dateMatchString) { ... }

// 4. 메인 함수들
async function loadAndRenderMatches() { ... }

// 5. 이벤트 핸들러들
async function handleDetailToggle(e) { ... }

// 6. export 함수들
export async function renderScoreDetail() { ... }</code></pre>

                        <h3>주석 스타일</h3>
                        <pre><code>// --- 섹션 구분선 ---
// --- 상수 및 상태 변수 ---
// --- 순수 헬퍼 함수 ---
// --- HTML 생성 함수 ---
// --- 이벤트 핸들러 ---
// --- 메인 컴포넌트 함수 ---</code></pre>

                        <hr>

                        <h2>📌 ES6+ 문법 사용 규칙</h2>
                        <ul>
                            <li><strong>화살표 함수</strong> → 간단한 함수나 콜백에서 사용<br>
                                예: <code>const icons = { ... }</code></li>
                            <li><strong>구조 분해 할당</strong> → 객체/배열에서 값 추출 시 사용<br>
                                예: <code>const { kill = 0, death = 0, assist = 0 } = matchData;</code></li>
                            <li><strong>템플릿 리터럴</strong> → 문자열 연결 시 사용<br>
                                예: <code>return \`\${year}.\${month}.\${day}.\`;</code></li>
                            <li><strong>async/await</strong> → 비동기 처리 시 사용<br>
                                예: <code>async function loadMatchDetail() { ... }</code></li>
                        </ul>

                        <hr>

                        <h2>📌 에러 처리 및 로깅</h2>
                        <h3>콘솔 로그 규칙</h3>
                        <pre><code>// 일반 로그
console.log(\`[API] 요청 URL: \${url}\`);

// 경고 로그
console.warn(\`[API] ⚠️  개발 환경에서 API 키가 설정되지 않았습니다.\`);

// 에러 로그
console.error(\`[API] \${endpoint} 요청 실패:\`, error.message);</code></pre>

                        <h3>에러 처리 패턴</h3>
                        <pre><code>try {
  const result = await apiService.getMatchDetail(matchId);
  // 성공 처리
} catch (error) {
  console.error(\`Error fetching match detail:\`, error);
  // 에러 처리
}</code></pre>

                        <hr>

                        <h2>📌 모듈 시스템</h2>
                        <h3>Import/Export 규칙</h3>
                        <pre><code>// CSS 파일 import
import "./score-detail.css";

// 모듈 import
import { apiService } from "../../services/api.js";

// 함수 export
export async function renderScoreDetail(targetElement, props = {}) { ... }</code></pre>

                        <h3>파일 구조 규칙</h3>
                        <ul>
                            <li>각 컴포넌트는 독립적인 폴더로 구성</li>
                            <li>CSS, HTML, JS 파일을 같은 폴더에 배치</li>
                            <li>유틸리티 함수는 <code>utils/</code> 폴더에 분리</li>
                        </ul>

                        <hr>

                        <h2>📌 ESLint 규칙</h2>
                        <h3>활성화된 규칙</h3>
                        <ul>
                            <li><code>no-unused-vars</code>: 사용하지 않는 변수 경고</li>
                            <li><code>no-console</code>: console 사용 허용</li>
                            <li><code>no-undef</code>: 정의되지 않은 변수 경고</li>
                            <li><code>prefer-const</code>: 가능한 경우 const 사용 권장</li>
                            <li><code>no-var</code>: var 사용 금지</li>
                        </ul>

                        <h3>비활성화된 규칙</h3>
                        <ul>
                            <li><code>no-unused-vars</code>: "off" (개발 중 임시 변수 허용)</li>
                            <li><code>no-console</code>: "off" (디버깅용 로그 허용)</li>
                        </ul>

                        <hr>

                        <h2>📌 추가 가이드라인</h2>
                        <ul>
                            <li><strong>함수 길이</strong>: 한 함수는 50줄 이내로 유지</li>
                            <li><strong>변수 스코프</strong>: 가능한 한 지역 변수 사용</li>
                            <li><strong>매직 넘버</strong>: 상수로 분리하여 의미 명확화</li>
                            <li><strong>비동기 처리</strong>: Promise.allSettled() 사용으로 안정성 확보</li>
                            <li><strong>타입 체크</strong>: typeof, instanceof 등으로 타입 검증</li>
                        </ul>

                        <hr>

                        <h2>📌 Git 커밋 메시지 컨벤션</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>타입</th>
                                    <th>설명</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>feat</td><td>새로운 기능 추가</td></tr>
                                <tr><td>fix</td><td>버그 수정</td></tr>
                                <tr><td>docs</td><td>문서 수정</td></tr>
                                <tr><td>modify</td><td>기능 변경을 포함한 코드 수정</td></tr>
                                <tr><td>refactor</td><td>리팩토링 (동작 변화 없음)</td></tr>
                                <tr><td>design</td><td>CSS 등 UI 관련 변경</td></tr>
                                <tr><td>comment</td><td>주석 추가 및 수정</td></tr>
                                <tr><td>style</td><td>코드 포맷, 공백, 세미콜론 등 포맷팅</td></tr>
                                <tr><td>test</td><td>테스트 코드 관련 작업</td></tr>
                                <tr><td>chore</td><td>빌드, 패키지 설정 등 운영 코드 작업</td></tr>
                                <tr><td>init</td><td>초기 프로젝트 세팅</td></tr>
                                <tr><td>rename</td><td>파일 또는 폴더명 변경</td></tr>
                                <tr><td>remove</td><td>파일 삭제</td></tr>
                                <tr><td>merge</td><td>브랜치 병합 시 사용</td></tr>
                                <tr><td>build</td><td>라이브러리, 패키지 설치</td></tr>
                                <tr><td>accessibility</td><td>접근성 관련 코드 작업</td></tr>
                            </tbody>
                        </table>

                        <p>✅ <strong>형식 예시:</strong><br>
                        <code>feat : 로그인 기능 구현</code><br>
                        <code>refactor : 카드 컴포넌트 구조 개선</code></p>

                        <hr>

                        <h2>📌 Git 브랜치 전략</h2>
                        <p>GitHub Flow branch 전략 사용</p>
                        <ul>
                            <li><code>main</code><br>
                                → 실제 배포에 사용되는 <strong>최종 브랜치</strong></li>
                            <li><code>feature/기능명</code><br>
                                → 단위 작업 브랜치<br>
                                예: <code>feature/signup-form</code> - 기능추가 브랜치<br>
                                <code>fix/signup-form</code> - 버그 수정 브랜치<br>
                                <code>refactor/signup-form</code> - 리팩토리 작업 브랜치<br>
                                <code>docs/signup-form</code> - 문서작업 브랜치<br>
                                <code>chore/signup-form</code> - 개발 환경 설정 변경 브랜치</li>
                        </ul>

                        <hr>

                        <h2>📌 추가 가이드라인</h2>
                        <ul>
                            <li><strong>접근성</strong>: 시맨틱 태그 + WAI-ARIA 속성 적극 사용</li>
                            <li><strong>주석 작성</strong>: 복잡하거나 비직관적인 로직에는 주석 필수</li>
                            <li><strong>파일 구조</strong>: 기능 단위로 폴더 구조를 설계해 유지보수성 확보</li>
                            <li><strong>코드 리뷰</strong>: 모든 PR은 최소 1명 이상의 리뷰 후 머지</li>
                        </ul>
                    </div>
                </div>
                <div class="tab-content tab-content--scrum">
                    <div class="scrum-content">
                        <h2>☀️ 데일리 스크럼</h2>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.18 (Day 1) - 프로젝트 기획 및 역할 분배</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ 아이디어 도출을 통한 주제 선정</li>
                                    <li>✅ 작업 파트를 명확하게 분배하여 각자 맡을 페이지 정의</li>
                                    <li>✅ 넥슨 Open Api를 활용한 FPS게임인 서든어택의 전적 조회 웹사이트 <strong>GGATTACK</strong> 제작</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>랭킹, 라이브 컴포넌트 마크업 및 스타일링</li>
                                            <li>API를 활용한 조회 기능 추가</li>
                                            <li>반응형 고려한 구조 설계</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>헤더, 풋터, 팀원소개, 전적통계 컴포넌트 마크업 및 스타일링</li>
                                            <li>API를 활용한 조회 기능 추가</li>
                                            <li>반응형 고려한 구조 설계</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 마크업 및 스타일링</li>
                                            <li>API를 활용한 조회 기능 추가</li>
                                            <li>반응형 고려한 구조 설계</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>사용자 정보, 검색바 컴포넌트 마크업 및 스타일링</li>
                                            <li>API를 활용한 조회 기능 추가</li>
                                            <li>반응형 고려한 구조 설계</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.21 (Day 2) - Wiki 문서작업 (컨벤션 정의 및 브랜치 전략) 및 회의</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ <a href="https://github.com/FRONTENDBOOTCAMP-14th/js-project-team3/wiki/Project-Rule">컨벤션 정의</a></li>
                                    <li>✅ 브랜치 전략</li>
                                    <li>✅ 깃허브 프로젝트 초기 설정</li>
                                    <li>✅ 공통 style.css 설정</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>news 컴포넌트 디자인 및 구현</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>main 디자인 및 기획 작업 완료 (포토샵)</li>
                                            <li>header 컴포넌트 마크업 및 스타일링 완료</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 스타일링</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>공통 api 정리 및 서비스 로직 작성</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.22 (Day 3) - GitHub 작업 방식 및 코드 컨벤션 정의</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ 브랜치 네이밍, PR 템플릿 (작업 개요·변경 요약·체크리스트) 도입으로 리뷰 프로세스 표준화</li>
                                    <li>✅ 반응형 스타일 가이드 회의 (모바일 퍼스트 접근, 브레이크포인트 480 / 768 / 1024 / 1440 px, 공통 CSS 변수)</li>
                                    <li>✅ 전체 레이아웃은 CSS Grid, 컴포넌트 내부 정렬은 Flexbox 활용으로 역할 분리 및 코드 가독성 향상</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>live 컴포넌트 디자인 및 구현</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>footer 컴포넌트 마크업 및 스타일링 완료</li>
                                            <li>main-visual 컴포넌트 마크업 및 스타일링, 애니메이션 구현 완료</li>
                                            <li>team-introduction 컴포넌트 마크업 및 스타일링, 애니메이션 구현 완료</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 기능 추가 및 구현</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>서치바 컨테이너 컴포넌트 마크업</li>
                                            <li>사용자 정보 및 서치바 마크업</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.23 (Day 4) - 마크업 & 스타일링 구현 및 라이브러리 사용 논의</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ 시멘틱 마크업 재검토 (HTML5 태그 활용과 접근성 강화)</li>
                                    <li>✅ 클래스명 구조 block__element--modifier로 일관성 있고 예측 가능한 스타일 관리</li>
                                    <li>✅ 애니메이션은 GSAP 및 플러그인만 사용, 기타 UI 효과는 순수 CSS/JS로 구현 결정</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>news 컴포넌트 리팩토링</li>
                                            <li>live 컴포넌트 리팩토링</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>전적 바로가기 button 마크업 및 스타일링 구현 완료</li>
                                            <li>전적 통계 마크업 및 스타일링 구현 완료</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 상세조회 영역 마크업 및 스타일링</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>서치바 컨테이너 컴포넌트 스타일링</li>
                                            <li>사용자 정보 및 서치바 스타일링</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.24 (Day 5) - 팀 회의를 통한 실무 오류 해결</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ PR 충돌 해결 프로세스</li>
                                    <li>✅ API 호출 방식 표준화 (fetch 함수로 일관된 에러 핸들링 구현)</li>
                                    <li>✅ 429 에러 긴급 대응 (빈번 호출 지점 캐싱 검토)</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>live 컴포넌트 치지직 및 유튜브 오픈 api연동 및 설정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>전적 통계 컴포넌트 API 연동 작업 완료</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 상세조회 영역 기능추가 및 구현</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>린터와 프리티어 기능 추가</li>
                                            <li>코드 컨벤션 추가</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.25 (Day 6) - TEST OPEN API 활용을 위한 코드 리팩토링</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ 호출 횟수 제한 대응 (세션당 동일 요청 1회 로컬 캐싱)</li>
                                    <li>✅ 테스트 api를 구현하기 위한 마크업 수정 및 코드 리팩토링</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>live 컴포넌트 디버깅</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>전적페이지 안내문구 컴포넌트 마크업 및 스타일링 구현</li>
                                            <li>전적 통계 api 연동(코드 수정)</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 디자인 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>린터 에러 수정 및 프리티어 규칙 추가</li>
                                            <li>서치바 컨테이너 컴포넌트 기능추가 및 구현</li>
                                            <li>사용자 정보 및 서치바 기능추가 및 구현</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.28 (Day 7) - 중간점검 및 컨벤션 재정의</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ JS코드 컨벤션 및 Commit & Branch 컨벤션 재정비</li>
                                    <li>✅ Prettier & ESLint 설정</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>컨벤션 기능추가</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>메인비주얼 이미지 변경 및 CSS 수정</li>
                                            <li>메인 버튼 컴포넌트 마크업 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 상세조회 영역 디자인 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>사용자 정보 및 서치바 구조 변경</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.29 (Day 8) - 컴포넌트 병합 및 스타일링 최종 조율</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ SPA 컴포넌트 통합</li>
                                    <li>✅ 스타일링 완성도 점검 (margin 변수 재조정)</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>home 컴포넌트 설계 및 구현</li>
                                            <li>record 컴포넌트 설계 및 구현</li>
                                            <li>score 컴포넌트 설계 및 구현</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>버튼 컴포넌트 마크업 수정</li>
                                            <li>SPA방식으로 구현하기 위해 기존 a태그에서 button 태그로 수정</li>
                                            <li>main-visual 이미지 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 기능 추가 및 오류 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>api키 노출 우려, 보안 고민</li>
                                            <li>네트리파이 서버리스 함수를 도입하여 프록시 서버를 대신 하기로 결정</li>
                                            <li>네트리파이 서버리스 함수 작성 및 netlify.toml 작성</li>
                                            <li>무료 플랜의 경우 서버리스 함수의 실행 위치가 미국 동부인 점으로 인해 api호출 시 물리적 지연 발생. 배포를 vercel에서 할지 고민</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.30 (Day 9) - 배포 환경 최적화 및 API 통합</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ Netlify 배포 환경 구축 및 빌드 오류 해결</li>
                                    <li>✅ 치지직 API 연동 및 에러 디버깅 완료</li>
                                    <li>✅ 반응형 디자인 개선 및 접근성 강화</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>네트리파이 배포 빌드오류 디버깅</li>
                                            <li>치지직 api 에러 디버깅</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>반응형 및 접근성 개선 코드 리팩토링</li>
                                            <li>footer 컴포넌트 CSS 수정</li>
                                            <li>이미지파일 경로 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 상세조회 영역 기능 추가 및 오류 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>네트리파이 서버리스 함수 추가 및 기능 추가</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.07.31 (Day 10) - 서버리스 함수 통합 및 컴포넌트 최적화</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ Netlify 서버리스 함수와 API 연동 로직 통합</li>
                                    <li>✅ 전체 컴포넌트 코드 리뷰 및 성능 최적화</li>
                                    <li>✅ 반응형 기능 추가 및 사용자 경험 개선</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>네트리파이 서버리스 함수 및 api연동 로직 통합</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>작업중인 전체 컴포넌트 코드 리뷰 및 점검</li>
                                            <li>total-statistics 컴포넌트 코드 리팩토링</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 반응형 기능 추가</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>서치바 컨테이너 컴포넌트 반응형 기능추가 및 구현</li>
                                            <li>사용자 정보 및 서치바 반응형 기능추가 및 구현</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.08.01 (Day 11) - 렌더링 방식 개선 및 기능 완성</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ SPA 렌더링 방식 최적화</li>
                                    <li>✅ 배포 환경 API 호출 로직 개선</li>
                                    <li>✅ 전적 통계 및 페이지네이션 기능 완성</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>main.js 렌더링 방식 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>배포환경에서의 api 호출 로직 변경</li>
                                            <li>total-statistics 컴포넌트 구현 완료</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 디자인 수정 및 오류수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>전적리스트 컴포넌트 페이지네이션 추가 및 기능 개선</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.08.02 (Day 12) - 프로젝트 완성 및 발표 준비</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ 프로젝트 전체 코드 점검 및 테스트</li>
                                    <li>✅ 발표 자료 정리 및 문서화</li>
                                    <li>✅ 접근성 개선 및 최종 디자인 완성</li>
                                </ul>
                                <hr>
                                <div class="team-work">
                                    <div class="member">
                                        <h4>👨‍🎨 박민성</h4>
                                        <ul>
                                            <li>프로젝트 전체 코드 점검</li>
                                            <li>발표자료 정리</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 심현보</h4>
                                        <ul>
                                            <li>배포환경에서 템플릿 리터럴 방식으로 js 개선</li>
                                            <li>검색가이드 이미지 작업 후 업로드</li>
                                            <li>total-statisics, main-button 컴포넌트 css 수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👩‍💻 윤정화</h4>
                                        <ul>
                                            <li>상세전적 컴포넌트 기능추가 및 오류수정</li>
                                        </ul>
                                    </div>
                                    <div class="member">
                                        <h4>👨‍🎨 한우창</h4>
                                        <ul>
                                            <li>서치바 컨테이너 컴포넌트 접근성 개선</li>
                                            <li>사용자 정보 및 서치바 접근성 개선</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </details>

                        <details class="scrum-day">
                            <summary>🗓️ 2025.08.03 (Day 13) - 프로젝트 최종 점검</summary>
                            <div class="scrum-details">
                                <hr>
                                <ul class="achievement-list">
                                    <li>✅ 프로젝트 전체 코드 점검 및 최종 테스트</li>
                                </ul>
                                <hr>
                            </div>
                        </details>
                    </div>
                </div>
                <div class="tab-content tab-content--timeline">
                    <div class="timeline-content">
                        <h2>🚀 프로젝트 타임라인</h2>
                        <div class="timeline-container">
                            
                            <div class="timeline-item">
                                <div class="timeline-marker phase-planning"></div>
                                <div class="timeline-content-wrapper">
                                    <div class="timeline-date">2025.07.18 (Day 1)</div>
                                    <div class="timeline-phase">📋 기획 단계</div>
                                    <div class="timeline-title">프로젝트 기획 및 역할 분배</div>
                                    <div class="timeline-description">
                                        넥슨 Open API를 활용한 서든어택 전적 조회 웹사이트 <strong>GGATTACK</strong> 아이디어 확정 및 팀원별 역할 분배 완료
                                    </div>
                                </div>
                            </div>

                            <div class="timeline-item">
                                <div class="timeline-marker phase-design"></div>
                                <div class="timeline-content-wrapper">
                                    <div class="timeline-date">2025.07.21-22 (Day 2-3)</div>
                                    <div class="timeline-phase">⚙️ 설계 단계</div>
                                    <div class="timeline-title">기술 스택 및 컨벤션 정의</div>
                                    <div class="timeline-description">
                                        코딩 컨벤션, Git 전략, 브랜치 전략 수립 및 반응형 스타일 가이드 정의. 
                                        GitHub 프로젝트 초기 설정 및 PR 템플릿 도입으로 협업 체계 구축
                                    </div>
                                </div>
                            </div>

                            <div class="timeline-item">
                                <div class="timeline-marker phase-development"></div>
                                <div class="timeline-content-wrapper">
                                    <div class="timeline-date">2025.07.23-29 (Day 4-8)</div>
                                    <div class="timeline-phase">💻 개발 단계</div>
                                    <div class="timeline-title">컴포넌트 개발 및 API 연동</div>
                                    <div class="timeline-description">
                                        각종 컴포넌트 마크업 및 스타일링 구현. API 호출 방식 표준화 및 429 에러 대응. 
                                        SPA 방식 도입 및 컴포넌트 통합 작업 완료
                                    </div>
                                </div>
                            </div>

                            <div class="timeline-item">
                                <div class="timeline-marker phase-integration"></div>
                                <div class="timeline-content-wrapper">
                                    <div class="timeline-date">2025.07.30-08.01 (Day 9-11)</div>
                                    <div class="timeline-phase">🔗 통합 & 배포 단계</div>
                                    <div class="timeline-title">배포 환경 구축 및 최적화</div>
                                    <div class="timeline-description">
                                        Netlify 서버리스 함수 도입으로 API 보안 강화. 
                                        치지직 API 연동 및 렌더링 방식 최적화. 반응형 기능 추가 완료
                                    </div>
                                </div>
                            </div>

                            <div class="timeline-item">
                                <div class="timeline-marker phase-completion"></div>
                                <div class="timeline-content-wrapper">
                                    <div class="timeline-date">2025.08.02-03 (Day 12-13)</div>
                                    <div class="timeline-phase">✅ 완성 단계</div>
                                    <div class="timeline-title">최종 점검 및 발표 준비</div>
                                    <div class="timeline-description">
                                        프로젝트 전체 코드 점검 및 접근성 개선. 
                                        발표 자료 준비 및 최종 테스트를 통한 프로젝트 완성
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-content tab-content--retrospect">
                    <div class="retrospect-content">
                        <h2>💭 프로젝트 회고</h2>
                        <p class="retrospect-intro">2주간의 여정을 마치며, 팀원들이 말하는 솔직한 이야기</p>
                        
                        <div class="retrospect-grid">
                            
                            <div class="retrospect-card member-pms">
                                <div class="member-header">
                                    <div class="member-avatar">👑</div>
                                    <div class="member-info">
                                        <h3 class="member-name">박민성</h3>
                                        <p class="member-role">Team Leader & Frontend Developer</p>
                                    </div>
                                </div>
                                <div class="retrospect-text">
                                    <h4>😔 아쉬움이 많은 프로젝트</h4>
                                    <p>이번 프로젝트를 마무리하고 그동안을 돌아보면서 간단하게 나의 회고를 정리하자면 <strong>아쉬움이 너무 많은 프로젝트</strong>였다. 초반에 순조롭게 흘러갔다고 생각했던 부분들이 사실 후반부에 가니까 전혀 아니었다.</p>
                                    
                                    <h4>💬 소통의 아쉬움</h4>
                                    <p>일단 가장 큰 아쉬움은 <strong>소통이 원활하지 못한점</strong>인 것같다. 소통 자체를 많이 안한 것이 아니라 소통을 했음에도 서로가 서로의 말과 의견을 정확하게 이해했는지 짚고 넘어가지 못한게 아마 가장 큰 원인이자 실수였다고 생각한다.</p>
                                    
                                    <p>오프라인에서 직접 만나서 이야기를 해도 의사소통에 있어선 오류가 발생하기 쉽다. 그런데 <strong>온라인 환경에서 마이크나 채팅으로 대화를 나눌땐 의사소통의 오류가 발생하기가 쉬움</strong>에도 불구하고 제대로 짚고 넘어가지 못한 부분이 너무 아쉬움에 남는다.</p>
                                    
                                    <h4>⏰ 시간 관리의 어려움</h4>
                                    <p>또 한가지 아쉬운 점은 프로젝트가 기간보다 빨리 마무리되면 +@ 기능의 구현까지 생각하고있었는데 프로젝트 후반부쯤부터 초반부의 스노우볼.. <strong>의사소통의 부재로 인한 문제가 하나 둘 나타나면서 디버깅을 하는데 급급</strong>했다.</p>
                                    
                                    <p>그러다보니 마지막 날까지 디버깅을 하고 추가기능은 커녕 기존의 기획했던 기능들도 겨우 다 완성한 상태란점이다. 뭐 어찌됐든 결국엔 프로젝트를 무사히 완성은 시켰지만 여러모로 아쉬움이 남는건 어쩔수 없는것 같다.</p>
                                    
                                    <h4>🙏 팀장으로서의 감사함</h4>
                                    <p>그리고 아직 많이 부족하지만 그래도 <strong>팀장이라고 믿고 날 따라와준 우창님, 현보님, 정화님에게 참 고맙고</strong> 내게 부족한 부분들을 다른분들이 채워주셔서 더 감사했다. 여러모로 아쉬운점들이 있는 프로젝트였지만 그래도 <strong>좋은 팀원분들을 만나 같이 재밌게 협업을 한 의미있는 시간</strong>이였다고 생각한다.</p>
                                </div>
                            </div>

                            <div class="retrospect-card member-wc">
                                <div class="member-header">
                                    <div class="member-avatar">🧑‍💻</div>
                                    <div class="member-info">
                                        <h3 class="member-name">한우창</h3>
                                        <p class="member-role">FFrontend Developer</p>
                                    </div>
                                </div>
                                <div class="retrospect-text">
                                    <h4>🤔 아쉬웠던 순간들</h4>
                                    <p>이번 프로젝트를 돌아보며 가장 아쉬웠던 순간을 꼽자면, <strong>팀원 간의 소통 부재가 중복 개발로 이어졌을 때</strong>입니다. 각자 맡은 파트에 집중하다 보니 다른 팀원이 어떤 작업을 하고 있는지 세세하게 파악하지 못했고, 나중에 코드를 합치는 과정에서 거의 동일한 기능이 각기 다른 사람에 의해 개발되고 있었다는 사실을 발견했습니다.</p>
                                    
                                    <p>이는 단순한 해프닝을 넘어 허탈감과 함께 프로젝트 전체의 일정 지연으로 이어졌습니다. 우리가 조금만 더 자주 이야기하고 진행 상황을 공유했다면 충분히 막을 수 있었던 문제였기에 아쉬움이 크게 남았습니다.</p>
                                    
                                    <h4>⚡ 업무 병목 현상의 경험</h4>
                                    <p>이러한 소통의 부재는 프로젝트의 구조적인 어려움과 맞물려 더 큰 비효율을 낳았습니다. 특정 기능이 완성되어야만 다음 작업을 시작할 수 있는 업무 병목 현상에 자주 부딪혔던 것입니다. 예를 들어, 앱의 전체적인 뼈대를 갖추는 초기 구조 설계 작업이 예상보다 늦어지자, 이를 기반으로 각자의 기능을 구현해야 했던 몇몇 팀원들이 사실상 손을 놓고 기다려야 하는 상황이 발생했습니다.</p>
                                    
                                    <h4>🎯 다음 프로젝트를 위한 다짐</h4>
                                    <p>다음 프로젝트 경험에 있어서는 <strong>작업 단위를 보다 명확하고 세세하게 나누어</strong>, 주어진 개발 기간을 좀 더 효율적으로 사용할 수 있도록 작업 관리에 신경 써보고 싶다는 점으로 이번 프로젝트를 마무리 짓고 싶습니다.</p>
                                </div>
                            </div>

                            <div class="retrospect-card member-shb">
                                <div class="member-header">
                                    <div class="member-avatar">🎨</div>
                                    <div class="member-info">
                                        <h3 class="member-name">심현보</h3>
                                        <p class="member-role">Frontend Developer</p>
                                    </div>
                                </div>
                                <div class="retrospect-text">
                                    <h4>😰 시작할 때의 두려움</h4>
                                    <p>이번 프로젝트는 <strong>API에 대한 완벽한 이해 없이 시작</strong>하게 되어 부담감과 두려움이 컸습니다. 하지만 팀원분들께서 반복적인 질문에도 흔쾌히 응답해주시고, 함께 고민하며 방향성을 제시해주신 덕분에 맡은 역할을 무사히 마칠 수 있었습니다.</p>
                                    
                                    <h4>🌟 예상치 못한 발견</h4>
                                    <p>API를 직접 다뤄보니, 이전에 어렵게 느껴졌던 <strong>애니메이션 작업들이 오히려 더 쉽게 느껴졌고</strong>, API 로직에 대한 깊이 있는 학습이 되었습니다. 작은 컴포넌트 하나를 작업하는 데에도 많은 시간이 걸리며, 아직 더 공부해야 할 부분들이 많다는 것을 실감했습니다.</p>
                                    
                                    <h4>🤝 협업의 소중함</h4>
                                    <p>이번 경험을 통해 기술적인 성장은 물론, <strong>협업의 중요성</strong>도 크게 느낄 수 있었던 값진 시간이었습니다.</p>
                                </div>
                            </div>

                            <div class="retrospect-card member-yjh">
                                <div class="member-header">
                                    <div class="member-avatar">👩‍💻</div>
                                    <div class="member-info">
                                        <h3 class="member-name">윤정화</h3>
                                        <p class="member-role">Frontend Developer</p>
                                    </div>
                                </div>
                                <div class="retrospect-text">
                                    <h4>🚀 도전의 시작</h4>
                                    <p><strong>API에 대한 이해도가 다소 부족한 상태</strong>에서 프로젝트가 시작되어 API를 제일 피하고 싶었지만, 팀원들과 회의 한 결과 제일 자신없는 API를 계속 다뤄보며 익숙해지는 것이 좋겠다고 생각해 주제를 선정했습니다.</p>
                                    
                                    <h4>🤯 예상과 현실의 차이</h4>
                                    <p>초기에 '생각보다 빠르게 진행되는 것 아니냐', '그럼 +@를 만들어야 하는가'에 대한 논의도 있었는데, 기본적으로 API에 대한 이해도가 너무 낮다보니 겉으로 보기에는 간단해 보이는 기능일지라도 실제로는 <strong>예상치 못한 API데이터의 형태나 처리, UI와의 연동 과정에서 깊은 고민과 시간</strong>이 필요했습니다.</p>
                                    
                                    <h4>💪 성장의 결실</h4>
                                    <p>많은 시간을 들여 문제 해결을 하면서 초기에 해야했던 <strong>API 데이터를 분석해 큰그림 그리는 법과 어떤 변수가 생길지 예측할 수 있는 힘과 해결하는 능력</strong>이 조금은 생긴 것 같습니다.</p>
                                    
                                    <h4>🙏 감사의 마음</h4>
                                    <p>제일 자신없는 부분일지라도 실무에서 제일 중요하다며 주제선정시에 용기를 주고 제가 절때마다 많은 도움을 주신 <strong>용감한 3조 팀원분들과 주말에도 독박육아 해주신 남편</strong>에게 감사합니다.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
    `;
    
    targetElement.innerHTML = html;

    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            this.classList.add("active");
            const tab = this.getAttribute("data-tab");
            document.querySelector(".tab-content--" + tab).classList.add("active");
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            this.classList.add("active");
            const tab = this.getAttribute("data-tab");
            document.querySelector(".tab-content--" + tab).classList.add("active");
        });
    });
});

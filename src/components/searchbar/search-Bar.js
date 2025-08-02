// 로컬 스토리지 키
const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_SEARCHES = 7;

// 최근 검색어 가져오기
function getRecentSearches() {
    const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
}

// 최근 검색어 추가
export function addRecentSearch(nickname) {
    if (!nickname) return;
    let searches = getRecentSearches();
    searches = searches.filter(item => item !== nickname);
    searches.unshift(nickname);
    if (searches.length > MAX_SEARCHES) {
        searches = searches.slice(0, MAX_SEARCHES);
    }
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

// 특정 검색어 삭제
function removeRecentSearch(nickname) {
    let searches = getRecentSearches();
    searches = searches.filter(item => item !== nickname);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

// 모든 검색어 삭제
function clearRecentSearches() {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    renderRecentSearches(); // 검색어 삭제 반영을 위한 렌더링링
}

// 최근 검색어 UI 렌더링
function renderRecentSearches() {
    const previousSearchList = document.querySelector(".previous-search-list");
    if (!previousSearchList) return;

    previousSearchList.innerHTML = ''; // 기존 목록 초기화
    const searches = getRecentSearches();

    if (searches.length > 0) {
        const clearItem = document.createElement('li');
        clearItem.className = 'previous-search-item clear-all-item';
        clearItem.innerHTML = `<span class="previous-search-item__text">최근 기록 삭제</span>`;
        clearItem.addEventListener('click', clearRecentSearches);
        previousSearchList.appendChild(clearItem);

        searches.forEach(nickname => {
            const listItem = document.createElement('li');
            listItem.className = 'previous-search-item';
            listItem.innerHTML = `
                <span class="previous-search-item__text">${nickname}</span>
                <button class="previous-search-item__remove">X</button>
            `;
            // 닉네임 클릭 시 검색
            listItem.querySelector('.previous-search-item__text').addEventListener('click', () => {
                if (window.routeTo) {
                    window.routeTo('score', { nickname });
                }
            });
            // 삭제 버튼 클릭
            listItem.querySelector('.previous-search-item__remove').addEventListener('click', (e) => {
                e.stopPropagation(); 
                removeRecentSearch(nickname);
                renderRecentSearches();
            });
            previousSearchList.appendChild(listItem);
        });
    }
}

export async function renderSearchBar(targetElement) {
    if (!targetElement) return;
    
    const html = `
    <section class="container search-section">
      <button type="button" class="search-form__filter-button">
        상세 검색
      </button>
      <form class="search-form">
        <div class="search-form__input-wrapper">
          <input
            class="search-form__input"
            type="text"
            placeholder="유저 닉네임을 입력해주세요."
          />
          <button
            class="search-form__submit-button"
            type="submit"
            aria-label="검색"
          >
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </form>
      <ul class="previous-search-list"></ul>
    </section>
    `;
    
    targetElement.innerHTML = html;
    
    const searchForm = targetElement.querySelector(".search-form");
    const searchInput = targetElement.querySelector(".search-form__input");
    
    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                if (window.routeTo) {
                    window.routeTo('score', { nickname: searchTerm });
                }
            }
        });
    }
    
    renderRecentSearches();
}

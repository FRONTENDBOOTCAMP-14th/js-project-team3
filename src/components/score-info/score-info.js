function extractBodyContent(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const bodyElement = tempDiv.querySelector("body");
    return bodyElement ? bodyElement.innerHTML : html;
}

export async function renderScoreInfo(targetElement) {
    if (!targetElement) {
        console.error("렌더링할 대상 요소(targetElement)가 유효하지 않습니다.");
        return;
    }

    try {
        const html = `
        <div class="score-info container" role="alert" aria-label="매치 정보 알림">
          <p class="score-info__text">
            <strong class="score-info__text-bold">본 사이트는 바닐라프로젝트를 위한 테스트용 서버입니다.</strong><br />
            최근 전적이 1,000경기를 넘는 경우 매치 정보가 표시되지 않으며, 금일 데이터는 조회되지 않습니다.
          </p>
        </div>
        `;
        
        targetElement.innerHTML = html;
        console.log("score-info.html 내용이 성공적으로 렌더링되었습니다.");

    } catch (error) {
        console.error("score-info.html 렌더링 중 오류 발생:", error);
    }
}
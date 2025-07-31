/* eslint-disable no-console */

function extractBodyContent(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const bodyElement = tempDiv.querySelector("body");
    return bodyElement ? bodyElement.innerHTML : html;
}

export async function renderTotalStatistics(targetElement) {
    if (!targetElement) return;
    
    const html = await fetch("src/components/total-statistics/total-statistics.html").then(function(res) { 
        return res.text(); 
    });
    
    const bodyContent = extractBodyContent(html);
    targetElement.innerHTML = bodyContent;
    
    // 기존 초기화 로직은 DOMContentLoaded 이벤트에서 처리됨
}

// GSAP 전역 변수 선언
/* global gsap */

function extractBodyContent(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const bodyElement = tempDiv.querySelector("body");
    return bodyElement ? bodyElement.innerHTML : html;
}

export async function renderMainVisual(targetElement) {
    if (!targetElement) return;
    
    const html = `
    <section class="main-visual">
        <div class="main-visual__bg"></div>
        <div class="visual container">
            <img class="visual-img01" src="/images/visual-item01.png" alt="서든어택" />
            <img class="visual-img02" src="/images/visual-item02.png" alt="오징어게임 시즌3" />
            <p class="visual-text">
                NETFLIX 오징어 게임 시즌3와의 콜라보레이션 2차 대공개!<br />
                오징어 게임 캐릭터 세트와 스킨 무기, SP와 제작 재료 등 풍성한 보상 획득의 기회!
            </p>
        </div>
    </section>
    `;
    
    targetElement.innerHTML = html;
    
    if (typeof gsap !== "undefined") {
        const tl = gsap.timeline({
            defaults: {
                opacity: 0,
                duration: 1,
                ease: "power2.out",
            },
        });

        tl.from(".main-visual__bg", {
            scale: 1.5,
            duration: 1.3,
        })
        .from(
            ".visual-img01",
            {
                x: -100,
            },
            "-=0.7"
        )
        .from(
            ".visual-img02",
            {
                x: 100,
            },
            "-=0.7"
        )
        .from(
            ".visual-text",
            {
                y: 50,
            },
            "-=0.7"
        );
    }
}

window.addEventListener("DOMContentLoaded", function () {
    if (typeof gsap !== "undefined") {
        const tl = gsap.timeline({
            defaults: {
                opacity: 0,
                duration: 1,
                ease: "power2.out",
            },
        });

        tl.from(".main-visual__bg", {
            scale: 1.5,
            duration: 1.3,
        })
        .from(
            ".visual-img01",
            {
                x: -100,
            },
            "-=0.7"
        )
        .from(
            ".visual-img02",
            {
                x: 100,
            },
            "-=0.7"
        )
        .from(
            ".visual-text",
            {
                y: 50,
            },
            "-=0.7"
        );
    }
});

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
                Team 3보급창고는 "넥슨 OPEN API"를 활용해 "서든어택" 유저의 전적을 조회할 수 있는 웹사이트를 개발<br />
                오징어게임의 스릴 넘치는 세계관을 담아 Black & Pink를 메인 컬러로 설정, 강렬하면서도 대조적인 분위기를 연출!
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

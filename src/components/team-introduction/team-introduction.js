// GSAP 전역 변수 선언
/* global gsap */

function extractBodyContent(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const bodyElement = tempDiv.querySelector('body');
    return bodyElement ? bodyElement.innerHTML : html;
}

export async function renderTeamIntroduction(targetElement) {
    if (!targetElement) return;
    
    const html = await fetch("src/components/team-introduction/team-introduction.html").then(function(res) { 
        return res.text(); 
    });
    
    const bodyContent = extractBodyContent(html);
    targetElement.innerHTML = bodyContent;
  
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({});

        tl.from(".team-member", {
            opacity: 0,
            duration: 1.3,
            ease: "power2.out",
            x: -100,
            stagger: 0.2,
        });
    }
}

window.addEventListener("DOMContentLoaded", function () {
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({});

        tl.from(".team-member", {
            opacity: 0,
            duration: 1.3,
            ease: "power2.out",
            x: -100,
            stagger: 0.2,
        });
    }
});

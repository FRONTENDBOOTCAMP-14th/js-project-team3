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
                    
                </div>
                <div class="tab-content tab-content--scrum">
                    
                </div>
                <div class="tab-content tab-content--timeline">
                  
                </div>
                <div class="tab-content tab-content--retrospect">
                    
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

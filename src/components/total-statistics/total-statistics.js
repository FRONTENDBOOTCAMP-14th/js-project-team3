document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".input-list-item").forEach((li) => {
    li.addEventListener("click", (e) => {
      const input = li.querySelector('.input-item[type="date"]')

      // showPicker 여부로 최신 브라우저인지 확인
      if (input) input.showPicker && input.showPicker()
      else if (input) input.focus()
    })
  })
})

document.addEventListener("DOMContentLoaded", () => {
  // 드롭다운 열기/닫기
  document
    .querySelectorAll(".record-list-item.match-type-list-item")
    .forEach((item) => {
      item.addEventListener("click", function (e) {
        e.stopPropagation()
        const dropdown = this.querySelector(".match-type-list")
        if (dropdown) {
          dropdown.style.display =
            dropdown.style.display === "block" ? "none" : "block"
        }
      })
    })

  // match-item 클릭 시 텍스트 변경 및 드롭다운 닫기
  document
    .querySelectorAll(".match-type-list .match-item")
    .forEach((matchItem) => {
      matchItem.addEventListener("click", function (e) {
        e.stopPropagation()
        const text = this.querySelector(".match-type-text").textContent
        const parent = this.closest(".record-list-item.match-type-list-item")
        if (parent) {
          const label = parent.querySelector(".match-type-label-text")
          if (label) label.textContent = text
          const dropdown = parent.querySelector(".match-type-list")
          if (dropdown) dropdown.style.display = "none"
        }
      })
    })

  // 바깥 클릭 시 드롭다운 닫기
  document.addEventListener("click", () => {
    document.querySelectorAll(".match-type-list").forEach((dropdown) => {
      dropdown.style.display = "none"
    })
  })
})

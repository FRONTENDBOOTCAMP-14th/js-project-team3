window.addEventListener("DOMContentLoaded", () => {
  const tl = gsap.timeline({})

  tl.from(".team-member", {
    opacity: 0,
    duration: 1.3,
    ease: "power2.out",
    x: -100,
    stagger: 0.2,
  })
})

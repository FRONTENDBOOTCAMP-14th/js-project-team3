window.addEventListener("DOMContentLoaded", () => {
  const tl = gsap.timeline({
    defaults: {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    },
  })

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
      ".visual.container p",
      {
        y: 50,
      },
      "-=0.7"
    )
})

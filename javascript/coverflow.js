const swiper = new Swiper(".coverflow-swiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 3,
  loop: false,
  coverflowEffect: {
    rotate: 30,
    stretch: 0,
    depth: 150,
    modifier: 1,
    slideShadows: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

// Ilha mínima: revela elementos [data-revelar] ao entrarem na tela.
// A classe .js é aplicada por um script inline no <head> (evita piscar).
// Com prefers-reduced-motion, o CSS já exibe tudo sem transição.
const els = document.querySelectorAll<HTMLElement>('[data-revelar]');
if (!('IntersectionObserver' in window)) {
  els.forEach((el) => el.classList.add('visivel'));
} else {
  const io = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visivel');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  els.forEach((el) => io.observe(el));
}

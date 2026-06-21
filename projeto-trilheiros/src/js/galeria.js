document.addEventListener("DOMContentLoaded", () => {
  const itens = document.querySelectorAll(".galeria__item");

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("is-visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  itens.forEach((item, indice) => {
    item.style.transitionDelay = `${(indice % 6) * 60}ms`;
    observador.observe(item);
  });
});

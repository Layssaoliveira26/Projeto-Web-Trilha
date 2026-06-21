const dicas = document.querySelectorAll(".dica");

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("is-visible");
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.2 },
);

dicas.forEach((dica) => observador.observe(dica));

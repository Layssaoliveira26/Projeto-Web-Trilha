const variaveisCssUrl = new URL("./styles/variaveis.css", import.meta.url);
const variaveisLink = document.createElement("link");
variaveisLink.rel = "stylesheet";
variaveisLink.href = variaveisCssUrl.href;
document.head.appendChild(variaveisLink);

const navbarHtmlUrl = new URL("./components/navbar.html", import.meta.url);
const navbarCssUrl = new URL("./styles/navbar.css", import.meta.url);
const footerHtmlUrl = new URL("./components/footer.html", import.meta.url);
const footerCssUrl = new URL("./styles/footer.css", import.meta.url);
import { calcularDistanciasDosCards } from "./pages/trilhas_famosas/trilhasfamosas.js";

async function initNavbar() {
  const container = document.getElementById("navbar-container");
  if (!container) {
    console.error("Erro: elemento 'navbar-container' não encontrado no HTML!");
    return;
  }

  try {
    if (!document.querySelector('link[href*="Material+Symbols+Outlined"]')) {
      const iconLink = document.createElement("link");
      iconLink.rel = "stylesheet";
      iconLink.href =
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0";
      document.head.appendChild(iconLink);
    }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = navbarCssUrl.href;
    document.head.appendChild(cssLink);

    const response = await fetch(navbarHtmlUrl.href);
    if (!response.ok) {
      throw new Error(
        `Falha ao carregar navbar: ${response.status} ${response.statusText}`,
      );
    }

    container.innerHTML = await response.text();
    const menuToggle = container.querySelector(".menu-toggle");
    const navbar = container.querySelector(".navbar");
    if (menuToggle && navbar) {
      menuToggle.addEventListener("click", () => {
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!expanded));
        const icon = menuToggle.querySelector(".material-symbols-outlined");
        if (icon) {
          icon.textContent = expanded ? "menu" : "close";
        }
        navbar.classList.toggle("nav-open");
      });
    }

    console.log("Navbar injetado com sucesso");
  } catch (error) {
    console.error("Erro ao carregar navbar:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavbar);
} else {
  initNavbar();
}

const trilhasHtmlUrl = new URL("./pages/trilhas_famosas/trilhasfamosas.html", import.meta.url);
const trilhasCssUrl = new URL("./styles/trilhasfamosas.css", import.meta.url);

async function initTrilhas() {
  const container = document.getElementById("secao-trilhas");
  if (!container) {
    console.error("Erro: elemento 'secao-trilhas' não encontrado no HTML!");
    return;
  }

  try {
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = trilhasCssUrl.href;
    document.head.appendChild(cssLink);

    const response = await fetch(trilhasHtmlUrl.href);
    if (!response.ok) {
      throw new Error(`Falha ao carregar trilhas: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const conteudo = doc.querySelector(".tf-trilhas");

    if (!conteudo) {
      throw new Error('Seção ".tf-trilhas" não encontrada em trilhasfamosas.html');
    }

    container.innerHTML = conteudo.outerHTML;
    calcularDistanciasDosCards();
    console.log("Trilhas injetadas com sucesso");
  } catch (error) {
    console.error("Erro ao carregar trilhas:", error);
  }
}

document.addEventListener("DOMContentLoaded", initTrilhas);

const timelineHtmlUrl = new URL("./pages/timeline/timeline.html", import.meta.url);
const timelineCssUrl = new URL("./styles/timeline.css", import.meta.url);

async function initTimeline() {
  const container = document.getElementById("secao-timeline");
  if (!container) {
    console.error("Erro: elemento 'secao-timeline' não encontrado no HTML!");
    return;
  }

  try {
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = timelineCssUrl.href;
    document.head.appendChild(cssLink);

    const response = await fetch(timelineHtmlUrl.href);
    if (!response.ok) {
      throw new Error(`Falha ao carregar timeline: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const conteudo = doc.querySelector(".tl-historia");

    if (!conteudo) {
      throw new Error('Seção ".tl-historia" não encontrada em timeline.html');
    }

    container.innerHTML = conteudo.outerHTML;
    animarTimeline();
    console.log("Timeline injetada com sucesso");
  } catch (error) {
    console.error("Erro ao carregar timeline:", error);
  }
}

document.addEventListener("DOMContentLoaded", initTimeline);

async function initFooter() {
  const container = document.getElementById("footer-container");
  if (!container) {
    console.error("Erro: elemento 'footer-container' não encontrado no HTML!");
    return;
  }

  try {
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = footerCssUrl.href;
    document.head.appendChild(cssLink);

    const response = await fetch(footerHtmlUrl.href);
    if (!response.ok) {
      throw new Error(`Falha ao carregar footer: ${response.status} ${response.statusText}`);
    }

    container.innerHTML = await response.text();
    console.log("Footer injetado com sucesso");
  } catch (error) {
    console.error("Erro ao carregar footer:", error);
  }
}

document.addEventListener("DOMContentLoaded", initFooter);

function animarTimeline() {
  const linha = document.querySelector('.tl-timeline__linha');
  const nodos = document.querySelectorAll('.tl-timeline__nodo');
  const itens = document.querySelectorAll('.tl-timeline__item');

  const observadorLinha = new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting) {
      linha.classList.add('visivel');
      observadorLinha.disconnect();
    }
  }, { threshold: 0.1 });

  observadorLinha.observe(linha);

  const observadorItens = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');

        const indice = [...itens].indexOf(entrada.target);
        const nodo = nodos[indice];
        if (nodo) {
          setTimeout(() => nodo.classList.add('visivel'), 200);
        }

        observadorItens.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.3 });

  itens.forEach(item => observadorItens.observe(item));
}
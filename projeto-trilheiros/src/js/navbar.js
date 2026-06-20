const navbarHtmlUrl = new URL("../components/navbar.html", import.meta.url);
const navbarCssUrl = new URL("../css/navbar.css", import.meta.url);

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

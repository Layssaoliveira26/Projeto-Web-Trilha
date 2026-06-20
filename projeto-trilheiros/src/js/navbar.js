const navbarHtmlUrl = new URL("../components/navbar.html", import.meta.url);
const navbarCssUrl = new URL("../css/navbar.css", import.meta.url);

async function initNavbar() {
  const container = document.getElementById("navbar-container");
  if (!container) {
    console.error("Erro: elemento 'navbar-container' não encontrado no HTML!");
    return;
  }

  try {
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

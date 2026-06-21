import { trilhas } from "../../mocks/trilhas-mock.js";

function getClasseDificuldade(dificuldade) {
    const mapa = {
        "Fácil": "badge-facil",
        "Média": "badge-media",
        "Difícil": "badge-dificil"
    };

    return mapa[dificuldade] || "badge-facil"; // fallback caso venha algo inesperado
}

function criarCard(trilha) {
    const card = document.createElement("div");
    card.classList.add("card");

    const classeBadge = getClasseDificuldade(trilha.dificuldade);

    card.innerHTML = `
        <div class="card-imagem">
            <img src="${trilha.imagem}" alt="${trilha.nome}">
            <span class="badge-dificuldade ${classeBadge}">${trilha.dificuldade.toUpperCase()}</span>
        </div>
        <div class="area-card-texto">
            <span class="localizacao">${trilha.cidade.toUpperCase()} · ${trilha.estado}</span>
            <p class="titulo-trilha">${trilha.nome}</p>

            <hr>

            <div class="info-trilha">
                <div class="info-item">
                    <strong>${trilha.distancia}</strong>
                    <span>DISTÂNCIA</span>
                </div>
                <div class="info-item">
                    <strong>${trilha.duracao}</strong>
                    <span>DURAÇÃO</span>
                </div>
                <div class="info-item">
                    <strong>${trilha.altitude}</strong>
                    <span>ALTITUDE</span>
                </div>
            </div>

            <p class="descricao">${trilha.descricao}</p>

            <a href="${trilha.linkMapa}" target="_blank" class="localizacao-maps">
                <img src="/src/assets/mapa.png" class="img-mapa" alt="">
                <span>Ver no mapa</span>
            </a>
        </div>
    `;

    return card;
}

function renderizarCards(lista) {
    const container = document.querySelector(".cards-trilhas");
    container.innerHTML = "";

    lista.forEach(trilha => {
        const card = criarCard(trilha);
        container.appendChild(card);
    });
}

document.querySelectorAll(".p-nivel").forEach(botao => {
    botao.addEventListener("click", () => {
        const nivel = botao.textContent.trim();

        if (nivel === "Todas") {
            renderizarCards(trilhas);
            botao.classList.add("ativo");
        } else {
            const filtradas = trilhas.filter(t => t.dificuldade === nivel);
            renderizarCards(filtradas);
            botao.classList.add("ativo");
        }
    });
});

renderizarCards(trilhas);
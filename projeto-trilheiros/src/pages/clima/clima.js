import { trilhas as trilhasMock } from "../../mocks/trilhas-mock.js";

const trilhas = trilhasMock.map(({ id, nome, imagem, dificuldade }) => ({
  id,
  nome,
  imagem,
  dificuldade,
}));

let PREVISAO_SEMANA = [];

const QUIXADA_COORDS = {
  latitude: -4.97139,
  longitude: -39.01528,
  timezone: "America/Fortaleza",
};

function gerarPrevisaoHoras(condicao) {
  if (condicao === "sol") {
    return Array.from({ length: 24 }, (_, hora) => {
      if (hora < 6) return { emoji: "🌙", temp: 21 + (hora % 2) };
      if (hora < 10) return { emoji: "🌤️", temp: 24 + Math.min(3, hora - 6) };
      if (hora < 18) return { emoji: "☀️", temp: 28 + Math.min(6, hora - 10) };
      return { emoji: "🌤️", temp: 34 - Math.min(7, hora - 18) };
    });
  }

  if (condicao === "sol-nuvem") {
    return Array.from({ length: 24 }, (_, hora) => {
      if (hora < 6) return { emoji: "🌙", temp: 20 + (hora % 2) };
      if (hora < 10) return { emoji: "🌥️", temp: 22 + Math.min(2, hora - 6) };
      if (hora < 18) return { emoji: "⛅", temp: 25 + Math.min(4, hora - 10) };
      return { emoji: "🌥️", temp: 29 - Math.min(5, hora - 18) };
    });
  }

  if (condicao === "noite") {
    return Array.from({ length: 24 }, (_, hora) => ({
      emoji: "🌙",
      temp: 20 + Math.min(2, hora % 6),
    }));
  }

  if (condicao === "nevoa") {
    return Array.from({ length: 24 }, (_, hora) => {
      if (hora < 10) return { emoji: "🌫️", temp: 21 + Math.min(2, hora) };
      return { emoji: "🌫️", temp: 23 + Math.min(2, hora - 10) };
    });
  }

  return Array.from({ length: 24 }, (_, hora) => {
    if (hora < 6) return { emoji: "🌧️", temp: 20 + (hora % 2) };
    if (hora < 12) return { emoji: "🌧️", temp: 21 + Math.min(2, hora - 6) };
    if (hora < 18) return { emoji: "🌧️", temp: 22 + Math.min(3, hora - 12) };
    return { emoji: "🌧️", temp: 23 - Math.min(2, hora - 18) };
  });
}

function mapWeatherCodeToCondicao(code, isDay = true) {
  if ([95, 96, 99].includes(code))
    return { condicao: "tempestade", emoji: isDay ? "⛈️" : "🌩️" };
  if ([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { condicao: "chuva", emoji: "🌧️" };
  if ([45, 48].includes(code)) return { condicao: "nevoa", emoji: "🌫️" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { condicao: "chuva", emoji: "🌨️" };
  if ([0, 1].includes(code))
    return { condicao: isDay ? "sol" : "noite", emoji: isDay ? "☀️" : "🌙" };
  if ([2, 3].includes(code))
    return {
      condicao: isDay ? "sol-nuvem" : "noite",
      emoji: isDay ? "⛅" : "☁️",
    };
  return {
    condicao: isDay ? "sol-nuvem" : "noite",
    emoji: isDay ? "⛅" : "☁️",
  };
}

function formatarHoraLabel(hora) {
  return `${String(hora).padStart(2, "0")}:00`;
}

async function carregarPrevisaoQuixada() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${QUIXADA_COORDS.latitude}&longitude=${QUIXADA_COORDS.longitude}&timezone=${encodeURIComponent(QUIXADA_COORDS.timezone)}&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao buscar previsão");

    const data = await response.json();
    const horas = data.hourly.time.map((time, index) => ({
      time,
      temp: data.hourly.temperature_2m[index],
      code: data.hourly.weather_code[index],
      isDay: data.hourly.is_day[index],
    }));

    PREVISAO_SEMANA = data.daily.time.map((dia, index) => {
      const diario = mapWeatherCodeToCondicao(
        data.daily.weather_code[index],
        true,
      );
      const horasDia = horas
        .filter((item) => item.time.startsWith(dia))
        .slice(0, 24);
      const tempMax = Math.round(data.daily.temperature_2m_max[index]);
      const tempMin = Math.round(data.daily.temperature_2m_min[index]);
      const favoravel =
        diario.condicao !== "chuva" &&
        diario.condicao !== "tempestade" &&
        diario.condicao !== "nevoa";

      return {
        favoravel,
        condicao: diario.condicao,
        tempMax,
        tempMin,
        horarioSaida: favoravel ? "06:00" : null,
        trilhaId: favoravel ? index + 1 : null,
        horas: horasDia.map((item) => {
          const mapeado = mapWeatherCodeToCondicao(item.code, item.isDay === 1);
          return {
            emoji: mapeado.emoji,
            temp: Math.round(item.temp),
          };
        }),
      };
    });

    renderizarGrid();
  } catch (error) {
    console.error("Erro ao buscar previsão de Quixadá:", error);
    PREVISAO_SEMANA = [];
    renderizarGrid();
  }
}

const DIAS_SEMANA = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const MESES = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

function gerarDatas() {
  const hoje = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    return `${d.getDate()} DE ${MESES[d.getMonth()]}`;
  });
}

function gerarDiasSemana() {
  const hoje = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    return DIAS_SEMANA[d.getDay() === 0 ? 6 : d.getDay() - 1];
  });
}

function svgSol(size = 44) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="11" fill="#D87A0F" opacity="0.92"/>
    <g stroke="#D87A0F" stroke-width="3" stroke-linecap="round">
      <line x1="32" y1="7"  x2="32" y2="15"/>
      <line x1="32" y1="49" x2="32" y2="57"/>
      <line x1="7"  y1="32" x2="15" y2="32"/>
      <line x1="49" y1="32" x2="57" y2="32"/>
      <line x1="14" y1="14" x2="19.8" y2="19.8"/>
      <line x1="44.2" y1="44.2" x2="50" y2="50"/>
      <line x1="50"  y1="14"  x2="44.2" y2="19.8"/>
      <line x1="19.8" y1="44.2" x2="14" y2="50"/>
    </g>
  </svg>`;
}

function svgSolNuvem(size = 44) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="9" fill="#D87A0F" opacity="0.88"/>
    <g stroke="#D87A0F" stroke-width="2.5" stroke-linecap="round">
      <line x1="24" y1="9"  x2="24" y2="14"/>
      <line x1="9"  y1="24" x2="14" y2="24"/>
      <line x1="13.4" y1="13.4" x2="17" y2="17"/>
    </g>
    <path d="M44 42a12 12 0 0 0-21.2-7.5A7.5 7.5 0 1 0 22 50h22a7.5 7.5 0 0 0 0-8z" fill="#C5BFB5" opacity="0.75"/>
  </svg>`;
}

function svgChuva(size = 44) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M46 36a15 15 0 1 0-26.6-9.4A9.5 9.5 0 1 0 19 46h27a9.5 9.5 0 0 0 0-10z" fill="#9EAAB5" opacity="0.6"/>
    <g stroke="#5A7A8A" stroke-width="2.5" stroke-linecap="round">
      <line x1="22" y1="51" x2="20" y2="58"/>
      <line x1="30" y1="51" x2="28" y2="58"/>
      <line x1="38" y1="51" x2="36" y2="58"/>
      <line x1="46" y1="51" x2="44" y2="58"/>
    </g>
  </svg>`;
}

function svgPorCondicao(condicao, size = 44) {
  if (condicao === "chuva") return svgChuva(size);
  if (condicao === "nevoa") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42 36a12 12 0 0 0-22.7-5.6A8.4 8.4 0 0 0 15 38h27a7.7 7.7 0 0 0 0-2Z" fill="#B7B3AA"/>
      <path d="M18 46h30" stroke="#8A8A8A" stroke-width="3" stroke-linecap="round"/>
      <path d="M18 52h22" stroke="#A7A7A7" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }
  if (condicao === "tempestade") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43 35a13 13 0 0 0-24-7.8A8 8 0 0 0 18 42h25a8 8 0 0 0 0-7Z" fill="#8D99A6"/>
      <path d="m31 18 7 12h-5l5 10-11-8h5l-6-14h5Z" fill="#D87A0F"/>
    </svg>`;
  }
  if (condicao === "noite") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M45 24a18 18 0 0 1-15 27 18 18 0 1 1 9.1-33.8A19.6 19.6 0 0 1 45 24Z" fill="#D8A63A"/>
    </svg>`;
  }
  if (condicao === "sol-nuvem") return svgSolNuvem(size);
  return svgSol(size);
}

function svgMiniPorEmoji(emoji, size = 18) {
  if (emoji === "🌧️") return svgChuva(size);
  if (emoji === "🌨️") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42 36a12 12 0 0 0-22.7-5.6A8.4 8.4 0 0 0 15 38h27a7.7 7.7 0 0 0 0-2Z" fill="#A7B2BE"/>
      <path d="M28 17v8M28 29v8M24 21l8 4M24 35l8 4M32 21l-8 4M32 35l-8 4" stroke="#6B7A8A" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }
  if (emoji === "🌫️") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42 36a12 12 0 0 0-22.7-5.6A8.4 8.4 0 0 0 15 38h27a7.7 7.7 0 0 0 0-2Z" fill="#B7B3AA"/>
      <path d="M20 46h24" stroke="#8A8A8A" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 52h18" stroke="#A7A7A7" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }
  if (emoji === "🌙") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42 22a18 18 0 0 1-15 27 18 18 0 1 1 9.1-33.8A20 20 0 0 0 42 22Z" fill="#D8A63A"/>
    </svg>`;
  }
  if (emoji === "⛈️") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43 35a13 13 0 0 0-24-7.8A8 8 0 0 0 18 42h25a8 8 0 0 0 0-7Z" fill="#8D99A6"/>
      <path d="m31 19 7 12h-5l5 10-11-8h5l-6-14h5Z" fill="#D87A0F"/>
    </svg>`;
  }
  if (emoji === "⛅" || emoji === "🌤️" || emoji === "🌥️")
    return svgSolNuvem(size);
  return svgSol(size);
}

function montarCard(previsao, diaLabel, dataLabel, trilha) {
  const favoravel = previsao.favoravel;
  const previsaoHoras =
    Array.isArray(previsao.horas) && previsao.horas.length > 0
      ? previsao.horas
      : gerarPrevisaoHoras(previsao.condicao);

  const horasHTML = previsaoHoras
    .map(
      (ponto, i) => `
      <div class="cl-card__hora-item">
        <span class="cl-card__hora-horario">${formatarHoraLabel(i)}</span>
        <div class="cl-card__hora-icone">
          ${svgMiniPorEmoji(ponto.emoji, 18)}
        </div>
        <span class="cl-card__hora-temp">${ponto.temp}°</span>
      </div>
    `,
    )
    .join("");

  const fotoHTML =
    favoravel && trilha
      ? `
    <div class="cl-card__foto">
      <img src="${trilha.imagem}" alt="${trilha.nome}" loading="lazy"
           onerror="this.style.display='none';this.parentElement.style.background='#2D2A26'">
      <div class="cl-card__foto-overlay">
        <span class="cl-card__nome-trilha">${trilha.nome}</span>
        <p class="cl-card__horario">Saída: <strong>${previsao.horarioSaida}</strong></p>
      </div>
    </div>
  `
      : `
    <div class="cl-card__foto cl-card__foto--mensagem">
      <div class="cl-card__mensagem">
        <span class="cl-card__mensagem-texto">Trilha não recomendada para este dia.</span>
      </div>
    </div>
  `;

  return `
    <article class="cl-card ${favoravel ? "cl-card--favoravel" : "cl-card--ruim"}"
             data-favoravel="${favoravel}">
      <div class="cl-card__topo">
        <span class="cl-card__dia">${diaLabel}</span>
        <span class="cl-card__data">${dataLabel}</span>
      </div>
      <div class="cl-card__clima">
        <div class="cl-card__icone-wrap">${svgPorCondicao(previsao.condicao)}</div>
        <div class="cl-card__temp">
          <span class="cl-card__temp-max">${previsao.tempMax}°</span>
          <div class="cl-card__temp-sep"></div>
          <span class="cl-card__temp-min">${previsao.tempMin}°</span>
        </div>
      </div>
      <div class="cl-card__horas-nav">
        <button class="cl-card__seta cl-card__seta--prev" type="button" aria-label="Ver horário anterior">‹</button>
        <div class="cl-card__horas">${horasHTML}</div>
        <button class="cl-card__seta cl-card__seta--next" type="button" aria-label="Ver próximo horário">›</button>
      </div>
      <span class="cl-card__badge ${favoravel ? "cl-card__badge--ok" : "cl-card__badge--ruim"}">
        ${favoravel ? "✓ Favorável" : "✕ Desfavorável"}
      </span>
      ${fotoHTML}
    </article>
  `;
}

function atualizarBadge() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, "0");
  const mins = String(agora.getMinutes()).padStart(2, "0");
  const badge = document.getElementById("badgeAtualizacao");
  if (!badge) return;
  badge.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
    Última atualização: ${horas}:${mins}
  `;
}

function renderizarGrid() {
  const grid = document.getElementById("gridSemana");
  if (!grid) return;

  const datas = gerarDatas();
  let html = "";

  const diasSemana = gerarDiasSemana();
  const previsoes =
    PREVISAO_SEMANA.length > 0
      ? PREVISAO_SEMANA
      : Array.from({ length: 7 }, (_, i) => ({
          favoravel: i % 2 === 0,
          condicao: i % 2 === 0 ? "sol" : "chuva",
          tempMax: 31 + i,
          tempMin: 20 + i,
          horarioSaida: i % 2 === 0 ? "06:00" : null,
          trilhaId: i % 2 === 0 ? i + 1 : null,
          horas: gerarPrevisaoHoras(i % 2 === 0 ? "sol" : "chuva"),
        }));

  previsoes.forEach((prev, i) => {
    const trilha = prev.trilhaId
      ? trilhas.find((t) => t.id === prev.trilhaId) ||
        trilhas[i % trilhas.length]
      : trilhas[i % trilhas.length];
    html += montarCard(prev, diasSemana[i], datas[i], trilha);
  });

  grid.innerHTML = html;
  iniciarCarrosselHoras();
}

function iniciarCarrosselHoras() {
  document.querySelectorAll(".cl-card__horas-nav").forEach((nav) => {
    const scroller = nav.querySelector(".cl-card__horas");
    const prev = nav.querySelector(".cl-card__seta--prev");
    const next = nav.querySelector(".cl-card__seta--next");

    if (!scroller || !prev || !next) return;

    const getStep = () => {
      const item = scroller.querySelector(".cl-card__hora-item");
      if (!item) return 64;
      const style = window.getComputedStyle(item);
      const gap = Number.parseFloat(
        style.marginRight || style.columnGap || style.gap || 8,
      );
      return item.getBoundingClientRect().width + gap;
    };

    prev.addEventListener("click", () => {
      scroller.scrollBy({ left: -getStep(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      scroller.scrollBy({ left: getStep(), behavior: "smooth" });
    });
  });
}

function iniciarToggle() {
  const toggle = document.getElementById("toggleFavoraveis");
  if (!toggle) return;

  toggle.addEventListener("change", () => {
    const cards = document.querySelectorAll(".cl-card[data-favoravel='false']");
    cards.forEach((c) => {
      c.style.display = toggle.checked ? "none" : "";
    });
  });
}

function iniciarAtualizacao() {
  atualizarBadge();
  setInterval(
    () => {
      atualizarBadge();
      carregarPrevisaoQuixada();
    },
    30 * 60 * 1000,
  );
}

document.addEventListener("DOMContentLoaded", () => {
  carregarPrevisaoQuixada();
  iniciarToggle();
  iniciarAtualizacao();
});

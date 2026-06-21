const trilhas = {
    cruzeiro: { 
        lat: -4.9688, 
        lon: -39.0141, 
        id: 'distancia-pedra-cruzeiro' 
    },
    galinha: { 
        lat: -4.9818, 
        lon: -39.0135, 
        id: 'distancia-galinha-choca' 
    },
    psicose: { 
        lat: -4.9855, 
        lon: -39.0238, 
        id: 'distancia-pedra-psicose' 
    }
};

// Fórmula de Haversine (calcula distância linear em km)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return (R * c).toFixed(1); 
}

function calcularDistanciasDosCards() {
    if ("geolocation" in navigator) {
        
        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                const userLat = posicao.coords.latitude;
                const userLon = posicao.coords.longitude;

                for (const chave in trilhas) {
                    const trilha = trilhas[chave];
                    const el = document.getElementById(trilha.id);
                    
                    if (el) {
                        const distancia = calcularDistancia(userLat, userLon, trilha.lat, trilha.lon);
                        el.innerText = `Distância: ${distancia} km`;
                    }
                }
            },
            (erro) => {
                console.warn("Usuário negou o GPS ou ocorreu um erro.");
                
                for (const chave in trilhas) {
                    const el = document.getElementById(trilhas[chave].id);
                    if (el) el.innerText = "Distância: --";
                }
            }
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    calcularDistanciasDosCards();
});
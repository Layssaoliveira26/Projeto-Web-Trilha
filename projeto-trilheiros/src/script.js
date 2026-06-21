document.addEventListener('DOMContentLoaded', () => {
    
    const btnInscrever = document.querySelector('.btn-primary');
    if(btnInscrever) {
        btnInscrever.addEventListener('click', () => {
            alert('Abertura de modal de inscrição em breve!');
        });
    }

    iniciarRastreio();
});

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

// Função matemática para calcular a distância (Fórmula de Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c; 
    
    return distancia.toFixed(1); 
}

function iniciarRastreio() {
    if ("geolocation" in navigator) {
        
        navigator.geolocation.watchPosition(
            (posicao) => {
                const userLat = posicao.coords.latitude;
                const userLon = posicao.coords.longitude;

                for (const chave in trilhas) {
                    const trilha = trilhas[chave];
                    const elementoDistancia = document.getElementById(trilha.id);
                    
                    if (elementoDistancia) {
                        const distanciaKm = calcularDistancia(userLat, userLon, trilha.lat, trilha.lon);
                        elementoDistancia.innerHTML = `Distância : ${distanciaKm} km`;
                    }
                }
            },
            (erro) => {
                console.error("Erro ao obter localização:", erro);

                for (const chave in trilhas) {
                    const el = document.getElementById(trilhas[chave].id);
                    if(el) el.innerHTML = "Distância: --";
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 60000
            }
        );
    } else {
        console.warn("GPS não suportado.");
    }
}
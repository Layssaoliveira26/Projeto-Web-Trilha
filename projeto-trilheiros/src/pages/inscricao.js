document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".forms form");
    const inputTelefone = document.getElementById("telefone");

    if (inputTelefone) {
        inputTelefone.addEventListener("input", function (e) {
            let valor = e.target.value.replace(/\D/g, '');
            valor = valor.substring(0, 11);
            let formatado = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
            formatado = formatado.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = formatado;
        });
    }

    if (form) {
        form.addEventListener("submit", async function (evento) {
            evento.preventDefault();

            const formData = new FormData(form);
            //LEMEBTRETE : o metodo Object.fromEntries() transforma um array de pares chave-valor em um objeto.
            const dadosInscricao = Object.fromEntries(formData.entries());

            try {
                //API FAKE PARA TESTE DE ENVIO DE DADOS
                const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    //LEMEBRETE: metodo JSON.stringify() converte um objeto JavaScript em uma string JSON.
                    body: JSON.stringify(dadosInscricao)
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const resultado = await response.json();
                
                console.log("Inscrição confirmada:", resultado);
                alert(`Inscrição de ${dadosInscricao.name} realizada com sucesso!`);
                form.reset();

            } catch (error) {
                console.error("Falha ao enviar inscrição:", error);
                alert("Ocorreu um erro ao processar sua inscrição. Tente novamente.");
            }
        });
    }
});
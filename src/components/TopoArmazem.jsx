
import React, { useState, useEffect, useRef } from 'react';
import armazemDataLoader from '../utils/armazemDataLoader';
import "bootstrap/dist/css/bootstrap.min.css";

const TopoArmazem = ({ onArcoSelecionado, arcoAtual, onFecharTopo }) => {
    const containerRef = useRef(null);
    const [dadosPendulos, setDadosPendulos] = useState(null);
    const [arcoSelecionado, setArcoSelecionado] = useState(1);
    const [celulaSelecionada, setCelulaSelecionada] = useState(1);
    const [layoutTopo, setLayoutTopo] = useState(null);
    const [dadosTopo, setDadosTopo] = useState(null);
    const [carregando, setCarregando] = useState(true);

    // Carregar e processar dados
    useEffect(() => {
        const processarDados = async () => {
            try {
                setCarregando(true);
                
                // Carregar dados do JSON (simulando API)
                const dadosJSON = await armazemDataLoader.carregarDados();
                
                if (!armazemDataLoader.validarEstrutura(dadosJSON)) {
                    throw new Error('Estrutura de dados inválida');
                }
                
                // Processar dados para o componente de topo
                const dadosProcessados = armazemDataLoader.processarParaTopo(dadosJSON);
                
                setDadosPendulos(dadosProcessados.sensores);
                setDadosTopo(dadosProcessados.sensores);
                setLayoutTopo(dadosProcessados.layout);
                
            } catch (error) {
                console.error('Erro ao processar dados:', error);
                
                // Usar layout automático como fallback
                const dadosFallback = armazemDataLoader.getDadosFallback();
                const layoutFallback = gerarLayoutAutomatico({ "1": [false, false, true, 25] });
                setLayoutTopo(layoutFallback);
            } finally {
                setCarregando(false);
            }
        };

        processarDados();
    }, []);

    // Atualizar quando arco atual mudar
    useEffect(() => {
        if (arcoAtual && arcoAtual !== arcoSelecionado) {
            setArcoSelecionado(arcoAtual);
            if (layoutTopo && layoutTopo[arcoAtual]) {
                setCelulaSelecionada(layoutTopo[arcoAtual].celula);
            }
        }
    }, [arcoAtual, layoutTopo]);

    // Atualizar SVG quando dados mudarem
    useEffect(() => {
        if (!layoutTopo || !dadosTopo || !containerRef.current) return;
        
        criarSVGTopo();
        atualizarVisualizacao();
    }, [layoutTopo, dadosTopo, arcoSelecionado, celulaSelecionada]);

    function gerarLayoutAutomatico(pendulos) {
        const totalPendulos = Object.keys(pendulos).length;
        const pendulosPorArco = 3;
        const totalArcos = Math.ceil(totalPendulos / pendulosPorArco);
        
        const layout = {
            celulas: {
                tamanho_svg: [600, 388],
                fundo: [5, 49, 590, 256],
                "1": [10, 50, 188, 254],
                "2": [207, 50, 186, 254], 
                "3": [402, 50, 188, 254]
            },
            aeradores: {
                "1": [65, 0, 1], "2": [154, 0, 1], "3": [240, 0, 1], "4": [329, 0, 1], "5": [416, 0, 1],
                "6": [65, 305, 0], "7": [154, 305, 0], "8": [240, 305, 0], "9": [329, 305, 0], "10": [416, 305, 0]
            }
        };

        // Distribuir arcos entre as 3 células
        const arcosParaCelula = Math.ceil(totalArcos / 3);
        
        // Distribuir pêndulos em arcos com posicionamento alternado
        const pendulosArray = Object.entries(pendulos);
        let posX = 30;
        const espacamentoArco = 30;
        
        for (let arco = 1; arco <= totalArcos; arco++) {
            // Determinar qual célula (1, 2 ou 3)
            let celula;
            if (arco <= arcosParaCelula) celula = 1;
            else if (arco <= arcosParaCelula * 2) celula = 2;
            else celula = 3;
            
            const pendulosDoArco = pendulosArray.slice((arco - 1) * pendulosPorArco, arco * pendulosPorArco);
            
            const sensores = {};
            pendulosDoArco.forEach(([id], index) => {
                // Alternância de posição: arcos ímpares para cima, pares para baixo
                let posY;
                if (arco % 2 === 1) {
                    // Arcos ímpares: posições mais para cima
                    posY = 80 + (index * 40);
                } else {
                    // Arcos pares: posições mais para baixo
                    posY = 140 + (index * 40);
                }
                sensores[id] = posY;
            });

            layout[arco] = {
                celula: celula,
                pos_x: posX,
                sensores: sensores
            };

            posX += espacamentoArco;
        }

        return layout;
    }

    function criarSVGTopo() {
        const container = containerRef.current;
        const svgExistente = container.querySelector("#des_topo_armazem");
        if (svgExistente) svgExistente.remove();

        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgEl.setAttribute("id", "des_topo_armazem");
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "750px");
        svgEl.setAttribute("viewBox", `0 0 ${layoutTopo.celulas.tamanho_svg[0]} ${layoutTopo.celulas.tamanho_svg[1]}`);
        svgEl.setAttribute("style", "background: #f8f9fa; border-radius: 8px; shape-rendering:geometricPrecision; text-rendering:geometricPrecision;");

        container.appendChild(svgEl);

        // Desenhar elementos na ordem correta
        desenharFundo();
        desenharCelulas();
        desenharArcos();
        desenharAeradores();
        
        // Adicionar eventos
        adicionarEventosClique();
    }

    function desenharFundo() {
        const svgEl = document.getElementById("des_topo_armazem");
        const fundo = layoutTopo.celulas.fundo;

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("id", "rec_celula0");
        rect.setAttribute("x", fundo[0]);
        rect.setAttribute("y", fundo[1]);
        rect.setAttribute("width", fundo[2]);
        rect.setAttribute("height", fundo[3]);
        rect.setAttribute("fill", "#D3D3D3");
        rect.setAttribute("stroke", "#999999");
        rect.setAttribute("stroke-width", "2");
        rect.setAttribute("stroke-miterlimit", "23");
        rect.setAttribute("rx", "5");
        rect.setAttribute("ry", "5");

        svgEl.appendChild(rect);
    }

    function desenharCelulas() {
        const svgEl = document.getElementById("des_topo_armazem");

        for (let celula = 1; celula <= 3; celula++) {
            const celulaData = layoutTopo.celulas[celula.toString()];

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("id", `rec_celula${celula}`);
            rect.setAttribute("x", celulaData[0]);
            rect.setAttribute("y", celulaData[1]);
            rect.setAttribute("width", celulaData[2]);
            rect.setAttribute("height", celulaData[3]);
            rect.setAttribute("fill", "#B3B3B3");
            rect.setAttribute("stroke", "#B3B3B3");
            rect.setAttribute("stroke-width", "2");
            rect.setAttribute("stroke-miterlimit", "23");
            rect.setAttribute("rx", "5");
            rect.setAttribute("ry", "5");
            rect.style.cursor = "pointer";

            svgEl.appendChild(rect);
        }
    }

    function desenharArcos() {
        const svgEl = document.getElementById("des_topo_armazem");

        Object.keys(layoutTopo).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arcoNum = parseInt(key);
                const arcoData = layoutTopo[key];
                desenharArco(arcoNum, arcoData);
            }
        });
    }

    function desenharArco(idArco, dadosArco) {
        const svgEl = document.getElementById("des_topo_armazem");
        const posX = dadosArco.pos_x;

        // Grupo do arco
        const grupoArco = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupoArco.setAttribute("id", `arco_${idArco}`);
        grupoArco.style.cursor = "pointer";

        // Retângulo de seleção do arco
        const retanguloSelecao = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        retanguloSelecao.setAttribute("id", `rec_arco_${idArco}`);
        retanguloSelecao.setAttribute("x", posX - 8.5);
        retanguloSelecao.setAttribute("y", 49);
        retanguloSelecao.setAttribute("width", 17);
        retanguloSelecao.setAttribute("height", 254);
        retanguloSelecao.setAttribute("fill", "#B3B3B3");

        // Botão superior
        const botaoSup = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        botaoSup.setAttribute("id", `arco${idArco}_botsup`);
        botaoSup.setAttribute("x", posX - 8.5);
        botaoSup.setAttribute("y", 41);
        botaoSup.setAttribute("width", 17);
        botaoSup.setAttribute("height", 17);
        botaoSup.setAttribute("rx", 4.2);
        botaoSup.setAttribute("ry", 4.2);
        botaoSup.setAttribute("fill", "#999999");

        // Texto botão superior
        const textoSup = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textoSup.setAttribute("x", posX);
        textoSup.setAttribute("y", 49.5);
        textoSup.setAttribute("text-anchor", "middle");
        textoSup.setAttribute("dominant-baseline", "central");
        textoSup.setAttribute("font-weight", "bold");
        textoSup.setAttribute("font-size", "10.5");
        textoSup.setAttribute("font-family", "Arial");
        textoSup.setAttribute("fill", "white");
        textoSup.textContent = idArco;

        // Botão inferior
        const botaoInf = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        botaoInf.setAttribute("id", `arco${idArco}_botinf`);
        botaoInf.setAttribute("x", posX - 8.5);
        botaoInf.setAttribute("y", 295);
        botaoInf.setAttribute("width", 17);
        botaoInf.setAttribute("height", 17);
        botaoInf.setAttribute("rx", 4.2);
        botaoInf.setAttribute("ry", 4.2);
        botaoInf.setAttribute("fill", "#999999");

        // Texto botão inferior
        const textoInf = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textoInf.setAttribute("x", posX);
        textoInf.setAttribute("y", 303.5);
        textoInf.setAttribute("text-anchor", "middle");
        textoInf.setAttribute("dominant-baseline", "central");
        textoInf.setAttribute("font-weight", "bold");
        textoInf.setAttribute("font-size", "10.5");
        textoInf.setAttribute("font-family", "Arial");
        textoInf.setAttribute("fill", "white");
        textoInf.textContent = idArco;

        grupoArco.appendChild(retanguloSelecao);
        grupoArco.appendChild(botaoSup);
        grupoArco.appendChild(textoSup);
        grupoArco.appendChild(botaoInf);
        grupoArco.appendChild(textoInf);

        // Desenhar pêndulos (cabos) do arco
        if (dadosArco.sensores) {
            Object.entries(dadosArco.sensores).forEach(([penduloId, posY]) => {
                const cabo = desenharCabo(penduloId, posX, posY);
                grupoArco.appendChild(cabo);
            });
        }

        svgEl.appendChild(grupoArco);
    }

    function desenharCabo(idCabo, posX, posY) {
        const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupo.setAttribute("id", `cabo_${idCabo}`);
        grupo.style.cursor = "pointer";

        // Círculo de ponto quente (oculto inicialmente) - deve vir primeiro para ficar atrás
        const circuloPQ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circuloPQ.setAttribute("id", `pq_cabo_${idCabo}`);
        circuloPQ.setAttribute("cx", posX);
        circuloPQ.setAttribute("cy", posY);
        circuloPQ.setAttribute("r", 13);
        circuloPQ.setAttribute("fill", "red");
        circuloPQ.setAttribute("visibility", "hidden");

        // Animação do ponto quente
        const animacao = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animacao.setAttribute("attributeName", "r");
        animacao.setAttribute("begin", "0s");
        animacao.setAttribute("dur", "1s");
        animacao.setAttribute("from", "13");
        animacao.setAttribute("to", "8");
        animacao.setAttribute("repeatCount", "indefinite");
        circuloPQ.appendChild(animacao);

        // Círculo do cabo
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("id", `c_cabo_${idCabo}`);
        circulo.setAttribute("cx", posX);
        circulo.setAttribute("cy", posY);
        circulo.setAttribute("r", 9);
        circulo.setAttribute("fill", "white");

        // Texto do cabo
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("id", `t_cabo_${idCabo}`);
        texto.setAttribute("x", posX);
        texto.setAttribute("y", posY);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("dominant-baseline", "central");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "7.75");
        texto.setAttribute("font-family", "Arial");
        texto.textContent = `C${idCabo}`;

        // Círculo de falha (oculto inicialmente)
        const circuloFalha = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circuloFalha.setAttribute("id", `f_cabo_${idCabo}`);
        circuloFalha.setAttribute("cx", posX);
        circuloFalha.setAttribute("cy", posY);
        circuloFalha.setAttribute("r", 11);
        circuloFalha.setAttribute("fill", "red");
        circuloFalha.setAttribute("fill-opacity", "0.6");
        circuloFalha.setAttribute("visibility", "hidden");

        // Ordem dos elementos: ponto quente, círculo, texto, falha
        grupo.appendChild(circuloPQ);
        grupo.appendChild(circulo);
        grupo.appendChild(texto);
        grupo.appendChild(circuloFalha);

        return grupo;
    }

    function desenharAeradores() {
        const svgEl = document.getElementById("des_topo_armazem");

        Object.entries(layoutTopo.aeradores).forEach(([id, dados]) => {
            const [posX, posY, textoAcima] = dados;
            desenharAerador(parseInt(id), posX, posY, textoAcima);
        });
    }

    function desenharAerador(idAerador, posX, posY, textoAcima) {
        const svgEl = document.getElementById("des_topo_armazem");

        // Criar grupo principal do aerador
        const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupo.setAttribute("id", `aerador_${idAerador}`);

        // Criar grupos para blade parada e girando
        const grupoBladePrado = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupoBladePrado.setAttribute("id", `blade_aerador_${idAerador}_parado`);

        const grupBladeGirando = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupBladeGirando.setAttribute("id", `blade_aerador_${idAerador}_girando`);

        // Retângulo do nome
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", 25);
        rect.setAttribute("height", 10);
        rect.setAttribute("rx", 6.4);
        rect.setAttribute("ry", 5);
        rect.setAttribute("fill", "#3A78FD");

        // Posicionar texto acima ou abaixo
        if (textoAcima === 1) {
            rect.setAttribute("x", 70 + 3.5);
            rect.setAttribute("y", 2);
        } else {
            rect.setAttribute("x", 70 + 3.5);
            rect.setAttribute("y", 36);
        }

        // Texto do nome
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("dominant-baseline", "central");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "6.5");
        texto.setAttribute("font-family", "Arial");
        texto.setAttribute("fill", "white");
        texto.textContent = `AE-${idAerador}`;

        // Posicionar texto acima ou abaixo
        if (textoAcima === 1) {
            texto.setAttribute("x", 70 + 12.5 + 3.5);
            texto.setAttribute("y", 0 + 7);
        } else {
            texto.setAttribute("x", 70 + 12.5 + 3.5);
            texto.setAttribute("y", 0 + 5 + 36);
        }

        // Círculo principal
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("id", `fundo_aerador_${idAerador}`);
        circulo.setAttribute("cx", 70 + 12.5 + 3.5);
        circulo.setAttribute("cy", 0 + 24);
        circulo.setAttribute("r", 10.5);
        circulo.setAttribute("fill", "#c5c5c5");

        // Definir path da blade
        const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 -0.0599,-0.1627 -0.0927,-0.3386 -0.0927,-0.5221 0,-0.1159 0.0131,-0.2287 0.0378,-0.3371 -2.7913,-0.5199 -5.9807,-0.6695 -6.4392,-2.7909 -0.0128,-1.1872 0.2692,-1.9342 1.3353,-3.2209 1.8235,3.4167 3.7637,4.2185 5.4165,5.3813 0.1852,-0.2222 0.433,-0.3903 0.7163,-0.4775 -0.9455,-2.6773 -2.4105,-5.5141 -0.8027,-6.9719 1.0218,-0.6046 1.8097,-0.734 3.4571,-0.454 -2.0471,3.2874 -1.7715,5.3685 -1.9521,7.3812 0.2952,0.0506 0.5612,0.1868 0.7714,0.3822 1.8461,-2.1575 3.5703,-4.845 5.6368,-4.1814 1.0345,0.5826 1.5405,1.2002 2.1218,2.7669 -3.8705,-0.1291 -5.535,1.15 -7.3682,2 0.0599,0.1627 0.0927,0.3386 0.0927,0.5221z";

        // Blade parada
        const bladeParada = document.createElementNS("http://www.w3.org/2000/svg", "path");
        bladeParada.setAttribute("d", dBlade);
        bladeParada.setAttribute("fill", "white");

        // Blade girando
        const bladeGirando = document.createElementNS("http://www.w3.org/2000/svg", "path");
        bladeGirando.setAttribute("d", dBlade);
        bladeGirando.setAttribute("fill", "white");

        // Animação da blade girando
        const animacao = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
        animacao.setAttribute("attributeName", "transform");
        animacao.setAttribute("type", "rotate");
        animacao.setAttribute("dur", "2s");
        animacao.setAttribute("values", "0 86.35 24.05; 360 86.35 24.05;");
        animacao.setAttribute("repeatCount", "indefinite");

        // Montar estrutura
        grupoBladePrado.appendChild(bladeParada);
        grupBladeGirando.appendChild(bladeGirando);
        grupBladeGirando.appendChild(animacao);

        grupo.appendChild(circulo);
        grupo.appendChild(rect);
        grupo.appendChild(texto);
        grupo.appendChild(grupoBladePrado);
        grupo.appendChild(grupBladeGirando);

        svgEl.appendChild(grupo);

        // Posicionar o aerador usando transform
        grupo.setAttribute("transform", `translate(${posX - 70}, ${posY})`);
    }

    function atualizarVisualizacao() {
        if (!dadosTopo || !layoutTopo) return;

        // Atualizar seleções
        atualizarSelecoes();
        
        // Atualizar cabos com dados reais
        atualizarCabos();
        
        // Atualizar aeradores (estados fixos para demonstração)
        atualizarAeradores();
    }

    function atualizarSelecoes() {
        // Primeiro: atualizar arcos baseado na célula selecionada (seguindo modelo HTML)
        Object.keys(layoutTopo).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arcoNum = parseInt(key);
                const arcoRect = document.getElementById(`rec_arco_${arcoNum}`);
                
                if (arcoRect) {
                    // Se o arco pertence à célula selecionada
                    if (layoutTopo[key].celula === celulaSelecionada) {
                        arcoRect.setAttribute("fill", "#E6E6E6");
                    } else {
                        arcoRect.setAttribute("fill", "#B3B3B3");
                    }
                }
            }
        });

        // Segundo: destacar o arco selecionado especificamente
        const arcoSelecionadoRect = document.getElementById(`rec_arco_${arcoSelecionado}`);
        if (arcoSelecionadoRect) {
            arcoSelecionadoRect.setAttribute("fill", "#438AF6");
        }

        // Terceiro: atualizar botões dos arcos
        Object.keys(layoutTopo).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arcoNum = parseInt(key);
                const botaoSup = document.getElementById(`arco${arcoNum}_botsup`);
                const botaoInf = document.getElementById(`arco${arcoNum}_botinf`);
                
                if (botaoSup && botaoInf) {
                    const cor = arcoNum === arcoSelecionado ? "#33CC33" : "#999999";
                    botaoSup.setAttribute("fill", cor);
                    botaoInf.setAttribute("fill", cor);
                }
            }
        });

        // Quarto: atualizar células
        for (let celula = 1; celula <= 3; celula++) {
            const elemento = document.getElementById(`rec_celula${celula}`);
            if (elemento) {
                if (celula === celulaSelecionada) {
                    elemento.setAttribute("fill", "#E6E6E6");
                    elemento.setAttribute("stroke", "#438AF6");
                } else {
                    elemento.setAttribute("fill", "#B3B3B3");
                    elemento.setAttribute("stroke", "#B3B3B3");
                }
            }
        }
    }

    function atualizarCabos() {
        Object.entries(dadosTopo).forEach(([idCabo, dados]) => {
            const [falha, pontoQuente, nivel, temperatura] = dados;
            
            const circulo = document.getElementById(`c_cabo_${idCabo}`);
            const texto = document.getElementById(`t_cabo_${idCabo}`);
            const falhaEl = document.getElementById(`f_cabo_${idCabo}`);
            const pontoQuenteEl = document.getElementById(`pq_cabo_${idCabo}`);

            if (circulo && texto) {
                // Definir cor baseada na temperatura
                let cor = corTemperatura(temperatura);
                let corTexto = temperatura >= 30 ? "white" : "black";
                let opacidade = "1";

                if (!nivel) {
                    cor = "#c7c7c7";
                    corTexto = "black";
                    opacidade = "0.78";
                }

                circulo.setAttribute("fill", cor);
                circulo.setAttribute("fill-opacity", opacidade);
                texto.setAttribute("fill", corTexto);
                texto.setAttribute("fill-opacity", nivel ? "1" : "0.4");

                // Controlar animações
                if (falhaEl) {
                    falhaEl.style.visibility = falha ? "visible" : "hidden";
                }
                
                if (pontoQuenteEl) {
                    pontoQuenteEl.style.visibility = (pontoQuente && !falha) ? "visible" : "hidden";
                }
            }
        });
    }

    function atualizarAeradores() {
        // Pegar número de aeradores dos dados
        const numAeradores = Object.keys(layoutTopo.aeradores).length;
        
        // Estados dos aeradores (seguindo padrão do modelo HTML)
        const estadosAeradores = [1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        for (let aeradorId = 1; aeradorId <= numAeradores; aeradorId++) {
            const estado = estadosAeradores[aeradorId - 1] || 0;
            setarEstadoAerador(aeradorId, estado);
        }
    }

    function setarEstadoAerador(aeradorId, estado) {
        const fundo = document.getElementById(`fundo_aerador_${aeradorId}`);
        const bladePrado = document.getElementById(`blade_aerador_${aeradorId}_parado`);
        const bladeGirando = document.getElementById(`blade_aerador_${aeradorId}_girando`);
        
        if (!fundo || !bladePrado || !bladeGirando) return;

        let cor;
        let visParado, visGirando;

        switch (estado) {
            case 0: // desligado
                cor = "#c5c5c5";
                visParado = "visible";
                visGirando = "hidden";
                break;
            case 1: // ligado
                cor = "#31dd0f";
                visParado = "hidden";
                visGirando = "visible";
                break;
            case 2: // falha
                cor = "#ff0000";
                visParado = "visible";
                visGirando = "hidden";
                break;
            default:
                cor = "#c5c5c5";
                visParado = "visible";
                visGirando = "hidden";
        }

        fundo.setAttribute("fill", cor);
        bladePrado.style.visibility = visParado;
        bladeGirando.style.visibility = visGirando;
    }

    function corTemperatura(temp) {
        if (temp < 12) return "#0384fc";
        else if (temp < 15) return "#03e8fc";
        else if (temp < 17) return "#03fcbe";
        else if (temp < 21) return "#07fc03";
        else if (temp < 25) return "#c3ff00";
        else if (temp < 27) return "#fcf803";
        else if (temp < 30) return "#ffb300";
        else if (temp < 35) return "#ff2200";
        else if (temp < 50) return "#ff0090";
        else return "#f700ff";
    }

    function adicionarEventosClique() {
        const svgEl = document.getElementById("des_topo_armazem");
        if (!svgEl) return;

        svgEl.addEventListener('click', (evento) => {
            const elemento = evento.target;
            const grupo = elemento.parentElement;

            if (grupo && grupo.id) {
                const [tipo, numero] = grupo.id.split('_');

                if (tipo === 'arco') {
                    const novoArco = parseInt(numero);
                    setArcoSelecionado(novoArco);
                    if (layoutTopo && layoutTopo[novoArco]) {
                        setCelulaSelecionada(layoutTopo[novoArco].celula);
                    }
                    if (onArcoSelecionado) {
                        onArcoSelecionado(novoArco);
                    }
                } else if (tipo === 'cabo') {
                    // Encontrar qual arco pertence este cabo
                    const caboNum = parseInt(numero);
                    Object.entries(layoutTopo).forEach(([arcoKey, arcoData]) => {
                        if (arcoKey !== 'celulas' && arcoKey !== 'aeradores') {
                            if (arcoData.sensores && arcoData.sensores[caboNum]) {
                                const novoArco = parseInt(arcoKey);
                                setArcoSelecionado(novoArco);
                                setCelulaSelecionada(arcoData.celula);
                                if (onArcoSelecionado) {
                                    onArcoSelecionado(novoArco);
                                }
                            }
                        }
                    });
                }
            }

            // Clique em células
            if (elemento.id && elemento.id.startsWith('rec_celula')) {
                const numeroCelula = parseInt(elemento.id.replace('rec_celula', ''));
                if (numeroCelula > 0) {
                    setCelulaSelecionada(numeroCelula);
                }
            }
        });
    }

    if (carregando || !dadosPendulos || !layoutTopo) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '750px' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando vista de topo...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-0">
            <div className="row g-0">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="fas fa-warehouse me-2"></i>
                                Visualização Topo do Armazém
                            </h5>
                            <button 
                                className="btn btn-outline-light btn-sm"
                                onClick={() => onFecharTopo && onFecharTopo()}
                                title="Fechar Topo"
                            >
                                <i className="fas fa-times"></i> Fechar Topo
                            </button>
                        </div>
                        <div className="card-body">
                            <div 
                                ref={containerRef} 
                                className="d-flex justify-content-center"
                                style={{ minHeight: '750px' }}
                            />

                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopoArmazem;

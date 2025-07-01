
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const TopoArmazem = ({ onArcoSelecionado, arcoAtual }) => {
    const containerRef = useRef(null);
    const [dados, setDados] = useState(null);
    const [dadosPortal, setDadosPortal] = useState(null);
    const [analiseArcos, setAnaliseArcos] = useState(null);
    const [arcoSelecionado, setArcoSelecionado] = useState(1);
    const [celulaSelecionada, setCelulaSelecionada] = useState(1);
    const [layoutTopo, setLayoutTopo] = useState(null);
    const [dadosTopo, setDadosTopo] = useState(null);

    // Carregar dados de exemplo
    useEffect(() => {
        const inicializarDados = async () => {
            try {
                const dadosExemplo = LayoutManager.gerarDadosExemploPortal();
                setDadosPortal(dadosExemplo);

                const analise = LayoutManager.analisarEstruturaArcos(dadosExemplo);
                setAnaliseArcos(analise);

                // Gerar layout baseado na estrutura do HTML
                const layout = gerarLayoutTopo(analise);
                setLayoutTopo(layout);

                // Gerar dados de temperatura dos cabos
                const dadosTemp = gerarDadosTemperatura(layout);
                setDadosTopo(dadosTemp);

                const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosExemplo);
                setDados(dadosConvertidos);
            } catch (error) {
                console.error('Erro ao carregar dados do topo:', error);
            }
        };

        inicializarDados();
    }, []);

    // Atualizar quando arco atual mudar
    useEffect(() => {
        if (arcoAtual && arcoAtual !== arcoSelecionado) {
            setArcoSelecionado(arcoAtual);
            if (layoutTopo) {
                // Atualizar célula baseada no arco selecionado
                const celula = layoutTopo[arcoAtual]?.celula || 1;
                setCelulaSelecionada(celula);
            }
        }
    }, [arcoAtual, layoutTopo]);

    // Atualizar SVG quando dados mudarem
    useEffect(() => {
        if (!layoutTopo || !dadosTopo) return;

        const container = containerRef.current;
        if (!container) return;

        criarSVGTopo();
    }, [layoutTopo, dadosTopo, arcoSelecionado, celulaSelecionada]);

    function gerarLayoutTopo(analise) {
        if (!analise) return null;

        const layout = {
            celulas: {
                tamanho_svg: [600, 388],
                fundo: [5, 49, 501, 256],
                "1": [5, 50, 180, 254],
                "2": [190, 50, 170, 254], 
                "3": [364, 50, 150, 254]
            },
            aeradores: {
                "1": [65, 0, 1],
                "2": [154, 0, 1],
                "3": [240, 0, 1],
                "4": [329, 0, 1],
                "5": [416, 0, 1],
                "6": [65, 305, 0],
                "7": [154, 305, 0],
                "8": [240, 305, 0],
                "9": [329, 305, 0],
                "10": [416, 305, 0]
            }
        };

        // Gerar arcos baseado na análise
        let caboAtual = 1;
        let posX = 30;
        Object.entries(analise.arcos).forEach(([numeroArco, infoArco], index) => {
            const celula = Math.ceil(parseInt(numeroArco) / 5); // 5 arcos por célula
            
            layout[numeroArco] = {
                celula: celula,
                pos_x: posX,
                sensores: {}
            };

            // Adicionar sensores/cabos para este arco
            infoArco.pendulos.forEach((pendulo, pendIndex) => {
                for (let s = 1; s <= pendulo.totalSensores; s++) {
                    const posY = 75 + (s - 1) * 75 + (pendIndex * 25); // Distribuir verticalmente
                    layout[numeroArco].sensores[caboAtual] = posY;
                    caboAtual++;
                }
            });

            posX += 35; // Espaçamento entre arcos
        });

        return layout;
    }

    function gerarDadosTemperatura(layout) {
        if (!layout) return null;

        const dados = {};
        let caboId = 1;

        // Para cada arco no layout
        Object.keys(layout).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arco = layout[key];
                if (arco.sensores) {
                    Object.keys(arco.sensores).forEach(cabo => {
                        // [falha, ponto_quente, nivel, temperatura, arco, celula]
                        dados[cabo] = [
                            false, // falha
                            false, // ponto quente
                            true,  // nivel
                            15 + Math.random() * 20, // temperatura aleatória
                            parseInt(key), // arco
                            arco.celula // célula
                        ];
                    });
                }
            }
        });

        return dados;
    }

    function criarSVGTopo() {
        const container = containerRef.current;
        const svgExistente = container.querySelector("#des_topo_armazem");
        if (svgExistente) svgExistente.remove();

        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgEl.setAttribute("id", "des_topo_armazem");
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "400px");
        svgEl.setAttribute("viewBox", `0 0 ${layoutTopo.celulas.tamanho_svg[0]} ${layoutTopo.celulas.tamanho_svg[1]}`);
        svgEl.setAttribute("style", "background: #f8f9fa; border-radius: 8px; shape-rendering:geometricPrecision; text-rendering:geometricPrecision;");
        
        container.appendChild(svgEl);

        // Desenhar elementos
        desenharFundo();
        desenharCelulas();
        desenharArcos();
        desenharAeradores();
        
        // Aplicar seleções
        atualizarSelecoes();
        atualizarTemperaturasCabos();

        // Adicionar eventos de clique
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
        rect.setAttribute("fill", "#B3B3B3");
        rect.setAttribute("stroke-width", "2");
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
                const arcoData = layoutTopo[key];
                desenharArco(parseInt(key), arcoData);
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
        
        // Retângulo de seleção
        const rectSelecao = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rectSelecao.setAttribute("id", `rec_arco_${idArco}`);
        rectSelecao.setAttribute("x", posX - 8.5);
        rectSelecao.setAttribute("y", 49);
        rectSelecao.setAttribute("width", 17);
        rectSelecao.setAttribute("height", 254);
        rectSelecao.setAttribute("fill", "#B3B3B3");
        
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
        
        grupoArco.appendChild(rectSelecao);
        grupoArco.appendChild(botaoSup);
        grupoArco.appendChild(textoSup);
        grupoArco.appendChild(botaoInf);
        grupoArco.appendChild(textoInf);
        
        // Desenhar cabos
        Object.entries(dadosArco.sensores).forEach(([caboId, posY]) => {
            const cabo = desenharCabo(caboId, posX, posY);
            grupoArco.appendChild(cabo);
        });
        
        document.getElementById("des_topo_armazem").appendChild(grupoArco);
    }

    function desenharCabo(idCabo, posX, posY) {
        const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupo.setAttribute("id", `cabo_${idCabo}`);
        grupo.style.cursor = "pointer";
        
        // Círculo do cabo
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("id", `c_cabo_${idCabo}`);
        circulo.setAttribute("cx", posX);
        circulo.setAttribute("cy", posY);
        circulo.setAttribute("r", 9);
        circulo.setAttribute("fill", "white");
        circulo.setAttribute("stroke", "black");
        circulo.setAttribute("stroke-width", "0.4");
        
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
        texto.setAttribute("fill", "black");
        texto.textContent = `C${idCabo}`;
        
        // Círculo de erro (inicialmente oculto)
        const circuloErro = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circuloErro.setAttribute("id", `f_cabo_${idCabo}`);
        circuloErro.setAttribute("cx", posX);
        circuloErro.setAttribute("cy", posY);
        circuloErro.setAttribute("r", 11);
        circuloErro.setAttribute("fill", "red");
        circuloErro.setAttribute("fill-opacity", "0.6");
        circuloErro.style.visibility = "hidden";
        
        // Círculo ponto quente com animação
        const circuloPQ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circuloPQ.setAttribute("id", `pq_cabo_${idCabo}`);
        circuloPQ.setAttribute("cx", posX);
        circuloPQ.setAttribute("cy", posY);
        circuloPQ.setAttribute("r", 13);
        circuloPQ.setAttribute("fill", "red");
        circuloPQ.style.visibility = "hidden";
        
        const animacao = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animacao.setAttribute("attributeName", "r");
        animacao.setAttribute("begin", "0s");
        animacao.setAttribute("dur", "1s");
        animacao.setAttribute("from", "13");
        animacao.setAttribute("to", "8");
        animacao.setAttribute("repeatCount", "indefinite");
        circuloPQ.appendChild(animacao);
        
        grupo.appendChild(circuloPQ);
        grupo.appendChild(circulo);
        grupo.appendChild(texto);
        grupo.appendChild(circuloErro);
        
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
        
        const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
        grupo.setAttribute("id", `aerador_${idAerador}`);
        grupo.setAttribute("transform", `translate(${posX - 70}, ${posY})`);
        
        // Círculo principal
        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("id", `fundo_aerador_${idAerador}`);
        circulo.setAttribute("cx", 86.35);
        circulo.setAttribute("cy", 24);
        circulo.setAttribute("r", 10.5);
        circulo.setAttribute("fill", "#c5c5c5");
        
        // Retângulo do nome
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", 73.5);
        rect.setAttribute("y", textoAcima ? 2 : 36);
        rect.setAttribute("width", 25);
        rect.setAttribute("height", 10);
        rect.setAttribute("rx", 6.4);
        rect.setAttribute("ry", 5);
        rect.setAttribute("fill", "#3A78FD");
        
        // Texto do nome
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", 86);
        texto.setAttribute("y", textoAcima ? 7 : 41);
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("dominant-baseline", "central");
        texto.setAttribute("font-weight", "bold");
        texto.setAttribute("font-size", "6.5");
        texto.setAttribute("font-family", "Arial");
        texto.setAttribute("fill", "white");
        texto.textContent = `AE-${idAerador}`;
        
        // Blade (simplificado)
        const blade = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        blade.setAttribute("cx", 86.35);
        blade.setAttribute("cy", 24);
        blade.setAttribute("r", 8);
        blade.setAttribute("fill", "none");
        blade.setAttribute("stroke", "white");
        blade.setAttribute("stroke-width", 2);
        
        grupo.appendChild(circulo);
        grupo.appendChild(rect);
        grupo.appendChild(texto);
        grupo.appendChild(blade);
        
        svgEl.appendChild(grupo);
    }

    function atualizarSelecoes() {
        if (!layoutTopo) return;
        
        // Atualizar seleção de células
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
        
        // Atualizar seleção de arcos
        Object.keys(layoutTopo).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arcoNum = parseInt(key);
                const arcoData = layoutTopo[key];
                
                // Retângulo de seleção do arco
                const rectArco = document.getElementById(`rec_arco_${arcoNum}`);
                if (rectArco) {
                    if (arcoNum === arcoSelecionado) {
                        rectArco.setAttribute("fill", "#438AF6");
                    } else if (arcoData.celula === celulaSelecionada) {
                        rectArco.setAttribute("fill", "#E6E6E6");
                    } else {
                        rectArco.setAttribute("fill", "#B3B3B3");
                    }
                }
                
                // Botões do arco
                const botaoSup = document.getElementById(`arco${arcoNum}_botsup`);
                const botaoInf = document.getElementById(`arco${arcoNum}_botinf`);
                if (botaoSup && botaoInf) {
                    const cor = arcoNum === arcoSelecionado ? "#33CC33" : "#999999";
                    botaoSup.setAttribute("fill", cor);
                    botaoInf.setAttribute("fill", cor);
                }
            }
        });
    }

    function atualizarTemperaturasCabos() {
        if (!dadosTopo) return;
        
        Object.entries(dadosTopo).forEach(([caboId, dados]) => {
            const [falha, pontoQuente, nivel, temperatura] = dados;
            
            const circulo = document.getElementById(`c_cabo_${caboId}`);
            const texto = document.getElementById(`t_cabo_${caboId}`);
            const circuloErro = document.getElementById(`f_cabo_${caboId}`);
            const circuloPQ = document.getElementById(`pq_cabo_${caboId}`);
            
            if (!circulo || !texto) return;
            
            // Esconder animações
            if (circuloErro) circuloErro.style.visibility = "hidden";
            if (circuloPQ) circuloPQ.style.visibility = "hidden";
            
            // Definir cor baseada na temperatura
            let cor = corFaixaExata(temperatura);
            let corTexto = temperatura >= 30 ? "white" : "black";
            
            if (!nivel) {
                cor = "#c7c7c7";
                corTexto = "black";
                circulo.setAttribute("fill-opacity", "0.78");
                texto.setAttribute("fill-opacity", "0.4");
            } else {
                circulo.setAttribute("fill-opacity", "1");
                texto.setAttribute("fill-opacity", "1");
            }
            
            if (pontoQuente && circuloPQ) {
                circuloPQ.style.visibility = "visible";
            }
            
            if (falha && circuloErro) {
                circuloErro.style.visibility = "visible";
                if (circuloPQ) circuloPQ.style.visibility = "hidden";
            }
            
            circulo.setAttribute("fill", cor);
            texto.setAttribute("fill", corTexto);
        });
    }

    function corFaixaExata(temp) {
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
                    if (layoutTopo[novoArco]) {
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
                
                // Atualizar visualização
                setTimeout(() => {
                    atualizarSelecoes();
                }, 50);
            }
            
            // Clique em células
            if (elemento.id && elemento.id.startsWith('rec_celula')) {
                const numeroCelula = parseInt(elemento.id.replace('rec_celula', ''));
                if (numeroCelula > 0) {
                    setCelulaSelecionada(numeroCelula);
                    setTimeout(() => {
                        atualizarSelecoes();
                    }, 50);
                }
            }
        });
    }

    if (!dados || !analiseArcos || !layoutTopo) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando vista de topo...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-2">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-info text-white">
                            <h6 className="mb-0">Vista de Topo - Armazém (Layout Retangular)</h6>
                        </div>
                        <div className="card-body">
                            <div 
                                ref={containerRef} 
                                className="d-flex justify-content-center"
                                style={{ minHeight: '400px' }}
                            />
                            
                            <div className="mt-3">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Arco Selecionado: {arcoSelecionado}</small>
                                            <div className="mt-1">
                                                <small>
                                                    Célula: {celulaSelecionada}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Controles:</small>
                                            <div className="mt-1">
                                                <small>
                                                    • Clique nos arcos para selecioná-los<br/>
                                                    • Clique nos cabos para selecionar o arco<br/>
                                                    • Clique nas células para selecioná-las
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Estatísticas:</small>
                                            <div className="mt-1">
                                                <small>
                                                    {analiseArcos.totalArcos} arcos, {' '}
                                                    {analiseArcos.estatisticas.totalPendulos} pêndulos, {' '}
                                                    {analiseArcos.estatisticas.totalSensores} sensores
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopoArmazem;

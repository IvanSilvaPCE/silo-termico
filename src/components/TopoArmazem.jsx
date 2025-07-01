
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const TopoArmazem = ({ onArcoSelecionado, arcoAtual }) => {
    const containerRef = useRef(null);
    const [dados, setDados] = useState(null);
    const [dadosPortal, setDadosPortal] = useState(null);
    const [analiseArcos, setAnaliseArcos] = useState(null);
    const [celulaAtual, setCelulaAtual] = useState(1);
    const [layoutTopo, setLayoutTopo] = useState(null);

    // Carregar dados de exemplo
    useEffect(() => {
        const inicializarDados = async () => {
            try {
                const dadosExemplo = LayoutManager.gerarDadosExemploPortal();
                setDadosPortal(dadosExemplo);

                const analise = LayoutManager.analisarEstruturaArcos(dadosExemplo);
                setAnaliseArcos(analise);

                // Gerar layout topo baseado na análise
                const layoutTopoGerado = gerarLayoutTopo(analise);
                setLayoutTopo(layoutTopoGerado);

                const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosExemplo);
                setDados(dadosConvertidos);
            } catch (error) {
                console.error('Erro ao carregar dados do topo:', error);
            }
        };

        inicializarDados();
    }, []);

    // Gerar layout de topo baseado na estrutura dos arcos
    const gerarLayoutTopo = (analise) => {
        if (!analise) return null;

        const layout = {
            celulas: {
                tamanho_svg: [600, 388],
                fundo: [5, 49, 590, 256],
                1: [5, 50, 180, 254],
                2: [190, 50, 170, 254], 
                3: [365, 50, 150, 254]
            }
        };

        // Distribuir arcos nas células
        const totalArcos = analise.totalArcos;
        const arcosPorCelula = Math.ceil(totalArcos / 3);
        let posX = 30;
        const espacamentoArcos = 35;

        Object.keys(analise.arcos).forEach((numeroArco, index) => {
            const arco = analise.arcos[numeroArco];
            const celula = Math.floor(index / arcosPorCelula) + 1;
            
            // Gerar sensores para o arco
            const sensores = {};
            let contadorSensor = 1;
            
            arco.pendulos.forEach(pendulo => {
                for (let s = 1; s <= pendulo.totalSensores; s++) {
                    const ySensor = 75 + (s - 1) * 50; // Distribuir sensores verticalmente
                    sensores[contadorSensor] = ySensor;
                    contadorSensor++;
                }
            });

            layout[numeroArco] = {
                celula: Math.min(celula, 3),
                pos_x: posX,
                sensores: sensores
            };

            posX += espacamentoArcos;
            
            // Resetar posição para próxima célula
            if ((index + 1) % arcosPorCelula === 0) {
                posX = 30 + (celula * 185); // Próxima célula
            }
        });

        return layout;
    };

    // Atualizar SVG quando dados mudarem
    useEffect(() => {
        if (!dados || !analiseArcos || !layoutTopo) return;

        const container = containerRef.current;
        if (!container) return;

        const svgExistente = container.querySelector("#des_topo_armazem");
        if (svgExistente) svgExistente.remove();

        criarSVGTopo();
        atualizarVisualizacao();
    }, [dados, analiseArcos, layoutTopo, arcoAtual, celulaAtual]);

    function criarSVGTopo() {
        const container = containerRef.current;
        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        
        svgEl.setAttribute("id", "des_topo_armazem");
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "400px");
        svgEl.setAttribute("viewBox", "0 0 600 388");
        svgEl.setAttribute("style", "background: #f8f9fa; border-radius: 8px;");
        
        container.appendChild(svgEl);

        // Desenhar estrutura do armazém
        desenharFundoArmazem();
        desenharCelulas();
        desenharArcos();
    }

    function desenharFundoArmazem() {
        const svgEl = document.getElementById("des_topo_armazem");
        
        // Fundo do armazém
        const fundoRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        fundoRect.setAttribute("id", "rec_celula0");
        fundoRect.setAttribute("x", layoutTopo.celulas.fundo[0]);
        fundoRect.setAttribute("y", layoutTopo.celulas.fundo[1]);
        fundoRect.setAttribute("width", layoutTopo.celulas.fundo[2]);
        fundoRect.setAttribute("height", layoutTopo.celulas.fundo[3]);
        fundoRect.setAttribute("fill", "#B3B3B3");
        fundoRect.setAttribute("stroke", "#999999");
        fundoRect.setAttribute("stroke-width", "2");
        fundoRect.setAttribute("rx", "5");
        fundoRect.setAttribute("ry", "5");
        
        svgEl.appendChild(fundoRect);
    }

    function desenharCelulas() {
        const svgEl = document.getElementById("des_topo_armazem");
        
        [1, 2, 3].forEach(numCelula => {
            const celula = layoutTopo.celulas[numCelula];
            
            const celulaRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            celulaRect.setAttribute("id", `rec_celula${numCelula}`);
            celulaRect.setAttribute("x", celula[0]);
            celulaRect.setAttribute("y", celula[1]);
            celulaRect.setAttribute("width", celula[2]);
            celulaRect.setAttribute("height", celula[3]);
            celulaRect.setAttribute("fill", celulaAtual === numCelula ? "#E6E6E6" : "#B3B3B3");
            celulaRect.setAttribute("stroke", celulaAtual === numCelula ? "#438AF6" : "#B3B3B3");
            celulaRect.setAttribute("stroke-width", "2");
            celulaRect.setAttribute("rx", "5");
            celulaRect.setAttribute("ry", "5");
            celulaRect.style.cursor = "pointer";

            // Texto da célula
            const textoCelula = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textoCelula.setAttribute("x", celula[0] + celula[2] / 2);
            textoCelula.setAttribute("y", celula[1] + 20);
            textoCelula.setAttribute("text-anchor", "middle");
            textoCelula.setAttribute("font-size", "12");
            textoCelula.setAttribute("font-weight", "bold");
            textoCelula.setAttribute("fill", "#495057");
            textoCelula.textContent = `Célula ${numCelula}`;
            textoCelula.style.cursor = "pointer";

            // Eventos de clique
            const clickHandler = () => {
                setCelulaAtual(numCelula);
                atualizarVisualizacao();
            };

            celulaRect.addEventListener('click', clickHandler);
            textoCelula.addEventListener('click', clickHandler);

            svgEl.appendChild(celulaRect);
            svgEl.appendChild(textoCelula);
        });
    }

    function desenharArcos() {
        if (!analiseArcos || !layoutTopo) return;

        const svgEl = document.getElementById("des_topo_armazem");

        Object.keys(analiseArcos.arcos).forEach(numeroArco => {
            const arcoInfo = analiseArcos.arcos[numeroArco];
            const layoutArco = layoutTopo[numeroArco];
            
            if (!layoutArco) return;

            // Criar grupo do arco
            const grupoArco = document.createElementNS("http://www.w3.org/2000/svg", "g");
            grupoArco.setAttribute("id", `arco_${numeroArco}`);
            grupoArco.style.cursor = "pointer";

            // Retângulo de seleção do arco
            const rectSelecao = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectSelecao.setAttribute("id", `rec_arco_${numeroArco}`);
            rectSelecao.setAttribute("x", layoutArco.pos_x - 8.5);
            rectSelecao.setAttribute("y", 49);
            rectSelecao.setAttribute("width", "17");
            rectSelecao.setAttribute("height", "254");
            rectSelecao.setAttribute("fill", arcoAtual == numeroArco ? "#438AF6" : "#B3B3B3");
            rectSelecao.setAttribute("stroke", "#fff");
            rectSelecao.setAttribute("stroke-width", "1");

            // Botão superior
            const botaoSup = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            botaoSup.setAttribute("id", `arco${numeroArco}_botsup`);
            botaoSup.setAttribute("x", layoutArco.pos_x - 8.5);
            botaoSup.setAttribute("y", 41);
            botaoSup.setAttribute("width", "17");
            botaoSup.setAttribute("height", "17");
            botaoSup.setAttribute("rx", "4.2");
            botaoSup.setAttribute("ry", "4.2");
            botaoSup.setAttribute("fill", arcoAtual == numeroArco ? "#33CC33" : "#999999");

            // Texto do botão superior
            const textoSup = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textoSup.setAttribute("x", layoutArco.pos_x);
            textoSup.setAttribute("y", 49.5);
            textoSup.setAttribute("text-anchor", "middle");
            textoSup.setAttribute("dominant-baseline", "central");
            textoSup.setAttribute("font-size", "10.5");
            textoSup.setAttribute("font-weight", "bold");
            textoSup.setAttribute("fill", "white");
            textoSup.textContent = numeroArco;

            // Botão inferior
            const botaoInf = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            botaoInf.setAttribute("id", `arco${numeroArco}_botinf`);
            botaoInf.setAttribute("x", layoutArco.pos_x - 8.5);
            botaoInf.setAttribute("y", 295);
            botaoInf.setAttribute("width", "17");
            botaoInf.setAttribute("height", "17");
            botaoInf.setAttribute("rx", "4.2");
            botaoInf.setAttribute("ry", "4.2");
            botaoInf.setAttribute("fill", arcoAtual == numeroArco ? "#33CC33" : "#999999");

            // Texto do botão inferior
            const textoInf = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textoInf.setAttribute("x", layoutArco.pos_x);
            textoInf.setAttribute("y", 303.5);
            textoInf.setAttribute("text-anchor", "middle");
            textoInf.setAttribute("dominant-baseline", "central");
            textoInf.setAttribute("font-size", "10.5");
            textoInf.setAttribute("font-weight", "bold");
            textoInf.setAttribute("fill", "white");
            textoInf.textContent = numeroArco;

            // Desenhar sensores (círculos dos cabos)
            Object.entries(layoutArco.sensores).forEach(([numSensor, posY]) => {
                const tempMaxima = obterTemperaturaSensor(numeroArco, numSensor);
                const corSensor = corFaixaExata(tempMaxima);

                // Círculo do sensor
                const circuloSensor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circuloSensor.setAttribute("id", `c_cabo_${numSensor}`);
                circuloSensor.setAttribute("cx", layoutArco.pos_x);
                circuloSensor.setAttribute("cy", posY);
                circuloSensor.setAttribute("r", "9");
                circuloSensor.setAttribute("fill", corSensor);
                circuloSensor.setAttribute("stroke", "black");
                circuloSensor.setAttribute("stroke-width", "1");

                // Texto do sensor
                const textoSensor = document.createElementNS("http://www.w3.org/2000/svg", "text");
                textoSensor.setAttribute("id", `t_cabo_${numSensor}`);
                textoSensor.setAttribute("x", layoutArco.pos_x);
                textoSensor.setAttribute("y", posY);
                textoSensor.setAttribute("text-anchor", "middle");
                textoSensor.setAttribute("dominant-baseline", "central");
                textoSensor.setAttribute("font-size", "7.75");
                textoSensor.setAttribute("font-weight", "bold");
                textoSensor.setAttribute("fill", tempMaxima >= 30 ? "white" : "black");
                textoSensor.textContent = `C${numSensor}`;

                grupoArco.appendChild(circuloSensor);
                grupoArco.appendChild(textoSensor);
            });

            // Adicionar elementos ao grupo
            grupoArco.appendChild(rectSelecao);
            grupoArco.appendChild(botaoSup);
            grupoArco.appendChild(textoSup);
            grupoArco.appendChild(botaoInf);
            grupoArco.appendChild(textoInf);

            // Evento de clique no arco
            grupoArco.addEventListener('click', () => {
                if (onArcoSelecionado) {
                    onArcoSelecionado(parseInt(numeroArco));
                }
                setCelulaAtual(layoutArco.celula);
                atualizarVisualizacao();
            });

            svgEl.appendChild(grupoArco);
        });
    }

    function obterTemperaturaSensor(numeroArco, numSensor) {
        if (!dadosPortal?.arcos?.[numeroArco]) return 20;

        let tempMaxima = 20;
        const pendulos = dadosPortal.arcos[numeroArco];

        Object.values(pendulos).forEach(sensores => {
            Object.values(sensores).forEach(([temp]) => {
                if (temp > tempMaxima) tempMaxima = temp;
            });
        });

        return tempMaxima;
    }

    function corFaixaExata(t) {
        if (t === -1000) return "#ff0000";
        if (t < 12) return "#0384fc";
        else if (t < 15) return "#03e8fc";
        else if (t < 17) return "#03fcbe";
        else if (t < 21) return "#07fc03";
        else if (t < 25) return "#c3ff00";
        else if (t < 27) return "#fcf803";
        else if (t < 30) return "#ffb300";
        else if (t < 35) return "#ff2200";
        else if (t < 50) return "#ff0090";
        else return "#f700ff";
    }

    function atualizarVisualizacao() {
        if (!analiseArcos || !layoutTopo) return;

        // Atualizar cores dos arcos
        Object.keys(analiseArcos.arcos).forEach(numeroArco => {
            const layoutArco = layoutTopo[numeroArco];
            if (!layoutArco) return;

            const rectArco = document.querySelector(`#rec_arco_${numeroArco}`);
            const botaoSup = document.querySelector(`#arco${numeroArco}_botsup`);
            const botaoInf = document.querySelector(`#arco${numeroArco}_botinf`);

            if (rectArco) {
                // Destacar arco baseado na célula selecionada
                if (layoutArco.celula === celulaAtual) {
                    rectArco.setAttribute("fill", arcoAtual == numeroArco ? "#438AF6" : "#E6E6E6");
                } else {
                    rectArco.setAttribute("fill", "#B3B3B3");
                }
            }

            if (botaoSup && botaoInf) {
                const corBotao = arcoAtual == numeroArco ? "#33CC33" : "#999999";
                botaoSup.setAttribute("fill", corBotao);
                botaoInf.setAttribute("fill", corBotao);
            }
        });

        // Atualizar cores das células
        [1, 2, 3].forEach(numCelula => {
            const rectCelula = document.querySelector(`#rec_celula${numCelula}`);
            if (rectCelula) {
                const cor = celulaAtual === numCelula ? "#E6E6E6" : "#B3B3B3";
                const stroke = celulaAtual === numCelula ? "#438AF6" : "#B3B3B3";
                rectCelula.setAttribute("fill", cor);
                rectCelula.setAttribute("stroke", stroke);
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
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Arco Selecionado: {arcoAtual}</small>
                                            {analiseArcos.arcos[arcoAtual] && (
                                                <div className="mt-1">
                                                    <small>
                                                        {analiseArcos.arcos[arcoAtual].totalPendulos} pêndulos, {' '}
                                                        {analiseArcos.arcos[arcoAtual].totalSensores} sensores
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Célula Selecionada: {celulaAtual}</small>
                                            <div className="mt-1">
                                                <small>
                                                    Total: {analiseArcos.totalArcos} arcos, {' '}
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

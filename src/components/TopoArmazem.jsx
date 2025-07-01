
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const TopoArmazem = ({ onArcoSelecionado, arcoAtual }) => {
    const containerRef = useRef(null);
    const [dados, setDados] = useState(null);
    const [dadosPortal, setDadosPortal] = useState(null);
    const [analiseArcos, setAnaliseArcos] = useState(null);
    const [celulaAtual, setCelulaAtual] = useState(1);

    // Carregar dados de exemplo
    useEffect(() => {
        const inicializarDados = async () => {
            try {
                const dadosExemplo = LayoutManager.gerarDadosExemploPortal();
                setDadosPortal(dadosExemplo);

                const analise = LayoutManager.analisarEstruturaArcos(dadosExemplo);
                setAnaliseArcos(analise);

                // Converter dados para formato compatível
                const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosExemplo);
                setDados(dadosConvertidos);
            } catch (error) {
                console.error('Erro ao carregar dados do topo:', error);
            }
        };

        inicializarDados();
    }, []);

    // Atualizar SVG quando dados mudarem
    useEffect(() => {
        if (!dados || !analiseArcos) return;

        const container = containerRef.current;
        if (!container) return;

        const svgExistente = container.querySelector("#des_topo_armazem");
        if (svgExistente) svgExistente.remove();

        criarSVGTopo();
        atualizarVisualizacao();
    }, [dados, analiseArcos, arcoAtual, celulaAtual]);

    function criarSVGTopo() {
        const container = containerRef.current;
        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        
        svgEl.setAttribute("id", "des_topo_armazem");
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "400px");
        svgEl.setAttribute("viewBox", "0 0 600 400");
        svgEl.setAttribute("style", "background: #f8f9fa; border-radius: 8px;");
        
        container.appendChild(svgEl);

        // Desenhar fundo circular
        desenharFundoCircular();
        
        // Desenhar arcos como fatias
        desenharFatiasArcos();
        
        // Desenhar células
        desenharCelulas();
    }

    function desenharFundoCircular() {
        const svgEl = document.getElementById("des_topo_armazem");
        const centerX = 300, centerY = 200, radius = 150;

        // Círculo de fundo
        const circuloFundo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circuloFundo.setAttribute("cx", centerX);
        circuloFundo.setAttribute("cy", centerY);
        circuloFundo.setAttribute("r", radius);
        circuloFundo.setAttribute("fill", "#e9ecef");
        circuloFundo.setAttribute("stroke", "#dee2e6");
        circuloFundo.setAttribute("stroke-width", "2");
        svgEl.appendChild(circuloFundo);
    }

    function desenharFatiasArcos() {
        if (!analiseArcos) return;

        const svgEl = document.getElementById("des_topo_armazem");
        const centerX = 300, centerY = 200, radius = 140;
        const totalArcos = analiseArcos.totalArcos;
        const anguloFatia = (2 * Math.PI) / totalArcos;

        Object.entries(analiseArcos.arcos).forEach(([numeroArco, infoArco], index) => {
            const anguloInicio = index * anguloFatia - Math.PI / 2; // Começar do topo
            const anguloFim = anguloInicio + anguloFatia;

            // Criar grupo para a fatia
            const grupoFatia = document.createElementNS("http://www.w3.org/2000/svg", "g");
            grupoFatia.setAttribute("id", `arco_${numeroArco}`);
            grupoFatia.setAttribute("class", "fatia-arco");
            grupoFatia.style.cursor = "pointer";

            // Calcular pontos da fatia
            const x1 = centerX + radius * Math.cos(anguloInicio);
            const y1 = centerY + radius * Math.sin(anguloInicio);
            const x2 = centerX + radius * Math.cos(anguloFim);
            const y2 = centerY + radius * Math.sin(anguloFim);

            // Desenhar fatia
            const pathFatia = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const largeArcFlag = anguloFatia > Math.PI ? 1 : 0;
            const pathD = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            pathFatia.setAttribute("d", pathD);
            pathFatia.setAttribute("fill", arcoAtual == numeroArco ? "#438AF6" : "#B3B3B3");
            pathFatia.setAttribute("stroke", "#fff");
            pathFatia.setAttribute("stroke-width", "2");

            // Calcular posição da bolinha (centro da fatia)
            const anguloMedio = anguloInicio + anguloFatia / 2;
            const raioMedio = radius * 0.7;
            const bolinhaCenterX = centerX + raioMedio * Math.cos(anguloMedio);
            const bolinhaCenterY = centerY + raioMedio * Math.sin(anguloMedio);

            // Obter temperatura máxima do arco
            const tempMaxima = obterTemperaturaMaximaArco(numeroArco);
            const corBolinha = corFaixaExata(tempMaxima);

            // Desenhar bolinha de temperatura
            const bolinha = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            bolinha.setAttribute("cx", bolinhaCenterX);
            bolinha.setAttribute("cy", bolinhaCenterY);
            bolinha.setAttribute("r", "12");
            bolinha.setAttribute("fill", corBolinha);
            bolinha.setAttribute("stroke", "#fff");
            bolinha.setAttribute("stroke-width", "2");

            // Texto da temperatura
            const textoTemp = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textoTemp.setAttribute("x", bolinhaCenterX);
            textoTemp.setAttribute("y", bolinhaCenterY);
            textoTemp.setAttribute("text-anchor", "middle");
            textoTemp.setAttribute("dominant-baseline", "central");
            textoTemp.setAttribute("font-size", "8");
            textoTemp.setAttribute("font-weight", "bold");
            textoTemp.setAttribute("fill", tempMaxima >= 30 ? "white" : "black");
            textoTemp.textContent = tempMaxima.toFixed(1);

            // Número do arco
            const anguloTexto = anguloMedio;
            const raioTexto = radius + 20;
            const textoX = centerX + raioTexto * Math.cos(anguloTexto);
            const textoY = centerY + raioTexto * Math.sin(anguloTexto);

            const textoArco = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textoArco.setAttribute("x", textoX);
            textoArco.setAttribute("y", textoY);
            textoArco.setAttribute("text-anchor", "middle");
            textoArco.setAttribute("dominant-baseline", "central");
            textoArco.setAttribute("font-size", "12");
            textoArco.setAttribute("font-weight", "bold");
            textoArco.setAttribute("fill", "#495057");
            textoArco.textContent = numeroArco;

            // Adicionar elementos ao grupo
            grupoFatia.appendChild(pathFatia);
            grupoFatia.appendChild(bolinha);
            grupoFatia.appendChild(textoTemp);
            grupoFatia.appendChild(textoArco);

            // Evento de clique
            grupoFatia.addEventListener('click', () => {
                if (onArcoSelecionado) {
                    onArcoSelecionado(parseInt(numeroArco));
                }
                atualizarVisualizacao();
            });

            svgEl.appendChild(grupoFatia);
        });
    }

    function desenharCelulas() {
        const svgEl = document.getElementById("des_topo_armazem");
        
        // Desenhar indicadores de células (caixas na parte inferior)
        const celulas = [1, 2, 3]; // Baseado no exemplo
        const larguraCelula = 80;
        const alturaCelula = 30;
        const inicioX = 200;
        const inicioY = 360;

        celulas.forEach((numCelula, index) => {
            const x = inicioX + index * (larguraCelula + 10);
            
            // Retângulo da célula
            const rectCelula = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectCelula.setAttribute("id", `rec_celula${numCelula}`);
            rectCelula.setAttribute("x", x);
            rectCelula.setAttribute("y", inicioY);
            rectCelula.setAttribute("width", larguraCelula);
            rectCelula.setAttribute("height", alturaCelula);
            rectCelula.setAttribute("rx", "5");
            rectCelula.setAttribute("ry", "5");
            rectCelula.setAttribute("fill", celulaAtual === numCelula ? "#E6E6E6" : "#B3B3B3");
            rectCelula.setAttribute("stroke", celulaAtual === numCelula ? "#438AF6" : "#B3B3B3");
            rectCelula.setAttribute("stroke-width", "2");
            rectCelula.style.cursor = "pointer";

            // Texto da célula
            const textoCelula = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textoCelula.setAttribute("x", x + larguraCelula / 2);
            textoCelula.setAttribute("y", inicioY + alturaCelula / 2);
            textoCelula.setAttribute("text-anchor", "middle");
            textoCelula.setAttribute("dominant-baseline", "central");
            textoCelula.setAttribute("font-size", "12");
            textoCelula.setAttribute("font-weight", "bold");
            textoCelula.setAttribute("fill", "#495057");
            textoCelula.textContent = `Célula ${numCelula}`;
            textoCelula.style.cursor = "pointer";

            // Evento de clique para célula
            const clickHandler = () => {
                setCelulaAtual(numCelula);
                atualizarVisualizacao();
            };

            rectCelula.addEventListener('click', clickHandler);
            textoCelula.addEventListener('click', clickHandler);

            svgEl.appendChild(rectCelula);
            svgEl.appendChild(textoCelula);
        });
    }

    function obterTemperaturaMaximaArco(numeroArco) {
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
        if (!analiseArcos) return;

        // Atualizar cores das fatias
        Object.keys(analiseArcos.arcos).forEach(numeroArco => {
            const fatia = document.querySelector(`#arco_${numeroArco} path`);
            if (fatia) {
                fatia.setAttribute("fill", arcoAtual == numeroArco ? "#438AF6" : "#B3B3B3");
            }
        });
    }

    if (!dados || !analiseArcos) {
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
                            <h6 className="mb-0">Vista de Topo - Armazém</h6>
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
                                                    Total Geral: {analiseArcos.totalArcos} arcos, {' '}
                                                    {analiseArcos.estatisticas.totalPendulos} pêndulos
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

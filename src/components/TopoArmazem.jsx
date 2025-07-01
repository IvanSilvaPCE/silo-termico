
import React, { useState, useEffect, useRef } from 'react';
import dadosArmazemTopo from '../dadosArmazemTopo';
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
        const processarDados = () => {
            try {
                setCarregando(true);
                
                // Usar dados do arquivo
                const pendulos = dadosArmazemTopo.pendulos;
                setDadosPendulos(pendulos);
                
                // Converter dados dos pêndulos para formato do topo
                const dadosConvertidos = {};
                Object.entries(pendulos).forEach(([id, dados]) => {
                    dadosConvertidos[id] = [
                        dados[0], // falha
                        dados[0], // ponto quente (usando mesmo valor de falha por simplicidade)
                        dados[2], // nivel (ativo)
                        dados[3]  // temperatura
                    ];
                });
                setDadosTopo(dadosConvertidos);
                
                // Gerar layout automático baseado nos dados
                const layout = gerarLayoutAutomatico(pendulos);
                setLayoutTopo(layout);
                
            } catch (error) {
                console.error('Erro ao processar dados:', error);
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
        const totalArcos = Math.ceil(totalPendulos / 3); // 3 pêndulos por arco
        const totalCelulas = 3;
        
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

        // Distribuir pêndulos em arcos
        const pendulosArray = Object.entries(pendulos);
        let posX = 30;
        const espacamentoArco = 35;

        for (let arco = 1; arco <= totalArcos; arco++) {
            const celula = Math.ceil(arco / Math.ceil(totalArcos / totalCelulas));
            const pendulosDoArco = pendulosArray.slice((arco - 1) * 3, arco * 3);
            
            const sensores = {};
            pendulosDoArco.forEach(([id], index) => {
                const posY = 80 + (index * 60);
                sensores[id] = posY;
            });

            layout[arco] = {
                celula: Math.min(celula, totalCelulas),
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
        svgEl.setAttribute("height", "400px");
        svgEl.setAttribute("viewBox", `0 0 ${layoutTopo.celulas.tamanho_svg[0]} ${layoutTopo.celulas.tamanho_svg[1]}`);
        svgEl.setAttribute("style", "background: #f8f9fa; border-radius: 8px; shape-rendering:geometricPrecision; text-rendering:geometricPrecision;");

        container.appendChild(svgEl);

        // Desenhar elementos
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

        // Círculo de ponto quente (oculto inicialmente)
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

        grupo.appendChild(circulo);
        grupo.appendChild(rect);
        grupo.appendChild(texto);

        svgEl.appendChild(grupo);
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
        // Atualizar células
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

        // Atualizar arcos
        Object.keys(layoutTopo).forEach(key => {
            if (key !== 'celulas' && key !== 'aeradores') {
                const arcoNum = parseInt(key);
                const arcoData = layoutTopo[key];

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
        // Estados dos aeradores (exemplo)
        const estadosAeradores = [1, 1, 1, 1, 2, 2, 0, 0, 0, 0];
        
        estadosAeradores.forEach((estado, index) => {
            const aeradorId = index + 1;
            const fundo = document.getElementById(`fundo_aerador_${aeradorId}`);
            
            if (fundo) {
                let cor = "#c5c5c5"; // desligado
                if (estado === 1) cor = "#31dd0f"; // ligado
                else if (estado === 2) cor = "#ff0000"; // falha
                
                fundo.setAttribute("fill", cor);
            }
        });
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
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
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
                                onClick={() => setMostrarTopo ? setMostrarTopo(false) : onFecharTopo && onFecharTopo()}
                                title="Fechar Topo"
                            >
                                <i className="fas fa-times"></i> Fechar Topo
                            </button>
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
                                                <small>Célula: {celulaSelecionada}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-2 border rounded bg-light">
                                            <small className="fw-bold">Estatísticas:</small>
                                            <div className="mt-1">
                                                <small>
                                                    {Object.keys(dadosPendulos).length} pêndulos<br/>
                                                    {Object.values(dadosPendulos).filter(p => p[0]).length} em alarme<br/>
                                                    {Object.values(dadosPendulos).filter(p => p[2]).length} ativos
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
                                                    • Clique nos pêndulos (cabos)<br/>
                                                    • Clique nas células
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

import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";
import TopoArmazem from "./TopoArmazem";

const ArmazemSVG = ({ dados: dadosExternos }) => {
    const containerRef = useRef(null);
    const [modo, setModo] = useState("temperatura");
    const [carregandoModo, setCarregandoModo] = useState(false);
    const [dados, setDados] = useState(null);
    const [dadosPortal, setDadosPortal] = useState(null);
    const [arcoAtual, setArcoAtual] = useState(1);
    const [analiseArcos, setAnaliseArcos] = useState(null);
    const [layoutsAutomaticos, setLayoutsAutomaticos] = useState(null);
    const [mostrarTopo, setMostrarTopo] = useState(false);
    const [dimensoesSVG, setDimensoesSVG] = useState({ largura: 350, altura: 200 });

    // Carregar dados reais do arquivo JSON
    useEffect(() => {
        const inicializarDados = async () => {
            try {
                // Carregar dados do arquivo JSON
                const response = await fetch('/attached_assets/modeloRotaArmazemPortal_1751897945212.json');
                const dadosArmazemPortal = await response.json();
                setDadosPortal(dadosArmazemPortal);

                // Analisar estrutura dos arcos
                const analise = LayoutManager.analisarEstruturaArcos(dadosArmazemPortal);
                setAnaliseArcos(analise);

                // Gerar layouts automáticos
                const layouts = LayoutManager.gerarLayoutAutomatico(analise);
                setLayoutsAutomaticos(layouts);

                // Calcular dimensões ideais do SVG baseado em todos os arcos
                const dimensoes = calcularDimensoesIdeais(analise);
                setDimensoesSVG(dimensoes);

                // Converter dados para o formato do armazém (arco 1 inicialmente)
                const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosArmazemPortal, 1);
                setDados(dadosConvertidos);
            } catch (error) {
                console.error('Erro ao inicializar dados:', error);
            }
        };

        inicializarDados();
    }, []);

    // Atualizar SVG quando dados ou modo mudarem
    useEffect(() => {
        if (!dados) return;

        const container = containerRef.current;
        if (!container) return;

        const svgExistente = container.querySelector("#des_arco_armazem");
        if (svgExistente) svgExistente.remove();

        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgEl.setAttribute("id", "des_arco_armazem");
        svgEl.setAttribute("xml", "preserve");
        svgEl.setAttribute("version", "1.0");
        svgEl.setAttribute(
            "style",
            "shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
        );
        svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "85vh");
        svgEl.setAttribute("viewBox", `0 0 ${dimensoesSVG.largura} ${dimensoesSVG.altura}`);
        container.appendChild(svgEl);

        // Desenhar fundo e conteúdo
        desenhaFundo();
        if (modo === "temperatura") {
            desenhaSensores();
            atualizarSensores(dados);
        } else {
            desenhaMapaCalor();
        }
    }, [dados, modo, arcoAtual, layoutsAutomaticos]);

    // Calcular dimensões ideais do SVG baseado na análise de todos os arcos
    function calcularDimensoesIdeais(analiseArcos) {
        if (!analiseArcos) return { largura: 350, altura: 200 };

        let maxSensores = 0;
        let maxPendulos = 0;

        // Encontrar o máximo de sensores e pêndulos em todos os arcos
        Object.values(analiseArcos.arcos).forEach(arco => {
            maxPendulos = Math.max(maxPendulos, arco.totalPendulos);
            arco.pendulos.forEach(pendulo => {
                maxSensores = Math.max(maxSensores, pendulo.totalSensores);
            });
        });

        const escala_sensores = 16;
        const dist_y_sensores = 12;
        const margemSuperior = 30; // Margem para o telhado
        const margemInferior = 50; // Margem para os pêndulos (P1, P2, etc.)
        const margemPendulo = 20; // Espaço extra para o nome do pêndulo

        // Calcular altura necessária
        const alturaBaseTelhado = 185; // Altura base original
        const alturaSensores = maxSensores * dist_y_sensores + escala_sensores;
        const alturaTotal = Math.max(
            alturaBaseTelhado, 
            margemSuperior + alturaSensores + margemInferior + margemPendulo
        );

        // Calcular largura necessária (baseada no número de pêndulos)
        const larguraMinima = 350;
        const espacamentoPendulo = 50;
        const larguraCalculada = Math.max(larguraMinima, (maxPendulos * espacamentoPendulo) + 100);

        return {
            largura: larguraCalculada,
            altura: Math.max(alturaTotal, 250) // Altura mínima
        };
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

    function desenhaFundo() {
        const svgEl = document.getElementById("des_arco_armazem");
        // Usar dimensões dinâmicas mas manter proporções do armazém
        const pb = dimensoesSVG.altura - 50; // Posição base ajustada
        const lb = dimensoesSVG.largura;
        const hb = 30, hf = 5;
        const lf = Math.min(250, lb * 0.7); // Largura frente proporcional
        const le = 15, ht = 50;

        // Base/Estrutura (Cinza Escuro) - Ajustada para conectar com telhado expandido
        const p1 = [lb, pb - hb + 40], // Ajustado para conectar com telhado
            p2 = [lb - le, pb - hb + 40], // Ajustado para conectar com telhado
            p3 = [lb - ((lb - lf) / 2), pb - hf],
            p4 = [(lb - lf) / 2, pb - hf],
            p5 = [le, pb - hb + 40], // Ajustado para conectar com telhado
            p6 = [0, pb - hb + 40], // Ajustado para conectar com telhado
            p7 = [0, pb],
            p8 = [lb, pb];
        const pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")}`;

        const polBase = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polBase.setAttribute("fill", "#999999");
        polBase.setAttribute("id", "des_fundo");
        polBase.setAttribute("points", pathBase);

        // Telhado (Cinza Claro) - Expandido para baixo
        const p1_ = [(lb - lf) / 2, pb - hf],
            p2_ = [le, pb - hb + 40], // Expandido 40px para baixo
            p3_ = [le, pb - ht],
            p4_ = [lb / 2, 1],
            p5_ = [lb - le, pb - ht],
            p6_ = [lb - le, pb - hb + 40], // Expandido 40px para baixo
            p7_ = [lb - ((lb - lf) / 2), pb - hf];
        const pathTelhado = `${p1_.join(",")} ${p2_.join(",")} ${p3_.join(",")} ${p4_.join(",")} ${p5_.join(",")} ${p6_.join(",")} ${p7_.join(",")}`;

        const polTelhado = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polTelhado.setAttribute("fill", "#E6E6E6");
        polTelhado.setAttribute("stroke", "#999999");
        polTelhado.setAttribute("stroke-width", "1.7");
        polTelhado.setAttribute("stroke-linecap", "round");
        polTelhado.setAttribute("stroke-linejoin", "round");
        polTelhado.setAttribute("stroke-miterlimit", "23");
        polTelhado.setAttribute("id", "des_telhado");
        polTelhado.setAttribute("points", pathTelhado);

        svgEl.appendChild(polTelhado);
        svgEl.appendChild(polBase);
    }

    function desenhaSensores() {
        if (!layoutsAutomaticos || !analiseArcos) return;

        const svgEl = document.getElementById("des_arco_armazem");
        const layoutArco = layoutsAutomaticos[`arco_${arcoAtual}`];

        if (!layoutArco) return;

        const arcoInfo = analiseArcos.arcos[arcoAtual];
        if (!arcoInfo) return;

        const escala_sensores = 16;
        const dist_y_sensores = 12;
        const pb = dimensoesSVG.altura - 50; // Posição base ajustada
        const yPendulo = pb + 15; // Posição dos pêndulos - FORA do armazém

        arcoInfo.pendulos.forEach((pendulo, index) => {
            const xCabo = layoutArco.desenho_sensores.pos_x_cabo[index];
            const numSensores = pendulo.totalSensores;

            // Retângulo do nome do pêndulo
            const rectPendulo = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectPendulo.setAttribute("id", `C${index + 1}`);
            rectPendulo.setAttribute("x", xCabo - escala_sensores/2);
            rectPendulo.setAttribute("y", yPendulo);
            rectPendulo.setAttribute("width", escala_sensores);
            rectPendulo.setAttribute("height", escala_sensores/2);
            rectPendulo.setAttribute("rx", "2");
            rectPendulo.setAttribute("ry", "2");
            rectPendulo.setAttribute("fill", "#3A78FD");
            svgEl.appendChild(rectPendulo);

            // Texto do nome do pêndulo
            const textPendulo = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textPendulo.setAttribute("id", `TC${index + 1}`);
            textPendulo.setAttribute("x", xCabo);
            textPendulo.setAttribute("y", yPendulo + escala_sensores/4);
            textPendulo.setAttribute("text-anchor", "middle");
            textPendulo.setAttribute("dominant-baseline", "central");
            textPendulo.setAttribute("font-weight", "bold");
            textPendulo.setAttribute("font-size", escala_sensores * 0.4 - 0.5);
            textPendulo.setAttribute("font-family", "Arial");
            textPendulo.setAttribute("fill", "white");
            textPendulo.textContent = `P${pendulo.numero}`;
            svgEl.appendChild(textPendulo);

            // Sensores - ajustar posicionamento para ficar dentro do SVG
            for (let s = 1; s <= numSensores; s++) {
                const ySensor = yPendulo - dist_y_sensores * s - 25; // Mais espaço do pêndulo

                // Garantir que o sensor está dentro dos limites do SVG
                if (ySensor > 10 && ySensor < (dimensoesSVG.altura - 60)) {
                    // Retângulo do sensor
                    const rectSensor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rectSensor.setAttribute("id", `C${index + 1}S${s}`);
                    rectSensor.setAttribute("x", xCabo - escala_sensores/2);
                    rectSensor.setAttribute("y", ySensor);
                    rectSensor.setAttribute("width", escala_sensores);
                    rectSensor.setAttribute("height", escala_sensores/2);
                    rectSensor.setAttribute("rx", "2");
                    rectSensor.setAttribute("ry", "2");
                    rectSensor.setAttribute("fill", "#ccc");
                    rectSensor.setAttribute("stroke", "black");
                    rectSensor.setAttribute("stroke-width", "1");
                    svgEl.appendChild(rectSensor);

                    // Texto do valor do sensor
                    const textSensor = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    textSensor.setAttribute("id", `TC${index + 1}S${s}`);
                    textSensor.setAttribute("x", xCabo);
                    textSensor.setAttribute("y", ySensor + escala_sensores/4);
                    textSensor.setAttribute("text-anchor", "middle");
                    textSensor.setAttribute("dominant-baseline", "central");
                    textSensor.setAttribute("font-size", escala_sensores * 0.4 - 0.5);
                    textSensor.setAttribute("font-family", "Arial");
                    textSensor.textContent = "0";
                    svgEl.appendChild(textSensor);

                    // Nome do sensor
                    const textNomeSensor = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    textNomeSensor.setAttribute("id", `TIND${index + 1}S${s}`);
                    textNomeSensor.setAttribute("x", xCabo - escala_sensores/2 - 2);
                    textNomeSensor.setAttribute("y", ySensor + escala_sensores/4);
                    textNomeSensor.setAttribute("text-anchor", "end");
                    textNomeSensor.setAttribute("dominant-baseline", "central");
                    textNomeSensor.setAttribute("font-size", escala_sensores * 0.4 - 1.5);
                    textNomeSensor.setAttribute("font-family", "Arial");
                    textNomeSensor.setAttribute("fill", "black");
                    textNomeSensor.textContent = `S${s}`;
                    svgEl.appendChild(textNomeSensor);
                }
            }
        });
    }

    function desenhaMapaCalor() {
        if (!layoutsAutomaticos || !analiseArcos || !dados) return;

        const svgEl = document.getElementById("des_arco_armazem");
        const layoutArco = layoutsAutomaticos[`arco_${arcoAtual}`];
        const arcoInfo = analiseArcos.arcos[arcoAtual];

        if (!layoutArco || !arcoInfo) return;

        const largura = dimensoesSVG.largura, altura = dimensoesSVG.altura;
        const resolucao = 160;
        const wCell = largura / resolucao;
        const hCell = altura / resolucao;

        // Coletar sensores e suas posições
        const sensores = [];
        Object.entries(dados.leitura).forEach(([pendulo, sensoresData], penduloIndex) => {
            const xCabo = layoutArco.desenho_sensores.pos_x_cabo[penduloIndex];
            const yCabo = dimensoesSVG.altura - 50 + 15; // Posição base dos pêndulos ajustada

            Object.entries(sensoresData).forEach(([sensorKey, dadosSensor]) => {
                const s = parseInt(sensorKey);
                const [temp, , , , ativo] = dadosSensor;
                const ySensor = yCabo - 12 * s - 12;

                sensores.push({
                    x: xCabo,
                    y: ySensor,
                    t: parseFloat(temp) || -1000,
                    ativo: ativo === true
                });
            });
        });

        // Função IDW para interpolação
        function idw(cx, cy) {
            let somaPesos = 0;
            let somaTemp = 0;
            const power = 2;
            let temSensorAtivo = false;

            sensores.forEach(({ x, y, t, ativo }) => {
                if (t === -1000 || !ativo) return;
                temSensorAtivo = true;
                const dist = Math.max(Math.hypot(x - cx, y - cy), 0.0001);
                const peso = 1 / Math.pow(dist, power);
                somaPesos += peso;
                somaTemp += t * peso;
            });

            return temSensorAtivo && somaPesos !== 0 ? somaTemp / somaPesos : null;
        }

        // Gerar grid de blocos
        const blocos = [];
        for (let i = 0; i < resolucao; i++) {
            for (let j = 0; j < resolucao; j++) {
                const cx = i * wCell + wCell / 2;
                const cy = j * hCell + hCell / 2;
                const tempInterpolada = idw(cx, cy);
                const cor = tempInterpolada === null ? "#ffffff" : corFaixaExata(tempInterpolada);

                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", i * wCell);
                rect.setAttribute("y", j * hCell);
                rect.setAttribute("width", wCell);
                rect.setAttribute("height", hCell);
                rect.setAttribute("fill", cor);
                blocos.push(rect);
            }
        }

        // Definir clip path para formato do armazém - usar dimensões dinâmicas
        const lb = dimensoesSVG.largura;
        const pb = dimensoesSVG.altura - 50;
        const lf = Math.min(250, lb * 0.7);
        const le = 15, hb = 30, hf = 5, ht = 50;
        const p1 = [(lb - lf) / 2, pb - hf],
            p2 = [le, pb - hb],
            p3 = [le, pb - ht],
            p4 = [lb / 2, 1],
            p5 = [lb - le, pb - ht],
            p6 = [lb - le, pb - hb],
            p7 = [lb - (lb - lf) / 2, pb - hf];
        const pathD = `M ${p1.join(",")} L ${p2.join(",")} L ${p3.join(",")} L ${p4.join(",")} L ${p5.join(",")} L ${p6.join(",")} L ${p7.join(",")} Z`;

        // Criar elementos de filtro e clip
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", "blurFilter");
        const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        blur.setAttribute("stdDeviation", "0.4");
        filter.appendChild(blur);
        defs.appendChild(filter);

        const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", "clipArmazem");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        clipPath.appendChild(path);
        defs.appendChild(clipPath);

        svgEl.appendChild(defs);

        // Adicionar blocos com filtros
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("filter", "url(#blurFilter)");
        g.setAttribute("clip-path", "url(#clipArmazem)");
        blocos.forEach((bloco) => g.appendChild(bloco));
        svgEl.appendChild(g);
    }

    function atualizarSensores(dadosArco) {
        if (!dadosArco?.leitura || !analiseArcos) return;

        Object.entries(dadosArco.leitura).forEach(([idCabo, sensores], penduloIndex) => {
            Object.entries(sensores).forEach(([s, [temp, , , falha, nivel]]) => {
                const rec = document.getElementById(`C${penduloIndex + 1}S${s}`);
                const txt = document.getElementById(`TC${penduloIndex + 1}S${s}`);
                if (!rec || !txt) return;

                txt.textContent = falha ? "ERRO" : temp.toFixed(1);
                if (!nivel) {
                    rec.setAttribute("fill", "#e6e6e6");
                    txt.setAttribute("fill", "black");
                } else {
                    const cor = corFaixaExata(temp);
                    rec.setAttribute("fill", cor);
                    txt.setAttribute("fill", cor === "#ff2200" ? "white" : "black");
                }
            });
        });
    }

    function trocarModo() {
        setCarregandoModo(true);
        setTimeout(() => {
            setModo(modo === "temperatura" ? "mapa" : "temperatura");
            setCarregandoModo(false);
        }, 600);
    }

    const mudarArco = (novoArco) => {
        setArcoAtual(novoArco);
        if (dadosPortal) {
            const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosPortal, novoArco);
            setDados(dadosConvertidos);
        }
    };

    const handleArcoSelecionadoTopo = (numeroArco) => {
        mudarArco(numeroArco);
        setMostrarTopo(false); // Fechar topo após seleção
    };

    const BotaoTrocaModo = () => (
        <button className="btn btn-primary" onClick={trocarModo}>
            {modo === "temperatura" ? "Ver Mapa de Calor" : "Ver Temperatura"}
        </button>
    );

    const BotaoTopo = () => (
        <button 
            className={`btn ${mostrarTopo ? 'btn-success' : 'btn-outline-info'} ms-2`} 
            onClick={() => setMostrarTopo(!mostrarTopo)}
        >
            {mostrarTopo ? "Fechar Topo" : "Vista de Topo"}
        </button>
    );

    const RenderArmazem = () => (
        <div ref={containerRef} className="d-flex justify-content-center" style={{ height: '85vh', minHeight: '400px' }} />
    );

    return (
        <div className="container-fluid p-1 p-md-2" style={{ minHeight: '100vh', overflow: 'auto' }}>
            <div className="row">
                <div className="col-12">
                    <h1 className="text-center mb-1 mb-md-2 fs-4 fs-md-1">Armazém - Monitoramento de Temperatura</h1>

                    {carregandoModo ? (
                        <div className="d-flex justify-content-center m-2">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </div>
                        </div>
                    ) : mostrarTopo ? (
                        <TopoArmazem 
                            onArcoSelecionado={handleArcoSelecionadoTopo}
                            arcoAtual={arcoAtual}
                            onFecharTopo={() => setMostrarTopo(false)}
                        />
                    ) : (
                        <div className="svg-container mb-1 mb-md-2" style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            minHeight: 'calc(100vh - 200px)',
                            maxHeight: 'calc(100vh - 140px)',
                            overflow: 'auto'
                        }}>
                            <RenderArmazem />
                        </div>
                    )}

                    {/* Controles de Navegação entre Arcos */}
                    {analiseArcos && (
                        <div className="row mb-3">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header bg-primary text-white">
                                        <h6 className="mb-0">Controle de Arcos - Configuração Automática</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row align-items-center">
                                            <div className="col-md-6">
                                                <label className="form-label">Arco Atual:</label>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => mudarArco(Math.max(1, arcoAtual - 1))}
                                                        disabled={arcoAtual <= 1}
                                                    >
                                                        ← Anterior
                                                    </button>
                                                    <select 
                                                        className="form-select"
                                                        value={arcoAtual}
                                                        onChange={(e) => mudarArco(parseInt(e.target.value))}
                                                    >
                                                        {Object.keys(analiseArcos.arcos).map(numeroArco => {
                                                            const arco = analiseArcos.arcos[numeroArco];
                                                            return (
                                                                <option key={numeroArco} value={numeroArco}>
                                                                    Arco {numeroArco} - {arco.totalPendulos} pêndulos, {arco.totalSensores} sensores
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => mudarArco(Math.min(analiseArcos.totalArcos, arcoAtual + 1))}
                                                        disabled={arcoAtual >= analiseArcos.totalArcos}
                                                    >
                                                        Próximo →
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="p-2 border rounded bg-light">
                                                    <small className="fw-bold">Estrutura do Arco {arcoAtual}:</small>
                                                    <div className="mt-2">
                                                        {analiseArcos.arcos[arcoAtual] && 
                                                            analiseArcos.arcos[arcoAtual].pendulos.map(pendulo => (
                                                                <span key={pendulo.numero} className="badge bg-primary me-1 mb-1">
                                                                    P{pendulo.numero}: {pendulo.totalSensores} sensores
                                                                </span>
                                                            ))
                                                        }
                                                    </div>
                                                    <hr className="my-2" />
                                                    <small className="text-muted">
                                                        <strong>Total Geral:</strong><br/>
                                                        • {analiseArcos.totalArcos} arcos<br/>
                                                        • {analiseArcos.estatisticas.totalPendulos} pêndulos<br/>
                                                        • {analiseArcos.estatisticas.totalSensores} sensores
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="d-flex justify-content-center py-2">
                        <BotaoTrocaModo />
                        <BotaoTopo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArmazemSVG;
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const ArmazemSVG = ({ dados: dadosExternos }) => {
    const containerRef = useRef(null);
    const [modo, setModo] = useState("temperatura");
    const [carregandoModo, setCarregandoModo] = useState(false);
    const [layoutAtual, setLayoutAtual] = useState("default");
    const [layoutConfig, setLayoutConfig] = useState(null);
    const [dados, setDados] = useState(dadosExternos);
    const [tipoLayout, setTipoLayout] = useState("antigo"); // "antigo" ou "portal"
    const [dadosPortal, setDadosPortal] = useState(null);
    const [celulaAtual, setCelulaAtual] = useState(1);

    const layoutArco = {
        tamanho_svg: [350, 200],
        desenho_sensores: {
            escala_cores_sensores: 2,
            nome_sensores_direita: 0,
            nome_cabo_acima: 0,
            escala_sensores: 16,
            dist_y_sensores: 12,
            dist_y_nome_cabo: [8, 8, 8, 8, 8],
            pos_x_cabos_uniforme: 1,
            pos_x_cabo: [62, 52, 158, 208, 258],
            pos_y_cabo: [181, 181, 181, 181, 181],
        },
        desenho_arco: {
            tipo_telhado: 1,
            pb: 185,
            lb: 350,
            hb: 30,
            hf: 5,
            lf: 250,
            le: 15,
            ht: 50,
            ctrl_p1: [60, 30],
            ctrl_p2: [97, 10],
        },
        cabos: { "1": 5, "2": 8, "3": 11, "4": 8, "5": 5 }, // Distribuição piramidal
    };

    // Atualizar dados internos quando props mudam
    useEffect(() => {
        setDados(dadosExternos);
    }, [dadosExternos]);

    // Carregar layouts disponíveis e aplicar layout selecionado
    useEffect(() => {
        const carregarLayouts = async () => {
            await LayoutManager.carregarLayoutsArmazem();
            await LayoutManager.carregarLayoutsArmazemPortal();

            if (tipoLayout === "portal") {
                const dadosPortalCarregados = await LayoutManager.carregarDadosArmazemPortal();
                setDadosPortal(dadosPortalCarregados);

                // Converter dados do portal para o formato do armazém
                const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosPortalCarregados);
                if (dadosConvertidos) {
                    setDados(dadosConvertidos);
                }
            } else if (dados && layoutAtual !== "default") {
                const layoutAdaptado = LayoutManager.adaptarLayoutParaDados("armazem", layoutAtual, dados);
                if (layoutAdaptado) {
                    setLayoutConfig(layoutAdaptado);
                }
            }
        };

        carregarLayouts();
    }, [dados, layoutAtual, tipoLayout]);

    useEffect(() => {
        const container = containerRef.current;
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

        // Usar layout adaptado se disponível
        const layoutFinal = layoutConfig || layoutArco;

        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "85vh");
        svgEl.setAttribute(
            "viewBox",
            `0 0 ${layoutFinal.tamanho_svg?.[0] || layoutArco.tamanho_svg[0]} ${layoutFinal.tamanho_svg?.[1] || layoutArco.tamanho_svg[1]}`
        );
        container.appendChild(svgEl);

        desenhaFundo(layoutFinal);
        if (modo === "temperatura") {
            desenhaSensores(layoutArco);
            if (dados) atualizarSensores(dados);
        } else {
            desenhaMapaCalor(layoutArco);
        }
    }, [dados, modo]);

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

    function desenhaFundo(layout) {
        const svgEl = document.getElementById("des_arco_armazem");
        const { tipo_telhado, pb, lb, hb, hf, lf, le, ht } = layout.desenho_arco;
        const p1 = [lb, pb - hb],
            p2 = [lb - le, pb - hb],
            p3 = [lb - ((lb - lf) / 2), pb - hf],
            p4 = [(lb - lf) / 2, pb - hf],
            p5 = [le, pb - hb],
            p6 = [0, pb - hb],
            p7 = [0, pb],
            p8 = [lb, pb];
        const pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(
            ","
        )} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")}`;
        const polBase = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polBase.setAttribute("fill", "#999999");
        polBase.setAttribute("id", "des_fundo");
        polBase.setAttribute("points", pathBase);
        let polTelhado = null;
        if (tipo_telhado === 1) {
            const p1_ = [(lb - lf) / 2, pb - hf],
                p2_ = [le, pb - hb],
                p3_ = [le, pb - ht],
                p4_ = [lb / 2, 1],
                p5_ = [lb - le, pb - ht],
                p6_ = [lb - le, pb - hb],
                p7_ = [lb - ((lb - lf) / 2), pb - hf];
            const pathTelhado = `${p1_.join(",")} ${p2_.join(",")} ${p3_.join(
                ","
            )} ${p4_.join(",")} ${p5_.join(",")} ${p6_.join(",")} ${p7_.join(",")}`;
            polTelhado = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polTelhado.setAttribute("fill", "#E6E6E6");
            polTelhado.setAttribute("stroke", "#999999");
            polTelhado.setAttribute("stroke-width", "1.7");
            polTelhado.setAttribute("stroke-linecap", "round");
            polTelhado.setAttribute("stroke-linejoin", "round");
            polTelhado.setAttribute("stroke-miterlimit", "23");
            polTelhado.setAttribute("id", "des_telhado");
            polTelhado.setAttribute("points", pathTelhado);
        }
        svgEl.appendChild(polTelhado);
        svgEl.appendChild(polBase);
    }

    // Função para gerar distribuição piramidal de sensores
    function gerarDistribuicaoPiramidal(totalPendulos, totalSensores) {
        if (totalPendulos === 1) return [totalSensores];

        const minSensores = 5; // Mínimo nas pontas
        const distribuicao = new Array(totalPendulos).fill(minSensores);
        let sensoresRestantes = totalSensores - (totalPendulos * minSensores);

        // Distribuir sensores extras priorizando o centro
        const centro = Math.floor(totalPendulos / 2);
        for (let offset = 0; offset <= centro && sensoresRestantes > 0; offset++) {
            const indices = offset === 0 ? [centro] : 
                           totalPendulos % 2 === 1 ? [centro - offset, centro + offset] :
                           offset === 1 ? [centro - 1, centro] : [centro - offset, centro + offset - 1];

            indices.forEach(idx => {
                if (idx >= 0 && idx < totalPendulos && sensoresRestantes > 0) {
                    distribuicao[idx]++;
                    sensoresRestantes--;
                }
            });
        }

        return distribuicao;
    }

    function desenhaSensores(layout) {
        const svgEl = document.getElementById("des_arco_armazem");
        const cabosIds = Object.keys(layout.cabos);
        const { escala_sensores, dist_y_sensores } = layout.desenho_sensores;
        const { pb, lb, hb } = layout.desenho_arco;

        // Calcular distribuição piramidal
        const totalSensores = Object.values(layout.cabos).reduce((a, b) => a + b, 0);
        const distribuicao = gerarDistribuicaoPiramidal(cabosIds.length, totalSensores);

        // Posicionar pêndulos fixos abaixo do layout
        const yPendulo = pb - hb - 5;
        const espacamento = (lb - 100) / Math.max(1, cabosIds.length - 1);
        const xInicial = 50;

        cabosIds.forEach((id, i) => {
            const xCabo = xInicial + (i * espacamento);
            const numSensores = distribuicao[i];

            // Pêndulo fixo abaixo
            const elementos = [
                { tipo: 'rect', attrs: { id: `C${i + 1}`, x: xCabo - escala_sensores/2, y: yPendulo, 
                    width: escala_sensores, height: escala_sensores/2, rx: "2", ry: "2", fill: "#3A78FD" }},
                { tipo: 'text', attrs: { id: `TC${i + 1}`, x: xCabo, y: yPendulo + escala_sensores/4,
                    'text-anchor': "middle", 'dominant-baseline': "central", 'font-weight': "bold",
                    'font-size': escala_sensores * 0.4 - 0.5, 'font-family': "Arial", fill: "white" },
                    texto: `P${id}` }
            ];

            // Sensores dentro do layout
            const yMaxSensor = yPendulo - 15;
            const alturaDisponivel = yMaxSensor - 20; // Margem superior
            const espacamentoSensor = Math.min(dist_y_sensores, alturaDisponivel / numSensores);

            for (let s = 1; s <= numSensores; s++) {
                const ySensor = yMaxSensor - (espacamentoSensor * s);

                elementos.push(
                    { tipo: 'rect', attrs: { id: `C${i + 1}S${s}`, x: xCabo - escala_sensores/2, y: ySensor,
                        width: escala_sensores, height: escala_sensores/2, rx: "2", ry: "2", fill: "#ccc",
                        stroke: "black", 'stroke-width': "1" }},
                    { tipo: 'text', attrs: { id: `TC${i + 1}S${s}`, x: xCabo, y: ySensor + escala_sensores/4,
                        'text-anchor': "middle", 'dominant-baseline': "central", 'font-size': escala_sensores * 0.4 - 0.5,
                        'font-family': "Arial" }, texto: "0" },
                    { tipo: 'text', attrs: { id: `TIND${i + 1}S${s}`, x: xCabo - escala_sensores/2 - 2, y: ySensor + escala_sensores/4,
                        'text-anchor': "end", 'dominant-baseline': "central", 'font-size': escala_sensores * 0.4 - 1.5,
                        'font-family': "Arial", fill: "black" }, texto: `S${s}` }
                );
            }

            // Criar elementos no DOM
            elementos.forEach(({ tipo, attrs, texto }) => {
                const el = document.createElementNS("http://www.w3.org/2000/svg", tipo);
                Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
                if (texto) el.textContent = texto;
                svgEl.appendChild(el);
            });
        });
    }

    function desenhaMapaCalor(layout) {
        const svgEl = document.getElementById("des_arco_armazem");
        const ds = layout.desenho_sensores;
        const { pb, lb, hb, hf, lf, le, ht } = layout.desenho_arco;
        const [largura, altura] = layout.tamanho_svg;
        const resolucao = 320;
        const wCell = largura / resolucao;
        const hCell = altura / resolucao;

        const sensores = [];
        if (dados && dados.leitura) {
            Object.entries(layout.cabos).forEach(([pend, qtd], idxCabo) => {
                const objSensores = dados.leitura[pend] || {};
                const xCabo = ds.pos_x_cabo[idxCabo];
                const yCabo = ds.pos_y_cabo[idxCabo];
                Object.entries(objSensores).forEach(([sensorKey, dadosSensor]) => {
                    const t = parseFloat(dadosSensor[0]) || -1000;
                    sensores.push({
                        x: xCabo,
                        y: yCabo - ds.dist_y_sensores * parseInt(sensorKey, 10) - 12,
                        t,
                        ativo: dadosSensor[4] === true
                    });
                });
            });
        }

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

        const p1 = [(lb - lf) / 2, pb - hf],
            p2 = [le, pb - hb],
            p3 = [le, pb - ht],
            p4 = [lb / 2, 1],
            p5 = [lb - le, pb - ht],
            p6 = [lb - le, pb - hb],
            p7 = [lb - ((lb - lf) / 2), pb - hf];
        const pathD = `M ${p1.join(",")} L ${p2.join(",")} L ${p3.join(",")} L ${p4.join(
            ","
        )} L ${p5.join(",")} L ${p6.join(",")} L ${p7.join(",")} Z`;

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

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("filter", "url(#blurFilter)");
        g.setAttribute("clip-path", "url(#clipArmazem)");
        blocos.forEach((bloco) => g.appendChild(bloco));
        svgEl.appendChild(g);
    }

    function atualizarSensores(dadosArco) {
        Object.entries(dadosArco.leitura).forEach(([idCabo, sensores], i) => {
            Object.entries(sensores).forEach(([s, [temp, , , falha, nivel]]) => {
                const rec = document.getElementById(`C${i + 1}S${s}`);
                const txt = document.getElementById(`TC${i + 1}S${s}`);
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

    const BotaoTrocaModo = () => (
        <button className="btn btn-primary" onClick={trocarModo}>
            {modo === "temperatura" ? "Ver Mapa de Calor" : "Ver Temperatura"}
        </button>
    );

    const SeletorLayout = () => {
        const layoutsDisponiveis = LayoutManager.listarLayouts("armazem");
        const layoutsPortal = LayoutManager.listarLayouts("portal");

        const InfoCelulas = () => {
            if (tipoLayout === "portal" && dadosPortal) {
                const infoCelulas = LayoutManager.obterInfoCelulasPortal(dadosPortal);
                if (!infoCelulas) return null;

                return (
                    <div className="mt-2 p-2 border rounded bg-light">
                        <small className="fw-bold">Estrutura do ArmazemPortal:</small>
                        <div className="row mt-1">
                            {Object.values(infoCelulas).map(celula => (
                                <div key={celula.numero} className="col-auto">
                                    <span className="badge bg-success me-1">
                                        Célula {celula.numero}: {celula.totalPendulos} pêndulos
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2">
                            <small className="text-muted">
                                Total de pêndulos: {Object.keys(dadosPortal.pendulos || {}).length} | 
                                Total de arcos: {Object.keys(dadosPortal.arcos || {}).length}
                            </small>
                        </div>
                    </div>
                );
            }

            if (layoutAtual === "default" || tipoLayout === "portal") return null;

            const infoCelulas = LayoutManager.obterInfoCelulas(layoutAtual);
            if (!infoCelulas) return null;

            return (
                <div className="mt-2 p-2 border rounded bg-light">
                    <small className="fw-bold">Estrutura do Layout {layoutAtual}:</small>
                    <div className="row mt-1">
                        {Object.values(infoCelulas).map(celula => (
                            <div key={celula.numero} className="col-auto">
                                <span className="badge bg-primary me-1">
                                    Célula {celula.numero}: {celula.pendulos.length} pêndulos
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        return (
            <div className="mb-3">
                <div className="row align-items-center mb-2">
                    <div className="col-md-12">
                        <label className="form-label">Tipo de Layout:</label>
                        <div className="d-flex gap-3">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="tipoLayout"
                                    id="layoutAntigo"
                                    checked={tipoLayout === "antigo"}
                                    onChange={() => setTipoLayout("antigo")}
                                />
                                <label className="form-check-label" htmlFor="layoutAntigo">
                                    Layout Antigo (Padrão)
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="tipoLayout"
                                    id="layoutPortal"
                                    checked={tipoLayout === "portal"}
                                    onChange={() => setTipoLayout("portal")}
                                />
                                <label className="form-check-label" htmlFor="layoutPortal">
                                    ArmazemPortal (Novo Modelo)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row align-items-center">
                    <div className="col-md-6">
                        <label className="form-label">
                            {tipoLayout === "portal" ? "Layout ArmazemPortal:" : "Layout por Células:"}
                        </label>
                        {tipoLayout === "portal" ? (
                            <select 
                                className="form-select"
                                value="portal"
                                disabled
                            >
                                <option value="portal">ArmazemPortal - Modelo Exemplo</option>
                            </select>
                        ) : (
                            <select 
                                className="form-select"
                                value={layoutAtual}
                                onChange={(e) => setLayoutAtual(e.target.value)}
                            >
                                <option value="default">Layout Padrão</option>
                                {layoutsDisponiveis.map(nome => (
                                    <option key={nome} value={nome}>
                                        Layout {nome} - {LayoutManager.obterInfoCelulas(nome) ? 
                                            Object.keys(LayoutManager.obterInfoCelulas(nome)).length + ' células' : 
                                            'Layout complexo'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="col-md-6">
                        {tipoLayout === "portal" ? (
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => {
                                        const dadosExemplo = LayoutManager.gerarDadosExemploPortal();
                                        setDadosPortal(dadosExemplo);
                                        const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosExemplo);
                                        setDados(dadosConvertidos);
                                        setCelulaAtual(1);
                                        alert("Dados de exemplo ArmazemPortal gerados!");
                                    }}
                                >
                                    Gerar Exemplo Portal
                                </button>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        console.log("Dados Portal:", dadosPortal);
                                        console.log("Dados Convertidos:", dados);
                                        console.log("Célula Atual:", celulaAtual);
                                    }}
                                >
                                    Debug Dados
                                </button>
                            </div>
                        ) : layoutAtual !== "default" && (
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-info btn-sm"
                                    onClick={() => {
                                        const layoutAdaptado = LayoutManager.adaptarLayoutParaDados("armazem", layoutAtual, dados);
                                        if (layoutAdaptado) {
                                            setLayoutConfig(layoutAdaptado);
                                            alert(`Layout "${layoutAtual}" adaptado aos dados!`);
                                        }
                                    }}
                                >
                                    Adaptar aos Dados
                                </button>
                                <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => {
                                        const dadosExemplo = LayoutManager.gerarDadosExemplo(layoutAtual);
                                        if (dadosExemplo) {
                                            setDados(dadosExemplo);
                                            alert(`Dados de exemplo gerados para layout "${layoutAtual}"!`);
                                        }
                                    }}
                                >
                                    Gerar Exemplo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <InfoCelulas />

                {tipoLayout === "portal" && dadosPortal && (
                    <small className="text-success d-block mt-2">
                        ArmazemPortal carregado com {Object.keys(dadosPortal.pendulos || {}).length} pêndulos e {Object.keys(dadosPortal.arcos || {}).length} arcos
                    </small>
                )}

                {layoutConfig && tipoLayout !== "portal" && (
                    <small className="text-success d-block mt-2">
                        Layout "{layoutAtual}" aplicado com {Object.keys(dados?.leitura || {}).length} pêndulos
                    </small>
                )}
            </div>
        );
    };

    const RenderArmazemTemperatura = () => (
        <div ref={containerRef} className="d-flex justify-content-center" style={{ height: '85vh', minHeight: '400px' }} />
    );

    const RenderArmazemMapa = () => (
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
                    ) : (
                        <div className="svg-container mb-1 mb-md-2" style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            minHeight: 'calc(100vh - 200px)',
                            maxHeight: 'calc(100vh - 140px)',
                            overflow: 'auto'
                        }}>
                            {modo === "temperatura" ? <RenderArmazemTemperatura /> : <RenderArmazemMapa />}
                        </div>
                    )}

                    <div className="row mb-1 mb-md-2">
                        <div className="col-12">
                            <SeletorLayout />
                        </div>
                    </div>

                    <div className="d-flex justify-content-center py-2">
                        <BotaoTrocaModo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArmazemSVG;
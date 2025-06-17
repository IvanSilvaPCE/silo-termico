import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const ArmazemSVG = ({ dados }) => {
    const containerRef = useRef(null);
    const [modo, setModo] = useState("temperatura");
    const [carregandoModo, setCarregandoModo] = useState(false);
    const [layoutAtual, setLayoutAtual] = useState("default");
    const [layoutConfig, setLayoutConfig] = useState(null);

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
        cabos: { "1": 5, "2": 7, "3": 9, "4": 7, "5": 5 },
    };

    // Carregar layout baseado nos dados
    useEffect(() => {
        if (dados && layoutAtual !== "default") {
            const layoutAdaptado = LayoutManager.adaptarLayoutParaDados("armazem", layoutAtual, dados);
            if (layoutAdaptado) {
                setLayoutConfig(layoutAdaptado);
            }
        }
    }, [dados, layoutAtual]);

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
        svgEl.setAttribute("height", "70vh");
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

    function desenhaSensores(layout) {
        const svgEl = document.getElementById("des_arco_armazem");
        const cabosIds = Object.keys(layout.cabos);
        cabosIds.forEach((id, i) => {
            const retNome = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            retNome.setAttribute("id", `C${i + 1}`);
            retNome.setAttribute("width", layout.desenho_sensores.escala_sensores);
            retNome.setAttribute("height", layout.desenho_sensores.escala_sensores / 2);
            retNome.setAttribute("rx", "2");
            retNome.setAttribute("ry", "2");
            retNome.setAttribute("fill", "#3A78FD");
            retNome.setAttribute("x", 50 + i * 60);
            retNome.setAttribute("y", 185);

            const txtNome = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txtNome.setAttribute("id", `TC${i + 1}`);
            txtNome.setAttribute("text-anchor", "middle");
            txtNome.setAttribute("dominant-baseline", "central");
            txtNome.setAttribute("font-weight", "bold");
            txtNome.setAttribute(
                "font-size",
                layout.desenho_sensores.escala_sensores * 0.4 - 0.5
            );
            txtNome.setAttribute("font-family", "Arial");
            txtNome.textContent = `P${id}`;
            txtNome.setAttribute("fill", "white");
            txtNome.setAttribute(
                "x",
                parseFloat(retNome.getAttribute("x")) + layout.desenho_sensores.escala_sensores / 2
            );
            txtNome.setAttribute(
                "y",
                parseFloat(retNome.getAttribute("y")) + layout.desenho_sensores.escala_sensores / 4
            );

            svgEl.appendChild(retNome);
            svgEl.appendChild(txtNome);

            const numSensores = layout.cabos[id];
            const txtNumPendulos = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txtNumPendulos.setAttribute("id", `TPEND${i + 1}`);
            txtNumPendulos.setAttribute("text-anchor", "middle");
            txtNumPendulos.setAttribute("dominant-baseline", "central");
            txtNumPendulos.setAttribute("font-weight", "bold");
            txtNumPendulos.setAttribute(
                "font-size",
                layout.desenho_sensores.escala_sensores * 0.3
            );
            txtNumPendulos.setAttribute("font-family", "Arial");
            txtNumPendulos.textContent = `${numSensores} Pendulos`;
            txtNumPendulos.setAttribute("fill", "white");
            txtNumPendulos.setAttribute("x", txtNome.getAttribute("x"));
            txtNumPendulos.setAttribute(
                "y",
                parseFloat(txtNome.getAttribute("y")) + 35
            );
            svgEl.appendChild(txtNumPendulos);

            for (let s = 1; s <= numSensores; s++) {
                const recSensor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                recSensor.setAttribute("id", `C${i + 1}S${s}`);
                recSensor.setAttribute("width", layout.desenho_sensores.escala_sensores);
                recSensor.setAttribute("height", layout.desenho_sensores.escala_sensores / 2);
                recSensor.setAttribute("rx", "2");
                recSensor.setAttribute("ry", "2");
                recSensor.setAttribute("fill", "#ccc");
                recSensor.setAttribute("x", retNome.getAttribute("x"));
                const ySensor =
                    parseFloat(retNome.getAttribute("y")) - layout.desenho_sensores.dist_y_sensores * s - 12;
                recSensor.setAttribute("y", Math.max(ySensor, 10));
                recSensor.setAttribute("stroke", "black");
                recSensor.setAttribute("stroke-width", "1");

                const txtSensor = document.createElementNS("http://www.w3.org/2000/svg", "text");
                txtSensor.setAttribute("id", `TC${i + 1}S${s}`);
                txtSensor.setAttribute("text-anchor", "middle");
                txtSensor.setAttribute("dominant-baseline", "central");
                txtSensor.setAttribute("font-size", layout.desenho_sensores.escala_sensores * 0.4 - 0.5);
                txtSensor.setAttribute("font-family", "Arial");
                txtSensor.textContent = "0";
                txtSensor.setAttribute(
                    "x",
                    parseFloat(recSensor.getAttribute("x")) + layout.desenho_sensores.escala_sensores / 2
                );
                txtSensor.setAttribute(
                    "y",
                    parseFloat(recSensor.getAttribute("y")) + layout.desenho_sensores.escala_sensores / 4
                );

                const txtSensorName = document.createElementNS("http://www.w3.org/2000/svg", "text");
                txtSensorName.setAttribute("id", `TIND${i + 1}S${s}`);
                txtSensorName.setAttribute("text-anchor", "end");
                txtSensorName.setAttribute("dominant-baseline", "central");
                txtSensorName.setAttribute("font-size", layout.desenho_sensores.escala_sensores * 0.4 - 1.5);
                txtSensorName.setAttribute("font-family", "Arial");
                txtSensorName.textContent = `S${s}`;
                txtSensorName.setAttribute("fill", "black");
                txtSensorName.setAttribute("x", parseFloat(recSensor.getAttribute("x")) - 2);
                txtSensorName.setAttribute(
                    "y",
                    parseFloat(recSensor.getAttribute("y")) + layout.desenho_sensores.escala_sensores / 4
                );

                svgEl.appendChild(recSensor);
                svgEl.appendChild(txtSensor);
                svgEl.appendChild(txtSensorName);
            }
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
        const cabosIds = Object.keys(dadosArco.leitura);
        cabosIds.forEach((idCabo, i) => {
            const sensores = dadosArco.leitura[idCabo];
            Object.keys(sensores).forEach((s) => {
                const [temp, , , falha, nivel] = sensores[s];
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

        return (
            <div className="mb-3">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <label className="form-label">Layout:</label>
                        <select 
                            className="form-select"
                            value={layoutAtual}
                            onChange={(e) => setLayoutAtual(e.target.value)}
                        >
                            <option value="default">Layout Padrão</option>
                            {layoutsDisponiveis.map(nome => (
                                <option key={nome} value={nome}>{nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        {layoutAtual !== "default" && dados && (
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
                        )}
                    </div>
                </div>
                {layoutConfig && (
                    <small className="text-success">
                        Layout "{layoutAtual}" aplicado com {Object.keys(dados?.leitura || {}).length} cabos
                    </small>
                )}
            </div>
        );
    };

    return (
        <div className="container-fluid p-3" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <h1 className="text-center mb-3">Armazém - Monitoramento de Temperatura</h1>

            <SeletorLayout />

            {carregandoModo ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            ) : (
                <div ref={containerRef} className="d-flex justify-content-center" style={{ height: '70vh' }} />
            )}
            <div className="d-flex justify-content-center mt-3">
                <BotaoTrocaModo />
            </div>
        </div>
    );
};

export default ArmazemSVG;
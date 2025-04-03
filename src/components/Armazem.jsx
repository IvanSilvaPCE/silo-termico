import React, { useEffect, useRef } from "react";

const ArmazemSVG = ({ dados }) => {
    const containerRef = useRef(null);

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
        svgEl.setAttribute("width", layoutArco.tamanho_svg[0] + "mm");
        svgEl.setAttribute("height", layoutArco.tamanho_svg[1] + "mm");
        svgEl.setAttribute(
            "viewBox",
            `0 0 ${layoutArco.tamanho_svg[0]} ${layoutArco.tamanho_svg[1]}`
        );
        container.appendChild(svgEl);

        desenhaFundo(layoutArco);
        desenhaSensores(layoutArco);
        if (dados) {
            atualizarSensores(dados);
        }
    }, [dados]);

    function atualizarSensores(dadosArco) {
        const cabosIds = Object.keys(dadosArco.leitura);
        cabosIds.forEach((idCabo, i) => {
            const sensores = dadosArco.leitura[idCabo];

            Object.keys(sensores).forEach((s) => {
                const [temp, media, pq, falha, nivel] = sensores[s];
                const rec = document.getElementById(`C${i + 1}S${s}`);
                const txt = document.getElementById(`TC${i + 1}S${s}`);
                if (!rec || !txt) return;
                txt.textContent = temp.toFixed(1);

                if (temp < 12) {
                    rec.setAttribute("fill", "#0384fc");
                    txt.setAttribute("fill", "white");
                } else if (temp < 15) {
                    rec.setAttribute("fill", "#03e8fc");
                    txt.setAttribute("fill", "black");
                } else if (temp < 17) {
                    rec.setAttribute("fill", "#03fcbe");
                    txt.setAttribute("fill", "black");
                } else if (temp < 21) {
                    rec.setAttribute("fill", "#07fc03");
                    txt.setAttribute("fill", "black");
                } else if (temp < 25) {
                    rec.setAttribute("fill", "#c3ff00");
                    txt.setAttribute("fill", "black");
                } else if (temp < 27) {
                    rec.setAttribute("fill", "#fcf803");
                    txt.setAttribute("fill", "black");
                } else if (temp < 30) {
                    rec.setAttribute("fill", "#ffb300");
                    txt.setAttribute("fill", "black");
                } else if (temp < 35) {
                    rec.setAttribute("fill", "#ff2200");
                    txt.setAttribute("fill", "white");
                } else {
                    rec.setAttribute("fill", "#ff2200");
                    txt.setAttribute("fill", "white");
                }

                if (!nivel) {
                    rec.setAttribute("fill", "#e6e6e6");
                    txt.setAttribute("fill", "black");
                }
            });
        });
    }

    function desenhaFundo(layout) {
        const svgEl = document.getElementById("des_arco_armazem");
        const { tipo_telhado, pb, lb, hb, hf, lf, le, ht, ctrl_p1, ctrl_p2 } =
            layout.desenho_arco;
        const p1 = [lb, pb - hb],
            p2 = [lb - le, pb - hb],
            p3 = [lb - ((lb - lf) / 2), pb - hf],
            p4 = [(lb - lf) / 2, pb - hf],
            p5 = [le, pb - hb],
            p6 = [0, pb - hb],
            p7 = [0, pb],
            p8 = [lb, pb];
        const pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(
            ","
        )} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(
            ","
        )} ${p8.join(",")}`;
        const polBase = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );
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
            polTelhado = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "polygon"
            );
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
            // Retângulo do cabo (posição fixa para exemplo)
            const retNome = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            retNome.setAttribute("id", "C" + (i + 1));
            retNome.setAttribute("width", layout.desenho_sensores.escala_sensores);
            retNome.setAttribute("height", layout.desenho_sensores.escala_sensores / 2);
            retNome.setAttribute("rx", "2");
            retNome.setAttribute("ry", "2");
            retNome.setAttribute("fill", "#3A78FD");
            // Defina a posição na base (ajuste os valores conforme necessário)
            retNome.setAttribute("x", 50 + i * 60);
            retNome.setAttribute("y", 185);

            // Texto do cabo
            const txtNome = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txtNome.setAttribute("id", "TC" + (i + 1));
            txtNome.setAttribute("text-anchor", "middle");
            txtNome.setAttribute("dominant-baseline", "central");
            txtNome.setAttribute("font-weight", "bold");
            txtNome.setAttribute(
                "font-size",
                layout.desenho_sensores.escala_sensores * 0.4 - 0.5
            );
            txtNome.setAttribute("font-family", "Arial");
            txtNome.textContent = "P" + id;
            txtNome.setAttribute("fill", "white");
            txtNome.setAttribute(
                "x",
                parseFloat(retNome.getAttribute("x")) +
                layout.desenho_sensores.escala_sensores / 2
            );
            txtNome.setAttribute(
                "y",
                parseFloat(retNome.getAttribute("y")) +
                layout.desenho_sensores.escala_sensores / 4
            );

            svgEl.appendChild(retNome);
            svgEl.appendChild(txtNome);

            // Número de pêndulos (texto abaixo do nome do cabo)
            const numSensores = layout.cabos[id];
            const txtNumPendulos = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );
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

            // Cria os sensores para cada cabo
            for (let s = 1; s <= numSensores; s++) {
                // Retângulo do sensor
                const recSensor = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "rect"
                );
                recSensor.setAttribute("id", `C${i + 1}S${s}`);
                recSensor.setAttribute("width", layout.desenho_sensores.escala_sensores);
                recSensor.setAttribute(
                    "height",
                    layout.desenho_sensores.escala_sensores / 2
                );
                recSensor.setAttribute("rx", "2");
                recSensor.setAttribute("ry", "2");
                recSensor.setAttribute("fill", "#ccc");
                // Posiciona o sensor acima do retângulo do cabo
                recSensor.setAttribute("x", retNome.getAttribute("x"));
                const ySensor =
                    parseFloat(retNome.getAttribute("y")) -
                    layout.desenho_sensores.dist_y_sensores * s - 12;

                recSensor.setAttribute("y", Math.max(ySensor, 10));

                recSensor.setAttribute("stroke", "black");
                recSensor.setAttribute("stroke-width", "1");


                // Texto da leitura do sensor
                const txtSensor = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );
                txtSensor.setAttribute("id", `TC${i + 1}S${s}`);
                txtSensor.setAttribute("text-anchor", "middle");
                txtSensor.setAttribute("dominant-baseline", "central");
                txtSensor.setAttribute(
                    "font-size",
                    layout.desenho_sensores.escala_sensores * 0.4 - 0.5
                );
                txtSensor.setAttribute("font-family", "Arial");
                txtSensor.textContent = "0";
                txtSensor.setAttribute(
                    "x",
                    parseFloat(recSensor.getAttribute("x")) +
                    layout.desenho_sensores.escala_sensores / 2
                );
                txtSensor.setAttribute(
                    "y",
                    parseFloat(recSensor.getAttribute("y")) +
                    layout.desenho_sensores.escala_sensores / 4
                );

                svgEl.appendChild(recSensor);
                svgEl.appendChild(txtSensor);

                // Texto do nome do sensor (S1, S2, …) à esquerda do sensor
                const txtSensorName = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );
                txtSensorName.setAttribute("id", `TIND${i + 1}S${s}`);
                txtSensorName.setAttribute("text-anchor", "end");
                txtSensorName.setAttribute("dominant-baseline", "central");
                txtSensorName.setAttribute(
                    "font-size",
                    layout.desenho_sensores.escala_sensores * 0.4 - 1.5
                );
                txtSensorName.setAttribute("font-family", "Arial");
                txtSensorName.textContent = `S${s}`;
                txtSensorName.setAttribute("fill", "black");
                txtSensorName.setAttribute(
                    "x",
                    parseFloat(recSensor.getAttribute("x")) - 2
                );
                txtSensorName.setAttribute("y",
                    parseFloat(recSensor.getAttribute("y")) +
                    layout.desenho_sensores.escala_sensores / 4
                );
                svgEl.appendChild(txtSensorName);
            }
        });
    }


    return <div ref={containerRef} />;
};

export default ArmazemSVG;

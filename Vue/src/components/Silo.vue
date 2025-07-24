<template>
  <div class="container-fluid p-1 p-md-2" style="min-height: 100vh; overflow: auto;">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-1 mb-md-2 fs-4 fs-md-1">Silo - Monitoramento de Temperatura</h1>

        <div v-if="carregandoModo" class="d-flex justify-content-center m-2">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
        <div v-else class="svg-container mb-1 mb-md-2"
          style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 180px); max-height: calc(100vh - 140px); overflow: auto;">
          <component :is="modo === 'temperatura' ? 'RenderSiloTemperatura' : 'RenderSiloMapa'" />
        </div>

        <div class="d-flex justify-content-center py-2">
          <button class="btn btn-primary" @click="trocarModo">
            {{ modo === 'temperatura' ? 'Ver Mapa de Calor' : 'Ver Temperatura' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SiloSVG",
  props: {
    dados: Object,
  },
  data() {
    return {
      modo: "temperatura",
      carregandoModo: false,
    };
  },
  computed: {
    layout() {
      return this.dados?.dados_layout || {};
    },
    leitura() {
      return this.dados?.leitura || {};
    },
    motorStatus() {
      return this.dados?.motor?.statusMotor || [];
    },
    largura() {
      return this.layout.tamanho_svg?.[0] || 300;
    },
    altura() {
      return this.layout.tamanho_svg?.[1] || 400;
    },
    transformSilo() {
      return this.layout.aeradores && this.layout.aeradores.na > 0
        ? `translate(${Number(this.layout.aeradores.ds) + 34}, 0)`
        : "";
    },
  },
  methods: {
    trocarModo() {
      this.carregandoModo = true;
      setTimeout(() => {
        this.modo = this.modo === "temperatura" ? "mapa" : "temperatura";
        this.carregandoModo = false;
      }, 600);
    },
    corFaixaExata(t) {
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
    },
    renderFundoSilo(h) {
      const { lb, hs, hb, eb } = this.layout.desenho_corte_silo;
      const p1 = [0, hs];
      const p2 = [lb, hs];
      const p3 = [lb, hb * 1.75];
      const p4 = [lb / 2, 0];
      const p5 = [0, hb * 1.75];
      const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`;

      return h("g", { attrs: { id: "g_des_fundo" } }, [
        h("polygon", { attrs: { fill: "#E7E7E7", points } }),
        h("path", {
          attrs: {
            fill: "#999999",
            d: "M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z",
            transform: `scale(${lb / 152}, ${hb / 15})`
          }
        }),
        h("ellipse", { attrs: { fill: "#999999", cx: lb / 2, cy: hs, rx: lb / 2, ry: hb } }),
        h("ellipse", { attrs: { fill: "#CCCCCC", cx: lb / 2, cy: hs - eb, rx: lb / 2, ry: hb } }),
      ]);
    },
    renderSensores(h) {
      const ds = this.layout.desenho_sensores;
      const escala = Number(ds.escala_sensores);
      const distYSensores = Number(ds.dist_y_sensores);
      const posYCabo = ds.pos_y_cabo;
      const posXCabo = ds.pos_x_cabo;
      const posXUniforme = Number(ds.pos_x_cabos_uniforme);
      const nomeSensoresDireita = Number(ds.nome_sensores_direita);
      const nomeCaboAcima = Number(ds.nome_cabo_acima);
      const distYNomeCabo = ds.dist_y_nome_cabo;
      const nCabos = Object.keys(this.leitura).length;
      const dist = posXCabo[1] || 0;
      const totalWidthCabos = (nCabos - 1) * dist + escala;
      const lb = this.layout.desenho_corte_silo.lb;
      const offsetCabos = (lb - totalWidthCabos) / 2;

      return Object.entries(this.leitura).map(([pend, sensores], idxCabo) => {
        const numSensores = Object.keys(sensores).length;
        const baseX =
          posXUniforme === 0 ? posXCabo[idxCabo] : offsetCabos + idxCabo * dist;
        const baseY = posYCabo[idxCabo];
        return h("g", { key: pend }, [
          h("rect", {
            attrs: {
              id: `C${pend}`,
              x: baseX,
              y:
                nomeCaboAcima === 1
                  ? baseY - (numSensores + 1) * distYSensores - distYNomeCabo[idxCabo]
                  : baseY + distYNomeCabo[idxCabo],
              width: escala,
              height: escala / 2,
              rx: 2,
              ry: 2,
              fill: "#3A78FD"
            }
          }),
          h("text", {
            attrs: {
              id: `TC${pend}`,
              x: baseX + escala / 2,
              y: (
                nomeCaboAcima === 1
                  ? baseY - (numSensores + 1) * distYSensores + escala / 2.2 - distYNomeCabo[idxCabo]
                  : baseY + distYNomeCabo[idxCabo] + escala / 2.2
              ),
              textAnchor: "middle",
              alignmentBaseline: "middle", 
              fontWeight: "bold",
              fontSize: escala * 0.4, 
              fontFamily: "Arial",
              fill: "white"
            }
          }, [pend]),

          ...Object.entries(sensores).map(([sensorKey, valores]) => {
            const sensor = parseInt(sensorKey, 10);
            const temp = parseFloat(valores[0]).toFixed(1);
            const t = parseFloat(temp);
            const cor = valores[4] === false ? "#e7e7e7" : this.corFaixaExata(t);

            const xSensor = baseX;
            const ySensor = baseY - distYSensores * sensor;
            return h("g", { key: `${pend}-${sensor}` }, [
              h("text", {
                attrs: {
                  id: `TIND${pend}S${sensor}`,
                  x: nomeSensoresDireita === 0 ? xSensor - 2 : xSensor + escala + 2,
                  y: ySensor + (escala / 2) / 2,
                  textAnchor: nomeSensoresDireita === 0 ? "end" : "start",
                  alignmentBaseline: "middle",
                  fontWeight: "bold",
                  fontSize: escala * 0.32,
                  fontFamily: "Arial",
                  fill: "black"
                }
              }, [`S${sensor}`]),

              h("rect", {
                attrs: {
                  id: `C${pend}S${sensor}`,
                  x: xSensor,
                  y: ySensor,
                  width: escala,
                  height: escala / 2,
                  rx: 2,
                  ry: 2,
                  fill: cor,
                  stroke: "black",
                  strokeWidth: valores[1] ? 0.6 : 0.25
                }
              }),
              h("text", {
                attrs: {
                  id: `TC${pend}S${sensor}`,
                  x: xSensor + escala / 2,
                  y: ySensor + (escala / 2) / 2,
                  textAnchor: "middle",
                  alignmentBaseline: "middle", // <-- Troque para alignmentBaseline
                  fontWeight: "bold",
                  fontSize: escala * 0.42, // <= melhor tamanho, igual React!
                  fontFamily: "Arial",
                  fill: cor === "#ff2200" ? "white" : "black"
                }
              }, [valores[3] ? "ERRO" : temp]),

              h("rect", {
                attrs: {
                  id: `FC${pend}S${sensor}`,
                  x: xSensor - 0.5,
                  y: ySensor - 0.5,
                  width: escala + 1,
                  height: escala / 2 + 1,
                  rx: 2,
                  ry: 2,
                  fill: "red",
                  fillOpacity: 0.6,
                  visibility: valores[3] ? "visible" : "hidden"
                }
              })
            ]);
          })
        ]);
      });
    },
    renderMapaCalor() {
      const ds = this.layout.desenho_sensores;
      const distYSensores = Number(ds.dist_y_sensores);
      const posYCabo = ds.pos_y_cabo;
      const posXCabo = ds.pos_x_cabo;
      const posXUniforme = Number(ds.pos_x_cabos_uniforme);

      const sensores = [];
      let nivelMaisAlto = 0;

      Object.entries(this.leitura).forEach(([pend, objSensores], idxCabo) => {
        const xCabo = posXUniforme === 0 ? posXCabo[idxCabo] : posXCabo[0] + posXCabo[1] * idxCabo;
        const yCabo = posYCabo[idxCabo];
        Object.entries(objSensores).forEach(([sensorKey, dadosSensor]) => {
          const sensorIdx = parseInt(sensorKey, 10);
          const t = parseFloat(dadosSensor[0]);
          const ativo = dadosSensor[4];
          const ySensor = yCabo - distYSensores * sensorIdx;
          sensores.push({ x: xCabo, y: ySensor, t, ativo });
          if (ativo && t !== -1000) {
            if (ySensor < nivelMaisAlto || nivelMaisAlto === 0) {
              nivelMaisAlto = ySensor;
            }
          }
        });
      });

      const [largura, altura] = this.layout.tamanho_svg;
      const isMobile = window.innerWidth < 768;
      const resolucao = isMobile ? 160 : 240;
      const wCell = largura / resolucao;
      const hCell = altura / resolucao;
      const blocos = [];

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
        if (!temSensorAtivo) return null;
        return somaPesos === 0 ? -1000 : somaTemp / somaPesos;
      }

      const niveisPorCabo = {};
      Object.entries(this.leitura).forEach(([pend, objSensores], idxCabo) => {
        const xCabo = posXUniforme === 0 ? posXCabo[idxCabo] : posXCabo[0] + posXCabo[1] * idxCabo;
        let nivelMaisAltoNesteCabo = 0;
        Object.entries(objSensores).forEach(([sensorKey, dadosSensor]) => {
          const sensorIdx = parseInt(sensorKey, 10);
          const t = parseFloat(dadosSensor[0]);
          const ativo = dadosSensor[4];
          const ySensor = posYCabo[idxCabo] - distYSensores * sensorIdx;
          if (ativo && t !== -1000) {
            if (ySensor < nivelMaisAltoNesteCabo || nivelMaisAltoNesteCabo === 0) {
              nivelMaisAltoNesteCabo = ySensor;
            }
          }
        });
        niveisPorCabo[xCabo] = nivelMaisAltoNesteCabo;
      });

      function temGraoNaPosicao(cx, cy) {
        const { hs } = this.layout.desenho_corte_silo;
        const cabosOrdenados = Object.keys(niveisPorCabo)
          .map(x => ({ x: parseFloat(x), nivel: niveisPorCabo[x] }))
          .sort((a, b) => a.x - b.x);
        if (cabosOrdenados.length === 0) return false;
        let nivelInterpolado = 0;
        if (cabosOrdenados.length === 1) {
          nivelInterpolado = cabosOrdenados[0].nivel;
        } else {
          let caboEsquerda = cabosOrdenados[0];
          let caboDireita = cabosOrdenados[cabosOrdenados.length - 1];
          for (let i = 0; i < cabosOrdenados.length - 1; i++) {
            if (cx >= cabosOrdenados[i].x && cx <= cabosOrdenados[i + 1].x) {
              caboEsquerda = cabosOrdenados[i];
              caboDireita = cabosOrdenados[i + 1];
              break;
            }
          }
          if (cx < cabosOrdenados[0].x) {
            nivelInterpolado = cabosOrdenados[0].nivel;
          } else if (cx > cabosOrdenados[cabosOrdenados.length - 1].x) {
            nivelInterpolado = cabosOrdenados[cabosOrdenados.length - 1].nivel;
          } else {
            const distTotal = caboDireita.x - caboEsquerda.x;
            const distAtual = cx - caboEsquerda.x;
            const fator = distTotal === 0 ? 0 : distAtual / distTotal;
            nivelInterpolado = caboEsquerda.nivel + (caboDireita.nivel - caboEsquerda.nivel) * fator;
          }
        }
        if (nivelInterpolado === 0) return false;
        const margemSeguranca = 15;
        return cy >= nivelInterpolado - margemSeguranca && cy <= this.layout.desenho_corte_silo.hs;
      }

      function temSensorAtivoNaPosicao(cx, cy) {
        const raioVerificacao = 50;
        for (const sensor of sensores) {
          if (!sensor.ativo) continue;
          const distancia = Math.hypot(sensor.x - cx, sensor.y - cy);
          if (distancia <= raioVerificacao) return true;
        }
        return false;
      }

      for (let i = 0; i < resolucao; i++) {
        for (let j = 0; j < resolucao; j++) {
          const cx = i * wCell + wCell / 2;
          const cy = j * hCell + hCell / 2;
          let cor;
          if (temGraoNaPosicao.call(this, cx, cy) && temSensorAtivoNaPosicao(cx, cy)) {
            const tempInterpolada = idw(cx, cy);
            cor = tempInterpolada === null ? "#e7e7e7" : this.corFaixaExata(tempInterpolada);
          } else {
            cor = "#e7e7e7";
          }
          blocos.push(
            h("rect", {
              key: `${i}-${j}`,
              attrs: {
                x: i * wCell,
                y: j * hCell,
                width: wCell,
                height: hCell,
                fill: cor,
              },
            })
          );
        }
      }
      const { lb, hs, hb } = this.layout.desenho_corte_silo;
      const p1 = [0, hs];
      const p2 = [lb, hs];
      const p3 = [lb, hb * 1.75];
      const p4 = [lb / 2, 0];
      const p5 = [0, hb * 1.75];
      const pathD = `M ${p1[0]},${p1[1]} L ${p2[0]},${p2[1]} L ${p3[0]},${p3[1]} L ${p4[0]},${p4[1]} L ${p5[0]},${p5[1]} Z`;

      return [
        h("defs", [
          h("filter", { attrs: { id: "blurFilter" } }, [
            h("feGaussianBlur", { attrs: { stdDeviation: "0.4" } })
          ]),
          h("clipPath", { attrs: { id: "clipSilo" } }, [
            h("path", { attrs: { d: pathD } })
          ])
        ]),
        h("g", { attrs: { filter: "url(#blurFilter)", clipPath: "url(#clipSilo)" } }, blocos)
      ];

    },
    renderAeradores(h) {
      if (!(this.layout.aeradores && this.layout.aeradores.na > 0)) return null;
      const numAeradores = this.layout.aeradores.na;
      const hs = Number(this.layout.desenho_corte_silo.hs);
      const lb = Number(this.layout.desenho_corte_silo.lb);
      const dy = Number(this.layout.aeradores.dy) || 0;
      const ds = Number(this.layout.aeradores.ds) || 0;
      const da = Number(this.layout.aeradores.da) || 0;
      const posY = hs + dy - 30;
      const posX = lb + ds * 2 - 31;
      const aeradores = [];
      const dBlade =
        "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z";
      const angles = [0, 60, 120, 180, 240, 300];
      for (let id = 1; id <= numAeradores; id++) {
        const estado = this.motorStatus[id - 1] ?? 0;
        let corFundo = "#c5c5c5";
        let visParado = "visible";
        let visGirando = "hidden";
        if (estado === 1) {
          corFundo = "#ffeb3b";
          visParado = "visible";
          visGirando = "hidden";
        } else if (estado === 3) {
          corFundo = "#31dd0f";
          visParado = "hidden";
          visGirando = "visible";
        } else if (estado === 4) {
          corFundo = "#ff0000";
          visParado = "visible";
          visGirando = "hidden";
        }
        let transform = "";
        if (id === 1) transform = `translate(-73, ${posY})`;
        else if (id === 2) transform = `translate(${posX}, ${posY})`;
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`;
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`;
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`;
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`;

        aeradores.push(
          h("g", { key: id, attrs: { id: `aerador_${id}`, transform } }, [
            h("circle", {
              attrs: {
                id: `fundo_aerador_${id}`,
                cx: 70 + 12.5 + 3.5,
                cy: 24,
                r: 10,
                fill: corFundo
              }
            }),
            h("rect", {
              attrs: {
                x: 70 + 3.5,
                y: 2,
                width: 25,
                height: 10,
                rx: 6.4,
                ry: 5,
                fill: "#3A78FD"
              }
            }),
            h("text", {
              attrs: {
                x: 70 + 12.5 + 3.5,
                y: 7,
                textAnchor: "middle",
                dominantBaseline: "central",
                fontWeight: "bold",
                fontSize: 6.5,
                fontFamily: "Arial",
                fill: "white"
              }
            }, [`AE-${id}`]),
            h("g", { attrs: { id: `blade_aerador_${id}_parado` }, style: { visibility: visParado } },
              angles.map((angle) =>
                h("path", {
                  key: angle,
                  attrs: {
                    d: dBlade,
                    fill: "white",
                    transform: angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`
                  }
                })
              )
            ),
            h("g", { attrs: { id: `blade_aerador_${id}_girando` }, style: { visibility: visGirando } }, [
              h("animateTransform", {
                attrs: {
                  attributeName: "transform",
                  type: "rotate",
                  dur: "2s",
                  values: "0 86.35 24.05; 360 86.35 24.05;",
                  repeatCount: "indefinite"
                }
              }),
              ...angles.map((angle) =>
                h("path", {
                  key: angle,
                  attrs: {
                    d: dBlade,
                    fill: "white",
                    transform: angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`
                  }
                })
              )
            ])
          ])
        );
      }
      return aeradores;
    },

  },
  components: {
    RenderSiloTemperatura: {
      functional: true,
      render: (h, { parent }) => {
        return h(
          "svg",
          {
            attrs: {
              width: "100%",
              height: "auto",
              viewBox: `0 0 ${parent.largura} ${parent.altura}`,
              style:
                "max-width:100%;max-height:70vh;height:auto;min-height:350px;shape-rendering:auto;text-rendering:geometricPrecision;image-rendering:optimizeQuality;fill-rule:evenodd;clip-rule:evenodd",
              preserveAspectRatio: "xMidYMid meet",
              xmlns: "http://www.w3.org/2000/svg",
            },
          },
          [
            h(
              "g",
              { attrs: { transform: parent.transformSilo } },
              [parent.renderFundoSilo(h), parent.renderSensores(h)]
            ),
            parent.renderAeradores(h),
          ]
        );
      },
    },
    RenderSiloMapa: {
      functional: true,
      render: (h, { parent }) => {
        return h(
          "svg",
          {
            attrs: {
              width: "100%",
              height: "auto",
              viewBox: `0 0 ${parent.largura} ${parent.altura}`,
              style:
                "max-width:100%;max-height:85vh;height:auto;min-height:400px;shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;fill-rule:evenodd;clip-rule:evenodd",
              preserveAspectRatio: "xMidYMid meet",
              xmlns: "http://www.w3.org/2000/svg",
            },
          },
          [
            h(
              "g",
              { attrs: { transform: parent.transformSilo } },
              [parent.renderFundoSilo(h), parent.renderMapaCalor(h)]
            ),
            parent.renderAeradores(h),
          ]
        );
      },
    },
  },
};
</script>

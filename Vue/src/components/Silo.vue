<template>
  <div class="container-fluid p-1 p-md-2" style="min-height: 100vh; overflow: auto;">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-1 mb-md-2 fs-4 fs-md-1">Silo - Monitoramento de Temperatura</h1>

        <div v-if="carregandoModo" class="d-flex justify-content-center m-2">
          <div class="spinner-border" role="status">
            <span class="visually-hidden"></span>
          </div>
        </div>
        <div v-else class="svg-container mb-1 mb-md-2"
          style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 180px); max-height: calc(100vh - 140px); overflow: auto;">
          <svg
            :width="`100%`"
            :height="`auto`"
            :viewBox="`0 0 ${largura} ${altura}`"
            style="max-width: 100%; max-height: 70vh; height: auto; min-height: 350px; shape-rendering: auto; text-rendering: geometricPrecision; image-rendering: optimizeQuality; fill-rule: evenodd; clip-rule: evenodd;"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g :transform="transformSilo">
              <g id="g_des_fundo">
                <polygon :fill="`#E7E7E7`" :points="fundoPoints" />
                <path
                  :fill="`#999999`"
                  :d="`M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z`"
                  :transform="`scale(${layout.desenho_corte_silo.lb / 152}, ${layout.desenho_corte_silo.hb / 15})`"
                />
                <ellipse :fill="`#999999`" :cx="layout.desenho_corte_silo.lb / 2" :cy="layout.desenho_corte_silo.hs" :rx="layout.desenho_corte_silo.lb / 2" :ry="layout.desenho_corte_silo.hb" />
                <ellipse :fill="`#CCCCCC`" :cx="layout.desenho_corte_silo.lb / 2" :cy="layout.desenho_corte_silo.hs - layout.desenho_corte_silo.eb" :rx="layout.desenho_corte_silo.lb / 2" :ry="layout.desenho_corte_silo.hb" />
              </g>

              <!-- Sensores ou Mapa de Calor -->
              <template v-if="modo === 'temperatura'">
                <g v-for="([pend, sensores], idxCabo) in Object.entries(leitura)" :key="pend">
                  <rect
                    :id="`C${pend}`"
                    :x="getBaseX(idxCabo)"
                    :y="getNomeCaboY(idxCabo)"
                    :width="escala"
                    :height="escala / 2"
                    rx="2"
                    ry="2"
                    fill="#3A78FD"
                  />
                  <text
                    :id="`TC${pend}`"
                    :x="getBaseX(idxCabo) + escala / 2"
                    :y="getNomeCaboY(idxCabo) + escala / 4"
                    text-anchor="middle"
                    dominant-baseline="central"
                    font-weight="bold"
                    :font-size="Math.max(escala * 0.4 - 0.5, 6)"
                    font-family="Arial"
                    fill="white"
                  >{{ pend }}</text>

                  <g v-for="([sensorKey, valores]) in Object.entries(sensores)" :key="`${pend}-${sensorKey}`">
                    <text
                      :id="`TIND${pend}S${sensorKey}`"
                      :x="layout.desenho_sensores.nome_sensores_direita === 0 ? getBaseX(idxCabo) - 2 : getBaseX(idxCabo) + escala + 2"
                      :y="getSensorY(idxCabo, parseInt(sensorKey)) + (escala / 2) / 2"
                      :text-anchor="layout.desenho_sensores.nome_sensores_direita === 0 ? 'end' : 'start'"
                      dominant-baseline="central"
                      font-weight="bold"
                      :font-size="Math.max(escala * 0.4 - 1.5, 5)"
                      font-family="Arial"
                      fill="black"
                    >S{{ sensorKey }}</text>

                    <rect
                      :id="`C${pend}S${sensorKey}`"
                      :x="getBaseX(idxCabo)"
                      :y="getSensorY(idxCabo, parseInt(sensorKey))"
                      :width="escala"
                      :height="escala / 2"
                      rx="2"
                      ry="2"
                      :fill="getSensorColor(valores)"
                      stroke="black"
                      :stroke-width="valores[1] ? 0.6 : 0.25"
                    />

                    <text
                      :id="`TC${pend}S${sensorKey}`"
                      :x="getBaseX(idxCabo) + escala / 2"
                      :y="getSensorY(idxCabo, parseInt(sensorKey)) + (escala / 2) / 2"
                      text-anchor="middle"
                      dominant-baseline="central"
                      font-weight="bold"
                      :font-size="Math.max(escala * 0.4 - 0.5, 6)"
                      font-family="Arial"
                      :fill="getSensorColor(valores) === '#ff2200' ? 'white' : 'black'"
                    >{{ getSensorText(valores) }}</text>

                    <rect
                      :id="`FC${pend}S${sensorKey}`"
                      :x="getBaseX(idxCabo) - 0.5"
                      :y="getSensorY(idxCabo, parseInt(sensorKey)) - 0.5"
                      :width="escala + 1"
                      :height="escala / 2 + 1"
                      rx="2"
                      ry="2"
                      fill="red"
                      fill-opacity="0.6"
                      :visibility="valores[3] ? 'visible' : 'hidden'"
                    />
                  </g>
                </g>
              </template>

              <!-- Mapa de Calor -->
              <template v-else>
                <defs>
                  <filter id="blurFilter">
                    <feGaussianBlur stdDeviation="0.4" />
                  </filter>
                  <clipPath id="clipSilo">
                    <path :d="clipPath" />
                  </clipPath>
                </defs>
                <g filter="url(#blurFilter)" clip-path="url(#clipSilo)">
                  <rect
                    v-for="(bloco, index) in mapaCalorBlocos"
                    :key="index"
                    :x="bloco.x"
                    :y="bloco.y"
                    :width="bloco.width"
                    :height="bloco.height"
                    :fill="bloco.fill"
                  />
                </g>
              </template>
            </g>

            <!-- Aeradores -->
            <g v-for="aerador in aeradores" :key="aerador.id" :id="`aerador_${aerador.id}`" :transform="aerador.transform">
              <circle
                :id="`fundo_aerador_${aerador.id}`"
                :cx="70 + 12.5 + 3.5"
                :cy="24"
                r="10"
                :fill="aerador.corFundo"
              />
              <rect x="73.5" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
              <text
                :x="70 + 12.5 + 3.5"
                y="7"
                text-anchor="middle"
                dominant-baseline="central"
                font-weight="bold"
                font-size="6.5"
                font-family="Arial"
                fill="white"
              >AE-{{ aerador.id }}</text>

              <g :id="`blade_aerador_${aerador.id}_parado`" :style="{ visibility: aerador.visParado }">
                <path
                  v-for="(angle, angleIndex) in [0, 60, 120, 180, 240, 300]"
                  :key="angleIndex"
                  :d="bladePath"
                  fill="white"
                  :transform="angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`"
                />
              </g>

              <g :id="`blade_aerador_${aerador.id}_girando`" :style="{ visibility: aerador.visGirando }">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur="2s"
                  values="0 86.35 24.05; 360 86.35 24.05;"
                  repeatCount="indefinite"
                />
                <path
                  v-for="(angle, angleIndex) in [0, 60, 120, 180, 240, 300]"
                  :key="angleIndex"
                  :d="bladePath"
                  fill="white"
                  :transform="angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`"
                />
              </g>
            </g>
          </svg>
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
    dados: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      modo: "temperatura",
      carregandoModo: false,
      bladePath: "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
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
    escala() {
      return Number(this.layout.desenho_sensores?.escala_sensores) || 16;
    },
    fundoPoints() {
      const { lb, hs, hb } = this.layout.desenho_corte_silo || {};
      if (!lb || !hs || !hb) return "";
      const p1 = [0, hs];
      const p2 = [lb, hs];
      const p3 = [lb, hb * 1.75];
      const p4 = [lb / 2, 0];
      const p5 = [0, hb * 1.75];
      return `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`;
    },
    clipPath() {
      const { lb, hs, hb } = this.layout.desenho_corte_silo || {};
      if (!lb || !hs || !hb) return "";
      const p1 = [0, hs];
      const p2 = [lb, hs];
      const p3 = [lb, hb * 1.75];
      const p4 = [lb / 2, 0];
      const p5 = [0, hb * 1.75];
      return `M ${p1[0]},${p1[1]} L ${p2[0]},${p2[1]} L ${p3[0]},${p3[1]} L ${p4[0]},${p4[1]} L ${p5[0]},${p5[1]} Z`;
    },
    aeradores() {
      if (!(this.layout.aeradores && this.layout.aeradores.na > 0)) return [];

      const numAeradores = this.layout.aeradores.na;
      const hs = Number(this.layout.desenho_corte_silo?.hs) || 0;
      const lb = Number(this.layout.desenho_corte_silo?.lb) || 0;
      const dy = Number(this.layout.aeradores.dy) || 0;
      const ds = Number(this.layout.aeradores.ds) || 0;
      const da = Number(this.layout.aeradores.da) || 0;
      const posY = hs + dy - 30;
      const posX = lb + ds * 2 - 31;

      const aeradores = [];
      for (let id = 1; id <= numAeradores; id++) {
        const estado = this.motorStatus[id - 1] ?? 0;
        let corFundo = "#c5c5c5";
        let visParado = "visible";
        let visGirando = "hidden";

        if (estado === 1) {
          corFundo = "#ffeb3b";
        } else if (estado === 3) {
          corFundo = "#31dd0f";
          visParado = "hidden";
          visGirando = "visible";
        } else if (estado === 4) {
          corFundo = "#ff0000";
        }

        let transform = "";
        if (id === 1) transform = `translate(-73, ${posY})`;
        else if (id === 2) transform = `translate(${posX}, ${posY})`;
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`;
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`;
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`;
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`;

        aeradores.push({
          id,
          corFundo,
          visParado,
          visGirando,
          transform
        });
      }
      return aeradores;
    },
    mapaCalorBlocos() {
      if (this.modo !== 'mapa') return [];

      const ds = this.layout.desenho_sensores || {};
      const distYSensores = Number(ds.dist_y_sensores) || 12;
      const posYCabo = ds.pos_y_cabo || [];
      const posXCabo = ds.pos_x_cabo || [];
      const posXUniforme = Number(ds.pos_x_cabos_uniforme) || 0;
      const { lb, hs, hb } = this.layout.desenho_corte_silo || {};
      
      // Coletar sensores ativos e criar mapa de níveis por cabo
      const sensores = [];
      const niveisPorCabo = {};
      
      Object.entries(this.leitura).forEach(([pend, objSensores], idxCabo) => {
        const xCabo = posXUniforme === 0 ? posXCabo[idxCabo] : posXCabo[0] + posXCabo[1] * idxCabo;
        const yCabo = posYCabo[idxCabo];
        let nivelMaisAltoNesteCabo = hs; // Começa do fundo se não houver sensores ativos
        
        Object.entries(objSensores).forEach(([sensorKey, dadosSensor]) => {
          const sensorIdx = parseInt(sensorKey, 10);
          const t = parseFloat(dadosSensor[0]);
          const ativo = dadosSensor[4];
          const ySensor = yCabo - distYSensores * sensorIdx;
          
          if (ativo && t !== -1000) {
            sensores.push({ x: xCabo, y: ySensor, t });
            // Atualizar o nível mais alto (menor Y) neste cabo
            if (ySensor < nivelMaisAltoNesteCabo) {
              nivelMaisAltoNesteCabo = ySensor;
            }
          }
        });
        
        niveisPorCabo[xCabo] = nivelMaisAltoNesteCabo;
      });

      if (sensores.length === 0) return [];

      // Função para interpolar o nível entre cabos
      const obterNivelNaPosicao = (x) => {
        const cabosOrdenados = Object.keys(niveisPorCabo)
          .map(k => parseFloat(k))
          .sort((a, b) => a - b);
          
        if (cabosOrdenados.length === 0) return hs;
        
        // Se x está antes do primeiro cabo
        if (x <= cabosOrdenados[0]) return niveisPorCabo[cabosOrdenados[0]];
        
        // Se x está depois do último cabo
        if (x >= cabosOrdenados[cabosOrdenados.length - 1]) {
          return niveisPorCabo[cabosOrdenados[cabosOrdenados.length - 1]];
        }
        
        // Interpolar entre cabos adjacentes
        for (let i = 0; i < cabosOrdenados.length - 1; i++) {
          const cabo1 = cabosOrdenados[i];
          const cabo2 = cabosOrdenados[i + 1];
          
          if (x >= cabo1 && x <= cabo2) {
            const nivel1 = niveisPorCabo[cabo1];
            const nivel2 = niveisPorCabo[cabo2];
            const proporcao = (x - cabo1) / (cabo2 - cabo1);
            return nivel1 + (nivel2 - nivel1) * proporcao;
          }
        }
        
        return hs;
      };

      // Área baseada na geometria completa do silo
      const areaX = 0;
      const areaMaxX = lb;
      const areaY = 0; // Começar do topo
      const areaMaxY = hs + hb * 1.75; // Até o fundo do cone
      
      const larguraArea = areaMaxX - areaX;
      const alturaArea = areaMaxY - areaY;

      // Resolução adaptativa baseada no tamanho do silo
      const resolucao = Math.min(Math.max(lb / 8, 40), 80);
      const wCell = larguraArea / resolucao;
      const hCell = alturaArea / resolucao;
      const blocos = [];

      // Função IDW melhorada
      const idw = (cx, cy) => {
        let somaPesos = 0;
        let somaTemp = 0;
        const power = 2.0;
        const maxDistance = Math.min(lb * 0.6, 120);

        let sensoresProximos = 0;
        
        sensores.forEach(({ x, y, t }) => {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist <= maxDistance) {
            sensoresProximos++;
            const peso = 1 / Math.pow(Math.max(dist, 1), power);
            somaPesos += peso;
            somaTemp += t * peso;
          }
        });

        return sensoresProximos > 0 && somaPesos > 0 ? somaTemp / somaPesos : null;
      };

      for (let i = 0; i < resolucao; i++) {
        for (let j = 0; j < resolucao; j++) {
          const cx = areaX + i * wCell + wCell / 2;
          const cy = areaY + j * hCell + hCell / 2;

          // Verificar se está na área com grãos baseado no nível dinâmico
          if (this.temGraoNaPosicao(cx, cy)) {
            const nivelNaPosicao = obterNivelNaPosicao(cx);
            
            // Só renderizar se estiver abaixo do nível de grãos nesta posição
            if (cy >= nivelNaPosicao) {
              const tempInterpolada = idw(cx, cy);
              let cor;
              
              if (tempInterpolada !== null) {
                cor = this.corFaixaExata(tempInterpolada);
              } else {
                cor = this.corFaixaExata(20); // Temperatura ambiente
              }
              
              blocos.push({
                x: areaX + i * wCell,
                y: areaY + j * hCell,
                width: wCell,
                height: hCell,
                fill: cor
              });
            }
          }
        }
      }

      return blocos;
    }
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
    getBaseX(idxCabo) {
      const ds = this.layout.desenho_sensores || {};
      const posXCabo = ds.pos_x_cabo || [];
      const posXUniforme = Number(ds.pos_x_cabos_uniforme) || 0;
      const nCabos = Object.keys(this.leitura).length;
      const dist = posXCabo[1] || 0;
      const totalWidthCabos = (nCabos - 1) * dist + this.escala;
      const lb = this.layout.desenho_corte_silo?.lb || 300;
      const offsetCabos = (lb - totalWidthCabos) / 2;

      return posXUniforme === 0 ? posXCabo[idxCabo] : offsetCabos + idxCabo * dist;
    },
    getSensorY(idxCabo, sensor) {
      const ds = this.layout.desenho_sensores || {};
      const posYCabo = ds.pos_y_cabo || [];
      const distYSensores = Number(ds.dist_y_sensores) || 12;
      const baseY = posYCabo[idxCabo] || 0;
      return baseY - distYSensores * sensor;
    },
    getNomeCaboY(idxCabo) {
      const ds = this.layout.desenho_sensores || {};
      const posYCabo = ds.pos_y_cabo || [];
      const distYNomeCabo = ds.dist_y_nome_cabo || [];
      const nomeCaboAcima = Number(ds.nome_cabo_acima) || 0;
      const distYSensores = Number(ds.dist_y_sensores) || 12;
      const baseY = posYCabo[idxCabo] || 0;
      const numSensores = Object.keys(this.leitura[Object.keys(this.leitura)[idxCabo]] || {}).length;

      return nomeCaboAcima === 1
        ? baseY - (numSensores + 1) * distYSensores - (distYNomeCabo[idxCabo] || 0)
        : baseY + (distYNomeCabo[idxCabo] || 0);
    },
    getSensorColor(valores) {
      const temp = parseFloat(valores[0]).toFixed(1);
      const t = parseFloat(temp);
      return valores[4] === false ? "#e7e7e7" : this.corFaixaExata(t);
    },
    getSensorText(valores) {
      const temp = parseFloat(valores[0]).toFixed(1);
      return valores[3] ? "ERRO" : temp;
    },
    temGraoNaPosicao(cx, cy) {
      const { lb, hs, hb } = this.layout.desenho_corte_silo || {};
      if (!lb || !hs || !hb) return false;

      // Parte cilíndrica do silo
      if (cy >= 0 && cy <= hs) {
        const distanciaCentro = Math.abs(cx - lb/2);
        return distanciaCentro <= lb/2;
      }

      // Parte cônica do silo (funil)
      if (cy > hs && cy <= hs + hb * 1.75) {
        const alturaRelativa = cy - hs;
        const alturaMaxCone = hb * 1.75;
        const proporcao = 1 - (alturaRelativa / alturaMaxCone);
        const raioNaAltura = (lb/2) * proporcao;
        const distanciaCentro = Math.abs(cx - lb/2);
        return distanciaCentro <= raioNaAltura;
      }

      return false;
    },
    temSensorAtivoNaPosicao(cx, cy, sensores) {
      const ds = this.layout.desenho_sensores || {};
      const escala = Number(ds.escala_sensores) || 16;
      const { lb } = this.layout.desenho_corte_silo || {};
      const larguraSilo = lb || 200;
      
      // Raio de verificação proporcional ao tamanho do silo
      const raioVerificacao = Math.max(larguraSilo * 0.4, escala * 3);

      for (const sensor of sensores) {
        if (!sensor.ativo || sensor.t === -1000) continue;
        const distancia = Math.hypot(sensor.x - cx, sensor.y - cy);
        if (distancia <= raioVerificacao) return true;
      }
      return false;
    },
    estaNaAreaDosCabos(cx, cy, sensores) {
      const escala = this.escala;
      const raioInfluencia = escala * 1.5; // Raio menor para área mais restrita
      
      for (const sensor of sensores) {
        const distancia = Math.hypot(sensor.x - cx, sensor.y - cy);
        if (distancia <= raioInfluencia) {
          return true;
        }
      }
      return false;
    }
  }
};
</script>
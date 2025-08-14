<template>
   <div class="white_shd full margin_bottom_30">
      <div class="full graph_head">
         <div id="menu" class="heading1 margin_0">
            <b-overlay :show="buscandoEquipamento" rounded="sm" class="overlay">
               <b-row class="align-items-center justify-content-center justify-content-md-start text-center text-md-left">
                  <b-col sm="12" md="4" lg="3">
                     <h2>{{ equipamento?.ds_equipamento }}</h2>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" v-b-tooltip.hover title="Status">
                     <b-icon icon="circle-fill" scale="1.5" class="mr-2" :variant="corVariant(equipamento.st_operacao)"></b-icon>
                     <span :class="corTexto(equipamento.st_operacao)">{{ formatarStatus(equipamento.st_operacao) || '-' }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="2" v-b-tooltip.hover title="Produto">
                     <span class="mouse ml-0 ml-lg-5"><img width="22" v-if="formatarProduto(dadoSecador.CUL).svg" :src="formatarProduto(dadoSecador.CUL).svg" /> {{ formatarProduto(dadoSecador.CUL).nome }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" v-b-tooltip.hover title="Operação">
                     <b-icon :icon="formatarOperacao(dadoSecador.OP).icone" scale="1.5" class="mr-2"></b-icon>
                     <span>{{ formatarOperacao(dadoSecador.OP).nome }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" class="text-nowrap" v-b-tooltip.hover title="Fluxo">
                     <b-icon :icon="formatarFluxo(dadoSecador.FX)?.icone" scale="1.5" class="mr-2"></b-icon>
                     <span>{{ formatarFluxo(dadoSecador.FX)?.nome }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" class="text-nowrap" v-b-tooltip.hover title="Controle">
                     <b-icon :icon="formatarControle(dadoSecador.CT)?.icone" scale="1.5" class="mr-2"></b-icon>
                     <span>{{ formatarControle(dadoSecador.CT)?.nome }}</span>
                  </b-col>
               </b-row>
               <b-row class="text-center text-md-left">
                  <b-col>
                     <small class="mb-0">Última atualização: {{ formatarData(dadoSecador.DAT) }}</small>
                  </b-col>
               </b-row>
            </b-overlay>
         </div>
      </div>
      <div class="map_section padding_infor_info">
         <b-overlay :show="buscandoDados" rounded="sm" class="overlay">
            <b-alert :show="!Object.keys(dadoSecador).length && !buscandoDados" variant="warning" class="text-center">Nenhum dado recebido</b-alert>
            <b-row>
               <b-col>
                  <p><b>Modelo: </b>{{ dadoSecador.MOD || '-' }}</p>
               </b-col>
            </b-row>
            <b-row>
               <b-col lg="5" class="text-center align-self-center">
                  <svg version="1.2" viewBox="0 0 4500 4873" xmlns="http://www.w3.org/2000/svg">
                     <defs>
                        <image
                           height="77"
                           href="data:image/png;base64,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"
                           id="img1"
                           width="64"
                        />
                        <image
                           height="83"
                           href="data:image/png;base64,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"
                           id="img2"
                           width="36"
                        />
                     </defs>
                     <g id="Fornalha">
                        <g id="ladoEsquerdoFornalha">
                           <path class="s0" d="m1941 3549h952v866h-952zm139 142v-1h690v1z" id="ladoEsquerdoFornalha_1" />
                           <path class="s0" d="m1941 3549h54v866h-54z" id="ladoEsquerdoFornalha_11" />
                           <path class="s0" d="m2847 3549h46v866h-46z" id="ladoEsquerdoFornalha_12" />
                           <path class="s0" d="m1941 3549h952v20h-952z" id="ladoEsquerdoFornalha_13" />
                           <path class="s0" d="m1941 4416h2075v38h-2075z" id="ladoEsquerdoFornalha_3" />
                           <g id="aberturaFornalha">
                              <path class="s0" d="m2080 3610h690v33h-690z" id="aberturaFornalha_10" />
                              <path class="s0" d="m2080 3721v-1h689v1z" id="aberturaFornalha_2" />
                              <path class="s0" d="m2080 3691v-1h689v1zm1 57v-1h689v1z" id="aberturaFornalha_3" />
                              <path class="s0" d="m2080 3664v-1h689v1z" id="aberturaFornalha_1" />
                              <path class="s1" d="m2080 3611h690v170h-690z" id="aberturaFornalha_8" />
                              <path class="s0" d="m2203 3611h21v170h-21z" id="aberturaFornalha_9" />
                              <path class="s0" d="m2080 3611h21v170h-21z" id="aberturaFornalha_9" />
                              <path class="s0" d="m2342 3611h21v170h-21z" id="aberturaFornalha_9" />
                              <path class="s0" d="m2480 3611h21v170h-21z" id="aberturaFornalha_9" />
                              <path class="s0" d="m2618 3611h21v170h-21z" id="aberturaFornalha_9" />
                              <path class="s0" d="m2748 3611h21v169h-21z" id="aberturaFornalha_9" />
                           </g>
                        </g>
                        <g id="ladoDireitoFornalha">
                           <path class="s0" d="m2893 3749h1052v666h-1052z" id="ladoDireitoFornalha_2" />
                           <path class="s0" d="m2957 4374h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3161 4374h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3364 4374h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3468 4375h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3468 4374h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3571 4374h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3673 4375h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3673 4374h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3776 4374h95v41h-95z" id="ladoDireitoFornalha_4" />
                           <path class="s0" d="m3416 4256v-75c0 0 27.9-15 55-15 27.4 0 54 15 54 15v76z" id="ladoDireitoFornalha_1" />
                           <path class="s0" d="m3599 4256v-75c0 0 27.9-15 55-15 27.4 0 54 15 54 15v76z" id="ladoDireitoFornalha_1" />
                           <path class="s0" d="m2893 3750h1052v37h-1052z" id="ladoDireitoFornalha_5" />
                        </g>
                        <g id="TuboFornalha">
                           <path class="s0" d="m2998.5 3173l89.5 39h-179z" id="TuboFornalha_1" />
                           <path class="s0" d="m2964.4 3211.3l-0.8-0.6 34-37 0.8 0.6z" id="TuboFornalha_4" />
                           <path class="s0" d="m2997.6 3174.3l0.8-0.6 34 37-0.8 0.6z" id="TuboFornalha_5" />
                           <path class="s0" d="m2998 3211h-1v-37h1z" id="TuboFornalha_6" />
                           <path class="s0" d="m3062.3 3211.6l-0.6 0.8-64-37 0.6-0.8z" id="TuboFornalha_7" />
                           <path class="s0" d="m2936.3 3212.4l-0.6-0.8 62-38 0.6 0.8z" id="TuboFornalha_8" />
                           <path class="s0" d="m2952 3211h93v538h-93z" id="TuboFornalha_6" />
                           <path class="s0" d="m2931 3720h134v12h-134z" id="TuboFornalha_7" />
                        </g>
                        <g id="centroSecador ">
                           <path class="s2" d="m693 1055h1248v2916h-811-437z" id="centroSecador_14" />
                           <path class="s2" d="m693 1055.6h1248v162.8h-1248z" id="centroSecador_15" />
                           <path class="s2" d="m693 1391.6h1248v162.8h-1248z" id="centroSecador_15" />
                           <path class="s2" d="m693 1726.6h1248v162.8h-1248z" id="centroSecador_15" />
                           <path class="s2" d="m693 2060.6h1248v162.8h-1248z" id="centroSecador_15" />
                           <path class="s0" d="m693 3972h295v451h-295z" id="centroSecador_22" />
                           <path class="s0" d="m1645 3971h295v451h-295z" id="centroSecador_22" />
                           <path class="s2" d="m693 2393.6h1248v162.8h-1248z" id="centroSecador_15" />
                           <path class="s2" d="m693 2725.6h1248v162.8h-1248z" id="centroSecador_15" />
                           <path class="s2" d="m693 3060.6h1248v162.8h-1248z" id="centroSecador_15" />
                           <path class="s2" d="m693 3386.6h1248v162.8h-1248z" id="centroSecador_15" />
                           <path class="s2" d="m693 3732h1248v163h-1248z" id="centroSecador_15" />
                           <g id="funilCentro">
                              <path class="s2" d="m1129.5 3971l0.5 106 154 107.7v14.3l10.2 10.2v36.8h44.8v-36.6l11.3-11.2v-13.5l151.7-109v-104.7z" id="funilCentro_2" />
                              <path class="s0" d="m1350 4184.1v13.8h-66v-13.8z" id="funilCentro_4" />
                              <path class="s2" d="m1503 4034v30h-373v-30z" id="funilCentro_5" />
                              <path class="s2" d="m1503 3971v30h-373v-30z" id="funilCentro_5" />
                           </g>
                           <path class="s0" d="m1105 3971h25v452h-25z" id="centroSecador_23" />
                           <path class="s0" d="m1502 3971h25v452h-25z" id="centroSecador_23" />
                           <path class="s0" d="m1941 4417v37h-1322v-37z" id="centroSecador_21" />
                           <path class="s2" d="m693 1028h1247v27h-1247z" id="centroSecador_16" />
                           <path class="s2" d="m1927 1028v-17l-438-42h-344l-437 45v14z" id="centroSecador_2" />
                           <path class="s2" d="m1140 562h354v405.7h-354z" id="centroSecador_17" />
                           <path class="s2" d="m1502 565l-371.2-0.6 185.9-178.4z" id="centroSecador_2" />
                           <path class="s2" d="m1265 227h108v338h-108z" id="centroSecador_18" />
                           <path class="s0" d="m1386 158l31-31-65-60-6 55z" id="centroSecador_3" />
                           <path class="s2" d="m1277 128h81v99h-81z" id="centroSecador_19" />
                           <path class="s2" d="m1282 67h71v61h-71z" id="centroSecador_20" />
                        </g>
                        <g id="exaustor_aerador">
                           <g id="exaustor">
                              <path class="s0" d="m991 510v180h-335v-180z" id="exaustor_6" />
                              <path class="s0" d="m964 800l27-109h-334l24 110z" id="exaustor_3" />
                              <path class="s0" d="m677 387h293c11.6 0 21 9.4 21 21v102h-335v-102c0-11.6 9.4-21 21-21zm5 414h281l-8.2 98.9 3.5 88.9-228.7 23.7-3.5-88.6z" id="exaustor_7" />
                              <path class="s0" d="m726.5 925.6l-0.5-5 229-24.2 0.5 5z" id="exaustor_8" />
                              <path class="s0" d="m954 386v-27h50.1v-31h-10.1l-20.5-20.5h-301.5l-86 32.5h86.1l14.9 31h10l4 16z" id="exaustor_4" />
                           </g>
                        </g>
                        <g id="centroArmazem">
                           <path class="s2" d="m1493 564v3407h-354v-3407z" id="centroArmazem_23" />
                           <path class="s2" d="m1138 2393.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 2770.2h356v63.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 3149.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 3526.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 3777.2h356v63.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 631.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 883.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 1134.2h356v63.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 1386.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 1638.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 1889.2h356v63.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 2141.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 2519.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 2896.2h356v63.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 3274.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 3651.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 3903.2h356v67.8h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 757.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 1008.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 1260.2h356v63.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 1512.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 1763.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 2015.2h356v63.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 2267.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 2644.1h356v62.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 3023.2h356v63.5h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1138 3400.7h356v62.6h-356z" id="centroArmazem_21" />
                           <path class="s2" d="m1492.9 564.9h9.3v3406.1h-9.3z" id="centroArmazem_22" />
                           <path class="s2" d="m1129.9 564.9h9.3v3406.1h-9.3z" id="centroArmazem_22" />
                        </g>
                        <g id="Nivel" class="mouse">
                           <path class="s3" d="m1318 880c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <text id="Nivel_text" x="1318" y="800" text-anchor="middle" dominant-baseline="middle" class="t4" style="font-size: 110px; font-weight: 700; font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'">N</text>
                        </g>

                        <g id="tubulacao" v-if="dadoSecador?.CAP == 1">
                           <path class="s0" d="m698.9 380.8v94.4l-130.5-1.8v-94.4z" id="tubulacao_10" />
                           <path class="s0" d="m609 617h47l42.7-143.3-130.7-0.4z" id="tubulacao_8" />
                           <path class="s0" d="m656 617v3591h-47v-3591z" id="tubulacao_11" />
                           <path class="s0" d="m655 1447v46h-46v-46z" id="tubulacao_13" />
                           <path class="s0" d="m655 1061v46h-46v-46z" id="tubulacao_14" />
                           <path class="s0" d="m634 401c-36.5 0-66-8.5-66-19 0-10.5 29.5-19 66-19 36.5 0 66 8.5 66 19 0 10.5-29.5 19-66 19z" id="tubulacao_9" />
                           <path class="s0" d="m610 388v-29h49v30" id="tubulacao_5" />
                           <path class="s0" d="m608.9 1947.3v-5l47.2-0.2v5z" id="tubulacao_15" />
                           <path class="s0" d="m609 2395.8v-5h47v5z" id="tubulacao_16" />
                           <path class="s0" d="m608.9 2834.8v-5h47v5z" id="tubulacao_17" />
                           <path class="s0" d="m608.9 3278.2v-5h47.3v5z" id="tubulacao_18" />
                           <path class="s0" d="m609.1 3721.7v-5h46.8v5z" id="tubulacao_19" />
                           <path class="s0" d="m609 4166.3v-5h47.2v5z" id="tubulacao_20" />
                           <path class="s0" d="m610 360v-19" id="tubulacao_6" />
                           <path class="s0" d="m659 359v-19" id="tubulacao_7" />
                        </g>
                        <g id="IconePre4" v-show="filtroGrafico == 'pressões'" transform="translate(210, -120)">
                           <path :class="corP4" d="m836 4076c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconePre4_0" />
                           <use href="#img1" id="IconePre4_2" transform="matrix(1.381,0,0,1.381,791.764,3935)" />
                        </g>
                        <g id="IconePre5" v-show="filtroGrafico == 'pressões'">
                           <path :class="corP5" d="m897 3309c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconePre5_0" />
                           <use href="#img1" id="IconePre5_2" transform="matrix(1.381,0,0,1.381,852.764,3168)" />
                        </g>
                        <g id="IconePre3" v-show="filtroGrafico == 'pressões'">
                           <path :class="corP3" d="m1724 3309c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconePre3_0" />
                           <use href="#img1" id="IconePre3_2" transform="matrix(1.381,0,0,1.381,1679.764,3168)" />
                        </g>
                        <g id="IconePre2" v-show="filtroGrafico == 'pressões'">
                           <path :class="corP2" d="m2114 4209c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconePre2_0" />
                           <use href="#img1" id="IconePre2_2" transform="matrix(1.381,0,0,1.381,2069.764,4068)" />
                        </g>
                        <g id="IconePre1" v-show="filtroGrafico == 'pressões'">
                           <path :class="corP1" d="m3801 4134c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconePre1_0" />
                           <use href="#img1" id="IconePre1_2" transform="matrix(1.381,0,0,1.381,3756.764,3993)" />
                        </g>
                        <g id="IconeSensorTemp4" v-show="filtroGrafico == 'temperaturas' && dadoSecador.hasOwnProperty('S4')">
                           <path :class="corS4" d="m1312 3643c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconeSensorTemp4_0" />
                           <use href="#img2" id="IconeSensorTemp4_1" transform="matrix(1.536,0,0,1.536,1284.353,3493.758)" />
                        </g>
                        <g id="IconeSensorTemp3" v-show="filtroGrafico == 'temperaturas'">
                           <path :class="corS3" d="m903 1390c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconeSensorTemp3_0" />
                           <use href="#img2" id="IconeSensorTemp3_1" transform="matrix(1.536,0,0,1.536,875.353,1240.758)" />
                        </g>
                        <g id="IconeSensorTemp2" v-show="filtroGrafico == 'temperaturas' && dadoSecador.hasOwnProperty('S2')">
                           <path :class="corS2" d="m1721 3098c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconeSensorTemp2_0" />
                           <use href="#img2" id="IconeSensorTemp2_1" transform="matrix(1.536,0,0,1.536,1693.353,2948.758)" />
                        </g>
                        <g id="IconeSensorTemp1" v-show="filtroGrafico == 'temperaturas'">
                           <path :class="corS1" d="m1723 2093c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" id="IconeSensorTemp1_0" />
                           <use href="#img2" id="IconeSensorTemp1_1" transform="matrix(1.536,0,0,1.536,1695.353,1943.758)" />
                        </g>
                        <g id="Motor5">
                           <path class="s7" d="m1185.7 4522.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" id="Motor5_3" />
                           <path class="s7" d="m1138.5 4569.2h8.3v55.2h-8.3z" id="Motor5_3" />
                           <path class="s7" d="m1229.6 4674.1h42.8v9.7h-42.8z" id="Motor5_3" />
                           <path class="s7" d="m1341.4 4674.4h42.8v9.6h-42.8z" id="Motor5_3" />
                           <path class="s7" d="m1435.1 4587.3h31.7v23.5h-31.7z" id="Motor5_3" />
                           <path class="s7" d="m1390.9 4522.5h20.7v151.8h-20.7z" id="Motor5_3" />
                           <path class="s7" d="m1390.8 4654.6v11h-166.8v-11z" id="Motor5_3" />
                           <path class="s7" d="m1390.8 4633.9v11h-166.8v-11z" id="Motor5_3" />
                           <path class="s7" d="m1390.8 4613.2v11h-166.8v-11z" id="Motor5_3" />
                           <path class="s7" d="m1390.8 4593.9v11h-166.8v-11z" id="Motor5_3" />
                           <path class="s7" d="m1390.8 4573.2v11h-166.8v-11z" id="Motor5_3" />
                           <path class="s7" d="m1390.8 4552.5v11h-166.8v-11z" id="Motor5_3" />
                           <path class="s7" d="m1390.8 4532.1v11.1h-166.8v-11.1z" id="Motor5_3" />
                           <path class="s7" d="m1199.2 4522.5h24.7v151.8h-24.7z" id="Motor5_3" />
                           <path class="s7" d="m1211.5 4600.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" id="Motor5_3" />
                           <path class="s7" d="m1211.5 4555.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor5_3" />
                           <path class="s7" d="m1211.5 4644.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor5_3" />
                        </g>
                        <g id="Motor4">
                           <path class="s7" d="m1200.7 3708.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" id="Motor4_3" />
                           <path class="s7" d="m1153.5 3755.2h8.3v55.2h-8.3z" id="Motor4_3" />
                           <path class="s7" d="m1244.6 3860.1h42.8v9.7h-42.8z" id="Motor4_3" />
                           <path class="s7" d="m1356.4 3860.4h42.8v9.6h-42.8z" id="Motor4_3" />
                           <path class="s7" d="m1450.1 3773.3h31.7v23.5h-31.7z" id="Motor4_3" />
                           <path class="s7" d="m1405.9 3708.5h20.7v151.8h-20.7z" id="Motor4_3" />
                           <path class="s7" d="m1405.8 3840.6v11h-166.8v-11z" id="Motor4_3" />
                           <path class="s7" d="m1405.8 3819.9v11h-166.8v-11z" id="Motor4_3" />
                           <path class="s7" d="m1405.8 3799.2v11h-166.8v-11z" id="Motor4_3" />
                           <path class="s7" d="m1405.8 3779.9v11h-166.8v-11z" id="Motor4_3" />
                           <path class="s7" d="m1405.8 3759.2v11h-166.8v-11z" id="Motor4_3" />
                           <path class="s7" d="m1405.8 3738.5v11h-166.8v-11z" id="Motor4_3" />
                           <path class="s7" d="m1405.8 3718.1v11.1h-166.8v-11.1z" id="Motor4_3" />
                           <path class="s7" d="m1214.2 3708.5h24.7v151.8h-24.7z" id="Motor4_3" />
                           <path class="s7" d="m1226.5 3786.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" id="Motor4_3" />
                           <path class="s7" d="m1226.5 3741.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor4_3" />
                           <path class="s7" d="m1226.5 3830.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor4_3" />
                        </g>
                        <g id="Motor3" v-show="dadoSecador?.CAP == 1">
                           <path class="s7" d="m226.7 357.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" id="Motor3_3" />
                           <path class="s7" d="m179.5 404.2h8.3v55.2h-8.3z" id="Motor3_3" />
                           <path class="s7" d="m270.6 509.1h42.8v9.7h-42.8z" id="Motor3_3" />
                           <path class="s7" d="m382.4 509.4h42.8v9.6h-42.8z" id="Motor3_3" />
                           <path class="s7" d="m476.1 422.3h31.7v23.5h-31.7z" id="Motor3_3" />
                           <path class="s7" d="m431.9 357.5h20.7v151.8h-20.7z" id="Motor3_3" />
                           <path class="s7" d="m431.8 489.6v11h-166.8v-11z" id="Motor3_3" />
                           <path class="s7" d="m431.8 468.9v11h-166.8v-11z" id="Motor3_3" />
                           <path class="s7" d="m431.8 448.2v11h-166.8v-11z" id="Motor3_3" />
                           <path class="s7" d="m431.8 428.9v11h-166.8v-11z" id="Motor3_3" />
                           <path class="s7" d="m431.8 408.2v11h-166.8v-11z" id="Motor3_3" />
                           <path class="s7" d="m431.8 387.5v11h-166.8v-11z" id="Motor3_3" />
                           <path class="s7" d="m431.8 367.1v11.1h-166.8v-11.1z" id="Motor3_3" />
                           <path class="s7" d="m240.2 357.5h24.7v151.8h-24.7z" id="Motor3_3" />
                           <path class="s7" d="m252.5 435.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" id="Motor3_3" />
                           <path class="s7" d="m252.5 390.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor3_3" />
                           <path class="s7" d="m252.5 479.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor3_3" />
                        </g>
                        <g id="Motor2">
                           <path class="s7" d="m262.7 917.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" id="Motor2_3" />
                           <path class="s7" d="m215.5 964.2h8.3v55.2h-8.3z" id="Motor2_3" />
                           <path class="s7" d="m306.6 1069.1h42.8v9.7h-42.8z" id="Motor2_3" />
                           <path class="s7" d="m418.4 1069.4h42.8v9.6h-42.8z" id="Motor2_3" />
                           <path class="s7" d="m512.1 982.3h31.7v23.5h-31.7z" id="Motor2_3" />
                           <path class="s7" d="m467.9 917.5h20.7v151.8h-20.7z" id="Motor2_3" />
                           <path class="s7" d="m467.8 1049.6v11h-166.8v-11z" id="Motor2_3" />
                           <path class="s7" d="m467.8 1028.9v11h-166.8v-11z" id="Motor2_3" />
                           <path class="s7" d="m467.8 1008.2v11h-166.8v-11z" id="Motor2_3" />
                           <path class="s7" d="m467.8 988.9v11h-166.8v-11z" id="Motor2_3" />
                           <path class="s7" d="m467.8 968.2v11h-166.8v-11z" id="Motor2_3" />
                           <path class="s7" d="m467.8 947.5v11h-166.8v-11z" id="Motor2_3" />
                           <path class="s7" d="m467.8 927.1v11.1h-166.8v-11.1z" id="Motor2_3" />
                           <path class="s7" d="m276.2 917.5h24.7v151.8h-24.7z" id="Motor2_3" />
                           <path class="s7" d="m288.5 995.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" id="Motor2_3" />
                           <path class="s7" d="m288.5 950.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor2_3" />
                           <path class="s7" d="m288.5 1039.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor2_3" />
                        </g>
                        <!-- <g id="Motor1">
                           <path class="s7" d="m1534.7 127.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" id="Motor1_3" />
                           <path class="s7" d="m1487.5 174.2h8.3v55.2h-8.3z" id="Motor1_3" />
                           <path class="s7" d="m1578.6 279.1h42.8v9.7h-42.8z" id="Motor1_3" />
                           <path class="s7" d="m1690.4 279.4h42.8v9.6h-42.8z" id="Motor1_3" />
                           <path class="s7" d="m1784.1 192.3h31.7v23.5h-31.7z" id="Motor1_3" />
                           <path class="s7" d="m1739.9 127.5h20.7v151.8h-20.7z" id="Motor1_3" />
                           <path class="s7" d="m1739.8 259.6v11h-166.8v-11z" id="Motor1_3" />
                           <path class="s7" d="m1739.8 238.9v11h-166.8v-11z" id="Motor1_3" />
                           <path class="s7" d="m1739.8 218.2v11h-166.8v-11z" id="Motor1_3" />
                           <path class="s7" d="m1739.8 198.9v11h-166.8v-11z" id="Motor1_3" />
                           <path class="s7" d="m1739.8 178.2v11h-166.8v-11z" id="Motor1_3" />
                           <path class="s7" d="m1739.8 157.5v11h-166.8v-11z" id="Motor1_3" />
                           <path class="s7" d="m1739.8 137.1v11.1h-166.8v-11.1z" id="Motor1_3" />
                           <path class="s7" d="m1548.2 127.5h24.7v151.8h-24.7z" id="Motor1_3" />
                           <path class="s7" d="m1560.5 205.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" id="Motor1_3" />
                           <path class="s7" d="m1560.5 160.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor1_3" />
                           <path class="s7" d="m1560.5 249.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" id="Motor1_3" />
                        </g> -->

                        <g id="CalhaInterna">
                           <defs>
                              <pattern id="flechaMovimento" patternUnits="userSpaceOnUse" width="120" height="130">
                                 <rect width="120" height="130" fill="#878787" />
                                 <path d="M20 20 L70 50 L20 80" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                                 <animateTransform attributeName="patternTransform" type="translate" from="0,0" to="120,0" dur="1s" repeatCount="indefinite" />
                              </pattern>
                           </defs>
                           <path id="CalhaInterna_Animada" d="m1498 4628l123-94h931l5-15h83v70h9v-9h16v29h-26v42h-5v22h-163v-15h-851v-34z" fill="url(#flechaMovimento)" stroke="#000" stroke-width="1" />
                        </g>
                        <g xmlns="http://www.w3.org/2000/svg" id="Umidade1" v-show="filtroGrafico == 'umidades'" transform="translate(-800, 100)">
                           <path id="FundoUmidade1" class="s0" :class="{ fundoUmidades: !this.isDataExpirada(), s0: this.isDataExpirada() }" d="m2312 406c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <path id="gota1" class="s1 gostasUmidade" d="m2302 271.2c7.4 0 35.6 45.9 35.6 65.9 0 20-16.3 36.3-36.3 36.3-20.1 0-36.3-16.3-36.3-36.3 0-20 29.6-65.9 37-65.9z" />
                           <path id="gota1" class="s1 gostasUmidade" d="m2348.9 264c3.7 0 17.8 22.9 17.8 32.9 0 10.1-8.2 18.2-18.2 18.2-10 0-18.1-8.1-18.1-18.2 0-10 14.8-32.9 18.5-32.9z" />
                        </g>
                        <g xmlns="http://www.w3.org/2000/svg" id="Umidade2" v-show="filtroGrafico == 'umidades'" transform="translate(-800, 3800)">
                           <path id="FundoUmidade1" class="s0" :class="{ fundoUmidades: !this.isDataExpirada(), s0: this.isDataExpirada() }" d="m2312 406c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <path id="gota1" class="s1 gostasUmidade" d="m2302 271.2c7.4 0 35.6 45.9 35.6 65.9 0 20-16.3 36.3-36.3 36.3-20.1 0-36.3-16.3-36.3-36.3 0-20 29.6-65.9 37-65.9z" />
                           <path id="gota1" class="s1 gostasUmidade" d="m2348.9 264c3.7 0 17.8 22.9 17.8 32.9 0 10.1-8.2 18.2-18.2 18.2-10 0-18.1-8.1-18.1-18.2 0-10 14.8-32.9 18.5-32.9z" />
                        </g>
                     </g>
                  </svg>
               </b-col>
               <b-col lg="7" ref="abasContainer" class="fundo">
                  <b-button class="pull-right" :class="{ 'mt-3': fullscreen }" variant="light" v-if="!fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen" title="Tela cheia"></b-icon></b-button>
                  <b-button class="pull-right" :class="{ 'mt-3': fullscreen }" variant="light" v-if="fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen-exit" title="Tela normal"></b-icon></b-button>
                  <b-tabs class="nav-customizado" :class="{ 'mt-3': fullscreen }">
                     <b-tab @click="alterarTipoGrafico('temperaturas')">
                        <template #title>
                           <div><b-icon icon="thermometer-half"></b-icon><span>Temperaturas</span></div>
                        </template>
                        <h1>Análise das temperaturas</h1>
                        <hr class="m-1" />
                        <secador-ads-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-ads-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('pressões')">
                        <template #title>
                           <div><b-icon icon="speedometer"></b-icon><span>Pressões</span></div>
                        </template>
                        <h1>Análise das depressões</h1>
                        <hr class="m-1" />
                        <secador-ads-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-ads-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('umidades')">
                        <template #title>
                           <div><b-icon icon="droplet"></b-icon><span>Umidades</span></div>
                        </template>
                        <h1>Análise das umidades</h1>
                        <hr class="m-1" />
                        <secador-ads-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-ads-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('rendimento')">
                        <template #title>
                           <div><b-icon icon="graph-up"></b-icon><span>Rendimento</span></div>
                        </template>
                        <h1>Análise da produtividade</h1>
                        <hr class="m-1" />
                        <secador-ads-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-ads-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('parametros')">
                        <template #title>
                           <div><b-icon icon="gear"></b-icon><span>Parâmetros</span></div>
                        </template>
                        <h1>Parâmetros da secagem</h1>
                        <hr class="m-1" />
                        <secador-ads-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-ads-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('acionamentos')">
                        <template #title>
                           <div><b-icon icon="circle-half"></b-icon><span>Acionamentos</span></div>
                        </template>
                        <h1>Análise dos acionamentos</h1>
                        <hr class="m-1" />
                        <secador-ads-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-ads-grafico>
                     </b-tab>
                  </b-tabs>
               </b-col>
            </b-row>
         </b-overlay>
      </div>
      <b-popover :show="showPopoverS1" target="IconeSensorTemp1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">S1</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.S1 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.S1 && (!dadoSecador?.TA1 || !dadoSecador?.TB1)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverS2" target="IconeSensorTemp2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">S2</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.S2 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.S2 && (!dadoSecador?.TA2 || !dadoSecador?.TB2)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverS3" target="IconeSensorTemp3" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">S3</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.S3 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.S3 && (!dadoSecador?.TA3 || !dadoSecador?.TB3)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverS4" target="IconeSensorTemp4" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">S4</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.S4 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.S4 && (!dadoSecador?.TA4 || !dadoSecador?.TB4)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverP1" target="IconePre1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P1</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.P1 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P1 && (!dadoSecador?.PA1 || !dadoSecador?.PB1)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverP2" target="IconePre2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P2</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.P2 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P2 && (!dadoSecador?.PA2 || !dadoSecador?.PB2)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverP3" target="IconePre3" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P3</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.P3 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P3 && (!dadoSecador?.PA3 || !dadoSecador?.PB3)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverP4" target="IconePre4" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P4</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.P4 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P4 && (!dadoSecador?.PA4 || !dadoSecador?.PB4)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverP5" target="IconePre5" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P5</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.P5 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P5 && (!dadoSecador?.PA5 || !dadoSecador?.PB5)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverUE" target="Umidade1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">UE</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.UE || '-' }} %</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverUS" target="Umidade2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">US</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.US || '-' }} %</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <!-- <b-popover :show="showPopoverM1" target="Motor1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Elevador de Carga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 4) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor text-center">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover> -->
      <b-popover :show="showPopoverM2" target="Motor2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Exaustores</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 0) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor text-center">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverM3" target="Motor3" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Captação de Pó</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 3) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor text-center">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverM4" target="Motor4" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Descarga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 1) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor text-center">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverM5" target="Motor5" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Transportador de Descarga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 2) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor text-center">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="Nivel" triggers="hover" placement="bottomleft">
         <div v-if="!this.isDataExpirada()" style="min-width: 150px">
            <b-row class="justify-content-center align-items-end">
               <b-col cols="6" class="text-center" v-if="['1', '2', '3'].includes(numeroNiveis)">
                  <p class="mb-0 text-nowrap">Máximo 1</p>
                  <div class="mt-0 ml-3 circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.NIV, 2), grey: !verificarBitNaPosicao(this.dadoSecador.NIV, 2) }"></div>
               </b-col>
               <b-col cols="6" class="text-center" v-if="['3'].includes(numeroNiveis)">
                  <p class="mb-0 text-nowrap">Máximo 2</p>
                  <div class="mt-0 ml-3 circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.NIV, 3), grey: !verificarBitNaPosicao(this.dadoSecador.NIV, 3) }"></div>
               </b-col>
            </b-row>
            <b-row class="justify-content-center align-items-end" v-if="['2'].includes(numeroNiveis)">
               <b-col cols="6" class="text-center">
                  <p class="mb-0 text-nowrap">Controle</p>
                  <div class="mt-0 ml-3 circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.NIV, 2), grey: !verificarBitNaPosicao(this.dadoSecador.NIV, 2) }"></div>
               </b-col>
               <b-col cols="6" class="text-center" v-if="dadoSecador?.RGM == 1">
                  <p class="mb-0 text-nowrap">Registro</p>
                  <div class="mt-0 ml-3 circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.AC1, 5), grey: !verificarBitNaPosicao(this.dadoSecador.AC1, 5) }"></div>
               </b-col>
            </b-row>
            <b-row class="justify-content-center align-items-end">
               <b-col cols="6" class="text-center" v-if="['0', '1', '2', '3'].includes(numeroNiveis)">
                  <p class="mb-0 text-nowrap">Mínimo 1</p>
                  <div class="mt-0 ml-3 circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.NIV, 0), grey: !verificarBitNaPosicao(this.dadoSecador.NIV, 0) }"></div>
               </b-col>
               <b-col cols="6" class="text-center" v-if="['0', '3'].includes(numeroNiveis)">
                  <p class="mb-0 text-nowrap">Mínimo 2</p>
                  <div class="mt-0 ml-3 circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.NIV, 1), grey: !verificarBitNaPosicao(this.dadoSecador.NIV, 1) }"></div>
               </b-col>
            </b-row>
         </div>
         <div v-if="this.isDataExpirada()">
            <p>Aguardando dados</p>
         </div>
      </b-popover>
   </div>
</template>

<script>
import client from '@/api'
import SecadorAdsGrafico from '../components/SecadorAdsGrafico.vue'
import sojaSVG from '@/assets/images/inicio/soja.svg'
import arrozSVG from '@/assets/images/inicio/arroz.svg'
import milhoSVG from '@/assets/images/inicio/milho.svg'
import trigoSVG from '@/assets/images/inicio/trigo.svg'

export default {
   name: 'SecadorAdsDados',
   props: {
      tempoAtualizacao: Number
   },
   components: {
      SecadorAdsGrafico
   },
   data() {
      return {
         dataGraficoInicial: this.$moment().format('YYYY-MM-DD'),
         dataGraficoFinal: this.$moment().format('YYYY-MM-DD'),
         fullscreen: false,
         buscandoEquipamento: false,
         equipamento: [],
         filtroGrafico: 'temperaturas',
         buscandoDados: false,
         dadoSecador: [],
         showPopoverS1: false,
         showPopoverS2: false,
         showPopoverS3: false,
         showPopoverS4: false,
         showPopoverP1: false,
         showPopoverP2: false,
         showPopoverP3: false,
         showPopoverP4: false,
         showPopoverP5: false,
         showPopoverUE: false,
         showPopoverUS: false,
         showPopoverM1: false,
         showPopoverM2: false,
         showPopoverM3: false,
         showPopoverM4: false,
         showPopoverM5: false
      }
   },

   computed: {
      corS1() {
         return this.calculaCor(this.dadoSecador.S1, this.dadoSecador.TA1, this.dadoSecador.TB1)
      },
      corS2() {
         return this.calculaCor(this.dadoSecador.S2, this.dadoSecador.TA2, this.dadoSecador.TB2)
      },
      corS3() {
         return this.calculaCor(this.dadoSecador.S3, this.dadoSecador.TA3, this.dadoSecador.TB3)
      },
      corS4() {
         return this.calculaCor(this.dadoSecador.S4, this.dadoSecador.TA4, this.dadoSecador.TB4)
      },
      corP1() {
         return this.calculaCor(this.dadoSecador.P1, this.dadoSecador.PA1, this.dadoSecador.PB1)
      },
      corP2() {
         return this.calculaCor(this.dadoSecador.P2, this.dadoSecador.PA2, this.dadoSecador.PB2)
      },
      corP3() {
         return this.calculaCor(this.dadoSecador.P3, this.dadoSecador.PA3, this.dadoSecador.PB3)
      },
      corP4() {
         return this.calculaCor(this.dadoSecador.P4, this.dadoSecador.PA4, this.dadoSecador.PB4)
      },
      corP5() {
         return this.calculaCor(this.dadoSecador.P5, this.dadoSecador.PA5, this.dadoSecador.PB5)
      },
      numeroNiveis() {
         return this.dadoSecador?.NPN?.charAt(2) || null
      }
   },

   methods: {
      async buscarEquipamento() {
         if (!this.idSecador) {
            return
         }
         this.buscandoEquipamento = true
         const dados = await client.get(`/equipamento/${this.idSecador}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar secador. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoEquipamento = false
         })
         this.buscandoEquipamento = false
         if (dados && dados.data) {
            this.equipamento = dados.data
         }
      },
      async buscarDados() {
         if (!this.idSecador) {
            return
         }
         this.buscandoDados = true
         const dados = await client.get(`/secador/ads/buscardado/${this.idSecador}`).catch((err) => {
            this.$bvToast.toast(`Erro ao buscar dados. ${err}`, {
               title: 'Erro',
               variant: 'warning',
               autoHideDelay: 5000,
               solid: true,
               toaster: 'b-toaster-bottom-right'
            })
            this.buscandoDados = false
         })
         this.buscandoDados = false
         if (dados && dados.data) {
            this.dadoSecador = dados.data
            // let motor1 = +this.verificarBitNaPosicao(this.dadoSecador.AC1, 4)
            let motor2 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 0)
            let motor3 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 3)
            let motor4 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 1)
            let motor5 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 2)
            // this.atualizarCorMotor('Motor1', motor1)
            this.atualizarCorMotor('Motor2', motor2)
            this.atualizarCorMotor('Motor3', motor3)
            this.atualizarCorMotor('Motor4', motor4)
            this.atualizarCorMotor('Motor5', motor5)
         }
      },
      alterarTipoGrafico(filtroGrafico) {
         this.filtroGrafico = filtroGrafico
      },
      formatarOperacao(value) {
         const status = {
            1: { nome: 'Desligado', icone: 'dash-square' },
            2: { nome: 'Carga', icone: 'arrow-up-square' },
            3: { nome: 'Secagem', icone: 'arrow-right-square' },
            4: { nome: 'Descarga', icone: 'arrow-down-square' }
         }
         return status[value] || { nome: '-', icone: 'dash-square' }
      },
      formatarProduto(value) {
         const produto = {
            1: { nome: 'Soja', svg: sojaSVG },
            2: { nome: 'Milho', svg: milhoSVG },
            3: { nome: 'Trigo', svg: trigoSVG },
            4: { nome: 'Arroz', svg: arrozSVG },
            5: { nome: 'Outros', svg: sojaSVG }
         }
         return produto[value] || { nome: '-', svg: sojaSVG }
      },
      formatarFluxo(value) {
         const status = {
            1: { nome: 'Contínuo', icone: 'arrow-down' },
            2: { nome: 'Rodízio', icone: 'arrow-repeat' }
         }
         return status[value]
      },
      formatarControle(value) {
         const status = {
            1: { nome: 'Manual', icone: 'square' },
            2: { nome: 'Semi-auto', icone: 'slash-square' },
            3: { nome: 'Automático', icone: 'check-square' }
         }
         return status[value]
      },
      formatarStatus(value) {
         const status = {
            OF: 'Offline',
            EF: 'Alerta',
            EC: 'Em configuração',
            EM: 'Em manutenção',
            CM: 'Com mensagem',
            ON: 'Online'
         }
         return status[value]
      },
      corTexto(st_operacao) {
         const variant = {
            OF: 'text-secondary',
            EF: 'text-danger',
            EC: 'text-dark',
            EM: 'text-warning',
            ON: 'text-success'
         }
         return variant[st_operacao]
      },
      corVariant(st_operacao) {
         const variant = {
            OF: 'secondary',
            EF: 'danger',
            EC: 'dark',
            EM: 'warning',
            ON: 'success'
         }
         return variant[st_operacao]
      },
      formatarData(value) {
         if (!value) return ' - '
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
      },
      toggleFullScreen() {
         const elem = this.$refs.abasContainer
         this.fullscreen = true

         if (!this.fullscreenElement) {
            if (elem.requestFullscreen) {
               elem.requestFullscreen()
            } else if (elem.mozRequestFullScreen) {
               elem.mozRequestFullScreen()
            } else if (elem.webkitRequestFullscreen) {
               elem.webkitRequestFullscreen()
            } else if (elem.msRequestFullscreen) {
               elem.msRequestFullscreen()
            }

            elem.style.overflow = 'auto'
            this.fullscreenElement = elem
         } else {
            if (document.exitFullscreen) {
               document.exitFullscreen()
            } else if (document.mozCancelFullScreen) {
               document.mozCancelFullScreen()
            } else if (document.webkitExitFullscreen) {
               document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
               document.msExitFullscreen()
            }

            this.fullscreenElement = null
            this.fullscreen = false
         }
      },
      exitFullScreen() {
         if (document.exitFullscreen) {
            document.exitFullscreen()
         } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
         } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
         } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
         }

         this.fullscreenElement = null
         this.fullscreen = false
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarDados()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      },
      verificarBitNaPosicao(binario, posicao) {
         if (!binario) return
         const posicaoInvertida = binario.length - 1 - posicao
         return binario.charAt(posicaoInvertida) === '1'
      },
      calculaCor(dado, maximo, minimo) {
         let temp = Number(dado)
         let tempMax = Number(maximo)
         let tempMin = Number(minimo)
         if (this.isDataExpirada() || !maximo || !minimo) {
            return 'gray'
         }
         if (temp > tempMax) {
            return 'red'
         } else if (temp < tempMin) {
            return 'blue'
         } else {
            return 'fgreen'
         }
      },
      isDataExpirada() {
         if (!this.dadoSecador || !this.dadoSecador.DAT || this.equipamento?.st_operacao === 'OF') {
            return true
         }
         const dataDados = this.$moment(this.dadoSecador.DAT, 'DD/MM/YYYY HH:mm:ss')
         const dataAtual = this.$moment()
         const diferencaHoras = dataAtual.diff(dataDados, 'hours')
         return diferencaHoras > 1
      },
      atualizarCorMotor(id, status) {
         const motor = document.getElementById(id)
         if (!motor) return
         // controla animação sempre, antes do return
         const animacao = document.querySelector('#flechaMovimento animateTransform')
         if (id === 'Motor5') {
            if (status === 1) {
               if (!animacao) {
                  const novo = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform')
                  novo.setAttribute('attributeName', 'patternTransform')
                  novo.setAttribute('type', 'translate')
                  novo.setAttribute('from', '0,0')
                  novo.setAttribute('to', '120,0')
                  novo.setAttribute('dur', '1s')
                  novo.setAttribute('repeatCount', 'indefinite')
                  document.querySelector('#flechaMovimento').appendChild(novo)
               }
            } else {
               if (animacao) animacao.remove()
            }
         }
         let cor = ''
         if (status === 1) cor = 'green'
         else if (status === 2) cor = 'red'
         else return
         const partes = motor.querySelectorAll('path, rect, circle, polygon')
         partes.forEach((el) => {
            el.removeAttribute('class')
            el.setAttribute('fill', cor)
            el.setAttribute('stroke', '#000')
         })
      }
   },

   mounted() {
      const idSecadorLocalStorage = localStorage.getItem('sec')

      if (idSecadorLocalStorage && idSecadorLocalStorage != 'undefined') {
         this.idSecador = idSecadorLocalStorage
      } else {
         this.idSecador = this.$route.params.idSecador
         localStorage.setItem('sec', this.idSecador)
      }
      this.buscarEquipamento()
      this.buscarDados()
   },

   watch: {
      tempoAtualizacao(newValue) {
         if (newValue) {
            this.startInterval(newValue)
         } else {
            this.stopInterval()
         }
      }
   },

   beforeDestroy() {
      this.stopInterval()
   }
}
</script>

<style scoped>
.overlay {
   z-index: 0;
}

.mouse {
   cursor: pointer;
}

.circulo {
   width: 25px;
   height: 25px;
   border-radius: 50%;
   margin: 10px;
}

.green {
   background-color: green;
}

.fgreen {
   fill: green;
}

.red {
   fill: red;
}

.blue {
   fill: blue;
}

.gray {
   fill: gray;
}

.grey {
   background-color: grey;
}

.s0 {
   fill: #878787;
   stroke: #000000;
   stroke-miterlimit: 100;
   stroke-width: 2;
}
.s1 {
   fill: none;
   stroke: #000000;
   stroke-miterlimit: 100;
   stroke-width: 2;
}
.s2 {
   fill: #b4b4b4;
   stroke: #000000;
   stroke-miterlimit: 100;
   stroke-width: 2;
}
.s3 {
   fill: #878787;
   stroke: black;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.t4 {
   font-size: 49px;
   fill: #ffffff;
   font-weight: 400;
   font-family: 'DejaVuSans', 'DejaVu Sans';
}
.s5 {
   fill: blue;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.s6 {
   fill: red;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.s7 {
   fill: #878787;
   stroke: #000000;
   stroke-miterlimit: 100;
}
.fundoUmidades {
   fill: green;
   stroke: #000000;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.gostasUmidade {
   fill: #ffffff;
   stroke: #fff;
   stroke-miterlimit: 100;
   stroke-width: 1;
}

.fundo {
   background: #fff;
}
</style>
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
                  <b-col cols="4" md="2" lg="1" v-b-tooltip.hover title="Produto">
                     <span class="mouse"><img width="22" v-if="formatarProduto(dadoSecador.GG).svg" :src="formatarProduto(dadoSecador.GG).svg" /> {{ formatarProduto(dadoSecador.GG).nome }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" class="text-nowrap" v-b-tooltip.hover title="Operação">
                     <b-icon :icon="formatarOperacao(dadoSecador.OP)?.icone" scale="1.5" class="mr-2"></b-icon>
                     <span>{{ formatarOperacao(dadoSecador.OP)?.nome }}</span>
                  </b-col>
                  <b-col cols="4" md="2" lg="1" class="text-nowrap" v-b-tooltip.hover title="Fluxo">
                     <b-icon :icon="formatarFluxo(dadoSecador.FX)?.icone" scale="1.5" class="mr-2"></b-icon>
                     <span>{{ formatarFluxo(dadoSecador.FX)?.nome }}</span>
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
               <b-col lg="5" class="align-self-center">
                  <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4500 4873">
                     <defs>
                        <image
                           width="64"
                           height="77"
                           id="img1"
                           href="data:image/png;base64,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"
                        />
                        <image
                           width="36"
                           height="83"
                           id="img2"
                           href="data:image/png;base64,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"
                        />
                     </defs>
                     <g id="Fornalha">
                        <g id="Fornalha">
                           <g id="ladoEsquerdoFornalha">
                              <path id="ladoEsquerdoFornalha_1" class="s0" d="m2180 3549h952v868h-952zm139 142.3v-1h690v1z" />
                              <path id="ladoEsquerdoFornalha_11" fill-rule="evenodd" class="s0" d="m2180 3549h54v868h-54z" />
                              <path id="ladoEsquerdoFornalha_12" fill-rule="evenodd" class="s0" d="m3086 3549h46v868h-46z" />
                              <path id="ladoEsquerdoFornalha_13" fill-rule="evenodd" class="s0" d="m2180 3548.7h952v20h-952z" />
                              <path id="ladoEsquerdoFornalha_3" fill-rule="evenodd" class="s0" d="m2180 4417h2075v37h-2075z" />
                              <g id="aberturaFornalha">
                                 <path id="aberturaFornalha_10" fill-rule="evenodd" class="s0" d="m2319 3609.7h690v33h-690z" />
                                 <path id="aberturaFornalha_2" fill-rule="evenodd" class="s0" d="m2319 3719.7h689v1h-689z" />
                                 <path id="aberturaFornalha_3" class="s0" d="m2319 3690.7v-1h689v1zm1 57v-1h689v1z" />
                                 <path id="aberturaFornalha_1" fill-rule="evenodd" class="s0" d="m2319 3662.7h689v1h-689z" />
                                 <path id="aberturaFornalha_8" fill-rule="evenodd" class="s1" d="m2319 3610.7h690v170h-690z" />
                                 <path id="aberturaFornalha_9" fill-rule="evenodd" class="s0" d="m2442 3610.7h21v170h-21z" />
                                 <path id="aberturaFornalha_9" fill-rule="evenodd" class="s0" d="m2319 3610.7h21v170h-21z" />
                                 <path id="aberturaFornalha_9" fill-rule="evenodd" class="s0" d="m2581 3610.7h21v170h-21z" />
                                 <path id="aberturaFornalha_9" fill-rule="evenodd" class="s0" d="m2719 3610.7h21v170h-21z" />
                                 <path id="aberturaFornalha_9" fill-rule="evenodd" class="s0" d="m2857 3610.7h21v170h-21z" />
                                 <path id="aberturaFornalha_9" fill-rule="evenodd" class="s0" d="m2987 3610.7h21v169h-21z" />
                              </g>
                           </g>
                           <g id="ladoDireitoFornalha">
                              <path id="ladoDireitoFornalha_2" fill-rule="evenodd" class="s0" d="m3132 3749h1052v668h-1052z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m3196 4374h95v43h-95z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m3400 4374h95v43h-95z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m3603 4374h95v43h-95z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m3707 4374.7h95v41h-95z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m3707 4374h95v43h-95z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m3810 4374h95v43h-95z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m3912 4374.7h95v41h-95z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m3912 4374h95v43h-95z" />
                              <path id="ladoDireitoFornalha_4" fill-rule="evenodd" class="s0" d="m4015 4374h95v43h-95z" />
                              <path id="ladoDireitoFornalha_1" class="s0" d="m3655 4255.7v-75c0 0 27.9-15 55-15 27.4 0 54 15 54 15v76z" />
                              <path id="ladoDireitoFornalha_1" class="s0" d="m3838 4255.7v-75c0 0 27.9-15 55-15 27.4 0 54 15 54 15v76z" />
                              <path id="ladoDireitoFornalha_5" fill-rule="evenodd" class="s0" d="m3132 3749.7h1052v37h-1052z" />
                           </g>
                           <g id="TuboFornalha">
                              <path id="TuboFornalha_1" class="s0" d="m3237.5 3172.7l89.5 39h-179z" />
                              <path id="TuboFornalha_4" class="s0" d="m3203.4 3211l-0.8-0.6 34-37 0.8 0.6z" />
                              <path id="TuboFornalha_5" class="s0" d="m3236.6 3174l0.8-0.6 34 37-0.8 0.6z" />
                              <path id="TuboFornalha_6" fill-rule="evenodd" class="s0" d="m3236 3173.7h1v37h-1z" />
                              <path id="TuboFornalha_7" class="s0" d="m3301.3 3211.3l-0.6 0.8-64-37 0.6-0.8z" />
                              <path id="TuboFornalha_8" class="s0" d="m3175.3 3212.1l-0.6-0.8 62-38 0.6 0.8z" />
                              <path id="TuboFornalha_6" fill-rule="evenodd" class="s0" d="m3191 3210.7h93v538h-93z" />
                              <path id="TuboFornalha_7" fill-rule="evenodd" class="s0" d="m3170 3719.7h134v12h-134z" />
                           </g>
                        </g>
                        <g id="ExaustorLateral" v-show="this.dadoSecador?.TEX == 0">
                           <g id="grupoExaustorLateral">
                              <g id="exaustorLateral">
                                 <path id="exaustor_6" fill-rule="evenodd" class="s0" d="m302.2 2065.1l0.9-335 180 0.5-0.9 335z" />
                                 <path id="exaustor_3" class="s0" d="m593 1757.9l-108.9-27.3-0.9 334 110-23.7z" />
                                 <path id="exaustor_7" class="s0" d="m179.2 2043.8l0.8-293c0.1-11.6 9.5-21 21.1-21l102 0.3-0.9 335-102-0.3c-11.6 0-21-9.4-21-21zm414-3.9l0.8-281 98.9 8.5 88.9-3.2 23.1 228.7-88.6 3.3z" />
                                 <path id="exaustor_4" class="s0" d="m179 1766.8l-27-0.1 0.1-50.1-31-0.1v10.1l-20.5 20.5-0.9 301.5 32.3 86.1 0.2-86.1 31.1-14.9v-10l16-3.9z" />
                              </g>
                              <g id="Motor6" v-show="false">
                                 <path id="Motor3_3" class="s2" d="m86.3 1513.2h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m39.1 1559.9h8.3v55.2h-8.3z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m130.2 1664.8h42.8v9.7h-42.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m242 1665.1h42.8v9.6h-42.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m335.7 1578h31.7v23.5h-31.7z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m291.5 1513.2h20.7v151.8h-20.7z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m124.6 1645.3h166.8v11h-166.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m124.6 1624.6h166.8v11h-166.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m124.6 1603.9h166.8v11h-166.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m124.6 1584.6h166.8v11h-166.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m124.6 1563.9h166.8v11h-166.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m124.6 1543.2h166.8v11h-166.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m124.6 1522.8h166.8v11.1h-166.8z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m99.8 1513.2h24.7v151.8h-24.7z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m112.1 1591.5c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m112.1 1545.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                                 <path id="Motor3_3" fill-rule="evenodd" class="s2" d="m112.1 1635.6c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                              </g>
                           </g>
                           <g id="saidaExaustorLateralSolo">
                              <g id="Motor7">
                                 <path id="Motor2_3" class="s2" d="m388.4 2168.3h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m341.2 2215h8.3v55.2h-8.3z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m432.3 2319.9h42.8v9.7h-42.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m544.1 2320.2h42.8v9.6h-42.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m637.8 2233.1h31.7v23.5h-31.7z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m593.6 2168.3h20.7v151.8h-20.7z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m426.7 2300.4h166.8v11h-166.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m426.7 2279.7h166.8v11h-166.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m426.7 2259h166.8v11h-166.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m426.7 2239.7h166.8v11h-166.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m426.7 2219h166.8v11h-166.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m426.7 2198.3h166.8v11h-166.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m426.7 2177.9h166.8v11.1h-166.8z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m401.9 2168.3h24.7v151.8h-24.7z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m414.2 2246.6c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m414.2 2201c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                                 <path id="Motor2_3" fill-rule="evenodd" class="s2" d="m414.2 2290.7c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                              </g>
                              <g id="exaustorSolo">
                                 <path id="Retângulo 3" fill-rule="evenodd" class="s0" d="m592 1758h101v283h-101z" />
                              </g>
                           </g>
                        </g>
                        <g id="ExaustorTopo" v-show="this.dadoSecador?.TEX == 1">
                           <g id="saidaExaustorTopoSolo">
                              <g id="Motor2">
                                 <path id="Motor2_3" class="s2" d="m262.7 917.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" />
                                 <path id="Motor2_3" class="s2" d="m215.5 964.2h8.3v55.2h-8.3z" />
                                 <path id="Motor2_3" class="s2" d="m306.6 1069.1h42.8v9.7h-42.8z" />
                                 <path id="Motor2_3" class="s2" d="m418.4 1069.4h42.8v9.6h-42.8z" />
                                 <path id="Motor2_3" class="s2" d="m512.1 982.3h31.7v23.5h-31.7z" />
                                 <path id="Motor2_3" class="s2" d="m467.9 917.5h20.7v151.8h-20.7z" />
                                 <path id="Motor2_3" class="s2" d="m467.8 1049.6v11h-166.8v-11z" />
                                 <path id="Motor2_3" class="s2" d="m467.8 1028.9v11h-166.8v-11z" />
                                 <path id="Motor2_3" class="s2" d="m467.8 1008.2v11h-166.8v-11z" />
                                 <path id="Motor2_3" class="s2" d="m467.8 988.9v11h-166.8v-11z" />
                                 <path id="Motor2_3" class="s2" d="m467.8 968.2v11h-166.8v-11z" />
                                 <path id="Motor2_3" class="s2" d="m467.8 947.5v11h-166.8v-11z" />
                                 <path id="Motor2_3" class="s2" d="m467.8 927.1v11.1h-166.8v-11.1z" />
                                 <path id="Motor2_3" class="s2" d="m276.2 917.5h24.7v151.8h-24.7z" />
                                 <path id="Motor2_3" class="s2" d="m288.5 995.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" />
                                 <path id="Motor2_3" class="s2" d="m288.5 950.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                                 <path id="Motor2_3" class="s2" d="m288.5 1039.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                              </g>
                              <g id="exaustorSolo">
                                 <path id="Forma 2" fill-rule="evenodd" class="s0" d="m729 1012l-3-87 229-24 3 86z" />
                              </g>
                           </g>
                           <g id="grupoExaustorTopo">
                              <g id="exaustorTopo">
                                 <g id="exaustor">
                                    <path id="exaustor_6" class="s0" d="m991 510v180h-335v-180z" />
                                    <path id="exaustor_3" class="s0" d="m964 800l27-109h-334l24 110z" />
                                    <path id="exaustor_7" class="s0" d="m677 387h293c11.6 0 21 9.4 21 21v102h-335v-102c0-11.6 9.4-21 21-21zm5 414h281l-8.2 98.9 3.5 88.9-228.7 23.7-3.5-88.6z" />
                                    <path id="exaustor_8" class="s0" d="m726.5 925.6l-0.5-5 229-24.2 0.5 5z" />
                                    <path id="exaustor_4" class="s0" d="m954 386v-27h50.1v-31h-10.1l-20.5-20.5h-301.5l-86 32.5h86.1l14.9 31h10l4 16z" />
                                 </g>
                              </g>
                              <g id="Motor3" v-show="false">
                                 <path id="Motor3_3" class="s2" d="m226.7 357.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" />
                                 <path id="Motor3_3" class="s2" d="m179.5 404.2h8.3v55.2h-8.3z" />
                                 <path id="Motor3_3" class="s2" d="m270.6 509.1h42.8v9.7h-42.8z" />
                                 <path id="Motor3_3" class="s2" d="m382.4 509.4h42.8v9.6h-42.8z" />
                                 <path id="Motor3_3" class="s2" d="m476.1 422.3h31.7v23.5h-31.7z" />
                                 <path id="Motor3_3" class="s2" d="m431.9 357.5h20.7v151.8h-20.7z" />
                                 <path id="Motor3_3" class="s2" d="m431.8 489.6v11h-166.8v-11z" />
                                 <path id="Motor3_3" class="s2" d="m431.8 468.9v11h-166.8v-11z" />
                                 <path id="Motor3_3" class="s2" d="m431.8 448.2v11h-166.8v-11z" />
                                 <path id="Motor3_3" class="s2" d="m431.8 428.9v11h-166.8v-11z" />
                                 <path id="Motor3_3" class="s2" d="m431.8 408.2v11h-166.8v-11z" />
                                 <path id="Motor3_3" class="s2" d="m431.8 387.5v11h-166.8v-11z" />
                                 <path id="Motor3_3" class="s2" d="m431.8 367.1v11.1h-166.8v-11.1z" />
                                 <path id="Motor3_3" class="s2" d="m240.2 357.5h24.7v151.8h-24.7z" />
                                 <path id="Motor3_3" class="s2" d="m252.5 435.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" />
                                 <path id="Motor3_3" class="s2" d="m252.5 390.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                                 <path id="Motor3_3" class="s2" d="m252.5 479.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                              </g>
                           </g>
                        </g>
                        <g id="centroSecador ">
                           <path id="centroSecador_14" class="s3" d="m693 1055h1248v2916h-811-437z" />
                           <path id="centroSecador_15" class="s3" d="m693 1055.6h1248v162.8h-1248z" />
                           <path id="Forma 1" fill-rule="evenodd" class="s3" d="m1941 1338c0 0 232.5 53.2 236 53 3.5-0.2-236 0-236 0-0.1-1.4 0-53 0-53z" />
                           <path id="centroSecador_15" fill-rule="evenodd" class="s3" d="m693 1391h1486v164h-1486z" />
                           <path id="centroSecador_15" fill-rule="evenodd" class="s3" d="m693 1727h1248v162h-1248z" />
                           <path id="centroSecador_15" fill-rule="evenodd" class="s3" d="m693 2061h1248v162h-1248z" />
                           <path id="centroSecador_22" class="s0" d="m693 3972h295v451h-295z" />
                           <path id="centroSecador_22" fill-rule="evenodd" class="s0" d="m1645 3971h296v446h-296z" />
                           <path id="centroSecador_22 copiar" fill-rule="evenodd" class="s0" d="m1941 3971h239v446h-239z" />
                           <path id="centroSecador_15" fill-rule="evenodd" class="s3" d="m693 2393h1248v163h-1248z" />
                           <path id="centroSecador_15" fill-rule="evenodd" class="s3" d="m693 2726h1248v162h-1248z" />
                           <path id="centroSecador_15" fill-rule="evenodd" class="s3" d="m693 3058h1248v165h-1248z" />
                           <path id="centroSecador_15" fill-rule="evenodd" class="s3" d="m693 3393h1248v156h-1248z" />
                           <path id="centroSecador_15" fill-rule="evenodd" class="s3" d="m693 3719h1248v176h-1248z" />
                           <g id="funilCentro">
                              <path id="funilCentro_2" class="s3" d="m1129.5 3971l0.5 106 154 107.7v14.3l10.2 10.2v36.8h44.8v-36.6l11.3-11.2v-13.5l151.7-109v-104.7z" />
                              <path id="funilCentro_4" class="s0" d="m1350 4184.1v13.8h-66v-13.8z" />
                              <path id="funilCentro_5" class="s3" d="m1503 4034v30h-373v-30z" />
                              <path id="funilCentro_5" class="s3" d="m1503 3971v30h-373v-30z" />
                           </g>
                           <path id="centroSecador_23" class="s0" d="m1105 3971h25v452h-25z" />
                           <path id="centroSecador_23" class="s0" d="m1502 3971h25v452h-25z" />
                           <path id="centroSecador_21" fill-rule="evenodd" class="s0" d="m619 4417h1561v37h-1561z" />
                           <path id="centroSecador_16" class="s3" d="m693 1028h1247v27h-1247z" />
                           <path id="centroSecador_2" class="s3" d="m1927 1028v-17l-438-42h-344l-437 45v14z" />
                           <path id="centroSecador_17" class="s3" d="m1140 562h354v405.7h-354z" />
                           <path id="centroSecador_2" class="s3" d="m1502 565l-371.2-0.6 185.9-178.4z" />
                           <path id="centroSecador_18" class="s3" d="m1265 227h108v338h-108z" />
                           <path id="centroSecador_3" class="s0" d="m1386 158l31-31-65-60-6 55z" />
                           <path id="centroSecador_19" class="s3" d="m1277 128h81v99h-81z" />
                           <path id="centroSecador_20" class="s3" d="m1282 67h71v61h-71z" />
                           <g id="centroSecadorExtra">
                              <path id="Retângulo 1" fill-rule="evenodd" class="s3" d="m1941 1391h239v2580h-239z" />
                              <path id="Retângulo 2" fill-rule="evenodd" class="s3" d="m1941 1555h239v172h-239z" />
                              <path id="Retângulo 2 copiar" fill-rule="evenodd" class="s3" d="m1941 1889h239v172h-239z" />
                              <path id="Retângulo 2 copiar 2" fill-rule="evenodd" class="s3" d="m1941 2223h239v170h-239z" />
                              <path id="Retângulo 2 copiar 3" fill-rule="evenodd" class="s3" d="m1941 2556h239v170h-239z" />
                              <path id="Retângulo 2 copiar 4" fill-rule="evenodd" class="s3" d="m1941 2888h239v170h-239z" />
                              <path id="Retângulo 2 copiar 5" fill-rule="evenodd" class="s3" d="m1941 3223h239v170h-239z" />
                              <path id="Retângulo 2 copiar 6" fill-rule="evenodd" class="s3" d="m1941 3549h239v170h-239z" />
                              <path id="Retângulo 2 copiar 7" fill-rule="evenodd" class="s3" d="m1941 3895h239v76h-239z" />
                           </g>
                        </g>
                        <g id="centroArmazem">
                           <path id="centroArmazem_23" class="s3" d="m1493 564v3407h-354v-3407z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 2393.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 2770.2h356v63.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 3149.7h356v62.6h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 3526.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 3777.2h356v63.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 631.7h356v62.6h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 883.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 1134.2h356v63.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 1386.7h356v62.6h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 1638.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 1889.2h356v63.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 2141.7h356v62.6h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 2519.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 2896.2h356v63.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 3274.7h356v62.6h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 3651.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 3903.2h356v67.8h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 757.7h356v62.6h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 1008.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 1260.2h356v63.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 1512.7h356v62.6h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 1763.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 2015.2h356v63.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 2267.7h356v62.6h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 2644.1h356v62.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 3023.2h356v63.5h-356z" />
                           <path id="centroArmazem_21" class="s3" d="m1138 3400.7h356v62.6h-356z" />
                           <path id="centroArmazem_22" class="s3" d="m1492.9 564.9h9.3v3406.1h-9.3z" />
                           <path id="centroArmazem_22" class="s3" d="m1129.9 564.9h9.3v3406.1h-9.3z" />
                        </g>
                        <g id="Nivel" class="mouse">
                           <path class="s4" d="m1318 880c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <text id="N" style="transform: matrix(1, 0, 0, 1, 1316.327, 837.8)">
                              <tspan x="-45.6" y="0" class="t5" style="font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode'">N</tspan>
                           </text>
                        </g>
                        <g id="IconePre4" v-show="filtroGrafico == 'pressao'">
                           <path id="IconePre4_0" fill-rule="evenodd" :class="corP5" d="m903 1650c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <use id="img1" href="#img1" transform="matrix(1.381,0,0,1.381,858.764,1509)" />
                        </g>
                        <g id="IconePre5" v-show="filtroGrafico == 'pressao'">
                           <path id="IconePre5_0" fill-rule="evenodd" :class="corP5" d="m903.5 3643.7c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <use id="img1" href="#img1" transform="matrix(1.375,0,0,1.377,859,3503)" />
                        </g>
                        <g id="IconePre3" v-show="filtroGrafico == 'pressao'">
                           <path id="IconePre3_0" fill-rule="evenodd" :class="corP3" d="m1724 2390.7c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <use id="img1" href="#img1" transform="matrix(1.375,0,0,1.377,1680,2250)" />
                        </g>
                        <g id="IconePre2" v-show="filtroGrafico == 'pressao'">
                           <path id="IconePre2_0" fill-rule="evenodd" :class="corP2" d="m1941 3644c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <use id="img1" href="#img1" transform="matrix(1.381,0,0,1.381,1896.764,3503)" />
                        </g>
                        <g id="IconePre1" v-show="filtroGrafico == 'pressao'">
                           <path id="IconePre1_0" fill-rule="evenodd" :class="corP1" d="m3650.5 4094.5c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <use id="img1" href="#img1" transform="matrix(1.375,0,0,1.377,3606,3954)" />
                        </g>
                        <g id="IconeSensorTemp2" v-show="filtroGrafico == 'temperatura'">
                           <path id="IconeSensorTemp2" :class="corS2" d="m1312 3643c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <use id="img2" href="#img2" transform="matrix(1.536,0,0,1.536,1284.353,3493.758)" />
                        </g>
                        <g id="IconeSensorTemp1" v-show="filtroGrafico == 'temperatura'">
                           <path id="IconeSensorTemp1" :class="corS1" d="m1723 2093c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <use id="img2" href="#img2" transform="matrix(1.536,0,0,1.536,1695.353,1943.758)" />
                        </g>
                        <g id="IconeSensorTemp3" v-show="filtroGrafico == 'temperatura'">
                           <path id="IconeSensorTemp3" :class="corS3" d="m903 1390c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <use id="img2" href="#img2" transform="matrix(1.536,0,0,1.536,875.353,1240.758)" />
                        </g>
                        <g id="Motor5">
                           <path id="Motor5_3" class="s2" d="m1185.7 4522.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" />
                           <path id="Motor5_3" class="s2" d="m1138.5 4569.2h8.3v55.2h-8.3z" />
                           <path id="Motor5_3" class="s2" d="m1229.6 4674.1h42.8v9.7h-42.8z" />
                           <path id="Motor5_3" class="s2" d="m1341.4 4674.4h42.8v9.6h-42.8z" />
                           <path id="Motor5_3" class="s2" d="m1435.1 4587.3h31.7v23.5h-31.7z" />
                           <path id="Motor5_3" class="s2" d="m1390.9 4522.5h20.7v151.8h-20.7z" />
                           <path id="Motor5_3" class="s2" d="m1390.8 4654.6v11h-166.8v-11z" />
                           <path id="Motor5_3" class="s2" d="m1390.8 4633.9v11h-166.8v-11z" />
                           <path id="Motor5_3" class="s2" d="m1390.8 4613.2v11h-166.8v-11z" />
                           <path id="Motor5_3" class="s2" d="m1390.8 4593.9v11h-166.8v-11z" />
                           <path id="Motor5_3" class="s2" d="m1390.8 4573.2v11h-166.8v-11z" />
                           <path id="Motor5_3" class="s2" d="m1390.8 4552.5v11h-166.8v-11z" />
                           <path id="Motor5_3" class="s2" d="m1390.8 4532.1v11.1h-166.8v-11.1z" />
                           <path id="Motor5_3" class="s2" d="m1199.2 4522.5h24.7v151.8h-24.7z" />
                           <path id="Motor5_3" class="s2" d="m1211.5 4600.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" />
                           <path id="Motor5_3" class="s2" d="m1211.5 4555.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                           <path id="Motor5_3" class="s2" d="m1211.5 4644.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                        </g>
                        <g id="Motor4">
                           <path id="Motor4_3" class="s2" d="m1200.7 3708.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" />
                           <path id="Motor4_3" class="s2" d="m1153.5 3755.2h8.3v55.2h-8.3z" />
                           <path id="Motor4_3" class="s2" d="m1244.6 3860.1h42.8v9.7h-42.8z" />
                           <path id="Motor4_3" class="s2" d="m1356.4 3860.4h42.8v9.6h-42.8z" />
                           <path id="Motor4_3" class="s2" d="m1450.1 3773.3h31.7v23.5h-31.7z" />
                           <path id="Motor4_3" class="s2" d="m1405.9 3708.5h20.7v151.8h-20.7z" />
                           <path id="Motor4_3" class="s2" d="m1405.8 3840.6v11h-166.8v-11z" />
                           <path id="Motor4_3" class="s2" d="m1405.8 3819.9v11h-166.8v-11z" />
                           <path id="Motor4_3" class="s2" d="m1405.8 3799.2v11h-166.8v-11z" />
                           <path id="Motor4_3" class="s2" d="m1405.8 3779.9v11h-166.8v-11z" />
                           <path id="Motor4_3" class="s2" d="m1405.8 3759.2v11h-166.8v-11z" />
                           <path id="Motor4_3" class="s2" d="m1405.8 3738.5v11h-166.8v-11z" />
                           <path id="Motor4_3" class="s2" d="m1405.8 3718.1v11.1h-166.8v-11.1z" />
                           <path id="Motor4_3" class="s2" d="m1214.2 3708.5h24.7v151.8h-24.7z" />
                           <path id="Motor4_3" class="s2" d="m1226.5 3786.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" />
                           <path id="Motor4_3" class="s2" d="m1226.5 3741.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                           <path id="Motor4_3" class="s2" d="m1226.5 3830.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                        </g>
                        <g id="Motor1">
                           <path id="Motor1_3" class="s2" d="m1534.7 127.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" />
                           <path id="Motor1_3" class="s2" d="m1487.5 174.2h8.3v55.2h-8.3z" />
                           <path id="Motor1_3" class="s2" d="m1578.6 279.1h42.8v9.7h-42.8z" />
                           <path id="Motor1_3" class="s2" d="m1690.4 279.4h42.8v9.6h-42.8z" />
                           <path id="Motor1_3" class="s2" d="m1784.1 192.3h31.7v23.5h-31.7z" />
                           <path id="Motor1_3" class="s2" d="m1739.9 127.5h20.7v151.8h-20.7z" />
                           <path id="Motor1_3" class="s2" d="m1739.8 259.6v11h-166.8v-11z" />
                           <path id="Motor1_3" class="s2" d="m1739.8 238.9v11h-166.8v-11z" />
                           <path id="Motor1_3" class="s2" d="m1739.8 218.2v11h-166.8v-11z" />
                           <path id="Motor1_3" class="s2" d="m1739.8 198.9v11h-166.8v-11z" />
                           <path id="Motor1_3" class="s2" d="m1739.8 178.2v11h-166.8v-11z" />
                           <path id="Motor1_3" class="s2" d="m1739.8 157.5v11h-166.8v-11z" />
                           <path id="Motor1_3" class="s2" d="m1739.8 137.1v11.1h-166.8v-11.1z" />
                           <path id="Motor1_3" class="s2" d="m1548.2 127.5h24.7v151.8h-24.7z" />
                           <path id="Motor1_3" class="s2" d="m1560.5 205.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" />
                           <path id="Motor1_3" class="s2" d="m1560.5 160.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                           <path id="Motor1_3" class="s2" d="m1560.5 249.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                        </g>
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
                        <g id="Umidade1" v-show="filtroGrafico == 'umidade'">
                           <path id="FundoUmidade1" class="s9" d="m1512 506c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <path id="gota1" class="s10" d="m1501.5 373.7c7.5 0 36.1 46.6 36.1 66.9 0 20.2-16.5 36.8-36.8 36.8-20.4 0-36.8-16.6-36.8-36.8 0-20.3 30-66.9 37.5-66.9z" />
                           <text id="              " style="transform: matrix(1, 0, 0, 1, 1968.146, 4656.333)">
                              <tspan x="-271.5" y="0" class="t5"></tspan>
                           </text>
                           <path id="gota1" class="s10" d="m1547.5 363c3.7 0 18 23.2 18 33.4 0 10.2-8.3 18.4-18.4 18.4-10.2 0-18.4-8.2-18.4-18.4 0-10.2 15-33.4 18.8-33.4z" />
                        </g>
                        <g id="Umidade2" v-show="filtroGrafico == 'umidade'">
                           <path id="FundoUmidade1 copy" class="s9" d="m1510 4227c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <path id="gota1 copy" class="s10" d="m1499.5 4094.7c7.5 0 36.1 46.6 36.1 66.9 0 20.2-16.5 36.8-36.8 36.8-20.4 0-36.8-16.6-36.8-36.8 0-20.3 30-66.9 37.5-66.9z" />
                           <text id="               copy" style="transform: matrix(1, 0, 0, 1, 1966.146, 8377.333)">
                              <tspan x="-271.5" y="0" class="t5"></tspan>
                           </text>
                           <path id="gota1 copy 2" class="s10" d="m1545.5 4084c3.7 0 18 23.2 18 33.4 0 10.2-8.3 18.4-18.4 18.4-10.2 0-18.4-8.2-18.4-18.4 0-10.2 15-33.4 18.8-33.4z" />
                        </g>
                     </g>
                  </svg>
               </b-col>
               <b-col lg="7" ref="abasContainer" class="mt-2 mt-lg-0 fundo">
                  <b-button class="pull-right" :class="{ 'mt-3': fullscreen }" variant="light" v-if="!fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen" title="Tela cheia"></b-icon></b-button>
                  <b-button class="pull-right" :class="{ 'mt-3': fullscreen }" variant="light" v-if="fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen-exit" title="Tela normal"></b-icon></b-button>
                  <b-tabs class="nav-customizado" :class="{ 'mt-3': fullscreen }">
                     <b-tab @click="alterarTipoGrafico('temperatura')">
                        <template #title>
                           <div><b-icon icon="thermometer-half"></b-icon><span>Temperaturas</span></div>
                        </template>
                        <h1>Análise das temperaturas</h1>
                        <hr class="m-1" />
                        <secador-online-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-online-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('pressao')">
                        <template #title>
                           <div><b-icon icon="speedometer"></b-icon><span>Pressões</span></div>
                        </template>
                        <h1>Análise das depressões</h1>
                        <hr class="m-1" />
                        <secador-online-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-online-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('umidade')">
                        <template #title>
                           <div><b-icon icon="droplet"></b-icon><span>Secagem</span></div>
                        </template>
                        <h1>Análise da secagem</h1>
                        <hr class="m-1" />
                        <secador-online-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-online-grafico>
                     </b-tab>

                     <b-tab @click="alterarTipoGrafico('parametro')">
                        <template #title>
                           <div><b-icon icon="gear"></b-icon><span>Parâmetros</span></div>
                        </template>
                        <h1>Parâmetros da secagem</h1>
                        <hr class="m-1" />
                        <secador-online-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-online-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('acionamento')">
                        <template #title>
                           <div><b-icon icon="circle-half"></b-icon><span>Acionamentos</span></div>
                        </template>
                        <h1>Análise dos acionamentos</h1>
                        <hr class="m-1" />
                        <secador-online-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-online-grafico>
                     </b-tab>
                  </b-tabs>
               </b-col>
            </b-row>
         </b-overlay>
         <b-popover target="Nivel" triggers="hover" placement="top">
            <div v-if="dadoSecador?.NPN != 0">
               <b-row>
                  <b-col>
                     <p class="text-center mb-0">Níveis máximos</p>
                  </b-col>
               </b-row>
               <b-row class="justify-content-center">
                  <b-col cols="3" class="p-0">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 4), grey: !verificarBitNaPosicao(this.dadoSecador.N, 4) }"></div>
                  </b-col>
                  <b-col cols="3" class="p-0" v-if="this.dadoSecador.NPN == 3 || this.dadoSecador.NPN == 2 || this.dadoSecador.NPN == 1">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 5), grey: !verificarBitNaPosicao(this.dadoSecador.N, 5) }"></div>
                  </b-col>
                  <b-col cols="3" class="p-0" v-if="this.dadoSecador.NPN == 3 || this.dadoSecador.NPN == 2">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 6), grey: !verificarBitNaPosicao(this.dadoSecador.N, 6) }"></div>
                  </b-col>
                  <b-col cols="3" class="p-0" v-if="this.dadoSecador.NPN == 3">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 7), grey: !verificarBitNaPosicao(this.dadoSecador.N, 7) }"></div>
                  </b-col>
               </b-row>
               <b-row>
                  <b-col>
                     <p class="text-center mt-2 mb-0">Níveis mínimos</p>
                  </b-col>
               </b-row>
               <b-row class="justify-content-center">
                  <b-col cols="3" class="p-0">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 0), grey: !verificarBitNaPosicao(this.dadoSecador.N, 0) }"></div>
                  </b-col>
                  <b-col cols="3" class="p-0" v-if="this.dadoSecador.NPN == 3 || this.dadoSecador.NPN == 2 || this.dadoSecador.NPN == 1">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 1), grey: !verificarBitNaPosicao(this.dadoSecador.N, 1) }"></div>
                  </b-col>
                  <b-col cols="3" class="p-0" v-if="this.dadoSecador.NPN == 3 || this.dadoSecador.NPN == 2">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 2), grey: !verificarBitNaPosicao(this.dadoSecador.N, 2) }"></div>
                  </b-col>
                  <b-col cols="3" class="p-0" v-if="this.dadoSecador.NPN == 3">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 3), grey: !verificarBitNaPosicao(this.dadoSecador.N, 3) }"></div>
                  </b-col>
               </b-row>
            </div>
            <div v-if="dadoSecador?.NPN == 0">
               <b-row class="justify-content-center">
                  <b-col>
                     <p class="text-center mb-0">Nível máximo</p>
                  </b-col>
               </b-row>
               <b-row class="justify-content-center">
                  <b-col cols="3" class="p-0">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 1), grey: !verificarBitNaPosicao(this.dadoSecador.N, 1) }"></div>
                  </b-col>
               </b-row>
               <b-row class="justify-content-center">
                  <b-col>
                     <p class="text-center mb-0">Nível mínimo</p>
                  </b-col>
               </b-row>
               <b-row class="justify-content-center">
                  <b-col cols="3" class="p-0">
                     <div class="circulo" :class="{ green: verificarBitNaPosicao(this.dadoSecador.N, 0), grey: !verificarBitNaPosicao(this.dadoSecador.N, 0) }"></div>
                  </b-col>
               </b-row>
            </div>
         </b-popover>
      </div>
      <b-popover target="IconeSensorTemp1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">S1</div></template>
         <b-row>
            <b-col class="text-center text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.T1 || '-' }} °C</p>
               <p v-if="!this.isDataExpirada() && dadoSecador.hasOwnProperty('T4')" class="mb-0 valor"><b>S1.1:</b> {{ dadoSecador?.T4 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.T1 && (!dadoSecador?.TA1 || !dadoSecador?.TB1)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="IconeSensorTemp2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">S2</div></template>
         <b-row>
            <b-col class="text-center text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.T2 || '-' }} °C</p>
               <p v-if="!this.isDataExpirada() && dadoSecador.hasOwnProperty('T5')" class="mb-0 valor"><b>S2.1:</b> {{ dadoSecador?.T5 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.T2 && (!dadoSecador?.TA2 || !dadoSecador?.TB2)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="IconeSensorTemp3" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">S3</div></template>
         <b-row>
            <b-col class="text-center text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.T3 || '-' }} °C</p>
               <p v-if="!this.isDataExpirada() && dadoSecador.hasOwnProperty('T6')" class="mb-0 valor"><b>S3.1:</b> {{ dadoSecador?.T6 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.T3 && (!dadoSecador?.TA3 || !dadoSecador?.TB3)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="IconePre1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P1</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.P1 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P1 && (!dadoSecador?.PA1 || !dadoSecador?.PB1)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="IconePre2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P2</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.P2 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P2 && (!dadoSecador?.PA2 || !dadoSecador?.PB2)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="IconePre3" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P3</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.P3 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P3 && (!dadoSecador?.PA3 || !dadoSecador?.PB3)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="IconePre4" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P4</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.P4 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P4 && (!dadoSecador?.PA4 || !dadoSecador?.PB4)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="IconePre5" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P5</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.P5 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P5 && (!dadoSecador?.PA5 || !dadoSecador?.PB5)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="Umidade1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">U1</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.UE || '-' }} %</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="Umidade2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">U2</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.US || '-' }} %</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="Motor1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Elevador de Carga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 2) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="Motor2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Exaustores</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 1) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="Motor7" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Exaustores</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 1) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="Motor4" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Descarga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 0) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover target="Motor5" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Transportador de Descarga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 3) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
   </div>
</template>

<script>
import client from '@/api'
import SecadorOnlineGrafico from '../components/SecadorOnlineGrafico.vue'
import sojaSVG from '@/assets/images/inicio/soja.svg'
import milhoSVG from '@/assets/images/inicio/milho.svg'
import trigoSVG from '@/assets/images/inicio/trigo.svg'
import arrozSVG from '@/assets/images/inicio/arroz.svg'
import sorgoSVG from '@/assets/images/inicio/sorgo.svg'

export default {
   name: 'SecadorOnlineDados',
   props: {
      tempoAtualizacao: Number
   },
   components: {
      SecadorOnlineGrafico
   },
   data() {
      return {
         dataGraficoInicial: this.$moment().format('YYYY-MM-DD'),
         dataGraficoFinal: this.$moment().format('YYYY-MM-DD'),
         filtroGrafico: 'temperatura',
         fullscreen: false,
         active: false,
         isWideScreen: window.innerWidth > 999,
         novaInformacao: 'temperatura',
         dadoSecador: [],
         buscandoDados: false,
         buscandoEquipamento: false,
         equipamento: {},
         idSecador: null,
         stringBinario: null,
         intervalId: null
      }
   },

   methods: {
      alterarTipoGrafico(filtroGrafico) {
         this.filtroGrafico = filtroGrafico
      },
      async buscarDados() {
         if (!this.idSecador) {
            return
         }
         this.buscandoDados = true
         const dados = await client.get(`/secador/buscardado/${this.idSecador}`).catch((err) => {
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
            let motor1 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 2)
            let motor2 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 1)
            let motor4 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 0)
            let motor5 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 3)
            let motor7 = this.isDataExpirada() ? 0 : +this.verificarBitNaPosicao(this.dadoSecador.AC1, 1)
            this.atualizarCorMotor('Motor1', motor1)
            this.atualizarCorMotor('Motor2', motor2)
            this.atualizarCorMotor('Motor4', motor4)
            this.atualizarCorMotor('Motor5', motor5)
            this.atualizarCorMotor('Motor7', motor7)
         }
      },
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
      verificarBitNaPosicao(binario, posicao) {
         if (!binario) return
         const posicaoInvertida = binario.length - 1 - posicao
         return binario.charAt(posicaoInvertida) === '1'
      },
      verificarNivelPosicao(binario, posicao) {
         if (!binario) return
         return binario.charAt(posicao) === '1'
      },
      formatarProduto(value) {
         const produto = {
            1: { nome: 'Soja', svg: sojaSVG },
            2: { nome: 'Milho', svg: milhoSVG },
            3: { nome: 'Trigo', svg: trigoSVG },
            // 4: { nome: 'Cevada', svg: cevadaSVG },
            4: { nome: 'Arroz', svg: arrozSVG },
            5: { nome: 'Semente', svg: sorgoSVG },
            6: { nome: 'Outro', svg: sorgoSVG }
         }
         return produto[value] || { nome: '-', svg: sojaSVG }
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
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarDados()
            this.alterarTipoGrafico(this.filtroGrafico)
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
      },
      formatarData(value) {
         if (!value) return ' - '
         return this.$moment(value, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
      },
      calculaCor(dado, maximo, minimo) {
         if (this.isDataExpirada() || !maximo || !minimo) {
            return 'gray'
         }
         if (dado > maximo) {
            return 'red'
         } else if (dado < minimo) {
            return 'blue'
         } else {
            return 'green'
         }
      },
      formatarOperacao(value) {
         const status = {
            1: { nome: 'Carga', icone: 'arrow-up-square' },
            2: { nome: 'Secagem', icone: 'arrow-right-square' },
            3: { nome: 'Descarga', icone: 'arrow-down-square' },
            4: { nome: 'Desligado', icone: 'dash-square' },
            5: { nome: 'Carga', icone: 'arrow-up-square' },
            6: { nome: 'Carregado', icone: 'check-square' }
         }
         return status[value]
      },
      formatarFluxo(value) {
         const status = {
            0: { nome: 'Contínuo', icone: 'arrow-down' },
            1: { nome: 'Rodízio', icone: 'arrow-repeat' }
         }
         return status[value]
      },
      toggleMenu() {
         this.active = !this.active
      },
      handleResize() {
         this.isWideScreen = window.innerWidth > 999
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
      isDataExpirada() {
         if (!this.dadoSecador || !this.dadoSecador.DAT || this.equipamento?.st_operacao === 'OF') {
            return true
         }
         const dataDados = this.$moment(this.dadoSecador.DAT, 'YYYY-MM-DD HH:mm:ss')
         const dataAtual = this.$moment()
         const diferencaHoras = dataAtual.diff(dataDados, 'hours')
         return diferencaHoras > 1
      },
      atualizarCorMotor(id, status) {
         const motor = document.getElementById(id)
         if (!motor) return
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
      // this.startInterval()
      const idSecadorLocalStorage = localStorage.getItem('sec')

      if (idSecadorLocalStorage && idSecadorLocalStorage != 'undefined') {
         this.idSecador = idSecadorLocalStorage
      } else {
         this.idSecador = this.$route.params.idSecador
         localStorage.setItem('sec', this.idSecador)
      }
      this.buscarDados()
      this.buscarEquipamento()
      window.scrollTo(0, 0)
   },

   computed: {
      chavesTemperatura() {
         return Object.keys(this.dadoSecador)
            .filter((chave) => chave.startsWith('T') && chave !== 'TEX' && !chave.startsWith('TA') && !chave.startsWith('TB'))
            .map((chave) => 's' + chave.slice(1).toLowerCase())
      },
      chavesPressao() {
         return Object.keys(this.dadoSecador)
            .filter((chave) => chave.startsWith('P') && !chave.startsWith('PA') && !chave.startsWith('PB'))
            .map((chave) => chave.toLowerCase())
      },
      corS1() {
         return this.calculaCor(this.dadoSecador.T1, this.dadoSecador.TA1, this.dadoSecador.TB1)
      },
      corS2() {
         return this.calculaCor(this.dadoSecador.T2, this.dadoSecador.TA2, this.dadoSecador.TB2)
      },
      corS3() {
         return this.calculaCor(this.dadoSecador.T3, this.dadoSecador.TA3, this.dadoSecador.TB3)
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
      nivelMinimo() {
         return this.dadoSecador?.N?.substring(8 - 4).includes('1') || false
      },
      nivelMaximo() {
         return this.dadoSecador?.N?.substring(0, 4).includes('1') || false
      }
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
::-webkit-scrollbar {
   height: 8px;
   background: none;
}

::-webkit-scrollbar-thumb:horizontal {
   background: #a7a7a7;
   border-radius: 10px;
}

.status {
   font-size: 18px;
   font-weight: 300;
}

.circulo {
   width: 25px;
   height: 25px;
   border-radius: 50%;
   margin: 10px;
}

.grey {
   background-color: grey;
}

.green {
   background-color: green;
}

.overlay {
   z-index: 0;
}

.mouse {
   cursor: pointer;
}

.valor {
   font-size: 16px;
   font-weight: 400;
}

.margem {
   margin: -21px;
}

.fundo {
   background: #fff;
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
   fill: #878787;
   stroke: #000000;
   stroke-miterlimit: 100;
}
.s3 {
   fill: #b4b4b4;
   stroke: #000000;
   stroke-miterlimit: 100;
   stroke-width: 2;
}
.s4 {
   fill: #878787;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.t5 {
   font-size: 122px;
   fill: #ffffff;
   font-weight: 400;
   font-family: 'DejaVuSans', 'DejaVu Sans';
}
.s6 {
   fill: #0000ff;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.s7 {
   fill: #ff0000;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.s8 {
   fill: #000000;
   stroke: #000000;
}
.s9 {
   fill: #007c00;
   stroke: #000000;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.s10 {
   fill: #ffffff;
}

.green {
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
</style>
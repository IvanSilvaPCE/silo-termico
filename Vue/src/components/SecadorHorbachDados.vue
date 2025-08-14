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
                     <b-icon :icon="formatarOperacao(dadoSecador.MOP).icone" scale="1.5" class="mr-2"></b-icon>
                     <span>{{ formatarOperacao(dadoSecador.MOP).nome }}</span>
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
               <b-col lg="5" class="text-center align-self-center">
                  <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3739 4120" style="width: 100%; height: auto; max-width: 100%">
                     <defs>
                        <image
                           width="36"
                           height="83"
                           id="img1"
                           href="data:image/png;base64,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"
                        />
                        <image
                           width="64"
                           height="77"
                           id="img2"
                           href="data:image/png;base64,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"
                        />
                     </defs>

                     <g id="Secador">
                        <g id="Umidade1" v-show="filtroGrafico == 'secagem'">
                           <path id="FundoUmidade1" class="s0" :class="{ fundoUmidades: !this.isDataExpirada() && dadoSecador.MOP == 2, s1: this.isDataExpirada() }" d="m2312 406c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <path id="gota1" class="s1 gotasUmidade" d="m2302 271.2c7.4 0 35.6 45.9 35.6 65.9 0 20-16.3 36.3-36.3 36.3-20.1 0-36.3-16.3-36.3-36.3 0-20 29.6-65.9 37-65.9z" />
                           <path id="gota1" class="s1 gotasUmidade" d="m2348.9 264c3.7 0 17.8 22.9 17.8 32.9 0 10.1-8.2 18.2-18.2 18.2-10 0-18.1-8.1-18.1-18.2 0-10 14.8-32.9 18.5-32.9z" />
                        </g>
                        <g id="Umidade2" v-show="filtroGrafico == 'secagem'">
                           <path id="FundoUmidade2" class="s0" :class="{ fundoUmidades: !this.isDataExpirada() && dadoSecador.MOP == 2, s1: this.isDataExpirada() }" d="m2302 3741c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                           <path id="gota2" class="s1 gotasUmidade" d="m2292 3606.2c7.4 0 35.6 45.9 35.6 65.9 0 20-16.3 36.3-36.3 36.3-20.1 0-36.3-16.3-36.3-36.3 0-20 29.6-65.9 37-65.9z" />
                           <path id="gota2" class="s1 gotasUmidade" d="m2338.9 3599c3.7 0 17.8 22.9 17.8 32.9 0 10.1-8.2 18.2-18.2 18.2-10 0-18.1-8.1-18.1-18.2 0-10 14.8-32.9 18.5-32.9z" />
                        </g>
                        <g id="Corpo">
                           <path id="Corpo-Retângulo-01" class="s0" d="m1346 3034h1261v173h-1261z" />
                           <path id="Corpo-Retângulo-02" class="s0" d="m1425 693h1107v1521h-1107z" />
                        </g>
                        <g id="Fornalha">
                           <g id="ConcretoFN">
                              <path id="ConcretoFN-Forma-01" class="s1" d="m1102 2302l298-1v120h-58c0 3 0 191 0 191h58.2l-0.2 126h-58v117h58.2v122h-54.2v46h-206v12h-37v-33h-110v-344h103v-12h43v11h143v-50h-146v10h-25v6h-118v-273h109z" />
                              <path id="ConcretoFN-Retângulo-01" class="s1" d="m598 2326h395c0 0 0 7.4 0 21.1 0 184.8 0 1520.9 0 1520.9h-395z" />
                           </g>
                           <g id="IconeTemperaturaFornalha" v-show="filtroGrafico == 'temperaturas'">
                              <path id="FundoTermFornalha" :class="corT1" d="m1168 2563c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                              <use id="IconeT" href="#img1" transform="matrix(1.536,0,0,1.536,1140.353,2413.758)" />
                           </g>
                           <g id="IconePreEsquerda" v-show="filtroGrafico == 'pressões'">
                              <path id="FundoPreFornalha" :class="corP1" d="m1168 2925c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                              <use id="IconeP" href="#img2" transform="matrix(1.381,0,0,1.381,1123.764,2784)" />
                           </g>
                           <path id="Fornalha-Retângulo-01" class="s3" d="m32 3269h417c1.1 0 2 0.9 2 2v512c0 1.1-0.9 2-2 2h-417c-1.1 0-2-0.9-2-2v-512c0-1.1 0.9-2 2-2z" />
                           <path id="Fornalha-Forma-01" class="s0" d="m31 3269.5l57-22.5h296l65 22.5z" />
                           <path id="Fornalha-Retângulo-02" class="s0" d="m397 2924h201v271h-201c0 0 0-225.4 0-265.1 0-3.8 0-5.9 0-5.9z" />
                           <path id="Fornalha-Forma-02" class="s0" d="m87 3245v-48h-10v-277h301v6h19v260h-21v60z" />
                           <path id="Fornalha-Retângulo-03" class="s0" d="m159 2905h156c2.8 0 5 2.2 5 5v5c0 2.8-2.2 5-5 5h-156c-2.8 0-5-2.2-5-5v-5c0-2.8 2.2-5 5-5z" />
                           <path id="Fornalha-Triângulo-01" class="s3" d="m237 2767l48 30c0 0-23.9 0-47.9 0-24 0-48.1 0-48.1 0z" />
                           <path id="Fornalha-Retângulo-04" class="s0" d="m215 2826h44v78h-44z" />
                           <path id="Fornalha-Forma-03" class="s0" d="m215 2828v-31h44v31-31h-44z" />
                           <path id="Fornalha-Forma-04" class="s0" d="m33.2 3785l56.4 23h293.2l64.3-23z" />
                           <path id="Fornalha-Retângulo-05" class="s0" d="m89 3808h298v59h-298z" />
                           <path id="Fornalha-Forma-05" class="s0" d="" />
                        </g>
                        <g id="Motor2">
                           <path id="Motor 2-Retângulo-01" class="s1" d="m1488 3739.3h233.5c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.5c-21.5 0-39-17.5-39-39v-73.8c0-21.6 17.5-39 39-39z" />
                           <path id="Motor 2-Retângulo-02" class="s1" d="m1440.9 3786h8.3v55.2h-8.3z" />
                           <path id="Motor 2-Retângulo-03" class="s1" d="m1532 3890.9h42.8v9.7h-42.8z" />
                           <path id="Motor 2-Retângulo-04" class="s1" d="m1643.7 3891.2h42.8v9.6h-42.8z" />
                           <path id="Motor 2-Retângulo-05" class="s1" d="m1737.5 3804.1h31.7v23.5h-31.7z" />
                           <path id="Motor 2-Retângulo-07" class="s1" d="m1693.3 3739.3h20.7v151.8h-20.7z" />
                           <path id="Motor 2-Retângulo-08" class="s1" d="m1693.2 3871.4v11h-167.2v-11z" />
                           <path id="Motor 2-Retângulo-09" class="s1" d="m1693.2 3850.7v11h-167.2v-11z" />
                           <path id="Motor 2-Retângulo-10" class="s1" d="m1693.2 3830v11h-167.2v-11z" />
                           <path id="Motor 2-Retângulo-11" class="s1" d="m1693.2 3810.7v11h-167.2v-11z" />
                           <path id="Motor 2-Retângulo-12" class="s1" d="m1693.2 3790v11h-167.2v-11z" />
                           <path id="Motor 2-Retângulo-13" class="s1" d="m1693.2 3769.3v11h-167.2v-11z" />
                           <path id="Motor 2-Retângulo-14" class="s1" d="m1693.2 3748.9v11.1h-167.2v-11.1z" />
                           <path id="Motor 2-Retângulo-06" class="s1" d="m1501.6 3739.3h24.6v151.8h-24.6z" />
                           <path id="Motor 2-Elipse-01" class="s1" d="m1513.9 3861.7c-1.1 0-2.1-0.9-2.1-2 0-1.2 1-2.1 2.1-2.1 1.1 0 2.1 0.9 2.1 2.1 0 1.1-1 2-2.1 2z" />
                           <path id="Motor 2-Elipse-02" class="s1" d="m1513.9 3817.6c-1.1 0-2.1-0.9-2.1-2.1 0-1.1 1-2.1 2.1-2.1 1.1 0 2.1 1 2.1 2.1 0 1.2-1 2.1-2.1 2.1z" />
                           <path id="Motor 2-Elipse-03" class="s1" d="m1513.9 3772c-1.1 0-2.1-0.9-2.1-2 0-1.2 1-2.1 2.1-2.1 1.1 0 2.1 0.9 2.1 2.1 0 1.1-1 2-2.1 2z" />
                        </g>
                        <g id="Motor3">
                           <path id="Motor 3-Retângulo-01" class="s1" d="m1487.7 3954.5h233.4c8.8 0 16 7.1 16 16v119.8c0 8.8-7.2 16-16 16h-233.4c-21.6 0-39-17.5-39-39v-73.8c0-21.6 17.4-39 39-39z" />
                           <path id="Motor 3-Retângulo-02" class="s1" d="m1440.5 4001.2h8.3v55.2h-8.3z" />
                           <path id="Motor 3-Retângulo-03" class="s1" d="m1531.6 4106.1h42.8v9.7h-42.8z" />
                           <path id="Motor 3-Retângulo-04" class="s1" d="m1643.4 4106.4h42.8v9.6h-42.8z" />
                           <path id="Motor 3-Retângulo-05" class="s1" d="m1737.1 4019.3h31.7v23.5h-31.7z" />
                           <path id="Motor 3-Retângulo-07" class="s1" d="m1692.9 3954.5h20.7v151.8h-20.7z" />
                           <path id="Motor 3-Retângulo-08" class="s1" d="m1692.8 4086.6v11h-166.8v-11z" />
                           <path id="Motor 3-Retângulo-09" class="s1" d="m1692.8 4065.9v11h-166.8v-11z" />
                           <path id="Motor 3-Retângulo-10" class="s1" d="m1692.8 4045.2v11h-166.8v-11z" />
                           <path id="Motor 3-Retângulo-11" class="s1" d="m1692.8 4025.9v11h-166.8v-11z" />
                           <path id="Motor 3-Retângulo-12" class="s1" d="m1692.8 4005.2v11h-166.8v-11z" />
                           <path id="Motor 3-Retângulo-13" class="s1" d="m1692.8 3984.5v11h-166.8v-11z" />
                           <path id="Motor 3-Retângulo-14" class="s1" d="m1692.8 3964.1v11.1h-166.8v-11.1z" />
                           <path id="Motor 3-Retângulo-06" class="s1" d="m1501.2 3954.5h24.7v151.8h-24.7z" />
                           <path id="Motor 3-Elipse-02" class="s1" d="m1513.5 4032.8c-1.1 0-2-0.9-2-2.1 0-1.1 0.9-2.1 2-2.1 1.2 0 2.1 1 2.1 2.1 0 1.2-0.9 2.1-2.1 2.1z" />
                           <path id="Motor 3-Elipse-03" class="s1" d="m1513.5 3987.2c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                           <path id="Motor 3-Elipse-01" class="s1" d="m1513.5 4076.9c-1.1 0-2-0.9-2-2 0-1.2 0.9-2.1 2-2.1 1.2 0 2.1 0.9 2.1 2.1 0 1.1-0.9 2-2.1 2z" />
                        </g>
                        <g id="CalhaInterna">
                           <defs>
                              <pattern id="flechaMovimento" patternUnits="userSpaceOnUse" width="100" height="100">
                                 <rect width="100" height="100" fill="#878787" />
                                 <path d="M15 5 L30 25 L15 45" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                                 <animateTransform attributeType="XML" attributeName="patternTransform" type="translate" from="0,0" to="100,0" begin="0s" dur="1s" repeatCount="indefinite" />
                              </pattern>
                           </defs>

                           <path id="Calha interna-Forma-01" d="m1800 4060l123-94h931l5-15h83v70h9v-9h16v29h-26v42h-5v22h-163v-15h-851v-34z" fill="url(#flechaMovimento)" stroke="#000" stroke-width="1" />
                        </g>
                        <g id="SuspiroLateral">
                           <g id="Motor4">
                              <path id="Motor4-Retângulo-01" class="s1" d="m3680.8 3570.5h-154c-8.8 0-16 7.1-16 16v78c0 8.8 7.2 16 16 16h154c21.6 0 39-17.5 39-39v-32c0-21.6-17.4-39-39-39z" />
                              <path id="Motor4-Retângulo-02" class="s1" d="m3725.7 3604.4h-6v40h6z" />
                              <path id="Motor4-Retângulo-03" class="s1" d="m3659.7 3680.4h-31v7h31z" />
                              <path id="Motor4-Retângulo-04" class="s1" d="m3578.7 3680.6h-31v7h31z" />
                              <path id="Motor4-Retângulo-05" class="s1" d="m3510.8 3617.5h-23v17h23z" />
                              <path id="Motor4-Retângulo-06" class="s1" d="m3681.7 3570.5h-17.8v110h17.8z" />
                              <path id="Motor4-Retângulo-07" class="s1" d="m3542.8 3570.5h-15v110h15z" />
                              <path id="Motor4-Elipse-01" class="s1" d="m3672.8 3656.2c-0.8 0-1.5 0.7-1.5 1.5 0 0.8 0.7 1.5 1.5 1.5 0.8 0 1.5-0.7 1.5-1.5z" />
                              <path id="Motor4-Elipse-02" class="s1" d="m3672.8 3624.2c-0.8 0-1.5 0.7-1.5 1.5 0 0.8 0.7 1.5 1.5 1.5 0.8 0 1.5-0.7 1.5-1.5z" />
                              <path id="Motor4-Elipse-03" class="s1" d="m3672.8 3591.2c-0.8 0-1.5 0.7-1.5 1.5 0 0.8 0.7 1.5 1.5 1.5 0.8 0 1.5-0.7 1.5-1.5z" />
                              <path id="Motor4-Retângulo-08" class="s1" d="m3662.9 3666.2h-120v8h120z" />
                              <path id="Motor4-Retângulo-09" class="s1" d="m3662.9 3651.2h-120v8h120z" />
                              <path id="Motor4-Retângulo-10" class="s1" d="m3662.9 3636.2h-120v8h120z" />
                              <path id="Motor4-Retângulo-11" class="s1" d="m3662.9 3622.2h-120v8h120z" />
                              <path id="Motor4-Retângulo-12" class="s1" d="m3662.9 3607.2h-120v8h120z" />
                              <path id="Motor4-Retângulo-13" class="s1" d="m3662.9 3592.2h-120v8h120z" />
                              <path id="Motor4-Retângulo-14" class="s1" d="m3662.9 3577.5h-120v8h120z" />
                           </g>
                           <g id="Aerador">
                              <path id="Aerador-Retângulo-01" class="s1" d="m3381 3458h142v346h-142z" />
                              <path id="Aerador-Retângulo-02" class="s1" d="m3277 3479h104v260h-104z" />
                              <path id="Aerador-Forma-01" class="s1" d="m3340 3360l41 97 45-97h32l41 98 46-98v-636l-107-34h-100z" />
                              <path id="Aerador-Forma-02" class="s1" d="m3338 2690l32-117 90 9 100 112-14 31-107-35z" />
                              <path id="Aerador-Forma-03" class="s1" d="m3370 2574l56-82 75 27 81 131-22 44-101-111z" />
                              <path id="Aerador-Forma-04" class="s1" d="m3427 2492l47.4-26.5 70.6-5.3 11 12.8 62 174-36 3-82-131z" />
                              <path id="Aerador-Forma-05" class="s1" d="m3545.3 2460.2h180.3v186.8h-109.6l-60-173z" />
                           </g>
                        </g>
                        <g id="Funil">
                           <path id="Funil-Forma-01" class="s0" d="m1404 3207l471 443h210l457-443zm465 443h223c4.4 0 8 3.6 8 8v18c0 4.4-3.6 8-8 8 0 0-170.4 0-213.3 0-6.2 0-9.7 0-9.7 0-4.4 0-8-3.6-8-8v-18c0-4.4 3.6-8 8-8z" />
                           <path id="Funil-Forma-02" class="s0" d="m1910 3723l-36-39 199 1-33 39z" />
                           <path id="Funil-Retângulo-01" class="s4" d="m1911 3723h125c4.4 0 8 3.6 8 8v22c0 4.4-3.6 8-8 8h-125c-4.4 0-8-3.6-8-8v-22c0-4.4 3.6-8 8-8z" />
                           <path id="Funil-Retângulo-02" class="s4" d="m1907 3761h133c4.4 0 8 3.6 8 8v26c0 4.4-3.6 8-8 8h-133c-4.4 0-8-3.6-8-8v-26c0-4.4 3.6-8 8-8z" />
                           <path id="Funil-Retângulo-03" class="s0" d="m1914 3803h119v84c0 13.8-11.2 25-25 25h-69c-13.8 0-25-11.2-25-25z" />
                        </g>
                        <g id="SuporteFunil">
                           <path id="SuporteFunil-Forma-01" class="s1" d="m1437 3269.5l2 195.5h54l74-195.5z" />
                           <path id="SuporteFunil-Forma-02" class="s1" d="m1630.7 3269.5l140.3 195.5h33l138-195.5z" />
                           <path id="SuporteFunil-Forma-03" class="s1" d="m2002.3 3270l140.2 195.5h33l138-195.5z" />
                           <path id="SuporteFunil-Retângulo-01" class="s4" d="m1417 3252h1107v18h-1107z" />
                           <path id="SuporteFunil-Retângulo-02" class="s4" d="m1446 3466h38v256h-38z" />
                           <path id="SuporteFunil-Forma-04" class="s1" d="m2507 3269.5l-2 195.5h-54l-74-195.5z" />
                           <path id="SuporteFunil-Retângulo-03" class="s4" d="m2459 3466h38v256h-38z" />
                           <path id="SuporteFunil-Retângulo-04" class="s4" d="m1773 3466h28v254h-28z" />
                           <path id="SuporteFunil-Retângulo-05" class="s4" d="m2145 3467h28v254h-28z" />
                           <g id="IconeTemperaturaFunil" v-show="filtroGrafico == 'temperaturas'">
                              <path id="FundoTermperaturaFunil" :class="corT3" d="m1974 3492c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                              <use id="IconeT" href="#img1" fill="red" transform="matrix(1.536,0,0,1.536,1946.353,3342.758)" />
                           </g>
                        </g>
                        <g id="Centro">
                           <path id="Centro-Forma-01" class="s0" d="m1342 2245v56h58v120h-58v191h58v125l-58 1v116h58v123l-54 1v59l1573-4-3-705-297-80z" />
                           <path id="Centro-Forma-02" class="s0" d="m2916 2329l384 99 1 1202-384.9-1z" />
                           <path id="Centro-Retângulo-01" class="s3" d="m2951 3629h328v136h-328z" />
                           <path id="Centro-Polígono-01" class="s0" d="m1343 2245c-3 0.3 83-31 83-31l1104.9-2.5 89.1 34.5c0 0-1275.6-1.6-1277-1z" />
                           <g id="IconeTemperaturaCentro" v-show="filtroGrafico == 'temperaturas'">
                              <path id="FundoTermperaturaCentro" :class="corT2" d="m1979 2730c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                              <use id="IconeT" href="#img1" transform="matrix(1.536,0,0,1.536,1951.353,2580.758)" />
                           </g>

                           <g id="IconeTemperaturaCentroExaustor" v-show="filtroGrafico == 'temperaturas'">
                              <path id="FundoTermCentro" :class="corT4" d="m3107 2690c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                              <use id="IconeT" href="#img1" transform="matrix(1.536,0,0,1.536,3079.353,2540.758)" />
                           </g>
                           <g id="IconePreDireita" v-show="filtroGrafico == 'pressões'">
                              <path id="FundoPreFornalha" :class="corP2" d="m3109 2957c-47.6 0-86-38.4-86-86 0-47.6 38.4-86 86-86 47.6 0 86 38.4 86 86 0 47.6-38.4 86-86 86z" />
                              <use id="IconeP" href="#img2" transform="matrix(1.381,0,0,1.381,3064.764,2816)" />
                           </g>
                        </g>
                        <g id="ChapeuTopo">
                           <path id="ChapeuTopo-Triângulo-01" class="s3" d="m1981.5 288.8l605.1 403.4h-1210.2z" />
                           <path id="ChapeuTopo-Forma-01" class="s3" d="m1566 693l414-402-261 401z" />
                           <path id="ChapeuTopo-Forma-02" class="s3" d="m1880 693l102-403 72 402z" />
                           <path id="ChapeuTopo-Forma-03" class="s3" d="m2216 692l-232-400 355 401z" />
                           <path id="ChapeuTopo-Forma-04" class="s3" d="m2465.7 692h122l-591.2-392.2z" />
                        </g>
                        <g id="MotorTopo">
                           <g id="Aerador">
                              <path id="MotorTopo-Aerador-Retângulo-01" class="s1" d="m1941.9 169.4l68.1-67.2 169.3 171.8-68.1 67.1z" />
                              <path id="MotorTopo-Aerador-Retângulo-02" class="s1" d="m1898.9 279.1h166v62h-166z" />
                              <path id="MotorTopo-Aerador-Retângulo-03" class="s1" d="m1929.9 18.1h105v262h-105z" />
                           </g>
                           <g id="Motor">
                              <path id="MotorTopo-Motor-Retângulo-01" class="s1" d="m1638.4 46.1h232.5c8.9 0 16 7.2 16 16v119.3c0 8.9-7.1 16-16 16h-232.5c-21.5 0-39-17.4-39-39v-73.3c0-21.5 17.5-39 39-39z" />
                              <path id="MotorTopo-Motor-Retângulo-02" class="s1" d="m1591.3 92.7h8.3v55.1h-8.3z" />
                              <path id="MotorTopo-Motor-Retângulo-03" class="s1" d="m1682.1 197.3h42.7v9.6h-42.7z" />
                              <path id="MotorTopo-Motor-Retângulo-04" class="s1" d="m1793.5 197.6h42.7v9.6h-42.7z" />
                              <path id="MotorTopo-Motor-Retângulo-05" class="s1" d="m1886.9 110.8h31.7v23.4h-31.7z" />
                              <path id="MotorTopo-Motor-Retângulo-07" class="s1" d="m1842.9 46.1h20.7v151.3h-20.7z" />
                              <path id="MotorTopo-Motor-Retângulo-08" class="s1" d="m1842.8 177.8v11h-166.8v-11z" />
                              <path id="MotorTopo-Motor-Retângulo-09" class="s1" d="m1842.8 157.2v11h-166.8v-11z" />
                              <path id="MotorTopo-Motor-Retângulo-10" class="s1" d="m1842.8 136.6v11h-166.8v-11z" />
                              <path id="MotorTopo-Motor-Retângulo-11" class="s1" d="m1842.8 117.3v11h-166.8v-11z" />
                              <path id="MotorTopo-Motor-Retângulo-12" class="s1" d="m1842.8 96.7v11h-166.8v-11z" />
                              <path id="MotorTopo-Motor-Retângulo-13" class="s1" d="m1842.8 76v11h-166.8v-11z" />
                              <path id="MotorTopo-Motor-Retângulo-14" class="s1" d="m1842.8 55.7v11h-166.8v-11z" />
                              <path id="MotorTopo-Motor-Retângulo-06" class="s1" d="m1651.8 46.1h24.6v151.3h-24.6z" />
                              <path id="MotorTopo-Motor-Elipse-01" class="s1" d="m1664.1 168.2c-1.1 0-2.1-0.9-2.1-2.1 0-1.1 1-2.1 2.1-2.1 1.1 0 2.1 0.9 2.1 2.1 0 1.1-1 2-2.1 2z" />
                              <path id="MotorTopo-Motor-Elipse-02" class="s1" d="m1664.1 124.2c-1.1 0-2.1-0.9-2.1-2.1 0-1.1 1-2.1 2.1-2.1 1.1 0 2.1 0.9 2.1 2.1 0 1.2-1 2.1-2.1 2.1z" />
                              <path id="MotorTopo-Motor-Elipse-03" class="s1" d="m1664.1 78.8c-1.1 0-2.1-0.9-2.1-2.1 0-1.1 1-2 2.1-2 1.1 0 2.1 0.9 2.1 2.1 0 1.2-1 2.1-2.1 2.1z" />
                           </g>
                        </g>
                        <g id="Niveis">
                           <path id="Nivel1" class="s5" d="m1973.5 3624c-31.2 0-56.5-25.3-56.5-56.5 0-31.2 25.3-56.5 56.5-56.5 31.2 0 56.5 25.3 56.5 56.5 0 31.2-25.3 56.5-56.5 56.5z" />
                           <path id="Nivel2" class="s5" d="m1973.5 900c-31.2 0-56.5-25.3-56.5-56.5 0-31.2 25.3-56.5 56.5-56.5 31.2 0 56.5 25.3 56.5 56.5 0 31.2-25.3 56.5-56.5 56.5z" />
                           <path id="Nivel3" class="s5" d="m1973.5 609c-31.2 0-56.5-25.3-56.5-56.5 0-31.2 25.3-56.5 56.5-56.5 31.2 0 56.5 25.3 56.5 56.5 0 31.2-25.3 56.5-56.5 56.5z" />
                        </g>
                     </g>
                  </svg>
               </b-col>
               <b-col lg="7" ref="abasContainer" class="mt-4 mt-lg-0 fundo">
                  <b-button class="pull-right" :class="{ 'mt-3': fullscreen }" variant="light" v-if="!fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen" title="Tela cheia"></b-icon></b-button>
                  <b-button class="pull-right" :class="{ 'mt-3': fullscreen }" variant="light" v-if="fullscreen" @click="toggleFullScreen" style="border: 2px solid #a5a5a569"><b-icon icon="fullscreen-exit" title="Tela normal"></b-icon></b-button>
                  <b-tabs class="nav-customizado" :class="{ 'mt-3': fullscreen }">
                     <b-tab @click="alterarTipoGrafico('temperaturas')">
                        <template #title>
                           <div><b-icon icon="thermometer-half"></b-icon><span>Temperaturas</span></div>
                        </template>
                        <h1>Análise das temperaturas</h1>
                        <hr class="m-1" />
                        <secador-horbach-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-horbach-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('pressões')">
                        <template #title>
                           <div><b-icon icon="speedometer"></b-icon><span>Pressões</span></div>
                        </template>
                        <h1>Análise das depressões</h1>
                        <hr class="m-1" />
                        <secador-horbach-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-horbach-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('secagem')">
                        <template #title>
                           <div><b-icon icon="arrow-repeat"></b-icon><span>Secagem</span></div>
                        </template>
                        <h1>Análise da secagem</h1>
                        <hr class="m-1" />
                        <secador-horbach-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-horbach-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('parametros')">
                        <template #title>
                           <div><b-icon icon="gear"></b-icon><span>Parâmetros</span></div>
                        </template>
                        <h1>Parâmetros da secagem</h1>
                        <hr class="m-1" />
                        <secador-horbach-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-horbach-grafico>
                     </b-tab>
                     <b-tab @click="alterarTipoGrafico('acionamentos')">
                        <template #title>
                           <div><b-icon icon="circle-half"></b-icon><span>Acionamentos</span></div>
                        </template>
                        <h1>Análise dos acionamentos</h1>
                        <hr class="m-1" />
                        <secador-horbach-grafico :filtroGrafico="filtroGrafico" :tempoAtualizacao="tempoAtualizacao" :statusEquipamento="equipamento.st_operacao" :dataInicial="dataGraficoInicial" :dataFinal="dataGraficoFinal" @update:dataInicial="dataGraficoInicial = $event" @update:dataFinal="dataGraficoFinal = $event"></secador-horbach-grafico>
                     </b-tab>
                  </b-tabs>
               </b-col>
            </b-row>
         </b-overlay>
      </div>
      <b-popover :show="showPopoverT1" target="IconeTemperaturaFornalha" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">T1</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.T1 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.T1 && (!dadoSecador?.TA1 || !dadoSecador?.TB1)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverT2" target="IconeTemperaturaCentro" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">T2</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.T2M || '-' }} °C</p>
               <div v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN', 'ADMINFABRI', 'ADMINLOCAL', 'ADMINGERAL'])">
                  <p v-if="!this.isDataExpirada()" class="mb-0 valor"><b>T2A:</b> {{ dadoSecador?.T2A || '-' }} °C</p>
                  <p v-if="!this.isDataExpirada()" class="mb-0 valor"><b>T2B:</b> {{ dadoSecador?.T2B || '-' }} °C</p>
                  <p v-if="!this.isDataExpirada()" class="mb-0 valor"><b>T2C:</b> {{ dadoSecador?.T2C || '-' }} °C</p>
                  <p v-if="!this.isDataExpirada()" class="mb-0 valor"><b>T2D:</b> {{ dadoSecador?.T2D || '-' }} °C</p>
               </div>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.T2M && (!dadoSecador?.TA2 || !dadoSecador?.TB2)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverT3" target="IconeTemperaturaFunil" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">T3</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ dadoSecador?.T3M || '-' }} °C</p>
               <div v-if="verificarPerfilOperacao(['ADMINPORTA', 'SUPORTTECN', 'ADMINFABRI', 'ADMINLOCAL', 'ADMINGERAL'])">
                  <p v-if="!this.isDataExpirada()" class="mb-0 valor"><b>T3A:</b> {{ dadoSecador?.T3A || '-' }} °C</p>
                  <p v-if="!this.isDataExpirada()" class="mb-0 valor"><b>T3B:</b> {{ dadoSecador?.T3B || '-' }} °C</p>
                  <p v-if="!this.isDataExpirada()" class="mb-0 valor"><b>T3C:</b> {{ dadoSecador?.T3C || '-' }} °C</p>
                  <p v-if="!this.isDataExpirada()" class="mb-0 valor"><b>T3D:</b> {{ dadoSecador?.T3D || '-' }} °C</p>
               </div>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.T3M && (!dadoSecador?.TA3 || !dadoSecador?.TB3)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverT4" target="IconeTemperaturaCentroExaustor" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">T4</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.T4 || '-' }} °C</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.T4 && (!dadoSecador?.TA4 || !dadoSecador?.TB4)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverP1" target="IconePreEsquerda" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P1</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.P1 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P1 && (!dadoSecador?.PA1 || !dadoSecador?.PB1)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverP2" target="IconePreDireita" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">P2</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor">{{ dadoSecador?.P2 || '-' }} mmCa</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
               <p v-if="dadoSecador?.P2 && (!dadoSecador?.PA2 || !dadoSecador?.PB2)" class="mb-0 valor">Aguardando setpoint</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverUe" target="Umidade1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">UE</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada() && dadoSecador.MOP == 2" class="mb-0 valor">{{ dadoSecador?.UE || '-' }} %</p>
               <p v-if="this.isDataExpirada() || dadoSecador.MOP != 2" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverUs" target="Umidade2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">US</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada() && dadoSecador.MOP == 2" class="mb-0 valor">{{ dadoSecador?.US || '-' }} %</p>
               <p v-if="this.isDataExpirada() || dadoSecador.MOP != 2" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverN1" target="Nivel1" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Sensor Presença 2</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.NIV, 2) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverN2" target="Nivel2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Nível Máximo</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.NIV, 0) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverN3" target="Nivel3" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Sensor Presença 1</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.NIV, 1) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverM1" target="Motor" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Elevador de Carga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 1) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverM2" target="Motor2" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Válvula de Descarga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 2) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverM3" target="Motor3" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Transportador de Descarga</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 3) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
      <b-popover :show="showPopoverM4" target="Motor4" triggers="hover" placement="bottomleft">
         <template #title><div class="text-center">Ventilador de Exaustão</div></template>
         <b-row>
            <b-col class="text-nowrap">
               <p v-if="!this.isDataExpirada()" class="mb-0 valor text-center">{{ this.verificarBitNaPosicao(this.dadoSecador.AC1, 0) == true ? 'Acionado' : 'Não acionado' }}</p>
               <p v-if="this.isDataExpirada()" class="mb-0 valor">Aguardando dados</p>
            </b-col>
         </b-row>
      </b-popover>
   </div>
</template>

<script>
import client from '@/api'
import { verificarPerfilOperacao } from '@/utils'
import SecadorHorbachGrafico from '../components/SecadorHorbachGrafico.vue'
import sojaSVG from '@/assets/images/inicio/soja.svg'
import milhoSVG from '@/assets/images/inicio/milho.svg'
import trigoSVG from '@/assets/images/inicio/trigo.svg'
import arrozSVG from '@/assets/images/inicio/arroz.svg'
import sorgoSVG from '@/assets/images/inicio/sorgo.svg'

export default {
   name: 'SecadorHorbachDados',
   props: {
      tempoAtualizacao: Number
   },
   components: {
      SecadorHorbachGrafico
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
         showPopoverT1: false,
         showPopoverT2: false,
         showPopoverT3: false,
         showPopoverT4: false,
         showPopoverP1: false,
         showPopoverP2: false,
         showPopoverUe: false,
         showPopoverUs: false,
         showPopoverN1: false,
         showPopoverN2: false,
         showPopoverN3: false,
         showPopoverM1: false,
         showPopoverM2: false,
         showPopoverM3: false,
         showPopoverM4: false
      }
   },

   computed: {
      corT1() {
         return this.calculaCor(this.dadoSecador.T1, this.dadoSecador.TA1, this.dadoSecador.TB1)
      },
      corT2() {
         return this.calculaCor(this.dadoSecador.T2M, this.dadoSecador.TA2, this.dadoSecador.TB2)
      },
      corT3() {
         return this.calculaCor(this.dadoSecador.T3M, this.dadoSecador.TA3, this.dadoSecador.TB3)
      },
      corT4() {
         return this.calculaCor(this.dadoSecador.T4, this.dadoSecador.TA4, this.dadoSecador.TB4)
      },
      corP1() {
         return this.calculaCor(this.dadoSecador.P1, this.dadoSecador.PA1, this.dadoSecador.PB1)
      },
      corP2() {
         return this.calculaCor(this.dadoSecador.P2, this.dadoSecador.PA2, this.dadoSecador.PB2)
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
         const dados = await client.get(`/secador/horbach/buscardado/${this.idSecador}`).catch((err) => {
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
            let presenca2 = +this.verificarBitNaPosicao(this.dadoSecador.NIV, 2)
            let maximo = +this.verificarBitNaPosicao(this.dadoSecador.NIV, 0)
            let presenca1 = +this.verificarBitNaPosicao(this.dadoSecador.NIV, 1)
            this.atualizarNiveis(presenca2, maximo, presenca1)
            this.alterarCorMotor('Motor', +this.verificarBitNaPosicao(this.dadoSecador.AC1, 1))
            this.alterarCorMotor('Motor2', +this.verificarBitNaPosicao(this.dadoSecador.AC1, 2))
            this.alterarCorMotor('Motor3', +this.verificarBitNaPosicao(this.dadoSecador.AC1, 3))
            this.alterarCorMotor('Motor4', +this.verificarBitNaPosicao(this.dadoSecador.AC1, 0))
         }
      },
      alterarTipoGrafico(filtroGrafico) {
         this.filtroGrafico = filtroGrafico
      },
      formatarOperacao(value) {
         const status = {
            1: { nome: 'Carga', icone: 'arrow-up-square' },
            2: { nome: 'Secagem', icone: 'arrow-right-square' },
            3: { nome: 'Descarga', icone: 'arrow-down-square' },
            4: { nome: 'Desligado', icone: 'dash-square' }
         }
         return status[value] || { nome: '-', icone: 'dash-square' }
      },
      formatarProduto(value) {
         const produto = {
            1: { nome: 'Soja', svg: sojaSVG },
            2: { nome: 'Milho', svg: milhoSVG },
            3: { nome: 'Trigo', svg: trigoSVG },
            4: { nome: 'Arroz', svg: arrozSVG },
            6: { nome: 'Outros', svg: sorgoSVG },
            7: { nome: 'Semente Soja', svg: sojaSVG },
            8: { nome: 'Semente Milho', svg: milhoSVG },
            9: { nome: 'Semente Trigo', svg: trigoSVG },
            10: { nome: 'Semente Arroz', svg: arrozSVG },
            11: { nome: 'Outras Sementes', svg: sorgoSVG }
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
      alterarCorMotor(idMotor, status) {
         const grupoMotor = document.getElementById(idMotor)
         if (!grupoMotor) return
         if (idMotor === 'Motor3') {
            const seta = document.querySelector('#flechaMovimento path')
            const animacao = document.querySelector('#flechaMovimento animateTransform')
            if (seta && animacao) {
               if (status === 0 || status === 2) {
                  seta.style.display = 'none'
                  animacao.setAttribute('repeatCount', '0')
                  animacao.setAttribute('to', '0,0')
               } else {
                  seta.style.display = 'inline'
                  animacao.setAttribute('repeatCount', 'indefinite')
                  animacao.setAttribute('to', '100,0')
               }
            }
         }
         if (status === 0 || this.isDataExpirada()) return
         let novaCor
         if (status === 1) {
            novaCor = 'green'
         } else if (status === 2) {
            novaCor = 'red'
         }
         grupoMotor.querySelectorAll('path').forEach((path) => {
            path.style.setProperty('fill', novaCor, 'important')
         })
      },
      atualizarNiveis(n1, n2, n3) {
         const corVerde = 'green'
         const nivel1 = document.getElementById('Nivel1')
         const nivel2 = document.getElementById('Nivel2')
         const nivel3 = document.getElementById('Nivel3')

         if (nivel1) {
            nivel1.style.setProperty('fill', n1 === 1 && !this.isDataExpirada() ? corVerde : '', 'important')
         }
         if (nivel2) {
            nivel2.style.setProperty('fill', n2 === 1 && !this.isDataExpirada() ? corVerde : '', 'important')
         }
         if (nivel3) {
            nivel3.style.setProperty('fill', n3 === 1 && !this.isDataExpirada() ? corVerde : '', 'important')
         }
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
            return 'green'
         }
      },
      verificarBitNaPosicao(binario, posicao) {
         if (!binario) return
         const posicaoInvertida = binario.length - 1 - posicao
         return binario.charAt(posicaoInvertida) === '1'
      },
      startInterval(interval) {
         this.intervalId = setInterval(() => {
            this.buscarDados()
         }, interval)
      },
      stopInterval() {
         clearInterval(this.intervalId)
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
      verificarPerfilOperacao
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
.s0 {
   fill: #b4b4b4;
   stroke: #000000;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.s1 {
   fill: #878787;
   stroke: #000000;
   stroke-miterlimit: 100;
}

.s2 {
   fill: #000000;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.s3 {
   fill: #b4b4b4;
   stroke: #000000;
   stroke-miterlimit: 100;
}

.s4 {
   fill: #878787;
   stroke: #000000;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.s5 {
   fill: #808080;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.fundoTemp {
   fill: red !important;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.fundoPres {
   fill: blue !important;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.fundoUmidades {
   fill: green !important;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}
.gotasUmidade {
   fill: white !important;
   stroke: #ffffff;
}

.fundo {
   background: #fff;
}

.valor {
   font-size: 16px;
   font-weight: 400;
}

.green {
   fill: green;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.red {
   fill: red;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.blue {
   fill: blue;
   stroke: #ffffff;
   stroke-miterlimit: 100;
   stroke-width: 3;
}

.overlay {
   z-index: 0;
}
</style>
<style>
.nav-customizado a:hover,
.nav-customizado a:focus {
   outline: none;
   text-decoration: none;
}
.nav-customizado .nav-tabs {
   padding-left: 15px;
   border-bottom: 4px solid #1988ff;
}
.nav-customizado .nav-tabs .nav-item .nav-link {
   color: #fff;
   padding: 10px 20px;
   margin-right: 15px;
   background: #1988ff;
   border: none;
   border-radius: 0;
   opacity: 0.5;
   position: relative;
   transition: all 0.3s ease 0s;
}
.nav-customizado .nav-tabs .nav-item .nav-link:hover {
   background: #1988ff;
   opacity: 0.8;
}
.nav-customizado .nav-tabs .nav-item .nav-link.active {
   opacity: 1;
}
.nav-customizado .nav-tabs .nav-item .nav-link:before,
.nav-customizado .nav-tabs .nav-item .nav-link:after {
   content: '';
   border-top: 42px solid transparent;
   position: absolute;
   top: -1px;
}
.nav-customizado .nav-tabs .nav-item .nav-link:before {
   border-right: 15px solid #1988ff;
   left: -14px;
}
.nav-customizado .nav-tabs .nav-item .nav-link:after {
   border-left: 15px solid #1988ff;
   right: -14px;
}
.nav-customizado .nav-tabs .nav-item .nav-link i,
.nav-customizado .nav-tabs .nav-item .nav-link.active i {
   display: inline-block;
   padding-right: 5px;
   font-size: 14px;
   text-shadow: none;
}
.nav-customizado .nav-tabs .nav-item .nav-link span {
   display: inline-block;
   font-size: 14px;
   letter-spacing: -9px;
   opacity: 0;
   transition: all 0.3s ease 0s;
}
.nav-customizado .nav-tabs .nav-item .nav-link:hover span,
.nav-customizado .nav-tabs .nav-item .nav-link.active span {
   letter-spacing: 1px;
   opacity: 1;
   transition: all 0.3s ease 0s;
   margin-left: 4px;
}
@media only screen and (max-width: 500px) {
   .nav-customizado .nav-tabs .nav-item .nav-link {
      padding: 5px 10px;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link:before,
   .nav-customizado .nav-tabs .nav-item .nav-link:after {
      border-top: 32px solid transparent;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link:before {
      border-right: 15px solid #1988ff;
      left: -14px;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link:after {
      border-left: 15px solid #1988ff;
      right: -14px;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link span {
      display: inline-block;
      font-size: 13px;
      letter-spacing: -9px;
      opacity: 0;
      transition: all 0.3s ease 0s;
   }
   .nav-customizado .nav-tabs .nav-item .nav-link:hover span,
   .nav-customizado .nav-tabs .nav-item .nav-link.active span {
      letter-spacing: -9px;
      opacity: 0;
      transition: all 0.3s ease 0s;
      margin-left: 0px;
   }
}
</style>

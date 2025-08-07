<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <!-- Painel de Controles -->
      <div class="col-xl-3 col-lg-4 col-md-5 col-sm-12 modelador-painel-controles" :style="{
        height: isMobile ? 'auto' : '100vh',
        overflowY: isMobile ? 'visible' : 'auto',
        position: 'relative',
        borderRight: '2px solid #dee2e6',
        backgroundColor: '#f8f9fa',
        zIndex: 1000,
        maxHeight: isMobile ? 'none' : '100vh'
      }">
        <div class="p-3">
          <h4 class="text-center mb-4">Modelador de Layouts</h4>

          <!-- Seletor de Tipo -->
          <div class="mb-3">
            <label class="form-label fw-bold">Tipo de Estrutura:</label>
            <select class="form-select" v-model="tipoAtivo" @change="onTipoChange">
              <option value="silo">Silo</option>
              <option value="armazem">Armazém</option>
            </select>
          </div>

          <!-- Controles para Silo -->
          <template v-if="tipoAtivo === 'silo'">
            <h6 class="mt-3 text-primary">Dimensões do Silo</h6>

            <div class="mb-3">
              <label class="form-label">Largura Base: {{ configSilo.lb }}px</label>
              <div class="d-flex align-items-center">
                <input v-model.number="configSilo.lb" type="range" min="100" max="400" class="form-range me-2"
                  @input="onSiloChange" />
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetSiloField('lb', 200)"
                  title="Resetar para padrão (200)">
                  ×
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Altura Superior: {{ configSilo.hs }}px</label>
              <div class="d-flex align-items-center">
                <input v-model.number="configSilo.hs" type="range" min="100" max="300" class="form-range me-2"
                  @input="onSiloChange" />
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetSiloField('hs', 180)"
                  title="Resetar para padrão (180)">
                  ×
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Altura Base: {{ configSilo.hb }}px</label>
              <div class="d-flex align-items-center">
                <input v-model.number="configSilo.hb" type="range" min="5" max="30" class="form-range me-2"
                  @input="onSiloChange" />
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetSiloField('hb', 15)"
                  title="Resetar para padrão (15)">
                  ×
                </button>
              </div>
            </div>

            <h6 class="mt-3 text-primary">Sensores</h6>
            <div class="mb-3">
              <label class="form-label">Escala Sensores: {{ configSilo.escala_sensores }}px</label>
              <div class="d-flex align-items-center">
                <input v-model.number="configSilo.escala_sensores" type="range" min="10" max="25"
                  class="form-range me-2" @input="onSiloChange" />
                <button type="button" class="btn btn-sm btn-outline-secondary"
                  @click="resetSiloField('escala_sensores', 16)" title="Resetar para padrão (16)">
                  ×
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Distância Y Sensores: {{ configSilo.dist_y_sensores }}px</label>
              <div class="d-flex align-items-center">
                <input v-model.number="configSilo.dist_y_sensores" type="range" min="8" max="20" class="form-range me-2"
                  @input="onSiloChange" />
                <button type="button" class="btn btn-sm btn-outline-secondary"
                  @click="resetSiloField('dist_y_sensores', 12)" title="Resetar para padrão (12)">
                  ×
                </button>
              </div>
            </div>

            <h6 class="mt-3 text-primary">Aeradores</h6>
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="configSilo.aeradores_ativo"
                  @change="onSiloChange" />
                <label class="form-check-label">Ativar Aeradores</label>
              </div>
            </div>

            <template v-if="configSilo.aeradores_ativo">
              <div class="mb-3">
                <label class="form-label">Número de Aeradores: {{ configSilo.na }}</label>
                <div class="d-flex align-items-center">
                  <input v-model.number="configSilo.na" type="range" min="2" max="6" class="form-range me-2"
                    @input="onSiloChange" />
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetSiloField('na', 4)"
                    title="Resetar para padrão (4)">
                    ×
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Deslocamento Lateral: {{ configSilo.ds }}px</label>
                <div class="d-flex align-items-center">
                  <input v-model.number="configSilo.ds" type="range" min="10" max="60" class="form-range me-2"
                    @input="onSiloChange" />
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetSiloField('ds', 30)"
                    title="Resetar para padrão (30)">
                    ×
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Distância entre Aeradores: {{ configSilo.da }}px</label>
                <div class="d-flex align-items-center">
                  <input v-model.number="configSilo.da" type="range" min="20" max="60" class="form-range me-2"
                    @input="onSiloChange" />
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetSiloField('da', 35)"
                    title="Resetar para padrão (35)">
                    ×
                  </button>
                </div>
              </div>
            </template>
          </template>

          <!-- Controles para Armazém -->
          <template v-if="tipoAtivo === 'armazem'">
            <!-- Seção 0: Configuração de Modelos de Arcos -->
            <div class="card mb-3">
              <div class="card-header bg-dark text-white">
                <h6 class="mb-0">🏗️ Modelos de Arcos do Armazém</h6>
              </div>
              <div class="card-body">
                <div class="row mb-3">
                  <div class="col-lg-6 col-md-12 mb-3">
                    <label class="form-label">Quantidade de Modelos:</label>
                    <select class="form-select" v-model="quantidadeModelosArcos" @change="onQuantidadeModelosChange">
                      <option :value="1">1 Modelo</option>
                      <option :value="2">2 Modelos</option>
                      <option :value="3">3 Modelos</option>
                      <option :value="4">4 Modelos</option>
                    </select>
                  </div>
                  <div class="col-lg-6 col-md-12 mb-3">
                    <label class="form-label">Modelo Atual:</label>
                    <select class="form-select" v-model="modeloArcoAtual" @change="onModeloArcoChange">
                      <option :value="null">Selecione Modelo</option>
                      <option v-for="i in quantidadeModelosArcos" :key="i" :value="i">
                        Modelo {{ i }} - {{ getDescricaoModelo(i) }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-lg-6 col-md-12 mb-3">
                    <label class="form-label">Nome do Modelo:</label>
                    <input type="text" class="form-control" v-model="modeloNome" placeholder="Nome do modelo"
                      :disabled="!modeloArcoAtual" @input="onNomeModeloChange" />
                  </div>
                  <div class="col-lg-6 col-md-12 mb-3">
                    <label class="form-label">Posição no Armazém:</label>
                    <select class="form-select" v-model="modeloPosicao" @change="onPosicaoArcoChange"
                      :disabled="!modeloArcoAtual">
                      <template v-if="quantidadeModelosArcos === 1">
                        <option value="todos">Todos os Arcos</option>
                      </template>
                      <template v-if="quantidadeModelosArcos === 2">
                        <option value="par">Par (2º, 4º, 6º...)</option>
                        <option value="impar">Ímpar (1º, 3º, 5º...)</option>
                      </template>
                      <template v-if="quantidadeModelosArcos === 3">
                        <option value="frente_fundo">Frente/Fundo (1º e Último)</option>
                        <option value="par">Par (2º, 4º, 6º...)</option>
                        <option value="impar">Ímpar (3º, 5º, 7º...)</option>
                      </template>
                      <template v-if="quantidadeModelosArcos === 4">
                        <option value="frente">Frente (1º Arco)</option>
                        <option value="par">Par (2º, 4º, 6º...)</option>
                        <option value="impar">Ímpar (3º, 5º, 7º...)</option>
                        <option value="fundo">Fundo (Último Arco)</option>
                      </template>
                    </select>
                  </div>
                </div>

                <div v-if="modeloArcoAtual" class="alert alert-info">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>EDITANDO:</strong> {{ modelosArcos[modeloArcoAtual]?.nome || `Modelo ${modeloArcoAtual}`
                      }}
                      <span class="badge bg-primary ms-2">
                        {{ modelosArcos[modeloArcoAtual]?.posicao || '' }}
                      </span>
                      <span v-if="modelosSalvos[modeloArcoAtual]" class="badge bg-success ms-2">
                        SALVO
                      </span>
                    </div>
                    <button type="button" class="btn btn-sm btn-success" @click="salvarModeloAtual"
                      title="Salvar este modelo">
                      💾 Salvar Modelo
                    </button>
                  </div>
                </div>

                <div v-if="!modeloArcoAtual" class="alert alert-warning">
                  <strong>⚠️ Nenhum modelo selecionado</strong>
                </div>

                <!-- Resumo dos modelos -->
                <div class="mt-3">
                  <h6>Resumo dos Modelos:</h6>
                  <div class="row">
                    <div v-for="i in quantidadeModelosArcos" :key="i" class="col-lg-6 col-md-12 col-sm-12 mb-2">
                      <div :class="['card', { 'border-primary': modeloArcoAtual === i }]">
                        <div class="card-body p-2">
                          <div class="d-flex justify-content-between align-items-start">
                            <small>
                              <strong>Modelo {{ i }}:</strong> {{ modelosArcos[i]?.posicao || '' }}<br />
                              {{ modelosArcos[i]?.nome || '' }}
                            </small>
                            <span v-if="modelosSalvos[i]" class="badge bg-success badge-sm">✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mt-2">
                    <small class="text-muted">
                      <strong>Status:</strong> {{ Object.keys(modelosSalvos).length }} de {{ quantidadeModelosArcos }}
                      modelos salvos
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Seção 1: Dimensões Básicas -->
            <div class="card mb-3">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">📐 Dimensões Básicas do Armazém</h6>
              </div>
              <div class="card-body">
                <div class="mb-2">
                  <label class="small fw-bold">Profundidade Base (pb):</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.pb" type="range" min="100" max="300" class="form-range"
                      @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.pb }}</span>
                    <button type="button" class="btn btn-outline-secondary" @click="resetArmazemField('pb', 185)"
                      title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Largura Base (lb):</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.lb" type="range" min="200" max="500" class="form-range"
                      @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.lb }}</span>
                    <button type="button" class="btn btn-outline-secondary" @click="resetArmazemField('lb', 350)"
                      title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Altura Base (hb):</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.hb" type="range" min="10" max="80" class="form-range"
                      @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.hb }}</span>
                    <button type="button" class="btn btn-outline-secondary" @click="resetArmazemField('hb', 30)"
                      title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Altura Frente (hf):</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.hf" type="range" min="2" max="20" class="form-range"
                      @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.hf }}</span>
                    <button type="button" class="btn btn-outline-secondary" @click="resetArmazemField('hf', 5)"
                      title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Largura Frente (lf):</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.lf" type="range" min="150" max="350" class="form-range"
                      @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.lf }}</span>
                    <button type="button" class="btn btn-outline-secondary" @click="resetArmazemField('lf', 250)"
                      title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Largura Estrutura (le):</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.le" type="range" min="5" max="50" class="form-range"
                      @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.le }}</span>
                    <button type="button" class="btn btn-outline-secondary" @click="resetArmazemField('le', 15)"
                      title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Altura Teto (ht):</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.ht" type="range" min="20" max="100" class="form-range"
                      @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.ht }}</span>
                    <button type="button" class="btn btn-outline-secondary" @click="resetArmazemField('ht', 50)"
                      title="Reset">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Seção 2: Configuração do Telhado -->
            <div class="card mb-3">
              <div class="card-header bg-info text-white">
                <h6 class="mb-0">🏠 Configuração do Telhado</h6>
              </div>
              <div class="card-body">
                <div class="mb-2">
                  <label class="small fw-bold">Tipo do Telhado:</label>
                  <div class="input-group input-group-sm">
                    <select class="form-select" v-model="configArmazem.tipo_telhado" @change="onArmazemChange">
                      <option :value="1">Pontudo</option>
                      <option :value="2">Arredondado</option>
                      <option :value="3">Arco</option>
                    </select>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('tipo_telhado', 1)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Curvatura do Topo:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.curvatura_topo" type="range" min="1" max="100"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.curvatura_topo }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('curvatura_topo', 50)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <!-- Personalização das Pontas -->
                <div class="mb-2">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="configArmazem.pontas_redondas"
                      @change="onArmazemChange" />
                    <label class="form-check-label small fw-bold">Pontas Redondas</label>
                  </div>
                </div>

                <div v-if="configArmazem.pontas_redondas" class="mb-2">
                  <label class="small fw-bold">Raio das Pontas:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.raio_pontas" type="range" min="5" max="50"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.raio_pontas }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('raio_pontas', 15)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <!-- Personalização das Laterais -->
                <div class="mb-2">
                  <label class="small fw-bold">Estilo das Laterais:</label>
                  <div class="input-group input-group-sm">
                    <select class="form-select" v-model="configArmazem.estilo_laterais" @change="onArmazemChange">
                      <option value="reta">Laterais Retas</option>
                      <option value="parede_para_fora">Paredes Para Fora</option>
                      <option value="parede_para_dentro">Paredes Para Dentro</option>
                    </select>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('estilo_laterais', 'reta')" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div v-if="configArmazem.estilo_laterais !== 'reta'" class="mb-2">
                  <label class="small fw-bold">Intensidade da Curvatura:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.curvatura_laterais" type="range" min="5" max="100"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.curvatura_laterais }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('curvatura_laterais', 30)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Seção 3: Configuração do Fundo -->
            <div class="card mb-3">
              <div class="card-header bg-warning text-dark">
                <h6 class="mb-0">⬇️ Configuração do Fundo</h6>
              </div>
              <div class="card-body">
                <div class="mb-2">
                  <label class="small fw-bold">Tipo do Fundo:</label>
                  <div class="input-group input-group-sm">
                    <select class="form-select" v-model="configArmazem.tipo_fundo" @change="onArmazemChange">
                      <option :value="0">Reto</option>
                      <option :value="1">Funil/V</option>
                      <option :value="2">Duplo V</option>
                    </select>
                    <button type="button" class="btn btn-outline-secondary" @click="resetArmazemField('tipo_fundo', 0)"
                      title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <!-- Controles específicos para Fundo Reto -->
                <div v-if="configArmazem.tipo_fundo === 0" class="alert alert-light">
                  <h6>Configurações do Fundo Reto:</h6>
                  <div class="mb-2">
                    <label class="form-label">Altura do Fundo Reto:</label>
                    <div class="input-group input-group-sm">
                      <input v-model.number="configArmazem.altura_fundo_reto" type="range" min="0" max="50"
                        class="form-range" @input="onArmazemChange" />
                      <span class="input-group-text">{{ configArmazem.altura_fundo_reto }}</span>
                      <button type="button" class="btn btn-outline-secondary"
                        @click="resetArmazemField('altura_fundo_reto', 10)" title="Reset">
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Controles específicos para Funil V -->
                <div v-if="configArmazem.tipo_fundo === 1" class="alert alert-light">
                  <h6>Configurações do Funil V:</h6>
                  <div class="row">
                    <div class="col-6 mb-2">
                      <label class="form-label">Altura do Funil:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.altura_funil_v" type="range" min="10" max="120"
                          class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.altura_funil_v }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('altura_funil_v', 18)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Posição da Ponta:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.posicao_ponta_v" type="range" min="-2" max="2" step="0.1"
                          class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.posicao_ponta_v }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('posicao_ponta_v', 0)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Largura da Abertura:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.largura_abertura_v" type="range" min="2" max="80"
                          class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.largura_abertura_v }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('largura_abertura_v', 20)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Inclinação das Paredes:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.inclinacao_funil_v" type="range" min="0" max="10"
                          step="0.1" class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.inclinacao_funil_v }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('inclinacao_funil_v', 1)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Controles específicos para Duplo V -->
                <div v-if="configArmazem.tipo_fundo === 2" class="alert alert-light">
                  <h6>Configurações do Duplo V:</h6>
                  <div class="row">
                    <div class="col-6 mb-2">
                      <label class="form-label">Altura dos Funis:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.altura_duplo_v" type="range" min="10" max="120"
                          class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.altura_duplo_v }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('altura_duplo_v', 22)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Posição V Esquerdo:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.posicao_v_esquerdo" type="range" min="-2" max="0.5"
                          step="0.1" class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.posicao_v_esquerdo }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('posicao_v_esquerdo', -1)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Posição V Direito:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.posicao_v_direito" type="range" min="-0.5" max="2"
                          step="0.1" class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.posicao_v_direito }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('posicao_v_direito', 1)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Largura das Aberturas:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.largura_abertura_duplo_v" type="range" min="2" max="80"
                          class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.largura_abertura_duplo_v }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('largura_abertura_duplo_v', 2)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Altura da Plataforma:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.altura_plataforma_duplo_v" type="range" min="0" max="1"
                          step="0.1" class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.altura_plataforma_duplo_v }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('altura_plataforma_duplo_v', 0.3)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Largura da Plataforma:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.largura_plataforma_duplo_v" type="range" min="10" max="120"
                          class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.largura_plataforma_duplo_v }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('largura_plataforma_duplo_v', 10)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Movimentação do Fundo (comum a todos) -->
                <div class="alert alert-warning p-2">
                  <h6 class="small">🔄 Movimentação do Fundo:</h6>
                  <div class="row">
                    <div class="col-6 mb-2">
                      <label class="small fw-bold">Deslocamento Horizontal:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.deslocamento_horizontal_fundo" type="range" min="-100"
                          max="100" class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.deslocamento_horizontal_fundo }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('deslocamento_horizontal_fundo', 0)" title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="small fw-bold">Deslocamento Vertical:</label>
                      <div class="input-group input-group-sm">
                        <input v-model.number="configArmazem.deslocamento_vertical_fundo" type="range" min="-100"
                          max="100" class="form-range" @input="onArmazemChange" />
                        <span class="input-group-text">{{ configArmazem.deslocamento_vertical_fundo }}</span>
                        <button type="button" class="btn btn-outline-secondary"
                          @click="resetArmazemField('deslocamento_vertical_fundo', obterDeslocamentoVerticalPadrao(configArmazem.tipo_fundo))"
                          title="Reset">
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Seção 4: Configuração dos Sensores -->
            <div class="card mb-3">
              <div class="card-header bg-success text-white">
                <h6 class="mb-0">🌡️ Configuração dos Sensores</h6>
              </div>
              <div class="card-body">
                <div class="mb-2">
                  <label class="small fw-bold">Escala dos Sensores:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.escala_sensores" type="range" min="10" max="30"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.escala_sensores }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('escala_sensores', 16)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Distância Y Sensores:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.dist_y_sensores" type="range" min="8" max="20"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.dist_y_sensores }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('dist_y_sensores', 12)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Distância X Sensores:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.dist_x_sensores" type="range" min="-100" max="100"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.dist_x_sensores }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('dist_x_sensores', 0)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Posição Horizontal:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.posicao_horizontal" type="range" min="-150" max="150"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.posicao_horizontal }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('posicao_horizontal', 0)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Posição Vertical:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.posicao_vertical" type="range" min="-100" max="100"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.posicao_vertical }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('posicao_vertical', 0)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Afastamento Vertical Pêndulo:</label>
                  <div class="input-group input-group-sm">
                    <input v-model.number="configArmazem.afastamento_vertical_pendulo" type="range" min="-50" max="50"
                      class="form-range" @input="onArmazemChange" />
                    <span class="input-group-text">{{ configArmazem.afastamento_vertical_pendulo }}</span>
                    <button type="button" class="btn btn-outline-secondary"
                      @click="resetArmazemField('afastamento_vertical_pendulo', 0)" title="Reset">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Botões de Reset -->
          <div class="d-grid gap-2 mb-3">
            <button type="button" class="btn btn-warning" @click="resetarPadrao">
              🔄 Resetar para Padrão
            </button>
            <button v-if="tipoAtivo === 'armazem'" type="button" class="btn btn-outline-warning"
              @click="resetarModelosParaPadrao">
              🗑️ Limpar Todos os Modelos
            </button>
            <button v-if="dadosVindosDoPreview" type="button" class="btn btn-info" @click="voltarParaPreview">
              ⬅️ Voltar ao Preview
            </button>
          </div>

          <!-- Gerenciador de Configurações -->
          <div class="card mt-3">
            <div class="card-header bg-info text-white">
              <h6 class="mb-0">📋 Gerenciar Configurações</h6>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Nome da Configuração:</label>
                <input type="text" class="form-control" v-model="nomeConfiguracao"
                  placeholder="Digite o nome para salvar/carregar" />
              </div>

              <div class="d-grid gap-2 mb-3">
                <button type="button" class="btn btn-success" @click="salvarConfiguracao"
                  :disabled="!nomeConfiguracao.trim()">
                  💾 Salvar {{ tipoAtivo === 'silo' ? 'Silo' : 'Armazém' }} Completo
                </button>
                <button type="button" class="btn btn-primary" @click="carregarConfiguracao"
                  :disabled="!nomeConfiguracao.trim()">
                  📂 Carregar Configuração
                </button>
              </div>

              <!-- Lista de configurações salvas -->
              <div v-if="configsDisponiveis.length > 0" class="alert alert-light">
                <h6>Configurações Salvas:</h6>
                <div class="d-flex flex-wrap gap-1">
                  <span v-for="nome in configsDisponiveis" :key="nome" class="badge bg-secondary position-relative">
                    {{ nome }}
                    <button type="button" class="btn-close btn-close-white" style="font-size: 8px; margin-left: 5px"
                      @click="deletarConfiguracao(nome)" aria-label="Close"></button>
                  </span>
                </div>
                <div class="mt-2">
                  <small class="text-muted">Clique em uma configuração para carregar rapidamente:</small>
                  <div class="d-flex flex-wrap gap-1 mt-1">
                    <button v-for="nome in configsDisponiveis" :key="nome" type="button"
                      class="btn btn-sm btn-outline-primary" @click="carregarConfiguracao(nome)">
                      {{ nome }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="tipoAtivo === 'armazem'" class="alert alert-info">
                <small>
                  <strong>📌 Dica:</strong> Quando salvar um armazém, todos os {{ quantidadeModelosArcos }} modelos de
                  arcos
                  configurados
                  serão salvos junto. Ao carregar, a configuração completa será restaurada com todos os modelos.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área de Visualização -->
      <div class="col-xl-9 col-lg-8 col-md-7 col-sm-12" :style="{
        padding: '10px',
        height: isMobile ? 'auto' : '100vh',
        overflow: isMobile ? 'visible' : 'hidden',
        minHeight: isMobile ? '400px' : '100vh'
      }">
        <div class="d-flex justify-content-center align-items-center h-100" style="minHeight: 400px">
          <div class="card w-100" :style="{
            maxWidth: '100%',
            minHeight: '400px',
            maxHeight: 'calc(100vh - 60px)',
            height: 'calc(100vh - 60px)'
          }">
            <div class="card-header bg-primary text-white">
              <div
                class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                <h6 class="mb-1 mb-md-0">
                  Preview - {{ tipoAtivo === 'silo' ? 'Silo' : `${modeloArcoAtual ? `EDITANDO:
                  ${modelosArcos[modeloArcoAtual]?.nome || 'Modelo ' + modeloArcoAtual}` : 'Visualização Geral'}` }}
                  <span v-if="dadosVindosDoPreview" class="badge bg-success ms-2"
                    title="Dados carregados do preview do Armazém">
                    📊 PREVIEW
                  </span>
                </h6>
                <small v-if="tipoAtivo === 'armazem'" class="text-white-50">
                  {{ modeloArcoAtual ?
                    `${quantidadeModelosArcos === 1 ? 'Modelo Único' : modelosArcos[modeloArcoAtual]?.posicao || ''} |
                  ${modeloArcoAtual}/${quantidadeModelosArcos}` :
                    `${determinarModeloParaArco(arcoAtual)?.nome || 'Padrão'} | ${quantidadeModelosArcos}
                  modelo${quantidadeModelosArcos > 1 ? 's' : ''}`
                  }}
                </small>
              </div>
            </div>

            <div class="card-body text-center d-flex align-items-center justify-content-center p-1 p-md-2" :style="{
              height: isMobile ? 'auto' : 'calc(100vh - 250px)',
              overflow: isMobile ? 'visible' : 'auto',
              minHeight: isMobile ? '250px' : '300px',
              maxHeight: isMobile ? 'none' : 'calc(100vh - 250px)'
            }">
              <div class="svg-container-responsive w-100">
                <svg :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`" :style="{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: isMobile ? '60vh' : 'calc(100vh - 320px)',
                  minHeight: isMobile ? '200px' : '250px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  shapeRendering: 'geometricPrecision',
                  textRendering: 'geometricPrecision',
                  imageRendering: 'optimizeQuality'
                }" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" v-html="svgContent">
                </svg>
              </div>
            </div>

            <!-- Navegação de Arcos para Armazém -->
            <div v-if="tipoAtivo === 'armazem' && analiseArcos" class="card-footer bg-light p-1">
              <!-- Seletor de Configuração Salva no Preview -->
              <div class="row mb-2">
                <div class="col-12">
                  <label class="form-label small">⚙️ Configuração do Preview:</label>
                  <div class="d-flex gap-2 align-items-center">
                    <select class="form-select form-select-sm" v-model="configuracaoPreviewSelecionada"
                      @change="aplicarConfiguracaoNoPreview">
                      <option value="">Configuração Padrão</option>
                      <option v-for="config in configsDisponiveis" :key="config" :value="config">
                        {{ config }}
                      </option>
                    </select>
                    <button v-if="configuracaoPreviewSelecionada" type="button" class="btn btn-outline-secondary btn-sm"
                      @click="limparConfiguracaoPreview" title="Voltar ao padrão">
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <!-- Mobile First: Layout para pequenas telas -->
              <div class="d-block d-md-none">
                <!-- Linha 1: Navegação compacta -->
                <div class="d-flex align-items-center justify-content-center mb-2 flex-wrap gap-1">
                  <button type="button" class="btn btn-outline-primary btn-sm"
                    @click="mudarArco(Math.max(1, arcoAtual - 1), false)" :disabled="arcoAtual <= 1"
                    title="Arco anterior" style="min-width: 35px;">
                    ←
                  </button>
                  <select class="form-select form-select-sm text-center mx-1" style="max-width: 100px; min-width: 80px;"
                    v-model.number="arcoAtual" @change="mudarArco(arcoAtual, false)">
                    <option v-for="numeroArco in analiseArcos.totalArcos" :key="numeroArco" :value="numeroArco">
                      {{ numeroArco }}
                    </option>
                  </select>
                  <button type="button" class="btn btn-outline-primary btn-sm"
                    @click="mudarArco(Math.min(analiseArcos.totalArcos, arcoAtual + 1), false)"
                    :disabled="arcoAtual >= analiseArcos.totalArcos" title="Próximo arco" style="min-width: 35px;">
                    →
                  </button>
                </div>

                <!-- Linha 2: Informações compactas -->
                <div class="text-center">
                  <div class="mb-1">
                    <small><strong>{{ arcoAtual }}/{{ analiseArcos.totalArcos }}</strong></small>
                    <span v-if="modeloArcoAtual" class="badge bg-warning text-dark ms-1"
                      style="font-size: 0.6rem;">EDIT</span>
                    <span v-if="configuracaoPreviewSelecionada" class="badge bg-success text-white ms-1"
                      style="font-size: 0.6rem;">{{ configuracaoPreviewSelecionada }}</span>
                  </div>
                  <div class="mb-1 d-flex justify-content-center align-items-center flex-wrap gap-1">
                    <span class="badge bg-info text-white" style="font-size: 0.65rem;">
                      {{ analiseArcos.arcos[arcoAtual]?.totalPendulos || 0 }}P
                    </span>
                    <span class="badge bg-secondary text-white" style="font-size: 0.65rem;">
                      {{ analiseArcos.arcos[arcoAtual]?.totalSensores || 0 }}S
                    </span>
                    <span :class="getBadgeClass()" style="color: white; font-size: 0.65rem;">
                      {{ getBadgeText() }}
                    </span>
                  </div>
                  <small class="text-muted d-block" style="font-size: 0.75rem;">{{
                    determinarModeloParaArco(arcoAtual)?.nome
                    || 'Modelo Padrão' }}</small>
                </div>
              </div>

              <!-- Desktop: Layout para telas médias e grandes -->
              <div class="d-none d-md-block">
                <div class="row g-1 align-items-center">
                  <!-- Navegação -->
                  <div class="col-md-4 col-lg-3">
                    <div class="d-flex align-items-center justify-content-center justify-content-lg-start">
                      <button type="button" class="btn btn-outline-primary btn-sm me-1"
                        @click="mudarArco(Math.max(1, arcoAtual - 1), false)" :disabled="arcoAtual <= 1"
                        title="Arco anterior">
                        ← Anterior
                      </button>
                      <select class="form-select form-select-sm mx-1" style="min-width: 100px; max-width: 120px;"
                        v-model.number="arcoAtual" @change="mudarArco(arcoAtual, false)">
                        <option v-for="numeroArco in analiseArcos.totalArcos" :key="numeroArco" :value="numeroArco">
                          Arco {{ numeroArco }}
                        </option>
                      </select>
                      <button type="button" class="btn btn-outline-primary btn-sm ms-1"
                        @click="mudarArco(Math.min(analiseArcos.totalArcos, arcoAtual + 1), false)"
                        :disabled="arcoAtual >= analiseArcos.totalArcos" title="Próximo arco">
                        Próximo →
                      </button>
                    </div>
                  </div>

                  <!-- Informações do Arco -->
                  <div class="col-md-4 col-lg-3 text-center">
                    <div>
                      <strong class="text-nowrap">Arco {{ arcoAtual }}/{{ analiseArcos.totalArcos }}</strong>
                      <span v-if="modeloArcoAtual" class="badge bg-warning text-dark ms-1">EDITANDO</span>
                      <span v-if="configuracaoPreviewSelecionada" class="badge bg-success text-white ms-1">{{
                        configuracaoPreviewSelecionada }}</span>
                    </div>
                    <small class="text-muted d-block">{{ determinarModeloParaArco(arcoAtual)?.nome || 'Modelo Padrão'
                    }}</small>
                  </div>

                  <!-- Badges de Contadores -->
                  <div class="col-md-4 col-lg-6 text-center text-md-end">
                    <div
                      class="d-flex flex-wrap justify-content-center justify-content-md-end align-items-center gap-1">
                      <span class="badge bg-info text-white">
                        {{ analiseArcos.arcos[arcoAtual]?.totalPendulos || 0 }} Pêndulos
                      </span>
                      <span class="badge bg-secondary text-white">
                        {{ analiseArcos.arcos[arcoAtual]?.totalSensores || 0 }} Sensores
                      </span>
                      <span :class="getBadgeClass()" style="color: white;">
                        {{ getBadgeText() }}
                      </span>
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
</template>

<script>
import LayoutManager from './utils/layoutManager'

export default {
  name: 'ModeladorSVG',
  data() {
    return {
      // Estados para configurações do Silo
      configSilo: {
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 5,
        escala_sensores: 16,
        dist_y_sensores: 12,
        pos_x_cabos_uniforme: 1,
        pos_x_cabo: [50, 25],
        pos_y_cabo: [160, 160, 160, 160, 160],
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35
      },

      // Estados para configurações do Armazém
      configArmazem: {
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 5,
        lf: 250,
        le: 15,
        ht: 50,
        tipo_telhado: 1,
        curvatura_topo: 30,
        pontas_redondas: false,
        raio_pontas: 15,
        estilo_laterais: 'reta',
        curvatura_laterais: 30,
        tipo_fundo: 0,
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
        largura_abertura_v: 20,
        altura_duplo_v: 22,
        posicao_v_esquerdo: -1,
        posicao_v_direito: 1,
        largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0
      },

      // Estados para modelos de arcos
      quantidadeModelosArcos: 1,
      modeloArcoAtual: null,
      modelosArcos: {
        1: {
          posicao: 'todos',
          config: {},
          nome: 'Modelo Único'
        }
      },
      modelosSalvos: {},

      // Estados para dados do JSON
      dados: null,
      dadosPortal: null,
      arcoAtual: 1,
      analiseArcos: null,
      layoutsAutomaticos: null,

      tipoAtivo: 'silo',
      nomeConfiguracao: '',
      larguraSVG: 400,
      alturaSVG: 300,
      svgContent: '',
      forceUpdateLista: 0,
      dadosVindosDoPreview: false,
      configuracaoPreviewSelecionada: '',
      configPreviewAplicada: null,
      configuracaoAplicada: null
    }
  },
  computed: {
    isMobile() {
      return typeof window !== 'undefined' && window.innerWidth <= 576
    },
    configsDisponiveis() {
      const prefixo = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_`
      const configs = []

      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const chave = localStorage.key(i)
          if (chave && chave.startsWith(prefixo)) {
            const nome = chave.replace(prefixo, '')
            configs.push(nome)
          }
        }
      }

      return configs
    },
    modeloNome: {
      get() {
        return this.modeloArcoAtual ? this.modelosArcos[this.modeloArcoAtual]?.nome || '' : ''
      },
      set(value) {
        if (this.modeloArcoAtual) {
          this.modelosArcos[this.modeloArcoAtual].nome = value
          this.salvarModelosAutomatico()
        }
      }
    },
    modeloPosicao: {
      get() {
        return this.modeloArcoAtual ? this.modelosArcos[this.modeloArcoAtual]?.posicao || '' : ''
      },
      set(value) {
        if (this.modeloArcoAtual) {
          this.modelosArcos[this.modeloArcoAtual].posicao = value
          this.salvarModelosAutomatico()
        }
      }
    }
  },
  async mounted() {
    await this.verificarDadosArcoRecebidos()
    await this.carregarDadosAPI()
    this.resetarModelosParaPadrao()
    this.updateSVG()
  },
  watch: {
    'configArmazem.tipo_fundo': {
      handler(novoTipo) {
        this.configArmazem.deslocamento_vertical_fundo = this.obterDeslocamentoVerticalPadrao(novoTipo)
      }
    },
    dados: {
      handler() {
        if (this.tipoAtivo === 'armazem' && this.dados) {
          // Aguardar um pouco mais para garantir que o SVG foi renderizado
          setTimeout(() => {
            this.atualizarSensores()
          }, 100)
        }
      },
      deep: true
    },
    arcoAtual() {
      if (this.tipoAtivo === 'armazem') {
        this.updateSVG()
      }
    }
  },
  methods: {
    async verificarDadosArcoRecebidos() {
      try {
        if (typeof localStorage !== 'undefined') {
          const dadosArcoString = localStorage.getItem('dadosArcoParaModelador')
          const timestamp = localStorage.getItem('timestampArcoModelador')

          // Verificar se os dados são recentes (menos de 5 minutos)
          if (dadosArcoString && timestamp) {
            const agora = new Date().getTime()
            const timestampDados = parseInt(timestamp)
            const cincoMinutos = 5 * 60 * 1000

            if ((agora - timestampDados) < cincoMinutos) {
              const dadosArco = JSON.parse(dadosArcoString)

              // Usar os dados recebidos
              this.dadosPortal = dadosArco.dadosPortal
              this.analiseArcos = dadosArco.analiseArcos
              this.layoutsAutomaticos = dadosArco.layoutsAutomaticos
              this.dados = dadosArco.dadosConvertidos
              this.arcoAtual = dadosArco.numeroArco

              // Forçar tipo armazém
              this.tipoAtivo = 'armazem'

              // Marcar que os dados vieram do preview
              this.dadosVindosDoPreview = true

              // Limpar dados do localStorage após usar
              localStorage.removeItem('dadosArcoParaModelador')
              localStorage.removeItem('timestampArcoModelador')

              return true
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar dados do arco recebidos:', error)
      }
      return false
    },

    async carregarDadosAPI() {
      try {
        // Se já recebeu dados do preview, não precisar recarregar
        const dadosRecebidos = await this.verificarDadosArcoRecebidos()
        if (dadosRecebidos) {
          console.log('Usando dados recebidos do preview, pulando inicialização padrão')
          return
        }

        const response = await fetch('https://cloud.pce-eng.com.br/cloud/api/public/api/armazem/buscardado/130?celula=1&leitura=1&data=2025-08-07%2008:03:36', {
          headers: {
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2Nsb3VkLnBjZS1lbmcuY29tLmJyL2Nsb3VkL2FwaS9wdWJsaWMvYXBpL2xvZ2luIiwiaWF0IjoxNzUzNzA3MjMwLCJleHAiOjE3NTQ5MTY4MzAsIm5iZiI6MTc1MzcwNzIzMCwianRpIjoieG9oam1Vd1k4bDIzWW84NSIsInN1YiI6IjEzIiwicHJ2IjoiNTg3MDg2M2Q0YTYyZDc5MTQ0M2ZhZjkzNmZjMzY4MDMxZDExMGM0ZiIsInVzZXIiOnsiaWRfdXN1YXJpbyI6MTMsIm5tX3VzdWFyaW8iOiJJdmFuIEphY3F1ZXMiLCJlbWFpbCI6Iml2YW4uc2lsdmFAcGNlLWVuZy5jb20uYnIiLCJ0ZWxlZm9uZSI6bnVsbCwiY2VsdWxhciI6bnVsbCwic3RfdXN1YXJpbyI6IkEiLCJpZF9pbWFnZW0iOjM4LCJsb2dhZG8iOiJTIiwidXN1YXJpb3NfcGVyZmlzIjpbeyJpZF9wZXJmaWwiOjEwLCJubV9wZXJmaWwiOiJBZG1pbmlzdHJhZG9yIGRvIFBvcnRhbCIsImNkX3BlcmZpbCI6IkFETUlOUE9SVEEiLCJ0cmFuc2Fjb2VzIjpbXX1dLCJpbWFnZW0iOnsiaWRfaW1hZ2VtIjozOCwidHBfaW1hZ2VtIjoiVSIsImRzX2ltYWdlbSI6bnVsbCwiY2FtaW5obyI6InVwbG9hZHMvdXN1YXJpb3MvMTcyOTc3MjA3OV9yYl80NzA3LnBuZyIsImV4dGVuc2FvIjoicG5nIn19fQ.EgTIJSQ7fOU2qJKb7qLrDEDR03bDA78rywayrKWI_iM',
            'Content-Type': 'application/json'
          },
          timeout: 15000
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados da API: ${response.status} - ${response.statusText}`)
        }

        const data = await response.json()

        if (!data) {
          throw new Error('Resposta da API vazia')
        }

        // Armazenar dados originais da API
        this.dadosPortal = data

        // Analisar estrutura dos arcos baseada na nova estrutura da API
        const analise = this.analisarEstruturaArcos(data)
        this.analiseArcos = analise

        // Gerar layouts automáticos
        const layouts = LayoutManager.gerarLayoutAutomatico(analise)
        this.layoutsAutomaticos = layouts
        // Calcular dimensões ideais
        const dimensoes = this.calcularDimensoesIdeais(analise)
        this.dimensoesSVG = dimensoes
        // Converter dados para formato de renderização
        const dadosConvertidos = this.converterDadosParaRenderizacao(data, 1)
        this.dados = dadosConvertidos
      } catch (error) {
        console.error('Erro ao carregar dados da API:', error)
        this.error = this.tratarErroAPI(error)
      }
    },

    // Analisar estrutura dos arcos baseada na nova estrutura da API
    analisarEstruturaArcos(dados) {

      if (!dados.arcos) {
        return this.criarEstruturaMinima()
      }

      const estrutura = {
        totalArcos: 0,
        arcos: {},
        estatisticas: {
          totalPendulos: 0,
          totalSensores: 0
        }
      }

      // Processar cada arco
      Object.keys(dados.arcos).forEach(numeroArco => {
        const dadosArco = dados.arcos[numeroArco]
        const arcoNum = parseInt(numeroArco)

        estrutura.totalArcos = Math.max(estrutura.totalArcos, arcoNum)

        const infoArco = {
          numero: arcoNum,
          totalPendulos: 0,
          totalSensores: 0,
          pendulos: []
        }

        // Processar cada pêndulo no arco
        Object.keys(dadosArco).forEach(numeroPendulo => {
          const dadosPendulo = dadosArco[numeroPendulo]
          const penduloNum = parseInt(numeroPendulo)

          const infoPendulo = {
            numero: penduloNum,
            totalSensores: Object.keys(dadosPendulo).length
          }

          infoArco.pendulos.push(infoPendulo)
          infoArco.totalPendulos++
          infoArco.totalSensores += infoPendulo.totalSensores
        })

        // Ordenar pêndulos por número
        infoArco.pendulos.sort((a, b) => a.numero - b.numero)

        estrutura.arcos[arcoNum] = infoArco
        estrutura.estatisticas.totalPendulos += infoArco.totalPendulos
        estrutura.estatisticas.totalSensores += infoArco.totalSensores
      })
      return estrutura
    },

    // Converter dados da API para formato de renderização
    converterDadosParaRenderizacao(dadosAPI, numeroArco) {

      if (!dadosAPI.arcos || !dadosAPI.arcos[numeroArco]) {
        return { leitura: {} }
      }

      const dadosArco = dadosAPI.arcos[numeroArco]
      const leituraConvertida = {}

      // Converter estrutura: arcos[numeroArco][pendulo][sensor] -> leitura[pendulo][sensor]
      Object.keys(dadosArco).forEach(numeroPendulo => {
        const sensoresPendulo = dadosArco[numeroPendulo]
        leituraConvertida[numeroPendulo] = {}

        Object.keys(sensoresPendulo).forEach(numeroSensor => {
          const dadosSensor = sensoresPendulo[numeroSensor]
          // Manter o formato original do sensor: [temp, pontoQuente, preAlarme, falha, nivel]
          leituraConvertida[numeroPendulo][numeroSensor] = dadosSensor
        })
      })

      const resultado = {
        leitura: leituraConvertida,
        arcoAtual: numeroArco,
        timestamp: new Date().toISOString()
      }

      return resultado
    },

    criarEstruturaMinima() {
      return {
        totalArcos: 1,
        arcos: {
          1: {
            numero: 1,
            totalPendulos: 1,
            totalSensores: 1,
            pendulos: [{ numero: 1, totalSensores: 1 }]
          }
        },
        estatisticas: {
          totalPendulos: 1,
          totalSensores: 1
        }
      }
    },

    tratarErroAPI(error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            return 'Token de autenticação inválido ou expirado. Verifique as credenciais.'
          case 403:
            return 'Acesso negado. Verifique as permissões do token.'
          case 404:
            return 'Endpoint da API não encontrado. Verifique a URL.'
          case 500:
            return 'Erro interno do servidor. Tente novamente mais tarde.'
          default:
            return `Erro HTTP ${error.response.status}: ${error.response.statusText}`
        }
      } else if (error.request) {
        return 'Erro de conectividade. Verifique sua conexão com a internet.'
      } else {
        return error.message || 'Erro desconhecido ao carregar dados.'
      }
    },

    // Calcular dimensões ideais do SVG baseado na análise de todos os arcos
    calcularDimensoesIdeais(analiseArcos) {
      if (!analiseArcos) return { largura: 350, altura: 200 }

      let maxSensores = 0
      let maxPendulos = 0

      // Encontrar o máximo de sensores e pêndulos em todos os arcos
      Object.values(analiseArcos.arcos).forEach(arco => {
        maxPendulos = Math.max(maxPendulos, arco.totalPendulos)
        arco.pendulos.forEach(pendulo => {
          maxSensores = Math.max(maxSensores, pendulo.totalSensores)
        })
      })

      const escala_sensores = 16
      const dist_y_sensores = 12
      const margemSuperior = 30
      const margemInferior = 50
      const margemPendulo = 20

      const alturaBaseTelhado = 185
      const alturaSensores = maxSensores * dist_y_sensores + escala_sensores
      const alturaTotal = Math.max(
        alturaBaseTelhado,
        margemSuperior + alturaSensores + margemInferior + margemPendulo
      )

      const larguraMinima = 350
      const espacamentoPendulo = 50
      const larguraCalculada = Math.max(larguraMinima, (maxPendulos * espacamentoPendulo) + 100)

      return {
        largura: larguraCalculada,
        altura: Math.max(alturaTotal, 250)
      }
    },

    onTipoChange() {
      this.updateSVG()
    },

    onSiloChange() {
      this.updateSVG()
    },

    onArmazemChange() {
      this.updateSVG()
      // Atualizar modelo atual se estiver selecionado
      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].config = { ...this.configArmazem }
        this.salvarModelosAutomatico()
      }
    },

    onQuantidadeModelosChange() {
      const qtd = parseInt(this.quantidadeModelosArcos)
      const novosModelos = {}

      for (let i = 1; i <= qtd; i++) {
        let posicao, nome

        if (qtd === 1) {
          posicao = 'todos'
          nome = 'Modelo Único'
        } else if (qtd === 2) {
          if (i === 1) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          }
        } else if (qtd === 3) {
          if (i === 1) {
            posicao = 'frente_fundo'
            nome = 'Modelo Frente/Fundo'
          } else if (i === 2) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          }
        } else if (qtd === 4) {
          if (i === 1) {
            posicao = 'frente'
            nome = 'Modelo Frente'
          } else if (i === 2) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else if (i === 3) {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          } else {
            posicao = 'fundo'
            nome = 'Modelo Fundo'
          }
        }

        novosModelos[i] = this.modelosArcos[i] || {
          posicao,
          config: { ...this.configArmazem },
          nome
        }
      }

      this.modelosArcos = novosModelos

      // Se o modelo atual não existe mais, voltar para o primeiro
      if (this.modeloArcoAtual > qtd) {
        this.modeloArcoAtual = 1
        this.configArmazem = { ...this.modelosArcos[1].config }
      }

      this.salvarModelosAutomatico()
    },

    onModeloArcoChange() {
      if (this.modeloArcoAtual) {
        this.configArmazem = { ...this.modelosArcos[this.modeloArcoAtual].config }
        this.salvarModelosAutomatico()

        // Automação: navegar para arco representativo do modelo selecionado
        if (this.analiseArcos && this.modelosArcos[this.modeloArcoAtual]) {
          const posicaoModelo = this.modelosArcos[this.modeloArcoAtual].posicao
          const totalArcos = this.analiseArcos.totalArcos
          let arcoRepresentativo = 1

          if (this.quantidadeModelosArcos === 1) {
            arcoRepresentativo = this.arcoAtual
          } else if (this.quantidadeModelosArcos === 2) {
            if (posicaoModelo === 'impar') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            }
          } else if (this.quantidadeModelosArcos === 3) {
            if (posicaoModelo === 'frente_fundo') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            } else if (posicaoModelo === 'impar') {
              arcoRepresentativo = 3
            }
          } else if (this.quantidadeModelosArcos === 4) {
            if (posicaoModelo === 'frente') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            } else if (posicaoModelo === 'impar') {
              arcoRepresentativo = 3
            } else if (posicaoModelo === 'fundo') {
              arcoRepresentativo = totalArcos
            }
          }

          arcoRepresentativo = Math.max(1, Math.min(totalArcos, arcoRepresentativo))

          if (arcoRepresentativo !== this.arcoAtual) {
            this.mudarArco(arcoRepresentativo)
          }
        }
      }
    },

    onNomeModeloChange() {
      this.salvarModelosAutomatico()
    },

    onPosicaoArcoChange() {
      this.salvarModelosAutomatico()
    },

    getDescricaoModelo(modeloNum) {
      if (this.quantidadeModelosArcos === 1) {
        return 'todos'
      } else if (this.quantidadeModelosArcos === 2) {
        return modeloNum === 1 ? 'par' : 'impar'
      } else if (this.quantidadeModelosArcos === 3) {
        if (modeloNum === 1) return 'frente/fundo'
        else if (modeloNum === 2) return 'par'
        else return 'impar'
      } else if (this.quantidadeModelosArcos === 4) {
        if (modeloNum === 1) return 'frente'
        else if (modeloNum === 2) return 'par'
        else if (modeloNum === 3) return 'impar'
        else return 'fundo'
      }
      return ''
    },

    determinarPosicaoDoModelo(numeroModelo, quantidadeModelos) {
      if (quantidadeModelos === 1) {
        return 'todos'
      } else if (quantidadeModelos === 2) {
        return numeroModelo === 1 ? 'par' : 'impar'
      } else if (quantidadeModelos === 3) {
        if (numeroModelo === 1) return 'frente_fundo'
        else if (numeroModelo === 2) return 'par'
        else return 'impar'
      } else if (quantidadeModelos === 4) {
        if (numeroModelo === 1) return 'frente'
        else if (numeroModelo === 2) return 'par'
        else if (numeroModelo === 3) return 'impar'
        else return 'fundo'
      }
      return 'todos'
    },

    determinarModeloParaArco(numeroArco) {
      const totalArcos = this.analiseArcos?.totalArcos || 1
      const quantidadeModelos = Object.keys(this.modelosArcos || {}).length

      if (!this.modelosArcos || quantidadeModelos === 0) {
        return null
      }

      // 1 modelo: todos os arcos usam o mesmo modelo
      if (quantidadeModelos === 1) {
        return this.modelosArcos[1] || null
      }

      // 2 modelos: começa com ímpar (1º, 3º, 5º...), depois par (2º, 4º, 6º...)
      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1
        const posicaoProcurada = isImpar ? 'impar' : 'par'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }

      // 3 modelos: 1º e último = frente_fundo, depois par e ímpar intercalados
      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'frente_fundo') || this.modelosArcos[1] || null
        }
        // Para arcos intermediários: a partir do 2º arco, par primeiro, depois ímpar
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }

      // 4 modelos: 1º = frente, último = fundo, intermediários par e ímpar intercalados
      if (quantidadeModelos === 4) {
        if (numeroArco === 1) {
          return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'frente') || this.modelosArcos[1] || null
        }
        if (numeroArco === totalArcos) {
          return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === 'fundo') || this.modelosArcos[1] || null
        }
        // Para arcos intermediários: par primeiro, depois ímpar
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(this.modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || this.modelosArcos[1] || null
      }

      return this.modelosArcos[1] || null
    },

    getBadgeClass() {
      if (!this.analiseArcos) return 'badge bg-info'

      const classes = ['badge']

      if (this.quantidadeModelosArcos === 1) {
        classes.push('bg-info')
      } else if (this.quantidadeModelosArcos === 2) {
        classes.push(this.arcoAtual % 2 === 1 ? 'bg-warning' : 'bg-primary')
      } else if (this.quantidadeModelosArcos === 3) {
        if (this.arcoAtual === 1 || this.arcoAtual === this.analiseArcos.totalArcos) {
          classes.push('bg-success')
        } else {
          classes.push(this.arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning')
        }
      } else if (this.quantidadeModelosArcos === 4) {
        if (this.arcoAtual === 1) {
          classes.push('bg-success')
        } else if (this.arcoAtual === this.analiseArcos.totalArcos) {
          classes.push('bg-danger')
        } else {
          classes.push(this.arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning')
        }
      }

      return classes.join(' ')
    },

    getBadgeText() {
      if (!this.analiseArcos) return 'TODOS'

      if (this.quantidadeModelosArcos === 1) {
        return 'TODOS'
      } else if (this.quantidadeModelosArcos === 2) {
        return this.arcoAtual % 2 === 1 ? 'ÍMPAR' : 'PAR'
      } else if (this.quantidadeModelosArcos === 3) {
        if (this.arcoAtual === 1 || this.arcoAtual === this.analiseArcos.totalArcos) {
          return 'F/F'
        } else {
          return this.arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR'
        }
      } else if (this.quantidadeModelosArcos === 4) {
        if (this.arcoAtual === 1) {
          return 'FRENTE'
        } else if (this.arcoAtual === this.analiseArcos.totalArcos) {
          return 'FUNDO'
        } else {
          return this.arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR'
        }
      }

      return 'TODOS'
    },

    mudarArco(novoArco, forcarAplicarConfiguracao = true) {
      this.arcoAtual = novoArco

      // Se estiver editando um modelo específico, não aplicar configuração automática
      if (forcarAplicarConfiguracao && !this.modeloArcoAtual) {
        const modeloParaArco = this.determinarModeloParaArco(novoArco)
        if (modeloParaArco && modeloParaArco.config) {
          this.configArmazem = { ...modeloParaArco.config }
        }
      }

      if (this.dadosPortal) {
        const dadosConvertidos = this.converterDadosParaRenderizacao(this.dadosPortal, novoArco)
        this.dados = dadosConvertidos
      }

      // Atualizar o SVG com o novo arco
      this.updateSVG()
    },

    obterDeslocamentoVerticalPadrao(tipoFundo) {
      switch (tipoFundo) {
        case 0: return 0  // Reto
        case 1: return 7  // Funil V
        case 2: return 10 // Duplo V
        default: return 0
      }
    },

    obterLogicaDistribuicao() {
      const logicas = {
        1: {
          nome: 'Modelo Único',
          descricao: 'Todos os arcos utilizam o mesmo modelo',
          aplicacao: 'todos_arcos'
        },
        2: {
          nome: 'Par/Ímpar',
          descricao: 'Arcos pares (2º, 4º, 6º...) e ímpares (1º, 3º, 5º...)',
          aplicacao: 'par_impar'
        },
        3: {
          nome: 'Frente/Fundo + Par/Ímpar',
          descricao: 'Frente e fundo iguais, meio alternado par/ímpar',
          aplicacao: 'frente_fundo_par_impar'
        },
        4: {
          nome: 'Frente/Par/Ímpar/Fundo',
          descricao: 'Primeiro único, último único, meio alternado',
          aplicacao: 'frente_par_impar_fundo'
        }
      }
      return logicas[this.quantidadeModelosArcos] || logicas[1]
    },

    prepararModelosParaSalvar() {
      const modelosPreparados = {}

      for (let i = 1; i <= this.quantidadeModelosArcos; i++) {
        const modelo = this.modelosArcos[i]
        if (modelo) {
          modelosPreparados[i] = {
            numero: i,
            nome: modelo.nome || `Modelo ${i}`,
            posicao: modelo.posicao || this.determinarPosicaoDoModelo(i, this.quantidadeModelosArcos),
            configuracao: {
              ...modelo.config || this.configArmazem
            },
            status: this.modelosSalvos[i] ? 'salvo' : 'pendente',
            timestampUltimaEdicao: new Date().toISOString()
          }
        }
      }

      return modelosPreparados
    },

    gerarMapeamentoArcos() {
      const mapeamento = {}
      const totalArcos = this.analiseArcos?.totalArcos || 1

      for (let arco = 1; arco <= totalArcos; arco++) {
        const modeloParaArco = this.determinarModeloParaArco(arco)
        mapeamento[arco] = {
          numeroArco: arco,
          modeloUtilizado: modeloParaArco ? {
            numero: Object.keys(this.modelosArcos).find(key =>
              this.modelosArcos[key] === modeloParaArco
            ),
            nome: modeloParaArco.nome,
            posicao: modeloParaArco.posicao
          } : null,
          pendulos: this.analiseArcos?.arcos[arco]?.totalPendulos || 0,
          sensores: this.analiseArcos?.arcos[arco]?.totalSensores || 0
        }
      }

      return mapeamento
    },

    gerarResumoConfiguracao(config) {
      const totalArcos = config.estruturaArmazem.totalArcos
      const totalModelos = config.configModelos.quantidadeModelos
      const logica = config.configModelos.logicaDistribuicao.nome

      return `Armazém "${config.nome}" salvo!\n\n` +
        `📊 Estrutura: ${totalArcos} arcos, ${totalModelos} modelo(s)\n` +
        `🎯 Lógica: ${logica}\n` +
        `⚙️ Mapeamento completo gerado para todos os arcos`
    },

    salvarModeloAtual() {
      if (!this.modeloArcoAtual) {
        this.mostrarToast('Selecione um modelo para salvar!', 'warning')
        return
      }

      const modeloParaSalvar = {
        ...this.modelosArcos[this.modeloArcoAtual],
        config: { ...this.configArmazem }
      }

      this.modelosArcos[this.modeloArcoAtual] = modeloParaSalvar
      this.modelosSalvos[this.modeloArcoAtual] = modeloParaSalvar

      this.salvarModelosAutomatico()

      this.mostrarToast(`Modelo ${this.modeloArcoAtual} (${modeloParaSalvar.nome}) salvo com sucesso!`, 'success')
    },

    salvarModelosAutomatico() {
      if (typeof localStorage !== 'undefined') {
        const configCompleta = {
          quantidadeModelos: this.quantidadeModelosArcos,
          modelosArcos: this.modelosArcos,
          modeloAtual: this.modeloArcoAtual,
          timestamp: new Date().toISOString(),
          versao: '2.0',
          tipo: 'configuracao_armazem_completa'
        }

        localStorage.setItem('configArmazem', JSON.stringify(configCompleta))
      }
    },

    resetSiloField(campo, valor) {
      this.configSilo[campo] = valor
      this.updateSVG()
    },

    resetArmazemField(campo, valor) {
      this.configArmazem[campo] = valor
      this.updateSVG()
      this.onArmazemChange()
    },

    resetarPadrao() {
      if (this.tipoAtivo === 'silo') {
        this.configSilo = {
          lb: 200,
          hs: 180,
          hb: 15,
          eb: 5,
          escala_sensores: 16,
          dist_y_sensores: 12,
          pos_x_cabos_uniforme: 1,
          pos_x_cabo: [50, 25],
          pos_y_cabo: [160, 160, 160, 160, 160],
          aeradores_ativo: false,
          na: 4,
          ds: 30,
          dy: 0,
          da: 35
        }
      } else {
        this.resetarModelosParaPadrao()
      }
      this.updateSVG()
    },

    resetarModelosParaPadrao() {
      const configPadrao = {
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 5,
        lf: 250,
        le: 15,
        ht: 50,
        tipo_telhado: 1,
        curvatura_topo: 30,
        pontas_redondas: false,
        raio_pontas: 15,
        estilo_laterais: 'reta',
        curvatura_laterais: 30,
        tipo_fundo: 0,
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
        largura_abertura_v: 20,
        altura_duplo_v: 22,
        posicao_v_esquerdo: -1,
        posicao_v_direito: 1,
        largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0
      }

      this.configArmazem = { ...configPadrao }
      this.quantidadeModelosArcos = 1
      this.modelosArcos = {
        1: {
          posicao: 'todos',
          config: { ...configPadrao },
          nome: 'Modelo Único'
        }
      }
      this.modeloArcoAtual = null
      this.modelosSalvos = {}
    },

    salvarConfiguracao() {
      if (!this.nomeConfiguracao.trim()) {
        this.mostrarToast('Digite um nome para salvar a configuração!', 'warning')
        return
      }

      if (typeof localStorage !== 'undefined') {
        if (this.tipoAtivo === 'silo') {
          localStorage.setItem('configSilo', JSON.stringify(this.configSilo))
          localStorage.setItem(`configSilo_${this.nomeConfiguracao}`, JSON.stringify(this.configSilo))
          this.mostrarToast(`Configuração Silo "${this.nomeConfiguracao}" salva com sucesso!`, 'success')
        } else {
          // Para armazém, criar hierarquia completa
          const hierarquiaCompleta = {
            // Metadados da configuração
            nome: this.nomeConfiguracao,
            timestamp: new Date().toISOString(),
            versao: '3.0',
            tipo: 'configuracao_armazem_hierarquica',

            // Informações da estrutura do armazém
            estruturaArmazem: {
              totalArcos: this.analiseArcos?.totalArcos || 1,
              arcosDetalhados: this.analiseArcos?.arcos || {},
              estatisticas: this.analiseArcos?.estatisticas || { totalPendulos: 0, totalSensores: 0 }
            },

            // Configuração dos modelos
            configModelos: {
              quantidadeModelos: this.quantidadeModelosArcos,
              logicaDistribuicao: this.obterLogicaDistribuicao(),
              modelosDefinidos: this.prepararModelosParaSalvar()
            },

            // Layouts automáticos se disponível
            layoutsAutomaticos: this.layoutsAutomaticos || {},

            // Configuração padrão atual
            configuracaoPadrao: { ...this.configArmazem },

            // Informações de distribuição de modelos por arco
            mapeamentoArcos: this.gerarMapeamentoArcos()
          }

          localStorage.setItem('configArmazem', JSON.stringify(hierarquiaCompleta))
          localStorage.setItem(`configArmazem_${this.nomeConfiguracao}`, JSON.stringify(hierarquiaCompleta))

          const resumo = this.gerarResumoConfiguracao(hierarquiaCompleta)
          this.mostrarToast(resumo, 'success')

          // Não resetar após salvar - manter contexto atual
          this.nomeConfiguracao = ''
        }

        this.forceUpdateLista++
      }
    },

    carregarConfiguracao(nome = null) {
      const nomeConfig = nome || this.nomeConfiguracao
      if (!nomeConfig) return

      if (typeof localStorage !== 'undefined') {
        const chave = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_${nomeConfig}`
        const configSalva = localStorage.getItem(chave)

        if (configSalva) {
          const dadosCarregados = JSON.parse(configSalva)

          if (this.tipoAtivo === 'silo') {
            this.configSilo = dadosCarregados
            this.mostrarToast('Configuração do silo carregada com sucesso!', 'success')
          } else {
            // Verificar tipo de configuração
            if (dadosCarregados.tipo === 'configuracao_armazem_hierarquica') {
              // Configuração hierárquica nova (v3.0+)
              this.carregarConfiguracaoHierarquica(dadosCarregados, nomeConfig)
            } else if (dadosCarregados.modelosArcos && dadosCarregados.tipo === 'configuracao_armazem_completa') {
              // Configuração completa antiga (v2.0)
              this.carregarConfiguracaoCompleta(dadosCarregados, nomeConfig)
            } else {
              // Configuração simples (formato antigo v1.0) - converter
              this.carregarConfiguracaoSimples(dadosCarregados, nomeConfig)
            }
          }

          if (!nome) {
            this.nomeConfiguracao = nomeConfig
          }
          this.updateSVG()
        } else {
          this.mostrarToast('Configuração não encontrada!', 'error')
        }
      }
    },

    carregarConfiguracaoHierarquica(dados, nomeConfig) {

      // Restaurar configuração dos modelos
      const configModelos = dados.configModelos
      this.quantidadeModelosArcos = configModelos.quantidadeModelos || 1

      // Converter modelos do formato hierárquico para o formato de trabalho
      const modelosConvertidos = {}
      const modelosSalvosConvertidos = {}

      Object.keys(configModelos.modelosDefinidos || {}).forEach(key => {
        const modeloHierarquico = configModelos.modelosDefinidos[key]
        const modeloConvertido = {
          nome: modeloHierarquico.nome,
          posicao: modeloHierarquico.posicao,
          config: modeloHierarquico.configuracao
        }
        modelosConvertidos[key] = modeloConvertido

        if (modeloHierarquico.status === 'salvo') {
          modelosSalvosConvertidos[key] = modeloConvertido
        }
      })

      this.modelosArcos = modelosConvertidos
      this.modelosSalvos = modelosSalvosConvertidos
      this.modeloArcoAtual = null

      // Restaurar layouts se disponível
      if (dados.layoutsAutomaticos) {
        this.layoutsAutomaticos = dados.layoutsAutomaticos
      }

      // Aplicar configuração para o arco atual
      setTimeout(() => {
        const modeloParaArcoAtual = this.determinarModeloParaArco(this.arcoAtual)
        if (modeloParaArcoAtual && modeloParaArcoAtual.config) {
          this.configArmazem = { ...modeloParaArcoAtual.config }
        } else if (dados.configuracaoPadrao) {
          this.configArmazem = { ...dados.configuracaoPadrao }
        }
      }, 100)

      const totalArcos = dados.estruturaArmazem?.totalArcos || 'N/A'
      const logica = configModelos.logicaDistribuicao?.nome || 'Padrão'

      this.mostrarToast(
        `Configuração hierárquica "${nomeConfig}" carregada!\n` +
        `📊 ${totalArcos} arcos, ${this.quantidadeModelosArcos} modelo(s)\n` +
        `🎯 Lógica: ${logica}`,
        'success'
      )
    },

    carregarConfiguracaoCompleta(dadosCarregados, nomeConfig) {
      // Carregamento de configuração completa com modelos (v2.0)
      this.quantidadeModelosArcos = dadosCarregados.quantidadeModelos || 1
      this.modelosArcos = dadosCarregados.modelosArcos || {}
      this.modelosSalvos = dadosCarregados.modelosArcos || {}
      this.modeloArcoAtual = null

      // Validar e corrigir posições dos modelos se necessário
      Object.keys(this.modelosArcos).forEach(key => {
        const numeroModelo = parseInt(key)
        const posicaoCorreta = this.determinarPosicaoDoModelo(numeroModelo, this.quantidadeModelosArcos)
        if (this.modelosArcos[key].posicao !== posicaoCorreta) {
          this.modelosArcos[key].posicao = posicaoCorreta
        }
      })

      setTimeout(() => {
        const modeloParaArcoAtual = this.determinarModeloParaArco(this.arcoAtual)
        if (modeloParaArcoAtual && modeloParaArcoAtual.config) {
          this.configArmazem = { ...modeloParaArcoAtual.config }
        } else {
          const primeiroModelo = dadosCarregados.modelosArcos[1]
          if (primeiroModelo && primeiroModelo.config) {
            this.configArmazem = { ...primeiroModelo.config }
          }
        }
      }, 100)

      this.mostrarToast(`Configuração completa "${nomeConfig}" carregada com ${this.quantidadeModelosArcos} modelo(s)!`, 'success')
    },

    carregarConfiguracaoSimples(dadosCarregados, nomeConfig) {
      // Configuração simples (formato antigo) - converter para novo formato
      this.configArmazem = dadosCarregados
      this.quantidadeModelosArcos = 1
      const modeloUnico = {
        posicao: 'todos',
        config: dadosCarregados,
        nome: 'Modelo Único'
      }
      this.modelosArcos = { 1: modeloUnico }
      this.modelosSalvos = { 1: modeloUnico }
      this.modeloArcoAtual = null
      this.mostrarToast(`Configuração "${nomeConfig}" convertida para o novo formato hierárquico!`, 'info')
    },

    deletarConfiguracao(nome) {
      if (typeof localStorage !== 'undefined') {
        const chave = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_${nome}`
        localStorage.removeItem(chave)
        this.mostrarToast(`Configuração "${nome}" removida com sucesso!`, 'success')
        this.forceUpdateLista++
        if (this.nomeConfiguracao === nome) {
          this.nomeConfiguracao = ''
        }
      }
    },

    // Sistema de Toast Notifications
    mostrarToast(mensagem, tipo = 'info') {
      const toast = document.createElement('div')
      const icones = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      const cores = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
      }

      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo] || cores.info};
        color: ${tipo === 'warning' ? '#000' : '#fff'};
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 99999;
        font-size: 14px;
        max-width: 350px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
      `

      toast.innerHTML = `
        ${icones[tipo] || icones.info} ${mensagem}
      `

      // Adicionar animação CSS
      const style = document.createElement('style')
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)

      document.body.appendChild(toast)

      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse'
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove()
          }
          if (style.parentNode) {
            style.remove()
          }
        }, 300)
      }, 4000)
    },

    // Métodos para configuração do preview
    aplicarConfiguracaoNoPreview() {
      if (!this.configuracaoPreviewSelecionada) {
        this.limparConfiguracaoPreview()
        return
      }

      if (typeof localStorage !== 'undefined') {
        const chave = `configArmazem_${this.configuracaoPreviewSelecionada}`
        const configSalva = localStorage.getItem(chave)

        if (configSalva) {
          try {
            const configData = JSON.parse(configSalva)

            if (configData.tipo === 'configuracao_armazem_hierarquica' && configData.modelosArcos) {
              // Determinar qual modelo aplicar baseado no arco atual
              const modeloParaArco = this.determinarModeloParaArcoComConfig(this.arcoAtual, configData.modelosArcos, configData.quantidadeModelos)

              if (modeloParaArco && modeloParaArco.config) {
                this.configPreviewAplicada = modeloParaArco.config
                this.mostrarToast(`Preview: ${modeloParaArco.nome} aplicado`, 'info')
              }
            } else {
              // Configuração simples
              this.configPreviewAplicada = configData
              this.mostrarToast(`Preview: ${this.configuracaoPreviewSelecionada} aplicado`, 'info')
            }

            this.updateSVG()
          } catch (error) {
            console.error('Erro ao aplicar configuração no preview:', error)
            this.mostrarToast('Erro ao carregar configuração no preview', 'error')
          }
        }
      }
    },

    limparConfiguracaoPreview() {
      this.configuracaoPreviewSelecionada = ''
      this.configPreviewAplicada = null
      this.updateSVG()
      this.mostrarToast('Preview voltou ao padrão', 'info')
    },

    determinarModeloParaArcoComConfig(numeroArco, modelosArcos, quantidadeModelos) {
      const totalArcos = this.analiseArcos?.totalArcos || 1

      if (quantidadeModelos === 1) {
        return Object.values(modelosArcos)[0] || null
      }

      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1
        const posicaoProcurada = isImpar ? 'impar' : 'par'
        return Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || Object.values(modelosArcos)[0] || null
      }

      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          return Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === 'frente_fundo') || Object.values(modelosArcos)[0] || null
        }
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || Object.values(modelosArcos)[0] || null
      }

      if (quantidadeModelos === 4) {
        if (numeroArco === 1) {
          return Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === 'frente') || Object.values(modelosArcos)[0] || null
        }
        if (numeroArco === totalArcos) {
          return Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === 'fundo') || Object.values(modelosArcos)[0] || null
        }
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'
        return Object.values(modelosArcos).find(modelo => modelo && modelo.posicao === posicaoProcurada) || Object.values(modelosArcos)[0] || null
      }

      return Object.values(modelosArcos)[0] || null
    },

    corFaixaExata(t) {
      if (t === -1000) return '#ff0000'
      if (t < 12) return '#0384fc'
      else if (t < 15) return '#03e8fc'
      else if (t < 17) return '#03fcbe'
      else if (t < 21) return '#07fc03'
      else if (t < 25) return '#c3ff00'
      else if (t < 27) return '#fcf803'
      else if (t < 30) return '#ffb300'
      else if (t < 35) return '#ff2200'
      else if (t < 50) return '#ff0090'
      else return '#f700ff'
    },

    renderSensoresArmazem() {
      if (!this.layoutsAutomaticos || !this.analiseArcos) return ''

      let elementos = ''
      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`]
      const arcoInfo = this.analiseArcos.arcos[this.arcoAtual]

      if (!layoutArco || !arcoInfo) return ''

      // Usar configuração aplicada se disponível, senão usar valores padrão
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      const escala_sensores = config.escala_sensores || 16
      const dist_y_sensores = config.dist_y_sensores || 12
      const dist_x_sensores = config.dist_x_sensores || 0
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      const pb = (config.pb || this.alturaSVG - 50) + (this.alturaSVG < 300 ? 0 : 50)
      const yPendulo = pb + 15 + posicao_vertical

      const totalCabos = arcoInfo.pendulos.length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      arcoInfo.pendulos.forEach((pendulo, index) => {
        const xCaboBase = layoutArco.desenho_sensores.pos_x_cabo[index]
        const distanciaDoMeio = index - indiceCentral
        const deslocamentoX = distanciaDoMeio * dist_x_sensores
        const xCabo = xCaboBase + posicao_horizontal + deslocamentoX
        const numSensores = pendulo.totalSensores

        // Retângulo do nome do pêndulo
        elementos += `
          <rect
            id="C${index + 1}"
            x="${xCabo - escala_sensores / 2}"
            y="${yPendulo}"
            width="${escala_sensores}"
            height="${escala_sensores / 2}"
            rx="2"
            ry="2"
            fill="#3A78FD"
          />
        `

        // Texto do nome do pêndulo
        elementos += `
          <text
            id="TC${index + 1}"
            x="${xCabo}"
            y="${yPendulo + escala_sensores / 4}"
            text-anchor="middle"
            dominant-baseline="central"
            font-weight="bold"
            font-size="${escala_sensores * 0.4 - 0.5}"
            font-family="Arial"
            fill="white"
          >
            P${pendulo.numero}
          </text>
        `

        // Sensores
        for (let s = 1; s <= numSensores; s++) {
          const ySensor = yPendulo - dist_y_sensores * s - 25 - afastamento_vertical_pendulo

          if (ySensor > 10 && ySensor < (this.alturaSVG - 60)) {
            // Retângulo do sensor
            elementos += `
              <rect
                id="C${index + 1}S${s}"
                x="${xCabo - escala_sensores / 2}"
                y="${ySensor}"
                width="${escala_sensores}"
                height="${escala_sensores / 2}"
                rx="2"
                ry="2"
                fill="#ccc"
                stroke="black"
                stroke-width="1"
              />
            `

            // Texto do valor do sensor
            elementos += `
              <text
                id="TC${index + 1}S${s}"
                x="${xCabo}"
                y="${ySensor + escala_sensores / 4}"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 0.5}"
                font-family="Arial"
                fill="black"
              >
                0
              </text>
            `

            // Nome do sensor
            elementos += `
              <text
                id="TIND${index + 1}S${s}"
                x="${xCabo - escala_sensores / 2 - 2}"
                y="${ySensor + escala_sensores / 4}"
                text-anchor="end"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 1.5}"
                font-family="Arial"
                fill="black"
              >
                S${s}
              </text>
            `
          }
        }
      })

      return elementos
    },

    atualizarSensores() {
      if (!this.dados?.leitura || !this.analiseArcos || !this.layoutsAutomaticos) return

      const layoutArco = this.layoutsAutomaticos[`arco_${this.arcoAtual}`]
      if (!layoutArco) return

      // Usar configuração aplicada se disponível
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      const escala_sensores = config.escala_sensores || 16
      const dist_y_sensores = config.dist_y_sensores || 12
      const dist_x_sensores = config.dist_x_sensores || 0
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      const pb = (config.pb || this.alturaSVG - 50) + (this.alturaSVG < 300 ? 0 : 50)
      const yPendulo = pb + 15 + posicao_vertical

      const totalCabos = Object.keys(this.dados.leitura).length
      const indiceCentral = Math.floor((totalCabos - 1) / 2)

      // Aguardar um pouco para garantir que o DOM foi renderizado
      this.$nextTick(() => {
        Object.entries(this.dados.leitura).forEach(([numeroPendulo, sensores], penduloIndex) => {
          const xCaboBase = layoutArco.desenho_sensores.pos_x_cabo[penduloIndex]
          const distanciaDoMeio = penduloIndex - indiceCentral
          const deslocamentoX = distanciaDoMeio * dist_x_sensores
          const xCabo = xCaboBase + posicao_horizontal + deslocamentoX

          // Atualizar posição do pêndulo
          const pendulo = document.getElementById(`C${penduloIndex + 1}`)
          const textoPendulo = document.getElementById(`TC${penduloIndex + 1}`)
          if (pendulo && textoPendulo) {
            pendulo.setAttribute('x', xCabo - escala_sensores / 2)
            pendulo.setAttribute('y', yPendulo)
            textoPendulo.setAttribute('x', xCabo)
            textoPendulo.setAttribute('y', yPendulo + escala_sensores / 4)
            textoPendulo.setAttribute('font-size', escala_sensores * 0.4 - 0.5)
          }

          Object.entries(sensores).forEach(([numeroSensor, dadosSensor]) => {
            if (!Array.isArray(dadosSensor) || dadosSensor.length < 5) return

            const s = parseInt(numeroSensor)
            const [temp, , , falha, nivel] = dadosSensor
            const ySensor = yPendulo - dist_y_sensores * s - 25 - afastamento_vertical_pendulo

            const rec = document.getElementById(`C${penduloIndex + 1}S${numeroSensor}`)
            const txt = document.getElementById(`TC${penduloIndex + 1}S${numeroSensor}`)
            const nomeTexto = document.getElementById(`TIND${penduloIndex + 1}S${numeroSensor}`)

            if (!rec || !txt || !nomeTexto) return

            // Atualizar posicionamento
            rec.setAttribute('x', xCabo - escala_sensores / 2)
            rec.setAttribute('y', ySensor)
            rec.setAttribute('width', escala_sensores)
            rec.setAttribute('height', escala_sensores / 2)

            txt.setAttribute('x', xCabo)
            txt.setAttribute('y', ySensor + escala_sensores / 4)
            txt.setAttribute('font-size', escala_sensores * 0.4 - 0.5)

            nomeTexto.setAttribute('x', xCabo - escala_sensores / 2 - 2)
            nomeTexto.setAttribute('y', ySensor + escala_sensores / 4)
            nomeTexto.setAttribute('font-size', escala_sensores * 0.4 - 1.5)

            // Atualizar dados com verificação de nível
            txt.textContent = falha ? "ERRO" : (parseFloat(temp) || 0).toFixed(1)
            if (!nivel || temp == 0) {
              rec.setAttribute("fill", "#e6e6e6")
              txt.setAttribute("fill", "black")
            } else {
              const cor = this.corFaixaExata(parseFloat(temp) || 0)
              rec.setAttribute("fill", cor)
              txt.setAttribute("fill", cor === "#ff2200" ? "white" : "black")
            }
          })
        })
      })
    },

    updateSVG() {
      this.calcularDimensoesSVG()
      this.generateSVG()

      // Se há dados de sensores, atualizar após renderização
      if (this.tipoAtivo === 'armazem' && this.dados) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.atualizarSensores()
          }, 100)
        })
      }
    },

    calcularDimensoesSVG() {
      if (this.tipoAtivo === 'silo') {
        this.larguraSVG = this.configSilo.lb + (this.configSilo.aeradores_ativo ? this.configSilo.ds * 2 + 68 : 0)
        this.alturaSVG = this.configSilo.hs + this.configSilo.hb * 1.75
      } else {
        // Para armazém, calcular dimensões baseadas no conteúdo e responsividade
        const larguraBase = Math.max(this.configArmazem.lb, 300)
        const alturaBase = Math.max(this.configArmazem.pb + this.configArmazem.ht + 50, 200)

        // Ajustar para mobile se necessário
        if (this.isMobile) {
          // Em mobile, garantir proporções adequadas
          const aspectRatio = larguraBase / alturaBase
          if (aspectRatio > 2) {
            // Se muito largo, ajustar altura
            this.larguraSVG = larguraBase
            this.alturaSVG = Math.max(alturaBase, larguraBase / 1.8)
          } else {
            this.larguraSVG = larguraBase
            this.alturaSVG = alturaBase
          }
        } else {
          this.larguraSVG = larguraBase
          this.alturaSVG = alturaBase
        }
      }
    },

    generateSVG() {
      if (this.tipoAtivo === 'silo') {
        this.svgContent = this.renderSilo()
      } else {
        this.svgContent = this.renderArmazem() + this.renderSensoresArmazem()
      }
    },

    renderSilo() {
      const { lb, hs, hb, eb } = this.configSilo
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`

      const transformSilo = this.configSilo.aeradores_ativo ? `translate(${this.configSilo.ds + 34}, 0)` : ""

      let svg = `
        <style>
          .sensor-element, .pendulo-element, text, rect {
            transition: all 0.15s ease-out;
          }
        </style>
        <g transform="${transformSilo}">
          <polygon fill="#E7E7E7" points="${points}" />
          <path
            fill="#999999"
            d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
            transform="scale(${lb / 152}, ${hb / 15})"
          />
          <ellipse fill="#999999" cx="${lb / 2}" cy="${hs}" rx="${lb / 2}" ry="${hb}" />
          <ellipse fill="#CCCCCC" cx="${lb / 2}" cy="${hs - eb}" rx="${lb / 2}" ry="${hb}" />
        </g>
      `

      if (this.configSilo.aeradores_ativo) {
        svg += this.renderAeradoresSilo()
      }

      return svg
    },

    renderAeradoresSilo() {
      const { na, ds, dy, da, lb, hs } = this.configSilo
      const posY = hs + dy - 30
      const posX = lb + ds * 2 - 31
      let aeradores = ''

      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
      const angles = [0, 60, 120, 180, 240, 300]

      for (let id = 1; id <= na; id++) {
        let transform = ""
        if (id === 1) transform = `translate(-73, ${posY})`
        else if (id === 2) transform = `translate(${posX}, ${posY})`
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`

        aeradores += `
          <g transform="${transform}">
            <circle cx="${70 + 12.5 + 3.5}" cy="24" r="10" fill="#c5c5c5" />
            <rect x="${70 + 3.5}" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
            <text x="${70 + 12.5 + 3.5}" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="6.5" font-family="Arial" fill="white">AE-${id}</text>
            <g>
              ${angles.map(angle =>
          `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},86.35,24.05)"`} />`
        ).join('')}
            </g>
          </g>
        `
      }

      return aeradores
    },

    renderArmazem() {
      return `
        <style>
          .sensor-element, .pendulo-element, text, rect {
            transition: all 0.15s ease-out;
          }
        </style>
      ` + this.renderTelhado() + this.renderFundoArmazem()
    },

    renderTelhado() {
      const config = this.configPreviewAplicada || this.configArmazem
      const {
        tipo_telhado,
        curvatura_topo,
        pb,
        lb,
        hb,
        hf,
        lf,
        le,
        ht,
        tipo_fundo,
        pontas_redondas,
        raio_pontas,
        estilo_laterais,
        curvatura_laterais
      } = config

      if (tipo_telhado === 1) {
        // Telhado Pontudo - aplicar modificações de curvatura lateral
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 7
        }

        // Pontos base do modelo padrão
        const p1 = [(lb - lf) / 2, pb - hf + extensao]
        const p2 = [le, pb - hb + extensao]
        const p3 = [le, pb - ht]
        const p4 = [lb / 2, 1]
        const p5 = [lb - le, pb - ht]
        const p6 = [lb - le, pb - hb + extensao]
        const p7 = [lb - (lb - lf) / 2, pb - hf + extensao]

        // Aplicar modificações baseadas no modelo padrão
        if (pontas_redondas || estilo_laterais !== 'reta') {
          const raio = raio_pontas || 15
          const curvaLateral = curvatura_laterais || 30

          let pathTelhado = `M ${p1[0]} ${p1[1]}`

          // Lateral esquerda - seguir exatamente o modelo padrão
          pathTelhado += ` L ${p2[0]} ${p2[1]}`

          // Aplicar curvatura lateral esquerda baseada no modelo padrão
          if (estilo_laterais === 'parede_para_fora') {
            pathTelhado += ` Q ${p2[0] + curvaLateral} ${p2[1]} ${p3[0]} ${p3[1]}`
          } else if (estilo_laterais === 'parede_para_dentro') {
            pathTelhado += ` Q ${p2[0] - curvaLateral} ${p2[1]} ${p3[0]} ${p3[1]}`
          } else {
            pathTelhado += ` L ${p3[0]} ${p3[1]}`
          }

          // Ponto do topo (sempre igual no modelo padrão)
          pathTelhado += ` L ${p4[0]} ${p4[1]}`

          // Aplicar curvatura lateral direita baseada no modelo padrão
          if (estilo_laterais === 'parede_para_fora') {
            pathTelhado += ` Q ${p6[0] - curvaLateral} ${p6[1]} ${p5[0]} ${p5[1]}`
          } else if (estilo_laterais === 'parede_para_dentro') {
            pathTelhado += ` Q ${p6[0] + curvaLateral} ${p6[1]} ${p5[0]} ${p5[1]}`
          } else {
            pathTelhado += ` L ${p5[0]} ${p5[1]}`
          }

          // Lateral direita - seguir exatamente o modelo padrão
          pathTelhado += ` L ${p6[0]} ${p6[1]}`

          // Aplicar pontas redondas apenas nas pontas finais se habilitado
          if (pontas_redondas) {
            pathTelhado += ` Q ${p7[0]} ${p7[1] + raio} ${p7[0]} ${p7[1]}`
          } else {
            pathTelhado += ` L ${p7[0]} ${p7[1]}`
          }

          pathTelhado += ` Z`

          return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" d="${pathTelhado}" />`
        } else {
          // Modelo padrão sem modificações
          const pathTelhado = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')}`
          return `<polygon fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" points="${pathTelhado}" />`
        }
      } else if (tipo_telhado === 2) {
        // Telhado Arredondado - manter formato padrão sem curvatura lateral
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        // Formato padrão arredondado sem modificações laterais
        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` Q ${lb / 2} ${1 - curvatura_topo} ${lb - le} ${pb - ht}`
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" d="${pathTelhado}" />`
      } else if (tipo_telhado === 3) {
        // Telhado em Arco - manter formato padrão sem curvatura lateral
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        // Formato padrão arco sem modificações laterais
        let pathTelhado = `M ${(lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` L ${le} ${pb - hb + extensao}`
        pathTelhado += ` L ${le} ${pb - ht}`
        pathTelhado += ` A ${(lb - le * 2) / 2} ${curvatura_topo} 0 0 1 ${lb - le} ${pb - ht}`
        pathTelhado += ` L ${lb - le} ${pb - hb + extensao}`
        pathTelhado += ` L ${lb - (lb - lf) / 2} ${pb - hf + extensao}`
        pathTelhado += ` Z`

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" d="${pathTelhado}" />`
      }

      return ''
    },

    renderFundoArmazem() {
      const config = this.configPreviewAplicada || this.configArmazem
      const { tipo_fundo } = config

      if (tipo_fundo === 0) {
        return this.renderBaseNormal()
      } else if (tipo_fundo === 1) {
        return this.renderBaseFunilV()
      } else if (tipo_fundo === 2) {
        return this.renderBaseDuploV()
      }

      return ''
    },

    renderBaseNormal() {
      const config = this.configPreviewAplicada || this.configArmazem
      const {
        pb, lb, hb, le, lf,
        altura_fundo_reto = 10,
        deslocamento_horizontal_fundo = 0,
        deslocamento_vertical_fundo = 0
      } = config

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo
      const altura_fundo_aplicada = altura_fundo_reto || 10

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [lb - (lb - lf) / 2 + ajuste_horizontal, pb - altura_fundo_aplicada + ajuste_base]
      const p4 = [(lb - lf) / 2 + ajuste_horizontal, pb - altura_fundo_aplicada + ajuste_base]
      const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p7 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p8 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pathBase = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')} ${p8.join(',')}`

      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    renderBaseFunilV() {
      const config = this.configPreviewAplicada || this.configArmazem
      const {
        pb, lb, hb, le,
        altura_funil_v = 40,
        posicao_ponta_v = 0,
        largura_abertura_v = 20,
        inclinacao_funil_v = 1,
        deslocamento_horizontal_fundo = 0,
        deslocamento_vertical_fundo = 0
      } = config

      const centroBase = lb / 2
      const deslocamentoPonta = lb * 0.1 * posicao_ponta_v
      const pontaX = centroBase + deslocamentoPonta

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const inclinacao_direita = altura_funil_v * inclinacao_funil_v
      const inclinacao_esquerda = altura_funil_v * inclinacao_funil_v

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [pontaX + largura_abertura_v / 2 + inclinacao_direita + ajuste_horizontal, pb - hb + ajuste_base + altura_funil_v]
      const p4 = [pontaX - largura_abertura_v / 2 - inclinacao_esquerda + ajuste_horizontal, pb - hb + ajuste_base + altura_funil_v]
      const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p7 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p8 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pontos = [p1, p2, p3, p4, p5, p6, p7, p8]
      const pathBase = pontos.map(p => p.join(',')).join(' ')

      return `<polygon fill="#999999" points="${pathBase}" />`
    },

    voltarParaPreview() {
      if (this.$router) {
        this.$router.push({
          name: 'Armazem',
          query: {
            arco: this.arcoAtual
          }
        });
      } else {
        // Fallback se não há roteamento
        this.dadosVindosDoPreview = false;
        alert('Navegação de volta ao preview não disponível. Dados do preview foram limpos.');
      }
    },

    irParaArmazem() {
      if (!this.dadosPortal || !this.analiseArcos || !this.layoutsAutomaticos) {
        alert('Dados não carregados completamente. Aguarde a inicialização.');
        return;
      }

      try {
        // Preparar dados para o preview do armazém
        const dadosParaArmazem = {
          dadosPortal: this.dadosPortal,
          analiseArcos: this.analiseArcos,
          layoutsAutomaticos: this.layoutsAutomaticos,
          dadosConvertidos: this.dados,
          numeroArco: this.arcoAtual,
          timestamp: new Date().getTime()
        };

        // Salvar dados no localStorage para o Armazem pegar
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('dadosArcoParaArmazem', JSON.stringify(dadosParaArmazem));
          localStorage.setItem('timestampArcoArmazem', dadosParaArmazem.timestamp.toString());
        }

        console.log(`Enviando dados do arco ${this.arcoAtual} para o preview do armazém:`, dadosParaArmazem);

        // Navegar para o Armazem
        if (this.$router) {
          this.$router.push({
            name: 'Armazem',
            query: {
              arco: this.arcoAtual,
              origem: 'modelador'
            }
          });
        } else {
          // Fallback se não há roteamento Vue
          alert(`Dados do arco ${this.arcoAtual} preparados para o preview do armazém. Navegue manualmente para a página do Armazém.`);
        }

      } catch (error) {
        console.error('Erro ao preparar dados para o preview do armazém:', error);
        alert('Erro ao preparar dados para o preview. Verifique o console.');
      }
    },

    renderBaseDuploV() {
      const config = this.configPreviewAplicada || this.configArmazem
      const {
        pb, lb, hb, le,
        altura_duplo_v = 35,
        posicao_v_esquerdo = -0.5,
        posicao_v_direito = 0.5,
        largura_abertura_duplo_v = 15,
        altura_plataforma_duplo_v = 0.3,
        largura_plataforma_duplo_v = 40,
        deslocamento_horizontal_fundo = 0,
        deslocamento_vertical_fundo = 0
      } = config

      const centroBase = lb / 2
      const pontaEsquerdaX = centroBase + lb * 0.2 * posicao_v_esquerdo
      const pontaDireitaX = centroBase + lb * 0.2 * posicao_v_direito

      const ajuste_base = -4 + deslocamento_vertical_fundo
      const ajuste_horizontal = deslocamento_horizontal_fundo

      const alturaPlataforma = altura_plataforma_duplo_v || 0.3
      const larguraPlataforma = largura_plataforma_duplo_v || 40

      const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]
      const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]
      const p3 = [pontaDireitaX + largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p4 = [pontaDireitaX - largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p5 = [centroBase + larguraPlataforma / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v * alturaPlataforma]
      const p6 = [centroBase - larguraPlataforma / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v * alturaPlataforma]
      const p7 = [pontaEsquerdaX + largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p8 = [pontaEsquerdaX - largura_abertura_duplo_v / 2 + ajuste_horizontal, pb - hb + ajuste_base + altura_duplo_v]
      const p9 = [le + ajuste_horizontal, pb - hb + ajuste_base]
      const p10 = [0 + ajuste_horizontal, pb - hb + ajuste_base]
      const p11 = [0 + ajuste_horizontal, pb + ajuste_base]
      const p12 = [lb + ajuste_horizontal, pb + ajuste_base]

      const pontos = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]
      const pathBase = pontos.map(p => p.join(',')).join(' ')

      return `<polygon fill="#999999" points="${pathBase}" />`
    }
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa !important;
}

.border-end {
  border-right: 1px solid #dee2e6 !important;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-text {
  min-width: 60px;
  text-align: center;
}

.badge-sm {
  font-size: 0.75em;
}

/* Melhorar visualização em mobile */
@media (max-width: 576px) {
  .modelador-painel-controles {
    height: auto !important;
    overflow-y: visible !important;
    max-height: none !important;
  }

  .form-control,
  .form-select {
    font-size: 14px;
  }

  .btn-sm {
    font-size: 12px;
    padding: 0.25rem 0.5rem;
  }
}

/* Responsividade para SVG */
.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

@media (max-width: 767.98px) {
  .svg-container-responsive {
    min-height: 180px;
    padding: 0.5rem;
  }

  .card-body {
    padding: 0.5rem !important;
  }
}

@media (max-width: 575.98px) {
  .svg-container-responsive {
    min-height: 150px;
    padding: 0.25rem;
  }
}
</style>
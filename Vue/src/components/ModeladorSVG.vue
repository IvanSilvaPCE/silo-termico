<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <!-- Painel de Controles -->
      <div
        class="col-xl-3 col-lg-4 col-md-5 col-sm-12 modelador-painel-controles"
        :style="{
          height: isMobile ? 'auto' : '100vh',
          overflowY: isMobile ? 'visible' : 'auto',
          position: 'relative',
          borderRight: '2px solid #dee2e6',
          backgroundColor: '#f8f9fa',
          zIndex: 1000,
          maxHeight: isMobile ? 'none' : '100vh'
        }"
      >
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
                <input
                  v-model.number="configSilo.lb"
                  type="range"
                  min="100"
                  max="400"
                  class="form-range me-2"
                  @input="onSiloChange"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="resetSiloField('lb', 200)"
                  title="Resetar para padrão (200)"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Altura Superior: {{ configSilo.hs }}px</label>
              <div class="d-flex align-items-center">
                <input
                  v-model.number="configSilo.hs"
                  type="range"
                  min="100"
                  max="300"
                  class="form-range me-2"
                  @input="onSiloChange"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="resetSiloField('hs', 180)"
                  title="Resetar para padrão (180)"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Altura Base: {{ configSilo.hb }}px</label>
              <div class="d-flex align-items-center">
                <input
                  v-model.number="configSilo.hb"
                  type="range"
                  min="5"
                  max="30"
                  class="form-range me-2"
                  @input="onSiloChange"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="resetSiloField('hb', 15)"
                  title="Resetar para padrão (15)"
                >
                  ×
                </button>
              </div>
            </div>

            <h6 class="mt-3 text-primary">Sensores</h6>
            <div class="mb-3">
              <label class="form-label">Escala Sensores: {{ configSilo.escala_sensores }}px</label>
              <div class="d-flex align-items-center">
                <input
                  v-model.number="configSilo.escala_sensores"
                  type="range"
                  min="10"
                  max="25"
                  class="form-range me-2"
                  @input="onSiloChange"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="resetSiloField('escala_sensores', 16)"
                  title="Resetar para padrão (16)"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Distância Y Sensores: {{ configSilo.dist_y_sensores }}px</label>
              <div class="d-flex align-items-center">
                <input
                  v-model.number="configSilo.dist_y_sensores"
                  type="range"
                  min="8"
                  max="20"
                  class="form-range me-2"
                  @input="onSiloChange"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  @click="resetSiloField('dist_y_sensores', 12)"
                  title="Resetar para padrão (12)"
                >
                  ×
                </button>
              </div>
            </div>

            <h6 class="mt-3 text-primary">Aeradores</h6>
            <div class="mb-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="configSilo.aeradores_ativo"
                  @change="onSiloChange"
                />
                <label class="form-check-label">Ativar Aeradores</label>
              </div>
            </div>

            <template v-if="configSilo.aeradores_ativo">
              <div class="mb-3">
                <label class="form-label">Número de Aeradores: {{ configSilo.na }}</label>
                <div class="d-flex align-items-center">
                  <input
                    v-model.number="configSilo.na"
                    type="range"
                    min="2"
                    max="6"
                    class="form-range me-2"
                    @input="onSiloChange"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetSiloField('na', 4)"
                    title="Resetar para padrão (4)"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Deslocamento Lateral: {{ configSilo.ds }}px</label>
                <div class="d-flex align-items-center">
                  <input
                    v-model.number="configSilo.ds"
                    type="range"
                    min="10"
                    max="60"
                    class="form-range me-2"
                    @input="onSiloChange"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetSiloField('ds', 30)"
                    title="Resetar para padrão (30)"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Distância entre Aeradores: {{ configSilo.da }}px</label>
                <div class="d-flex align-items-center">
                  <input
                    v-model.number="configSilo.da"
                    type="range"
                    min="20"
                    max="60"
                    class="form-range me-2"
                    @input="onSiloChange"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="resetSiloField('da', 35)"
                    title="Resetar para padrão (35)"
                  >
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
                      <option 
                        v-for="i in quantidadeModelosArcos" 
                        :key="i" 
                        :value="i"
                      >
                        Modelo {{ i }} - {{ getDescricaoModelo(i) }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-lg-6 col-md-12 mb-3">
                    <label class="form-label">Nome do Modelo:</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="modeloNome"
                      placeholder="Nome do modelo"
                      :disabled="!modeloArcoAtual"
                      @input="onNomeModeloChange"
                    />
                  </div>
                  <div class="col-lg-6 col-md-12 mb-3">
                    <label class="form-label">Posição no Armazém:</label>
                    <select 
                      class="form-select" 
                      v-model="modeloPosicao" 
                      @change="onPosicaoArcoChange"
                      :disabled="!modeloArcoAtual"
                    >
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
                      <strong>EDITANDO:</strong> {{ modelosArcos[modeloArcoAtual]?.nome || `Modelo ${modeloArcoAtual}` }}
                      <span class="badge bg-primary ms-2">
                        {{ modelosArcos[modeloArcoAtual]?.posicao || '' }}
                      </span>
                      <span v-if="modelosSalvos[modeloArcoAtual]" class="badge bg-success ms-2">
                        SALVO
                      </span>
                    </div>
                    <button
                      type="button"
                      class="btn btn-sm btn-success"
                      @click="salvarModeloAtual"
                      title="Salvar este modelo"
                    >
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
                      <strong>Status:</strong> {{ Object.keys(modelosSalvos).length }} de {{ quantidadeModelosArcos }} modelos salvos
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
                    <input
                      v-model.number="configArmazem.pb"
                      type="range"
                      min="100"
                      max="300"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.pb }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('pb', 185)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Largura Base (lb):</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.lb"
                      type="range"
                      min="200"
                      max="500"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.lb }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('lb', 350)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Altura Base (hb):</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.hb"
                      type="range"
                      min="10"
                      max="80"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.hb }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('hb', 30)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Altura Frente (hf):</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.hf"
                      type="range"
                      min="2"
                      max="20"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.hf }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('hf', 5)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Largura Frente (lf):</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.lf"
                      type="range"
                      min="150"
                      max="350"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.lf }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('lf', 250)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Largura Estrutura (le):</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.le"
                      type="range"
                      min="5"
                      max="50"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.le }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('le', 15)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Altura Teto (ht):</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.ht"
                      type="range"
                      min="20"
                      max="100"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.ht }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('ht', 50)"
                      title="Reset"
                    >
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
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('tipo_telhado', 1)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Curvatura do Topo:</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.curvatura_topo"
                      type="range"
                      min="10"
                      max="80"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.curvatura_topo }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('curvatura_topo', 30)"
                      title="Reset"
                    >
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
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('tipo_fundo', 0)"
                      title="Reset"
                    >
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
                      <input
                        v-model.number="configArmazem.altura_fundo_reto"
                        type="range"
                        min="0"
                        max="50"
                        class="form-range"
                        @input="onArmazemChange"
                      />
                      <span class="input-group-text">{{ configArmazem.altura_fundo_reto }}</span>
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="resetArmazemField('altura_fundo_reto', 10)"
                        title="Reset"
                      >
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
                        <input
                          v-model.number="configArmazem.altura_funil_v"
                          type="range"
                          min="10"
                          max="120"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.altura_funil_v }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('altura_funil_v', 18)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Posição da Ponta:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.posicao_ponta_v"
                          type="range"
                          min="-2"
                          max="2"
                          step="0.1"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.posicao_ponta_v }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('posicao_ponta_v', 0)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Largura da Abertura:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.largura_abertura_v"
                          type="range"
                          min="2"
                          max="80"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.largura_abertura_v }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('largura_abertura_v', 20)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Inclinação das Paredes:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.inclinacao_funil_v"
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.inclinacao_funil_v }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('inclinacao_funil_v', 1)"
                          title="Reset"
                        >
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
                        <input
                          v-model.number="configArmazem.altura_duplo_v"
                          type="range"
                          min="10"
                          max="120"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.altura_duplo_v }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('altura_duplo_v', 22)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Posição V Esquerdo:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.posicao_v_esquerdo"
                          type="range"
                          min="-2"
                          max="0.5"
                          step="0.1"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.posicao_v_esquerdo }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('posicao_v_esquerdo', -1)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Posição V Direito:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.posicao_v_direito"
                          type="range"
                          min="-0.5"
                          max="2"
                          step="0.1"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.posicao_v_direito }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('posicao_v_direito', 1)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Largura das Aberturas:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.largura_abertura_duplo_v"
                          type="range"
                          min="2"
                          max="80"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.largura_abertura_duplo_v }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('largura_abertura_duplo_v', 2)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Altura da Plataforma:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.altura_plataforma_duplo_v"
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.altura_plataforma_duplo_v }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('altura_plataforma_duplo_v', 0.3)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="form-label">Largura da Plataforma:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.largura_plataforma_duplo_v"
                          type="range"
                          min="10"
                          max="120"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.largura_plataforma_duplo_v }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('largura_plataforma_duplo_v', 10)"
                          title="Reset"
                        >
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
                        <input
                          v-model.number="configArmazem.deslocamento_horizontal_fundo"
                          type="range"
                          min="-100"
                          max="100"
                          class="form-range"
```
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.deslocamento_horizontal_fundo }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('deslocamento_horizontal_fundo', 0)"
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div class="col-6 mb-2">
                      <label class="small fw-bold">Deslocamento Vertical:</label>
                      <div class="input-group input-group-sm">
                        <input
                          v-model.number="configArmazem.deslocamento_vertical_fundo"
                          type="range"
                          min="-100"
                          max="100"
                          class="form-range"
                          @input="onArmazemChange"
                        />
                        <span class="input-group-text">{{ configArmazem.deslocamento_vertical_fundo }}</span>
                        <button
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="resetArmazemField('deslocamento_vertical_fundo', obterDeslocamentoVerticalPadrao(configArmazem.tipo_fundo))"
                          title="Reset"
                        >
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
                    <input
                      v-model.number="configArmazem.escala_sensores"
                      type="range"
                      min="10"
                      max="30"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.escala_sensores }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('escala_sensores', 16)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Distância Y Sensores:</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.dist_y_sensores"
                      type="range"
                      min="8"
                      max="20"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.dist_y_sensores }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('dist_y_sensores', 12)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Distância X Sensores:</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.dist_x_sensores"
                      type="range"
                      min="-100"
                      max="100"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.dist_x_sensores }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('dist_x_sensores', 0)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Posição Horizontal:</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.posicao_horizontal"
                      type="range"
                      min="-150"
                      max="150"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.posicao_horizontal }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('posicao_horizontal', 0)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Posição Vertical:</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.posicao_vertical"
                      type="range"
                      min="-100"
                      max="100"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.posicao_vertical }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('posicao_vertical', 0)"
                      title="Reset"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="mb-2">
                  <label class="small fw-bold">Afastamento Vertical Pêndulo:</label>
                  <div class="input-group input-group-sm">
                    <input
                      v-model.number="configArmazem.afastamento_vertical_pendulo"
                      type="range"
                      min="-50"
                      max="50"
                      class="form-range"
                      @input="onArmazemChange"
                    />
                    <span class="input-group-text">{{ configArmazem.afastamento_vertical_pendulo }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="resetArmazemField('afastamento_vertical_pendulo', 0)"
                      title="Reset"
                    >
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
            <button 
              v-if="tipoAtivo === 'armazem'" 
              type="button" 
              class="btn btn-outline-warning" 
              @click="resetarModelosParaPadrao"
            >
              🗑️ Limpar Todos os Modelos
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
                <input
                  type="text"
                  class="form-control"
                  v-model="nomeConfiguracao"
                  placeholder="Digite o nome para salvar/carregar"
                />
              </div>

              <div class="d-grid gap-2 mb-3">
                <button
                  type="button"
                  class="btn btn-success"
                  @click="salvarConfiguracao"
                  :disabled="!nomeConfiguracao.trim()"
                >
                  💾 Salvar {{ tipoAtivo === 'silo' ? 'Silo' : 'Armazém' }} Completo
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="carregarConfiguracao"
                  :disabled="!nomeConfiguracao.trim()"
                >
                  📂 Carregar Configuração
                </button>
              </div>

              <!-- Lista de configurações salvas -->
              <div v-if="configsDisponiveis.length > 0" class="alert alert-light">
                <h6>Configurações Salvas:</h6>
                <div class="d-flex flex-wrap gap-1">
                  <span v-for="nome in configsDisponiveis" :key="nome" class="badge bg-secondary position-relative">
                    {{ nome }}
                    <button
                      type="button"
                      class="btn-close btn-close-white"
                      style="font-size: 8px; margin-left: 5px"
                      @click="deletarConfiguracao(nome)"
                      aria-label="Close"
                    ></button>
                  </span>
                </div>
                <div class="mt-2">
                  <small class="text-muted">Clique em uma configuração para carregar rapidamente:</small>
                  <div class="d-flex flex-wrap gap-1 mt-1">
                    <button
                      v-for="nome in configsDisponiveis"
                      :key="nome"
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      @click="carregarConfiguracao(nome)"
                    >
                      {{ nome }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="tipoAtivo === 'armazem'" class="alert alert-info">
                <small>
                  <strong>📌 Dica:</strong> Quando salvar um armazém, todos os {{ quantidadeModelosArcos }} modelos de arcos configurados
                  serão salvos junto. Ao carregar, a configuração completa será restaurada com todos os modelos.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área de Visualização -->
      <div
        class="col-xl-9 col-lg-8 col-md-7 col-sm-12"
        :style="{
          padding: '10px',
          height: isMobile ? 'auto' : '100vh',
          overflow: isMobile ? 'visible' : 'hidden',
          minHeight: isMobile ? '400px' : '100vh'
        }"
      >
        <div class="d-flex justify-content-center align-items-center h-100" style="minHeight: 400px">
          <div
            class="card w-100"
            :style="{
              maxWidth: '100%',
              minHeight: '400px',
              maxHeight: 'calc(100vh - 60px)',
              height: 'calc(100vh - 60px)'
            }"
          >
            <div class="card-header bg-primary text-white">
              <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                <h6 class="mb-1 mb-md-0">
                  Preview - {{ tipoAtivo === 'silo' ? 'Silo' : `${modeloArcoAtual ? `EDITANDO: ${modelosArcos[modeloArcoAtual]?.nome || 'Modelo ' + modeloArcoAtual}` : 'Visualização Geral'}` }}
                </h6>
                <small v-if="tipoAtivo === 'armazem'" class="text-white-50">
                  {{ modeloArcoAtual ? 
                    `${quantidadeModelosArcos === 1 ? 'Modelo Único' : modelosArcos[modeloArcoAtual]?.posicao || ''} | ${modeloArcoAtual}/${quantidadeModelosArcos}` :
                    `Padrão | ${quantidadeModelosArcos} modelo${quantidadeModelosArcos > 1 ? 's' : ''}`
                  }}
                </small>
              </div>
            </div>

            <div
              class="card-body text-center d-flex align-items-center justify-content-center p-2"
              :style="{
                height: 'calc(100vh - 250px)',
                overflow: 'auto',
                minHeight: '300px',
                maxHeight: 'calc(100vh - 250px)'
              }"
            >
              <svg
                :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`"
                :style="{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 320px)',
                  minHeight: '250px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  shapeRendering: 'geometricPrecision',
                  textRendering: 'geometricPrecision',
                  imageRendering: 'optimizeQuality'
                }"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                v-html="svgContent"
              >
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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

      tipoAtivo: 'silo',
      nomeConfiguracao: '',
      larguraSVG: 400,
      alturaSVG: 300,
      svgContent: '',
      forceUpdateLista: 0
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
  mounted() {
    this.resetarModelosParaPadrao()
    this.updateSVG()
  },
  watch: {
    'configArmazem.tipo_fundo': {
      handler(novoTipo) {
        this.configArmazem.deslocamento_vertical_fundo = this.obterDeslocamentoVerticalPadrao(novoTipo)
      }
    }
  },
  methods: {
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

    obterDeslocamentoVerticalPadrao(tipoFundo) {
      switch (tipoFundo) {
        case 0: return 0  // Reto
        case 1: return 7  // Funil V
        case 2: return 10 // Duplo V
        default: return 0
      }
    },

    salvarModeloAtual() {
      if (!this.modeloArcoAtual) {
        alert('Selecione um modelo para salvar!')
        return
      }

      const modeloParaSalvar = {
        ...this.modelosArcos[this.modeloArcoAtual],
        config: { ...this.configArmazem }
      }

      this.modelosArcos[this.modeloArcoAtual] = modeloParaSalvar
      this.modelosSalvos[this.modeloArcoAtual] = modeloParaSalvar

      this.salvarModelosAutomatico()

      alert(`Modelo ${this.modeloArcoAtual} (${modeloParaSalvar.nome}) salvo com sucesso!`)
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
        alert('Digite um nome para salvar a configuração!')
        return
      }

      if (typeof localStorage !== 'undefined') {
        if (this.tipoAtivo === 'silo') {
          localStorage.setItem('configSilo', JSON.stringify(this.configSilo))
          localStorage.setItem(`configSilo_${this.nomeConfiguracao}`, JSON.stringify(this.configSilo))
          alert(`Configuração Silo "${this.nomeConfiguracao}" salva com sucesso!`)
        } else {
          // Verificar se todos os modelos foram salvos
          const modelosSalvosCount = Object.keys(this.modelosSalvos).length

          if (modelosSalvosCount !== this.quantidadeModelosArcos) {
            alert(`Atenção: Você tem ${this.quantidadeModelosArcos} modelos configurados, mas apenas ${modelosSalvosCount} foram salvos. Salve todos os modelos antes de salvar o armazém.`)
            return
          }

          const configCompleta = {
            nome: this.nomeConfiguracao,
            quantidadeModelos: this.quantidadeModelosArcos,
            modelosArcos: this.modelosArcos,
            modeloAtual: null,
            timestamp: new Date().toISOString(),
            versao: '2.0',
            tipo: 'configuracao_armazem_completa'
          }

          localStorage.setItem('configArmazem', JSON.stringify(configCompleta))
          localStorage.setItem(`configArmazem_${this.nomeConfiguracao}`, JSON.stringify(configCompleta))

          alert(`Configuração completa do armazém "${this.nomeConfiguracao}" salva!`)

          this.resetarModelosParaPadrao()
          this.modelosSalvos = {}
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
            alert('Configuração do silo carregada com sucesso!')
          } else {
            if (dadosCarregados.modelosArcos && dadosCarregados.tipo === 'configuracao_armazem_completa') {
              this.quantidadeModelosArcos = dadosCarregados.quantidadeModelos
              this.modelosArcos = dadosCarregados.modelosArcos
              this.modelosSalvos = dadosCarregados.modelosArcos
              this.modeloArcoAtual = null

              const primeiroModelo = dadosCarregados.modelosArcos[1]
              if (primeiroModelo && primeiroModelo.config) {
                this.configArmazem = { ...primeiroModelo.config }
              }

              alert(`Configuração completa do armazém "${nomeConfig}" carregada!`)
            } else {
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
              alert('Configuração antiga convertida para o novo formato!')
            }
          }

          if (!nome) {
            this.nomeConfiguracao = nomeConfig
          }
          this.updateSVG()
        } else {
          alert('Configuração não encontrada!')
        }
      }
    },

    deletarConfiguracao(nome) {
      if (typeof localStorage !== 'undefined') {
        const chave = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_${nome}`
        localStorage.removeItem(chave)
        alert(`Configuração "${nome}" removida com sucesso!`)
        this.forceUpdateLista++
        if (this.nomeConfiguracao === nome) {
          this.nomeConfiguracao = ''
        }
      }
    },

    updateSVG() {
      this.calcularDimensoesSVG()
      this.generateSVG()
    },

    calcularDimensoesSVG() {
      if (this.tipoAtivo === 'silo') {
        this.larguraSVG = this.configSilo.lb + (this.configSilo.aeradores_ativo ? this.configSilo.ds * 2 + 68 : 0)
        this.alturaSVG = this.configSilo.hs + this.configSilo.hb * 1.75
      } else {
        this.larguraSVG = Math.max(this.configArmazem.lb, 300)
        this.alturaSVG = Math.max(this.configArmazem.pb + this.configArmazem.ht + 50, 200)
      }
    },

    generateSVG() {
      if (this.tipoAtivo === 'silo') {
        this.svgContent = this.renderSilo()
      } else {
        this.svgContent = this.renderArmazem()
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
      return this.renderTelhado() + this.renderFundoArmazem()
    },

    renderTelhado() {
      const { tipo_telhado, curvatura_topo, pb, lb, hb, hf, lf, le, ht, tipo_fundo } = this.configArmazem

      if (tipo_telhado === 1) {
        // Pontudo
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 7
        }

        const p1 = [(lb - lf) / 2, pb - hf + extensao]
        const p2 = [le, pb - hb + extensao]
        const p3 = [le, pb - ht]
        const p4 = [lb / 2, 1]
        const p5 = [lb - le, pb - ht]
        const p6 = [lb - le, pb - hb + extensao]
        const p7 = [lb - (lb - lf) / 2, pb - hf + extensao]

        const pathTelhado = `${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')} ${p5.join(',')} ${p6.join(',')} ${p7.join(',')}`

        return `<polygon fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" points="${pathTelhado}" />`
      } else if (tipo_telhado === 2) {
        // Arredondado
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        const pathTelhado = `
          M ${(lb - lf) / 2} ${pb - hf + extensao}
          L ${le} ${pb - hb + extensao}
          L ${le} ${pb - ht}
          Q ${lb / 2} ${1 - curvatura_topo} ${lb - le} ${pb - ht}
          L ${lb - le} ${pb - hb + extensao}
          L ${lb - (lb - lf) / 2} ${pb - hf + extensao}
          Z
        `
        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" d="${pathTelhado}" />`
      } else if (tipo_telhado === 3) {
        // Arco
        let extensao = 0
        if (tipo_fundo === 1 || tipo_fundo === 2) {
          extensao = 5
        }

        const pathTelhado = `
          M ${(lb - lf) / 2} ${pb - hf + extensao}
          L ${le} ${pb - hb + extensao}
          L ${le} ${pb - ht}
          A ${(lb - le * 2) / 2} ${curvatura_topo} 0 0 1 ${lb - le} ${pb - ht}
          L ${lb - le} ${pb - hb + extensao}
          L ${lb - (lb - lf) / 2} ${pb - hf + extensao}
          Z
        `

        return `<path fill="#E6E6E6" stroke="#999999" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="23" d="${pathTelhado}" />`
      }

      return ''
    },

    renderFundoArmazem() {
      const { tipo_fundo } = this.configArmazem

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
      const { 
        pb, lb, hb, le, lf,
        altura_fundo_reto = 10, 
        deslocamento_horizontal_fundo = 0, 
        deslocamento_vertical_fundo = 0 
      } = this.configArmazem

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
      const { 
        pb, lb, hb, le,
        altura_funil_v = 40,
        posicao_ponta_v = 0,
        largura_abertura_v = 20,
        inclinacao_funil_v = 1,
        deslocamento_horizontal_fundo = 0,
        deslocamento_vertical_fundo = 0
      } = this.configArmazem

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

    renderBaseDuploV() {
      const { 
        pb, lb, hb, le, lf,
        altura_duplo_v = 35,
        posicao_v_esquerdo = -0.5,
        posicao_v_direito = 0.5,
        largura_abertura_duplo_v = 15,
        altura_plataforma_duplo_v = 0.3,
        largura_plataforma_duplo_v = 40,
        deslocamento_horizontal_fundo = 0,
        deslocamento_vertical_fundo = 0
      } = this.configArmazem

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

  .form-control, .form-select {
    font-size: 14px;
  }

  .btn-sm {
    font-size: 12px;
    padding: 0.25rem 0.5rem;
  }
}
</style>
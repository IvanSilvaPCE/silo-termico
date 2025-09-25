// src/servicos/modeloSvgService.js
import client from "@/api.js";

// ===== Helpers =====
const pegarToken = () => {
  const token = localStorage.getItem("token") || "";
  if (!token || token.trim() === "") return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

const preservarPosicoesCabos = (dadosSvg) => {
  try {
    const dados = typeof dadosSvg === 'string' ? JSON.parse(dadosSvg) : dadosSvg;

    // 🎯 NOVA ESTRUTURA V6.0: Preservar estrutura de modelos conforme anexo
    if (dados.modelos) {

      Object.keys(dados.modelos).forEach(modeloId => {
        const modelo = dados.modelos[modeloId];

        if (modelo && modelo.dimensoes && modelo.modeloEspecifico) {

          // 🔒 PRESERVAR TOTALMENTE as dimensões já salvas - NÃO alterar
          if (modelo.dimensoes) {
          }

          // 🔒 PRESERVAR posições dos pêndulos
          if (modelo.modeloEspecifico.posicoesPendulos) {
            const totalPosicoes = Object.keys(modelo.modeloEspecifico.posicoesPendulos).length;
          }

          // 🔒 PRESERVAR posições manuais dos sensores
          if (modelo.modeloEspecifico.posicoesManualSensores) {
            const totalSensores = Object.keys(modelo.modeloEspecifico.posicoesManualSensores).length;
          }

          // 🔒 PRESERVAR sensores por pêndulo
          if (modelo.modeloEspecifico.sensoresPorPendulo) {
            const totalSensoresPorPendulo = Object.keys(modelo.modeloEspecifico.sensoresPorPendulo).length;
          }
        }
      });

      return typeof dadosSvg === 'string' ? JSON.stringify(dados) : dados;
    }

    // 🔄 FALLBACK: Estrutura antiga (modelosDefinidos)
    if (dados.modelosDefinidos) {
      Object.keys(dados.modelosDefinidos).forEach(modeloKey => {
        const modelo = dados.modelosDefinidos[modeloKey];

        if (modelo.configuracao) {
          const config = modelo.configuracao;
          const quantidadePendulos = modelo.quantidadePendulos || 3;


          // 🔒 PRESERVAR TOTALMENTE as dimensões - NÃO sobrescrever se já existem
          const dimensoesSalvas = ['pb', 'lb', 'hb', 'hf', 'lf', 'le', 'ht'];
          dimensoesSalvas.forEach(dim => {
            if (config[dim] !== undefined && config[dim] !== null) {
            } else {
              // Apenas aplicar defaults se realmente não existir
              const defaults = { pb: 185, lb: 350, hb: 30, hf: 6, lf: 250, le: 15, ht: 50 };
              config[dim] = defaults[dim];
            }
          });

          // CRÍTICO: Preservar configurações do telhado
          if (config.tipo_telhado === undefined) config.tipo_telhado = 1;
          if (config.curvatura_topo === undefined) config.curvatura_topo = 30;
          if (config.pontas_redondas === undefined) config.pontas_redondas = false;
          if (config.raio_pontas === undefined) config.raio_pontas = 15;
          if (config.estilo_laterais === undefined) config.estilo_laterais = 'reta';
          if (config.curvatura_laterais === undefined) config.curvatura_laterais = 0;

          // CRÍTICO: Preservar configurações do fundo
          if (config.tipo_fundo === undefined) config.tipo_fundo = 0;
          if (config.altura_fundo_reto === undefined) config.altura_fundo_reto = 10;
          if (config.altura_funil_v === undefined) config.altura_funil_v = 18;
          if (config.posicao_ponta_v === undefined) config.posicao_ponta_v = 0;
          if (config.inclinacao_funil_v === undefined) config.inclinacao_funil_v = 1;
          if (config.largura_abertura_v === undefined) config.largura_abertura_v = 20;
          if (config.altura_duplo_v === undefined) config.altura_duplo_v = 22;
          if (config.posicao_v_esquerdo === undefined) config.posicao_v_esquerdo = -1;
          if (config.posicao_v_direito === undefined) config.posicao_v_direito = 1;
          if (config.largura_abertura_duplo_v === undefined) config.largura_abertura_duplo_v = 2;
          if (config.altura_plataforma_duplo_v === undefined) config.altura_plataforma_duplo_v = 0.3;
          if (config.largura_plataforma_duplo_v === undefined) config.largura_plataforma_duplo_v = 10;
          if (config.deslocamento_horizontal_fundo === undefined) config.deslocamento_horizontal_fundo = 0;
          if (config.deslocamento_vertical_fundo === undefined) config.deslocamento_vertical_fundo = -1;

          // Configurações de sensores - apenas garantir que existam SEM alterar valores salvos
          if (config.escala_sensores === undefined) config.escala_sensores = 16;
          if (config.dist_y_sensores === undefined) config.dist_y_sensores = 12;
          if (config.dist_x_sensores === undefined) config.dist_x_sensores = 0;
          if (config.posicao_horizontal === undefined) config.posicao_horizontal = 0;
          if (config.posicao_vertical === undefined) config.posicao_vertical = 0;
          if (config.afastamento_vertical_pendulo === undefined) config.afastamento_vertical_pendulo = 0;

          // IMPORTANTE: Preservar posições individuais dos cabos EXATAMENTE como foram salvas
          if (!config.posicoesCabos) {
            config.posicoesCabos = {};
          }

          // NOVO: Preservar posições manuais dos pêndulos E SENSORES (drag and drop)
          if (!config.posicoesManualPendulos) {
            config.posicoesManualPendulos = {};
          }
          if (!config.posicoesManualSensores) {
            config.posicoesManualSensores = {};
          }

          // CRÍTICO: Preservar posições manuais dos sensores do modeloEspecifico
          if (modelo.modeloEspecifico && modelo.modeloEspecifico.posicoesManualSensores) {
            config.posicoesManualSensores = { ...modelo.modeloEspecifico.posicoesManualSensores };
          }

          // NOVO: Preservar posições manuais dos pêndulos
          if (!config.posicoesManualPendulos) {
            config.posicoesManualPendulos = {};
          }

          // CRÍTICO: Preservar posições manuais dos pêndulos do modeloEspecifico
          if (modelo.modeloEspecifico && modelo.modeloEspecifico.posicoesManualPendulos) {
            config.posicoesManualPendulos = { ...modelo.modeloEspecifico.posicoesManualPendulos };
          }

          // NOVO: Garantir que posicoesManualSensores sempre existe na estrutura V6.0
          if (!modelo.modeloEspecifico.posicoesManualSensores) {
            modelo.modeloEspecifico.posicoesManualSensores = {};
          }

          // NOVO: Garantir que posicoesManualPendulos sempre existe na estrutura V6.0
          if (!modelo.modeloEspecifico.posicoesManualPendulos) {
            modelo.modeloEspecifico.posicoesManualPendulos = {};
          }

          // Garantir estrutura para cada cabo, mas SEM alterar posições existentes
          for (let i = 1; i <= quantidadePendulos; i++) {
            if (!config.posicoesCabos[i]) {
              // Só criar se não existir
              config.posicoesCabos[i] = {
                x: 0, // Posição horizontal personalizada
                y: 0, // Posição vertical personalizada
                offsetX: 0, // Offset adicional X
                offsetY: 0, // Offset adicional Y
                altura: 0, // Altura específica do cabo
                distanciaHorizontal: 0, // Distância horizontal específica
                numeroSensores: 3, // Número de sensores neste cabo/pêndulo
                timestampAlteracao: Date.now()
              };
            } else {
              // PRESERVAR TOTALMENTE as posições já salvas
              const posicaoExistente = config.posicoesCabos[i];

              // Apenas garantir que campos obrigatórios existam SEM ALTERAR valores existentes
              if (posicaoExistente.offsetX === undefined) posicaoExistente.offsetX = 0;
              if (posicaoExistente.offsetY === undefined) posicaoExistente.offsetY = 0;
              if (posicaoExistente.altura === undefined) posicaoExistente.altura = 0;
              if (posicaoExistente.distanciaHorizontal === undefined) posicaoExistente.distanciaHorizontal = 0;
              if (posicaoExistente.numeroSensores === undefined) posicaoExistente.numeroSensores = 3;
              if (!posicaoExistente.timestampAlteracao) posicaoExistente.timestampAlteracao = Date.now();

            }
          }

          // NOVO: Log das posições manuais preservadas (pêndulos E sensores)
          const totalPendulosManual = Object.keys(config.posicoesManualPendulos).length;
          const totalSensoresManual = Object.keys(config.posicoesManualSensores).length;
          if (totalPendulosManual > 0 || totalSensoresManual > 0) {
          }

          // Construir array pos_x_cabo baseado nas posições individuais salvas
          if (config.posicoesCabos) {
            const posicoesArray = [];
            for (let i = 1; i <= quantidadePendulos; i++) {
              if (config.posicoesCabos[i]) {
                const posicaoFinal = (config.posicoesCabos[i].x || 0) + (config.posicoesCabos[i].offsetX || 0);
                posicoesArray.push(posicaoFinal);
              } else {
                posicoesArray.push(0);
              }
            }
            config.pos_x_cabo = posicoesArray;
          }

          // Calcular distância entre cabos baseada nas posições reais
          if (config.pos_x_cabo && config.pos_x_cabo.length > 1) {
            const distancias = [];
            for (let i = 1; i < config.pos_x_cabo.length; i++) {
              distancias.push(Math.round((config.pos_x_cabo[i] - config.pos_x_cabo[i-1]) * 10) / 10);
            }
            config.distancia_entre_cabos = distancias;
          } else {
            config.distancia_entre_cabos = [0];
          }

          // Adicionar informações do modelo
          if (!config.informacoesModelo) {
            config.informacoesModelo = {};
          }

          config.informacoesModelo.quantidadePendulos = quantidadePendulos;
          config.informacoesModelo.numeroModelo = modeloKey;
          config.informacoesModelo.timestampUltimaEdicao = Date.now();
          config.informacoesModelo.posicionamentoPersonalizado = true;


          // VALIDAÇÃO CRÍTICA: Verificar se dimensões básicas estão sendo preservadas
          const dimensoesCriticas = ['pb', 'lb', 'hb', 'hf', 'lf', 'le', 'ht'];
          const dimensoesPreservadas = dimensoesCriticas.filter(dim =>
            config[dim] !== undefined && config[dim] !== null
          );
          const dimensoesComValores = {};
          dimensoesCriticas.forEach(dim => {
            dimensoesComValores[dim] = config[dim];
          });

        }
      });
    }

    return typeof dadosSvg === 'string' ? JSON.stringify(dados) : dados;
  } catch (error) {
    return dadosSvg;
  }
};

const validarDadosModelo = (dados) => {
  const erros = [];

  if (!dados.nm_modelo || typeof dados.nm_modelo !== "string" || !dados.nm_modelo.trim()) {
    erros.push("Nome do modelo é obrigatório e deve ser uma string não vazia");
  }
  if (!dados.tp_svg || !["A", "S"].includes(dados.tp_svg)) {
    erros.push("Tipo SVG deve ser 'A' (Armazém) ou 'S' (Silo)");
  }
  if (!dados.vista_svg || !["F", "L", "T"].includes(dados.vista_svg)) {
    erros.push("Vista SVG deve ser 'F' (Frontal), 'L' (Lateral) ou 'T' (Topo)");
  }
  if (!dados.dado_svg || typeof dados.dado_svg !== "string" || !dados.dado_svg.trim() || dados.dado_svg === "{}") {
    erros.push("Dados SVG são obrigatórios e devem conter dados válidos");
  }
  if (dados.dado_svg && typeof dados.dado_svg === "string") {
    try { JSON.parse(dados.dado_svg); } catch { erros.push("Dados SVG devem ser um JSON válido"); }
  }


  return { valido: erros.length === 0, erros };
};

const extrairMensagemErro = (error) => {
  const status = error.response?.status || 500;
  let data = error.response?.data;

  if (typeof data === "string") {
    try { const parsed = JSON.parse(data); if (parsed) data = parsed; } catch { }
  }

  // Laravel pode retornar { campo: ["msg"] } sem 'errors'
  if (data && typeof data === "object" && !Array.isArray(data)) {
    if (data.errors) {
      const lista = Object.values(data.errors).flat().join(" | ");
      return { status, mensagem: `Validação: ${lista}`, payload: data };
    }
    const valores = Object.values(data);
    if (valores.length && valores.every(v => Array.isArray(v))) {
      const lista = valores.flat().join(" | ");
      return { status, mensagem: `Validação: ${lista}`, payload: data };
    }
    if (data.message) return { status, mensagem: data.message, payload: data };
    if (data.error) return { status, mensagem: data.error, payload: data };
  }

  if (typeof data === "string") return { status, mensagem: data, payload: data };
  return { status, mensagem: error.message || "Erro desconhecido", payload: data || error };
};

// ===== API =====
const salvarModelo = async (dadosModelo) => {
  let dadosComDefaults = null; // <- disponível no catch

  try {
    const token = pegarToken();
    if (!token) {
      return { status: 401, success: false, message: "Token de autenticação não encontrado" };
    }

    console.log("🔄 [ENTRADA] Dados recebidos na função salvarModelo:", {
      dadosModelo,
      tipo: typeof dadosModelo,
      keys: dadosModelo ? Object.keys(dadosModelo) : "null/undefined",
      nm_modelo_original: dadosModelo?.nm_modelo,
      tp_svg_original: dadosModelo?.tp_svg,
      vista_svg_original: dadosModelo?.vista_svg,
      ds_modelo_original: dadosModelo?.ds_modelo,
      dado_svg_original_type: typeof dadosModelo?.dado_svg,
      dado_svg_original_length: dadosModelo?.dado_svg ? dadosModelo.dado_svg.length : 0,
    });

    if (!dadosModelo || typeof dadosModelo !== "object") {
      console.error("❌ [ENTRADA] dadosModelo é inválido:", dadosModelo);
      return { status: 400, success: false, message: "Dados do modelo são obrigatórios e devem ser um objeto válido" };
    }

    dadosComDefaults = {
      nm_modelo:
        dadosModelo.nm_modelo && typeof dadosModelo.nm_modelo === "string" && dadosModelo.nm_modelo.trim()
          ? dadosModelo.nm_modelo.trim()
          : "Modelo Sem Nome",
      tp_svg:
        dadosModelo.tp_svg && typeof dadosModelo.tp_svg === "string" && ["A", "S"].includes(dadosModelo.tp_svg)
          ? dadosModelo.tp_svg
          : "A",
      vista_svg:
        dadosModelo.vista_svg && typeof dadosModelo.vista_svg === "string" && ["F", "L", "T"].includes(dadosModelo.vista_svg)
          ? dadosModelo.vista_svg
          : "F",
      ds_modelo:
        dadosModelo.ds_modelo && typeof dadosModelo.ds_modelo === "string" && dadosModelo.ds_modelo.trim()
          ? dadosModelo.ds_modelo.trim()
          : `Modelo criado em ${new Date().toLocaleDateString("pt-BR")}`,
      dado_svg: null,
    };

    // dado_svg - PRESERVAR TOTALMENTE os dados modelados
    let dadoSvgProcessado = "";
    if (dadosModelo.dado_svg) {
      if (typeof dadosModelo.dado_svg === "string") {
        try {
          // VALIDAR JSON sem alterar conteúdo
          const dadosParseados = JSON.parse(dadosModelo.dado_svg);
          dadoSvgProcessado = dadosModelo.dado_svg.trim();

          console.log(`✅ [PROCESSAMENTO] Dados SVG string preservados:`, {
            tipo: dadosParseados.modelos ? 'v6.0' : 'legado',
            modelos: dadosParseados.modelos ? Object.keys(dadosParseados.modelos).length : 
                     dadosParseados.modelosDefinidos ? Object.keys(dadosParseados.modelosDefinidos).length : 0,
            tamanho: dadoSvgProcessado.length
          });
        }
        catch {
          console.warn("⚠️ [PROCESSAMENTO] dado_svg não é JSON válido, preservando como string");
          dadoSvgProcessado = dadosModelo.dado_svg;
        }
      } else if (typeof dadosModelo.dado_svg === "object") {
        // PRESERVAR INTEGRALMENTE o objeto modelado
        dadoSvgProcessado = JSON.stringify(dadosModelo.dado_svg);

        console.log(`✅ [PROCESSAMENTO] Dados SVG objeto preservados:`, {
          tipo: dadosModelo.dado_svg.modelos ? 'v6.0' : 'legado',
          modelos: dadosModelo.dado_svg.modelos ? Object.keys(dadosModelo.dado_svg.modelos).length : 
                   dadosModelo.dado_svg.modelosDefinidos ? Object.keys(dadosModelo.dado_svg.modelosDefinidos).length : 0,
          tamanho: dadoSvgProcessado.length
        });
      } else {
        dadoSvgProcessado = String(dadosModelo.dado_svg);
      }
    }

    // IMPORTANTE: Apenas criar dados básicos se realmente não houver dados
    if (!dadoSvgProcessado || dadoSvgProcessado.trim() === "") {
      console.log("🆕 [PROCESSAMENTO] Criando estrutura básica pois dados estão vazios");
      dadoSvgProcessado = JSON.stringify({
        versao: "1.0",
        tipo: "modelo_basico",
        configuracao: {},
        timestamp: Date.now()
      });
    } else {
      console.log(`✅ [PROCESSAMENTO] Dados SVG preservados - tamanho: ${dadoSvgProcessado.length} caracteres`);
    }

    // IMPORTANTE: Salvar primeiro no localStorage antes de enviar para o banco
    try {
      const dadosParaSalvar = typeof dadoSvgProcessado === 'string' ? JSON.parse(dadoSvgProcessado) : dadoSvgProcessado;
      const chaveLocalStorage = `modelo_temp_${dadosComDefaults.nm_modelo}_${Date.now()}`;
      localStorage.setItem(chaveLocalStorage, JSON.stringify({
        dados: dadosParaSalvar,
        timestamp: Date.now(),
        nome: dadosComDefaults.nm_modelo
      }));
      console.log("💾 [LOCALSTORAGE] Modelo salvo temporariamente:", chaveLocalStorage);
    } catch (error) {
      console.warn("⚠️ [LOCALSTORAGE] Erro ao salvar no localStorage:", error);
    }

    // Preservar posições exatas dos cabos como foram definidas pelo usuário
    dadosComDefaults.dado_svg = preservarPosicoesCabos(dadoSvgProcessado);

    console.log("🔄 [PROCESSAMENTO] Dados após aplicar defaults:", {
      nm_modelo: dadosComDefaults.nm_modelo,
      tp_svg: dadosComDefaults.tp_svg,
      vista_svg: dadosComDefaults.vista_svg,
      ds_modelo: dadosComDefaults.ds_modelo,
      dado_svg_size: dadosComDefaults.dado_svg?.length || 0,
      dado_svg_preview: dadosComDefaults.dado_svg?.substring(0, 100) + "...",
    });

    const validacao = validarDadosModelo(dadosComDefaults);
    if (!validacao.valido) {
      console.error("❌ [PENÚLTIMA] Dados inválidos após processamento:", { dadosProcessados: dadosComDefaults, errosValidacao: validacao.erros, dadosOriginais: dadosModelo });
      return { status: 400, success: false, message: `Dados inválidos: ${validacao.erros.join(", ")}`, error: validacao.erros };
    }

    // 🔍 VALIDAÇÃO CRÍTICA: Verificar se dimensões básicas estão preservadas no payload final
    let dimensoesFinalValidacao = null;
    try {
      const dadosParsed = JSON.parse(dadosComDefaults.dado_svg);
      if (dadosParsed.modelosDefinidos) {
        dimensoesFinalValidacao = {};
        Object.keys(dadosParsed.modelosDefinidos).forEach(modeloKey => {
          const config = dadosParsed.modelosDefinidos[modeloKey]?.configuracao;
          if (config) {
            dimensoesFinalValidacao[modeloKey] = {
              pb: config.pb,
              lb: config.lb,
              hb: config.hb,
              hf: config.hf,
              lf: config.lf,
              le: config.le,
              ht: config.ht
            };
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ [VALIDAÇÃO] Erro ao verificar dimensões finais:', error);
    }

    console.log("🔄 [PENÚLTIMA] Dados preparados para envio (estrutura final):", {
      nm_modelo: `"${dadosComDefaults.nm_modelo}"`,
      tp_svg: `"${dadosComDefaults.tp_svg}"`,
      vista_svg: `"${dadosComDefaults.vista_svg}"`,
      ds_modelo: `"${dadosComDefaults.ds_modelo}"`,
      dado_svg_size: dadosComDefaults.dado_svg.length + " caracteres",
      dado_svg_is_valid_json: (() => { try { JSON.parse(dadosComDefaults.dado_svg); return true; } catch { return false; } })(),
      dimensoesFinalValidacao,
      payload_completo: dadosComDefaults,
    });

    console.log("🔍 [PENÚLTIMA] Validação final dos campos obrigatórios:", {
      nm_modelo_valido: !!(dadosComDefaults.nm_modelo && dadosComDefaults.nm_modelo.trim()),
      tp_svg_valido: !!(dadosComDefaults.tp_svg && ["A", "S"].includes(dadosComDefaults.tp_svg)),
      vista_svg_valido: !!(dadosComDefaults.vista_svg && ["F", "L", "T"].includes(dadosComDefaults.vista_svg)),
      dado_svg_valido: !!(dadosComDefaults.dado_svg && dadosComDefaults.dado_svg.length > 2),
      todos_campos_presentes: Object.keys(dadosComDefaults).length === 5,
    });

    const response = await client.post(
      "/svg",
      JSON.stringify(dadosComDefaults),
      {
        headers: {
          Authorization: token,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        transformRequest: [(d) => d], // impede interceptor de virar FormData
      }
    );


    console.log("✅ [ÚLTIMA] Resposta do servidor:", response.data);
    console.log("✅ [ÚLTIMA] Status da resposta:", response.status);

    return { status: response.status, data: response.data, success: true, message: "Modelo salvo com sucesso!" };
  } catch (error) {
    console.error("❌ [ÚLTIMA] Erro ao salvar modelo:", error);

    // Logs seguros (sem quebrar por escopo)
    let dadosEnviados = null;
    try { dadosEnviados = error.config?.data ? JSON.parse(error.config.data) : null; }
    catch { dadosEnviados = error.config?.data || null; }

    console.error("❌ [ÚLTIMA] Detalhes do erro:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      dadosEnviados,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
    });

    if (error.response?.status === 422) {
      console.error("🚨 [ÚLTIMA] Erro de validação 422 - Dados rejeitados pelo servidor:", {
        dadosEnviados,
        respostaServidor: error.response?.data,
      });
    }

    const { status, mensagem, payload } = extrairMensagemErro(error);
    return { status, success: false, message: mensagem, error: payload };
  }
};

const buscarModelos = async (tipo = null) => {
  try {
    const token = pegarToken();
    if (!token) return { status: 401, data: [], success: false, error: "Token de autenticação não encontrado" };

    const url = tipo ? `/svg?tp_svg=${encodeURIComponent(tipo)}` : "/svg";
    const response = await client.get(url, { headers: { Authorization: token, Accept: "application/json" } });
    return { status: response.status, data: response.data || [], success: true };
  } catch (error) {
    const { status, mensagem } = extrairMensagemErro(error);
    return { status, data: [], success: false, error: mensagem };
  }
};

const buscarModeloPorId = async (id) => {
  try {
    const response = await client.get(`/svg/${id}`, { headers: { Authorization: pegarToken(), Accept: "application/json" } });
    return { status: response.status, data: response.data, success: true };
  } catch (error) {
    const { status, mensagem, payload } = extrairMensagemErro(error);
    return { status, data: null, success: false, error: payload || mensagem };
  }
};

const atualizarModelo = async (id, dadosModelo) => {
  try {
    const response = await client.put(
      `/svg/${id}`,
      JSON.stringify(dadosModelo),
      {
        headers: {
          Authorization: pegarToken(),
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        transformRequest: [(d) => d],
      }
    );
    return { status: response.status, data: response.data, success: true, message: "Modelo atualizado com sucesso!" };
  } catch (error) {
    const { status, mensagem, payload } = extrairMensagemErro(error);
    return { status, success: false, message: mensagem, error: payload || mensagem };
  }
};

const excluirModelo = async (id) => {
  try {
    const token = pegarToken();
    if (!token) return { status: 401, success: false, message: "Token de autenticação não encontrado", error: "NO_TOKEN" };

    const response = await client.delete(`/svg/${id}`, { headers: { Authorization: token, Accept: "application/json" } });
    return { status: response.status, data: response.data, success: true, message: "Modelo excluído com sucesso!" };
  } catch (error) {
    const { status, mensagem, payload } = extrairMensagemErro(error);
    return { status, success: false, message: mensagem, error: payload || mensagem };
  }
};

export const modeloSvgService = {
  salvarModelo,
  buscarModelos,
  buscarModeloPorId,
  atualizarModelo,
  excluirModelo,
};
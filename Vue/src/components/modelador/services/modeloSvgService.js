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
    
    if (dados.modelosDefinidos) {
      Object.keys(dados.modelosDefinidos).forEach(modeloKey => {
        const modelo = dados.modelosDefinidos[modeloKey];
        
        if (modelo.configuracao) {
          const config = modelo.configuracao;
          const quantidadePendulos = modelo.quantidadePendulos || 3;
          
          console.log(`💾 [PRESERVAÇÃO] Modelo ${modeloKey} - Salvando posições exatas dos ${quantidadePendulos} pêndulos`);
          
          // Garantir que propriedades básicas existam (sem alterar valores)
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
              console.log(`🆕 [PRESERVAÇÃO] Modelo ${modeloKey} - Cabo ${i} - Estrutura inicial criada`);
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
              
              console.log(`✅ [PRESERVAÇÃO] Modelo ${modeloKey} - Cabo ${i} - Posição preservada EXATA: x=${posicaoExistente.x}, y=${posicaoExistente.y}`);
            }
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
          
          console.log(`💾 [PRESERVAÇÃO] Modelo ${modeloKey} - Posições dos cabos preservadas:`, {
            quantidadePendulos: quantidadePendulos,
            posicoesCabos: config.posicoesCabos,
            pos_x_cabo: config.pos_x_cabo,
            distancia_entre_cabos: config.distancia_entre_cabos
          });
        }
      });
    }
    
    return typeof dadosSvg === 'string' ? JSON.stringify(dados) : dados;
  } catch (error) {
    console.warn('⚠️ [PRESERVAÇÃO] Erro ao preservar posições de cabos:', error);
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

  console.log("🔍 [validarDadosModelo] Validação detalhada:", {
    nm_modelo: { valor: dados.nm_modelo, valido: !!(dados.nm_modelo && dados.nm_modelo.trim()) },
    tp_svg: { valor: dados.tp_svg, valido: !!dados.tp_svg && ["A", "S"].includes(dados.tp_svg) },
    vista_svg: { valor: dados.vista_svg, valido: !!dados.vista_svg && ["F", "L", "T"].includes(dados.vista_svg) },
    dado_svg: {
      valor: dados.dado_svg ? dados.dado_svg.substring(0, 50) + "..." : null,
      tamanho: dados.dado_svg ? dados.dado_svg.length : 0,
      valido: !!(dados.dado_svg && dados.dado_svg.length > 2),
    },
    erros,
  });

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

    // dado_svg
    let dadoSvgProcessado = "";
    if (dadosModelo.dado_svg) {
      if (typeof dadosModelo.dado_svg === "string") {
        try { JSON.parse(dadosModelo.dado_svg); dadoSvgProcessado = dadosModelo.dado_svg.trim(); }
        catch { console.warn("⚠️ [PROCESSAMENTO] dado_svg não é JSON válido, usando como string"); dadoSvgProcessado = dadosModelo.dado_svg; }
      } else if (typeof dadosModelo.dado_svg === "object") {
        dadoSvgProcessado = JSON.stringify(dadosModelo.dado_svg);
      } else {
        dadoSvgProcessado = String(dadosModelo.dado_svg);
      }
    }
    if (!dadoSvgProcessado || dadoSvgProcessado.trim() === "" || dadoSvgProcessado.trim() === "{}") {
      dadoSvgProcessado = JSON.stringify({ versao: "1.0", tipo: "modelo_basico", configuracao: {}, timestamp: Date.now() });
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

    console.log("🔄 [PENÚLTIMA] Dados preparados para envio (estrutura final):", {
      nm_modelo: `"${dadosComDefaults.nm_modelo}"`,
      tp_svg: `"${dadosComDefaults.tp_svg}"`,
      vista_svg: `"${dadosComDefaults.vista_svg}"`,
      ds_modelo: `"${dadosComDefaults.ds_modelo}"`,
      dado_svg_size: dadosComDefaults.dado_svg.length + " caracteres",
      dado_svg_is_valid_json: (() => { try { JSON.parse(dadosComDefaults.dado_svg); return true; } catch { return false; } })(),
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

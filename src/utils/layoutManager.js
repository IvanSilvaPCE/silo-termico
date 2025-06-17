
class LayoutManager {
  // Listar layouts salvos
  static listarLayouts(tipo) {
    const prefixo = `config${tipo === "silo" ? "Silo" : "Armazem"}_`;
    const layouts = [];

    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave && chave.startsWith(prefixo)) {
        const nome = chave.replace(prefixo, '');
        layouts.push(nome);
      }
    }

    return layouts;
  }

  // Carregar layout específico
  static carregarLayout(tipo, nome) {
    const chave = `config${tipo === "silo" ? "Silo" : "Armazem"}_${nome}`;
    const layout = localStorage.getItem(chave);
    return layout ? JSON.parse(layout) : null;
  }

  // Adaptar layout para dados específicos
  static adaptarLayoutParaDados(tipo, nomeLayout, dados) {
    if (!dados || !dados.leitura) {
      return null;
    }

    const layoutBase = this.carregarLayout(tipo, nomeLayout);
    if (!layoutBase) {
      console.warn(`Layout "${nomeLayout}" não encontrado`);
      return null;
    }

    if (tipo === "armazem") {
      return this.adaptarArmazemParaDados(layoutBase, dados);
    } else if (tipo === "silo") {
      return this.adaptarSiloParaDados(layoutBase, dados);
    }

    return layoutBase;
  }

  static adaptarArmazemParaDados(layoutBase, dados) {
    const layoutAdaptado = { ...layoutBase };
    const cabos = Object.keys(dados.leitura);
    
    // Criar estrutura de cabos baseada nos dados (pêndulos com seus sensores)
    const pendulos = {};
    cabos.forEach((cabo) => {
      const sensores = dados.leitura[cabo];
      pendulos[cabo] = Object.keys(sensores).length;
    });

    // Configuração de células
    const configCelulas = {
      pendulos_celula_impar: layoutAdaptado.pendulos_celula_impar || 3,
      pendulos_celula_par: layoutAdaptado.pendulos_celula_par || 4,
      total_celulas: layoutAdaptado.total_celulas || 6,
      posicionamento_automatico: layoutAdaptado.posicionamento_automatico !== false
    };

    // Função para gerar posições baseadas na célula
    const gerarPosicoesPorCelula = (numeroCelula) => {
      const qtdPendulos = numeroCelula % 2 === 1 ? 
        configCelulas.pendulos_celula_impar : 
        configCelulas.pendulos_celula_par;
      
      if (!configCelulas.posicionamento_automatico) {
        return layoutAdaptado.pos_x_cabo?.slice(0, qtdPendulos) || [];
      }

      const larguraBase = layoutAdaptado.lb || 350;
      const margemLateral = 50;
      const larguraUtil = larguraBase - (margemLateral * 2);
      const espacamento = qtdPendulos > 1 ? larguraUtil / (qtdPendulos - 1) : 0;
      
      const posicoes = [];
      for (let i = 0; i < qtdPendulos; i++) {
        if (qtdPendulos === 1) {
          posicoes.push(larguraBase / 2);
        } else {
          posicoes.push(margemLateral + (espacamento * i));
        }
      }
      
      return posicoes;
    };

    // Estrutura final para o componente Armazem
    return {
      tamanho_svg: [layoutAdaptado.lb || 350, layoutAdaptado.pb || 200],
      desenho_sensores: {
        escala_cores_sensores: 2,
        nome_sensores_direita: 0,
        nome_cabo_acima: 0,
        escala_sensores: layoutAdaptado.escala_sensores || 16,
        dist_y_sensores: layoutAdaptado.dist_y_sensores || 12,
        dist_y_nome_cabo: [8, 8, 8, 8, 8, 8, 8, 8],
        pos_x_cabos_uniforme: 1,
        pos_x_cabo: layoutAdaptado.pos_x_cabo || [62, 52, 158, 208, 258],
        pos_y_cabo: new Array(8).fill(layoutAdaptado.pos_y_cabo?.[0] || 181),
      },
      desenho_arco: {
        tipo_telhado: layoutAdaptado.tipo_telhado || 1,
        tipo_fundo: layoutAdaptado.tipo_fundo || 0,
        intensidade_fundo: layoutAdaptado.intensidade_fundo || 20,
        curvatura_topo: layoutAdaptado.curvatura_topo || 30,
        pb: layoutAdaptado.pb || 185,
        lb: layoutAdaptado.lb || 350,
        hb: layoutAdaptado.hb || 30,
        hf: layoutAdaptado.hf || 5,
        lf: layoutAdaptado.lf || 250,
        le: layoutAdaptado.le || 15,
        ht: layoutAdaptado.ht || 50,
        ctrl_p1: [60, 30],
        ctrl_p2: [97, 10],
      },
      // Dados dos pêndulos (vindos do JSON/API)
      pendulos: pendulos,
      // Configuração de células para navegação
      configuracao_celulas: {
        ...configCelulas,
        gerarPosicoesPorCelula
      }
    };
  }

  static adaptarSiloParaDados(layoutBase, dados) {
    if (!dados || !dados.leitura) {
      return layoutBase;
    }

    const layoutAdaptado = { ...layoutBase };
    const totalCabos = Object.keys(dados.leitura).length;
    
    // Adaptar posicionamento dos cabos
    if (layoutAdaptado.pos_x_cabo && Array.isArray(layoutAdaptado.pos_x_cabo)) {
      const [posInicial, distancia] = layoutAdaptado.pos_x_cabo;
      layoutAdaptado.pos_x_cabo = [posInicial, distancia];
    }

    // Adaptar altura dos cabos
    if (totalCabos > 0) {
      layoutAdaptado.pos_y_cabo = new Array(totalCabos).fill(
        layoutAdaptado.pos_y_cabo?.[0] || 160
      );
    }

    // Estrutura final para o componente Silo
    return {
      tamanho_svg: [
        layoutAdaptado.lb + (layoutAdaptado.aeradores_ativo ? layoutAdaptado.ds * 2 + 68 : 0),
        layoutAdaptado.hs + layoutAdaptado.hb * 1.75
      ],
      desenho_corte_silo: {
        lb: layoutAdaptado.lb || 200,
        hs: layoutAdaptado.hs || 180,
        hb: layoutAdaptado.hb || 15,
        eb: layoutAdaptado.eb || 5,
      },
      desenho_sensores: {
        escala_sensores: layoutAdaptado.escala_sensores || 16,
        dist_y_sensores: layoutAdaptado.dist_y_sensores || 12,
        pos_x_cabos_uniforme: layoutAdaptado.pos_x_cabos_uniforme || 1,
        pos_x_cabo: layoutAdaptado.pos_x_cabo || [50, 25],
        pos_y_cabo: layoutAdaptado.pos_y_cabo,
        nome_sensores_direita: 0,
        nome_cabo_acima: 0,
        dist_y_nome_cabo: new Array(totalCabos).fill(8),
      },
      aeradores: layoutAdaptado.aeradores_ativo ? {
        na: layoutAdaptado.na || 4,
        ds: layoutAdaptado.ds || 30,
        dy: layoutAdaptado.dy || 0,
        da: layoutAdaptado.da || 35,
      } : null,
    };
  }

  // Função para usar nos componentes Silo e Armazem
  static aplicarLayoutAutomatico(tipo, nomeLayout, dados, setConfigCallback) {
    try {
      const layoutAdaptado = this.adaptarLayoutParaDados(tipo, nomeLayout, dados);
      if (layoutAdaptado && setConfigCallback) {
        setConfigCallback(layoutAdaptado);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao aplicar layout automático:', error);
      return false;
    }
  }

  // Função para detectar o melhor layout baseado nos dados
  static detectarMelhorLayout(tipo, dados) {
    const layouts = this.listarLayouts(tipo);
    
    if (layouts.length === 0) {
      return null;
    }

    // Por enquanto, retorna o primeiro layout encontrado
    // Você pode implementar lógica mais sofisticada aqui
    return layouts[0];
  }
}

export default LayoutManager;

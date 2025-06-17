
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
    
    // Criar estrutura de cabos baseada nos dados
    const novosCabos = {};
    cabos.forEach((cabo, index) => {
      const sensores = dados.leitura[cabo];
      novosCabos[cabo] = Object.keys(sensores).length;
    });

    // Adaptar posições dos cabos
    const numCabos = cabos.length;
    if (numCabos > 0) {
      const larguraBase = layoutAdaptado.lb || 350;
      const margemLateral = 50;
      const larguraUtil = larguraBase - (margemLateral * 2);
      const espacamento = numCabos > 1 ? larguraUtil / (numCabos - 1) : 0;

      layoutAdaptado.pos_x_cabo = cabos.map((_, i) => {
        if (numCabos === 1) {
          return larguraBase / 2;
        }
        return margemLateral + (espacamento * i);
      });

      layoutAdaptado.pos_y_cabo = new Array(numCabos).fill(
        layoutAdaptado.pos_y_cabo?.[0] || 181
      );
    }

    // Adicionar informações de distribuição por células se disponível
    if (layoutAdaptado.total_cabos && layoutAdaptado.sensores_celula_impar && layoutAdaptado.sensores_celula_par) {
      layoutAdaptado.distribuicao_celulas = {};
      for (let i = 1; i <= layoutAdaptado.total_cabos; i++) {
        layoutAdaptado.distribuicao_celulas[i] = i % 2 === 1 ? 
          layoutAdaptado.sensores_celula_impar : 
          layoutAdaptado.sensores_celula_par;
      }
    }

    // Estrutura final para o componente Armazem
    return {
      tamanho_svg: [layoutAdaptado.lb || 350, layoutAdaptado.pb || 200],
      desenho_sensores: {
        escala_cores_sensores: 2,
        nome_sensores_direita: 0,
        nome_cabo_acima: 0,
        escala_sensores: layoutAdaptado.escala_sensores || 16,
        dist_y_sensores: layoutAdaptado.dist_y_sensores || 12,
        dist_y_nome_cabo: new Array(numCabos).fill(8),
        pos_x_cabos_uniforme: 1,
        pos_x_cabo: layoutAdaptado.pos_x_cabo,
        pos_y_cabo: layoutAdaptado.pos_y_cabo,
      },
      desenho_arco: {
        tipo_telhado: layoutAdaptado.tipo_telhado || 1,
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
      cabos: novosCabos,
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

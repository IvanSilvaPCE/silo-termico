
// Utilitário para gerenciar layouts salvos e adaptação aos dados do backend

export class LayoutManager {
  static salvarLayout(tipo, nome, configuracao) {
    const chave = `config${tipo === "silo" ? "Silo" : "Armazem"}_${nome}`;
    localStorage.setItem(chave, JSON.stringify(configuracao));
    return true;
  }

  static carregarLayout(tipo, nome) {
    const chave = `config${tipo === "silo" ? "Silo" : "Armazem"}_${nome}`;
    const layoutSalvo = localStorage.getItem(chave);
    return layoutSalvo ? JSON.parse(layoutSalvo) : null;
  }

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

  static deletarLayout(tipo, nome) {
    const chave = `config${tipo === "silo" ? "Silo" : "Armazem"}_${nome}`;
    localStorage.removeItem(chave);
    return true;
  }

  // Função principal para adaptar layout aos dados do backend
  static adaptarLayoutParaDados(tipo, nomeLayout, dadosBackend) {
    const layoutBase = this.carregarLayout(tipo, nomeLayout);
    
    if (!layoutBase) {
      throw new Error(`Layout "${nomeLayout}" não encontrado`);
    }

    if (tipo === "armazem") {
      return this.adaptarArmazemParaDados(layoutBase, dadosBackend);
    } else if (tipo === "silo") {
      return this.adaptarSiloParaDados(layoutBase, dadosBackend);
    }

    return layoutBase;
  }

  static adaptarArmazemParaDados(layoutBase, dados) {
    if (!dados || !dados.leitura) {
      return layoutBase;
    }

    const layoutAdaptado = { ...layoutBase };
    const cabos = Object.keys(dados.leitura);
    const numCabos = cabos.length;

    // Adaptar posicionamento dos cabos baseado na quantidade
    const larguraBase = layoutAdaptado.lb;
    const margemLateral = 50; // margem das bordas
    const larguraUtil = larguraBase - (margemLateral * 2);
    const espacamento = numCabos > 1 ? larguraUtil / (numCabos - 1) : 0;

    // Calcular novas posições dos cabos
    layoutAdaptado.pos_x_cabo = cabos.map((_, i) => {
      if (numCabos === 1) {
        return larguraBase / 2; // centralizar se só tem 1 cabo
      }
      return margemLateral + (espacamento * i);
    });

    // Manter mesma altura para todos os cabos ou adaptar conforme necessário
    layoutAdaptado.pos_y_cabo = new Array(numCabos).fill(
      layoutAdaptado.pos_y_cabo?.[0] || 181
    );

    // Adaptar cabos no objeto de configuração
    const novosCabos = {};
    cabos.forEach((cabo, index) => {
      // Contar quantos sensores tem cada cabo
      const sensores = dados.leitura[cabo];
      const qtdSensores = Object.keys(sensores).length;
      novosCabos[cabo] = qtdSensores;
    });

    // Se o layout original tem configuração de cabos, adaptamos
    if (layoutBase.cabos) {
      layoutAdaptado.cabos = novosCabos;
    }

    return layoutAdaptado;
  }

  static adaptarSiloParaDados(layoutBase, dados) {
    if (!dados || !dados.leitura) {
      return layoutBase;
    }

    const layoutAdaptado = { ...layoutBase };
    
    // Para silo, você pode adaptar baseado no número de cabos/sensores
    const totalCabos = Object.keys(dados.leitura).length;
    
    // Adaptar posicionamento dos cabos se necessário
    if (layoutAdaptado.pos_x_cabo && Array.isArray(layoutAdaptado.pos_x_cabo)) {
      // Ajustar espaçamento baseado no número de cabos
      const [posInicial, distancia] = layoutAdaptado.pos_x_cabo;
      layoutAdaptado.pos_x_cabo = [posInicial, distancia];
    }

    // Adaptar altura dos cabos se necessário
    if (layoutAdaptado.pos_y_cabo && totalCabos > 0) {
      layoutAdaptado.pos_y_cabo = new Array(totalCabos).fill(
        layoutAdaptado.pos_y_cabo[0] || 160
      );
    }

    return layoutAdaptado;
  }

  // Função para usar nos componentes Silo e Armazem
  static aplicarLayoutAutomatico(tipo, nomeLayout, dados, setConfigCallback) {
    try {
      const layoutAdaptado = this.adaptarLayoutParaDados(tipo, nomeLayout, dados);
      setConfigCallback(layoutAdaptado);
      return true;
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

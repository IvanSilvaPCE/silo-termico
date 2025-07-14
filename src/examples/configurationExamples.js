
// Exemplos de configurações que podem ser salvas no banco

export const exemploConfigSiloIndustrial = {
  nome: "Silo Industrial Grande",
  tipo: "silo",
  descricao: "Configuração para silo industrial de grande porte",
  tags: ["industrial", "grande", "exportação"],
  config: {
    lb: 300,
    hs: 250,
    hb: 20,
    eb: 8,
    escala_sensores: 18,
    dist_y_sensores: 15,
    pos_x_cabos_uniforme: 1,
    pos_x_cabo: [60, 35],
    pos_y_cabo: [220, 220, 220, 220, 220],
    aeradores_ativo: true,
    na: 6,
    ds: 40,
    dy: 0,
    da: 45,
  }
};

export const exemploConfigSiloPequeno = {
  nome: "Silo Compacto",
  tipo: "silo", 
  descricao: "Configuração para silo de pequeno porte",
  tags: ["pequeno", "compacto", "fazenda"],
  config: {
    lb: 150,
    hs: 120,
    hb: 10,
    eb: 3,
    escala_sensores: 14,
    dist_y_sensores: 10,
    pos_x_cabos_uniforme: 1,
    pos_x_cabo: [40, 20],
    pos_y_cabo: [100, 100, 100],
    aeradores_ativo: false,
    na: 2,
    ds: 20,
    dy: 0,
    da: 25,
  }
};

export const exemploConfigArmazemIndustrial = {
  nome: "Armazém Industrial",
  tipo: "armazem",
  descricao: "Configuração para armazém industrial de grande capacidade",
  tags: ["industrial", "alto", "cooperativa"],
  config: {
    pb: 220,
    lb: 450,
    hb: 40,
    hf: 8,
    lf: 350,
    le: 20,
    ht: 70,
    tipo_telhado: 2,
    tipo_fundo: 1,
    intensidade_fundo: 30,
    curvatura_topo: 45,
    escala_sensores: 18,
    dist_y_sensores: 15,
  }
};

export const exemploConfigArmazemMedio = {
  nome: "Armazém Médio Porte",
  tipo: "armazem",
  descricao: "Configuração para armazém de médio porte",
  tags: ["médio", "padrão", "cooperativa"],
  config: {
    // Dimensões Básicas
    pb: 185,
    lb: 350,
    hb: 30,
    hf: 5,
    lf: 250,
    le: 15,
    ht: 50,
    
    // Configuração do Telhado
    tipo_telhado: 1,
    curvatura_topo: 30,
    
    // Configuração do Fundo
    tipo_fundo: 0,
    altura_fundo_reto: 0,
    
    // Configurações Funil V
    altura_funil_v: 40,
    posicao_ponta_v: 0,
    largura_abertura_v: 20,
    
    // Configurações Duplo V
    altura_duplo_v: 35,
    posicao_v_esquerdo: -0.5,
    posicao_v_direito: 0.5,
    largura_abertura_duplo_v: 15,
    
    // Configuração dos Sensores
    escala_sensores: 16,
    dist_y_sensores: 12,
    intensidade_fundo: 20,
  }
};

export const exemploConfigArmazemFunilV = {
  nome: "Armazém com Funil V",
  tipo: "armazem",
  descricao: "Configuração com fundo em funil V para grãos",
  tags: ["funil", "v", "grãos"],
  config: {
    pb: 200,
    lb: 400,
    hb: 35,
    hf: 8,
    lf: 280,
    le: 18,
    ht: 60,
    tipo_telhado: 1,
    curvatura_topo: 25,
    tipo_fundo: 1,
    altura_funil_v: 50,
    posicao_ponta_v: 0.2,
    largura_abertura_v: 25,
    escala_sensores: 18,
    dist_y_sensores: 14,
    intensidade_fundo: 25,
  }
};

export const exemploConfigArmazemDuploV = {
  nome: "Armazém Duplo V Industrial",
  tipo: "armazem", 
  descricao: "Configuração industrial com dois funis em V",
  tags: ["industrial", "duplo-v", "grande"],
  config: {
    pb: 220,
    lb: 450,
    hb: 40,
    hf: 10,
    lf: 320,
    le: 20,
    ht: 70,
    tipo_telhado: 2,
    curvatura_topo: 45,
    tipo_fundo: 2,
    altura_duplo_v: 45,
    posicao_v_esquerdo: -0.6,
    posicao_v_direito: 0.6,
    largura_abertura_duplo_v: 18,
    escala_sensores: 20,
    dist_y_sensores: 15,
    intensidade_fundo: 30,
  }sensores: 12,
  }
};

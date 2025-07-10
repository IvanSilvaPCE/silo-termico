
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
    pb: 185,
    lb: 350,
    hb: 30,
    hf: 5,
    lf: 250,
    le: 15,
    ht: 50,
    tipo_telhado: 1,
    tipo_fundo: 0,
    intensidade_fundo: 20,
    curvatura_topo: 30,
    escala_sensores: 16,
    dist_y_sensores: 12,
  }
};

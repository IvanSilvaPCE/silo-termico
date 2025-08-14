import client from '@/api.js'

const pegarToken = () => localStorage.getItem('token') || '';
const paraString = v => (typeof v === 'string' ? v : JSON.stringify(v || {}));


const salvarModelo = async (dadosModelo) => {
  try {
    // Mapear campos exatamente conforme backend espera (conforme REGRA_POST)
    const paraString = v => (typeof v === 'string' ? v : JSON.stringify(v || {}));

    const dadosValidados = {
      nm_modelo: (dadosModelo.nm_modelo || dadosModelo.nome || '').trim(),
      dado_svg: paraString(dadosModelo.dado_svg || dadosModelo.dados_svg),
      ds_modelo: (dadosModelo.ds_modelo || dadosModelo.descricao || '').trim(),
      tp_svg: (dadosModelo.tp_svg || dadosModelo.tipo || '').trim(), // 'A' ou 'S'
      vista_svg: (dadosModelo.vista_svg || 'F').trim()               // 'T' ou 'F'
    }



    // Verificar campos obrigatórios conforme validação do backend
    const camposFaltando = []
    if (!dadosValidados.nm_modelo || dadosValidados.nm_modelo.trim() === '') {
      camposFaltando.push('nm_modelo (required|string|max:255|unique:svg)')
    }
    if (!dadosValidados.dado_svg || dadosValidados.dado_svg === '{}' || dadosValidados.dado_svg === '') {
      camposFaltando.push('dado_svg (required|json)')
    }
    if (!dadosValidados.tp_svg || dadosValidados.tp_svg === '') {
      camposFaltando.push('tp_svg (required|string|in:A,S)')
    }
    if (!dadosValidados.vista_svg || dadosValidados.vista_svg === '') {
      camposFaltando.push('vista_svg (required|string|in:T,F)')
    }

    // Validar tp_svg - deve ser A ou S
    if (dadosValidados.tp_svg && !['A', 'S'].includes(dadosValidados.tp_svg)) {
      camposFaltando.push('tp_svg deve ser A (Armazém) ou S (Silo)')
    }

    // Validar vista_svg - deve ser T ou F  
    if (dadosValidados.vista_svg && !['T', 'F'].includes(dadosValidados.vista_svg)) {
      camposFaltando.push('vista_svg deve ser T (Topo) ou F (Frontal)')
    }

    console.log('🔄 [modeloSvgService] Dados a serem enviados para API:', {
      nm_modelo: dadosValidados.nm_modelo,
      tp_svg: dadosValidados.tp_svg,
      vista_svg: dadosValidados.vista_svg,
      tamanho_dado_svg: dadosValidados.dado_svg.length,
      ds_modelo_length: dadosValidados.ds_modelo?.length || 0,
      campos_obrigatorios_ok: camposFaltando.length === 0,
      campos_faltando: camposFaltando
    })

    // Verificar campos obrigatórios localmente antes de enviar
    if (camposFaltando.length > 0) {
      return {
        status: 422,
        success: false,
        message: 'Campos obrigatórios não preenchidos',
        error: { erros: camposFaltando }
      };
    }


    const jwt = pegarToken();
    const corpo = JSON.stringify(dadosValidados);

    const response = await client.post('/svg', corpo, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${jwt}`
      },
      transformRequest: [(data, headers) => {
        headers.Authorization = `bearer ${jwt}`;
        return data;
      }]
    });



    console.log('✅ [modeloSvgService] Resposta da API:', response.data)

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Modelo salvo com sucesso!'
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao salvar modelo:', error)

    let mensagemErro = 'Erro ao salvar modelo no banco'
    let status = error.response?.status || 500

    if (error.response?.data?.message) {
      mensagemErro = error.response.data.message
    } else if (error.response?.data?.error) {
      mensagemErro = error.response.data.error
    } else if (error.message) {
      mensagemErro = error.message
    }

    return {
      status: status,
      success: false,
      message: mensagemErro,
      error: error.response?.data || error
    }
  }
}



// GET (buscarModelos / buscarModeloPorId)
const buscarModelos = (tipo = null) => {
  const url = tipo ? `/svg?tp_svg=${tipo}` : '/svg';
  return client.get(url, {
    headers: { Authorization: `bearer ${pegarToken()}` }

  }).catch(e => e.response);
};

// DELETE
const excluirModelo = (id) => {
  return client.delete(`/svg/${id}`, {
    headers: { Authorization: `bearer ${pegarToken()}` }

  }).catch(e => e.response);
};
const buscarModeloPorId = (id) => {
  return client.get(`/svg/${id}`, {
    headers: { Authorization: `bearer ${pegarToken()}` }

  }).catch(e => e.response);
};

const atualizarModelo = (id, dadosModelo) => {
  const corpo = JSON.stringify({
    nm_modelo: (dadosModelo.nm_modelo || '').trim(),
    dado_svg: paraString(dadosModelo.dado_svg || dadosModelo.dados_svg),
    ds_modelo: (dadosModelo.ds_modelo || '').trim(),
    tp_svg: (dadosModelo.tp_svg || '').trim(),
    vista_svg: (dadosModelo.vista_svg || 'F').trim()
  });


  return client.put(`/svg/${id}`, corpo, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token()}`
    },
    transformRequest: [(data, headers) => {
      headers.Authorization = `bearer ${token()}`;
      return data; // já é string
    }]
  }).catch(e => e.response);
};

export const modeloSvgService = {
  salvarModelo,
  buscarModelos,
  excluirModelo,
  buscarModeloPorId,
  atualizarModelo
}
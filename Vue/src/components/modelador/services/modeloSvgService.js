import client from '@/api.js'

// Função auxiliar para pegar o token
const pegarToken = () => {
  return localStorage.getItem('token') || ''
}

// Função auxiliar para converter para string
const paraString = (valor) => {
  if (typeof valor === 'string') {
    return valor
  }
  return JSON.stringify(valor || {})
}

// POST - Salvar novo modelo
const salvarModelo = async (dadosModelo) => {
  try {
    const dadosValidados = {
      nm_modelo: (dadosModelo.nm_modelo || dadosModelo.nome || '').trim(),
      dado_svg: paraString(dadosModelo.dado_svg),
      ds_modelo: (dadosModelo.ds_modelo || dadosModelo.descricao || '').trim(),
      tp_svg: (dadosModelo.tp_svg || dadosModelo.tipo || '').trim(),
      vista_svg: (dadosModelo.vista_svg || 'F').trim()
    }

    // Validação básica
    const camposFaltando = []
    if (!dadosValidados.nm_modelo) {
      camposFaltando.push('Nome do modelo é obrigatório')
    }
    if (!dadosValidados.dado_svg || dadosValidados.dado_svg === '{}') {
      camposFaltando.push('Dados do modelo são obrigatórios')
    }
    if (!dadosValidados.tp_svg || !['A', 'S'].includes(dadosValidados.tp_svg)) {
      camposFaltando.push('Tipo deve ser A (Armazém) ou S (Silo)')
    }
    if (!dadosValidados.vista_svg || !['T', 'F'].includes(dadosValidados.vista_svg)) {
      camposFaltando.push('Vista deve ser T (Topo) ou F (Frontal)')
    }

    if (camposFaltando.length > 0) {
      return {
        status: 422,
        success: false,
        message: 'Erro de validação',
        error: { erros: camposFaltando }
      }
    }

    console.log('🔄 [modeloSvgService] Salvando modelo:', {
      nm_modelo: dadosValidados.nm_modelo,
      tp_svg: dadosValidados.tp_svg,
      vista_svg: dadosValidados.vista_svg,
      tamanho_dados: dadosValidados.dado_svg.length
    })

    const response = await client.post('/svg', dadosValidados, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pegarToken()}`
      }
    })

    console.log('✅ [modeloSvgService] Modelo salvo com sucesso:', response.data)

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Modelo salvo com sucesso!'
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao salvar modelo:', error)

    const status = error.response?.status || 500
    let mensagem = 'Erro ao salvar modelo'

    if (error.response?.data?.message) {
      mensagem = error.response.data.message
    } else if (error.response?.data?.error) {
      mensagem = error.response.data.error
    }

    return {
      status,
      success: false,
      message: mensagem,
      error: error.response?.data || error
    }
  }
}

// GET - Buscar modelos com filtro opcional por tipo
const buscarModelos = async (tipo = null) => {
  try {
    const url = tipo ? `/svg?tp_svg=${tipo}` : '/svg'

    console.log('🔄 [modeloSvgService] Buscando modelos:', { tipo, url })

    const response = await client.get(url, {
      headers: { 
        'Authorization': `Bearer ${pegarToken()}` 
      }
    })

    console.log('✅ [modeloSvgService] Modelos encontrados:', response.data?.length || 0)

    return {
      status: response.status,
      data: response.data,
      success: true
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao buscar modelos:', error)
    return {
      status: error.response?.status || 500,
      data: [],
      success: false,
      error: error.response?.data || error
    }
  }
}

// GET - Buscar modelo por ID
const buscarModeloPorId = async (id) => {
  try {
    console.log('🔄 [modeloSvgService] Buscando modelo por ID:', id)

    const response = await client.get(`/svg/${id}`, {
      headers: { 
        'Authorization': `Bearer ${pegarToken()}` 
      }
    })

    console.log('✅ [modeloSvgService] Modelo encontrado:', response.data?.nm_modelo)

    return {
      status: response.status,
      data: response.data,
      success: true
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao buscar modelo por ID:', error)
    return {
      status: error.response?.status || 500,
      data: null,
      success: false,
      error: error.response?.data || error
    }
  }
}

// PUT - Atualizar modelo existente
const atualizarModelo = async (id, dadosModelo) => {
  try {
    const dadosValidados = {
      nm_modelo: (dadosModelo.nm_modelo || '').trim(),
      dado_svg: paraString(dadosModelo.dado_svg),
      ds_modelo: (dadosModelo.ds_modelo || '').trim(),
      tp_svg: (dadosModelo.tp_svg || '').trim(),
      vista_svg: (dadosModelo.vista_svg || 'F').trim()
    }

    console.log('🔄 [modeloSvgService] Atualizando modelo:', {
      id,
      nm_modelo: dadosValidados.nm_modelo
    })

    const response = await client.put(`/svg/${id}`, dadosValidados, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pegarToken()}`
      }
    })

    console.log('✅ [modeloSvgService] Modelo atualizado com sucesso')

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Modelo atualizado com sucesso!'
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao atualizar modelo:', error)
    return {
      status: error.response?.status || 500,
      success: false,
      message: 'Erro ao atualizar modelo',
      error: error.response?.data || error
    }
  }
}

// DELETE - Excluir modelo
const excluirModelo = async (id) => {
  try {
    console.log('🔄 [modeloSvgService] Excluindo modelo:', id)

    const response = await client.delete(`/svg/${id}`, {
      headers: { 
        'Authorization': `Bearer ${pegarToken()}` 
      }
    })

    console.log('✅ [modeloSvgService] Modelo excluído com sucesso')

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Modelo excluído com sucesso!'
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao excluir modelo:', error)
    return {
      status: error.response?.status || 500,
      success: false,
      message: 'Erro ao excluir modelo',
      error: error.response?.data || error
    }
  }
}

export const modeloSvgService = {
  salvarModelo,
  buscarModelos,
  buscarModeloPorId,
  atualizarModelo,
  excluirModelo
}
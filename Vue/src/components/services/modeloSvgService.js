
import client from '@/api.js'

const salvarModelo = async (dadosModelo) => {
  try {
    console.log('🔄 [modeloSvgService] Enviando modelo para API:', {
      nome: dadosModelo.nm_modelo,
      tipo: dadosModelo.tp_svg,
      tamanhoJSON: dadosModelo.dados_svg?.length || 0,
      descricao: dadosModelo.ds_modelo?.substring(0, 50) + '...'
    })

    const response = await client.post('/svg', dadosModelo)

    console.log('✅ [modeloSvgService] Modelo salvo na API com sucesso:', {
      status: response.status,
      modeloId: response.data?.id_svg,
      nome: dadosModelo.nm_modelo
    })

    return {
      status: response.status,
      data: response.data
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao salvar modelo na API:', {
      erro: error.message,
      status: error.response?.status,
      dadosErro: error.response?.data
    })
    return {
      status: error.response?.status || 500,
      data: error.response?.data || { error: 'Erro interno' }
    }
  }
}

const buscarModelos = (tipo = null) => {
  const url = tipo ? `/svg?tp_svg=${tipo}` : '/svg'
  return client.get(url).catch(e => e.response)
}

const excluirModelo = (id) => {
  return client.delete(`/svg/${id}`).catch(e => e.response)
}

const buscarModeloPorId = (id) => {
  return client.get(`/svg/${id}`).catch(e => e.response)
}

const atualizarModelo = (id, dadosModelo) => {
  return client.put(`/svg/${id}`, dadosModelo).catch(e => e.response)
}

export const modeloSvgService = {
  salvarModelo,
  buscarModelos,
  excluirModelo,
  buscarModeloPorId,
  atualizarModelo
}

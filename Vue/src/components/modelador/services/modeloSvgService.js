// src/servicos/modeloSvgService.js
import client from '@/api.js'

// Helpers
const pegarToken = () => localStorage.getItem('token') || ''

const normalizarModelo = (dados = {}) => {
  const nome = (dados.nm_modelo || dados.nome || '').trim()
  const descricao = (dados.ds_modelo || dados.descricao || '').trim()

  // Tipo: A (Armazém) | S (Silo)
  let tipo = (dados.tp_svg || dados.tipo || '').toString().trim().toUpperCase()
  if (!['A', 'S'].includes(tipo)) {
    if (/arma/i.test(tipo)) tipo = 'A'
    else if (/silo/i.test(tipo)) tipo = 'S'
    else tipo = 'A' // Padrão para armazém
  }

  // Vista: T (Topo) | F (Frontal)
  let vista = (dados.vista_svg || dados.vista || dados.vistaSvg || 'F').toString().trim().toUpperCase()
  if (!['T', 'F'].includes(vista)) {
    if (/top/i.test(vista)) vista = 'T'
    else vista = 'F' // Padrão para frontal
  }

  // Dado SVG (string ou objeto) - SEMPRE converter para string JSON
  let dadoSvg = dados.dado_svg || dados.dadosSvg || dados.dados
  if (typeof dadoSvg === 'object' && dadoSvg !== null) {
    dadoSvg = JSON.stringify(dadoSvg)
  } else if (typeof dadoSvg !== 'string') {
    dadoSvg = JSON.stringify(dadoSvg || {})
  }
  
  // Garantir que não é string vazia
  if (!dadoSvg || dadoSvg.trim() === '' || dadoSvg === '{}') {
    dadoSvg = JSON.stringify({ erro: 'Dados SVG não fornecidos' })
  }

  // Imagem (base64/URL string)
  const imagem = (dados.imagem || dados.imagemBase64 || '').toString().trim()

  return {
    nm_modelo: nome,
    dado_svg: dadoSvg,
    ds_modelo: descricao,
    tp_svg: tipo,
    vista_svg: vista,
    imagem
  }
}

const validarDados = (dadosValidados) => {
  const erros = []
  
  // Validações obrigatórias conforme API
  if (!dadosValidados.nm_modelo || dadosValidados.nm_modelo.trim() === '') {
    erros.push('Nome do modelo (nm_modelo) é obrigatório')
  }
  
  if (!dadosValidados.dado_svg || dadosValidados.dado_svg.trim() === '') {
    erros.push('Dados do modelo (dado_svg) são obrigatórios')
  }
  
  if (!['A', 'S'].includes(dadosValidados.tp_svg)) {
    erros.push('Tipo deve ser A (Armazém) ou S (Silo)')
  }
  
  if (!['T', 'F'].includes(dadosValidados.vista_svg)) {
    erros.push('Vista deve ser T (Topo) ou F (Frontal)')
  }
  
  return erros
}

// POST - Salvar novo modelo
const salvarModelo = async (dadosModelo) => {
  try {
    const dadosValidados = normalizarModelo(dadosModelo)
    const erros = validarDados(dadosValidados)
    
    if (erros.length) {
      console.warn('⚠️ [modeloSvgService] Erros de validação:', erros)
      return { 
        status: 422, 
        success: false, 
        message: 'Erro de validação: ' + erros.join(', '), 
        error: { erros } 
      }
    }

    console.log('🔄 [modeloSvgService] Salvando modelo:', {
      nm_modelo: dadosValidados.nm_modelo,
      tp_svg: dadosValidados.tp_svg,
      vista_svg: dadosValidados.vista_svg,
      ds_modelo: dadosValidados.ds_modelo,
      tamanho_dados: dadosValidados.dado_svg?.length || 0,
      tem_imagem: !!dadosValidados.imagem
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
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        mensagem = error.response.data
      } else if (error.response.data.message) {
        mensagem = error.response.data.message
      } else if (error.response.data.error) {
        mensagem = error.response.data.error
      }
    } else if (error.message) {
      mensagem = error.message
    }
    
    return { 
      status, 
      success: false, 
      message: mensagem, 
      error: error.response?.data || error.message || error 
    }
  }
}

// GET - Buscar modelos (opcional filtro tp_svg = 'A' | 'S')
const buscarModelos = async (tipo = null) => {
  try {
    const url = tipo ? `/svg?tp_svg=${encodeURIComponent(tipo)}` : '/svg'
    console.log('🔄 [modeloSvgService] Buscando modelos:', { tipo, url })

    const response = await client.get(url, {
      headers: { 'Authorization': `Bearer ${pegarToken()}` }
    })

    console.log('✅ [modeloSvgService] Modelos encontrados:', Array.isArray(response.data) ? response.data.length : 1)

    return { status: response.status, data: response.data, success: true }
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
      headers: { 'Authorization': `Bearer ${pegarToken()}` }
    })

    console.log('✅ [modeloSvgService] Modelo encontrado:', response.data?.nm_modelo)

    return { status: response.status, data: response.data, success: true }
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

// PUT - Atualizar modelo
const atualizarModelo = async (id, dadosModelo) => {
  try {
    const dadosValidados = normalizarModelo(dadosModelo)
    const erros = validarDados(dadosValidados)
    if (erros.length) {
      return { status: 422, success: false, message: 'Erro de validação', error: { erros } }
    }

    console.log('🔄 [modeloSvgService] Atualizando modelo:', { id, nm_modelo: dadosValidados.nm_modelo })

    const response = await client.put(`/svg/${id}`, dadosValidados, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pegarToken()}`
      }
    })

    console.log('✅ [modeloSvgService] Modelo atualizado')

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Modelo atualizado com sucesso!'
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao atualizar modelo:', error)
    const status = error.response?.status || 500
    const mensagem = error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar modelo'
    return { status, success: false, message: mensagem, error: error.response?.data || error }
  }
}

// DELETE - Excluir modelo
const excluirModelo = async (id) => {
  try {
    console.log('🔄 [modeloSvgService] Excluindo modelo:', id)

    const response = await client.delete(`/svg/${id}`, {
      headers: { 'Authorization': `Bearer ${pegarToken()}` }
    })

    console.log('✅ [modeloSvgService] Modelo excluído')

    return {
      status: response.status,
      data: response.data,
      success: true,
      message: 'Modelo excluído com sucesso!'
    }
  } catch (error) {
    console.error('❌ [modeloSvgService] Erro ao excluir modelo:', error)
    const status = error.response?.status || 500
    const mensagem = error.response?.data?.message || error.response?.data?.error || 'Erro ao excluir modelo'
    return { status, success: false, message: mensagem, error: error.response?.data || error }
  }
}

export const modeloSvgService = {
  salvarModelo,
  buscarModelos,
  buscarModeloPorId,
  atualizarModelo,
  excluirModelo
}

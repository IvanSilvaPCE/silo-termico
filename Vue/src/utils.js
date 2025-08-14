import { jwtDecode } from 'jwt-decode'

export function verificarPerfilOperacao(cdParametros) {
   const token = localStorage.getItem('token') || null
   const decodedToken = jwtDecode(token)

   if (decodedToken && decodedToken.user && decodedToken.user.usuarios_perfis) {
      const perfilOuOperacaoEncontrado = decodedToken.user.usuarios_perfis.some((perfil) => {
         if (cdParametros.some(cdParametro => perfil.cd_perfil === cdParametro)) {
            return true
         }
         return perfil.transacoes.some((transacao) =>
            transacao.operacoes.some((op) =>
               cdParametros.some(cdParametro => op.cd_transacao_operacao === cdParametro)
            )
         )
      })
      return perfilOuOperacaoEncontrado
   }
   return false
}
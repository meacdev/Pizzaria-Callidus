/**
 * @file auth.service.ts
 * @brief Serviço de autenticação do painel administrativo.
 *
 * @details
 * Implementação temporária com credenciais fixas — deve ser substituída
 * pela chamada real à API de autenticação quando o backend estiver pronto.
 */

/**
 * @brief Verifica as credenciais de acesso ao painel administrativo.
 * @param usuario Nome de usuário informado no login.
 * @param senha Senha informada no login.
 * @return O token de sessão quando as credenciais são válidas, ou `null` caso contrário.
 */
export async function verificarLogin(usuario: string, senha: string): Promise<string | null> {
    // exemplo temporário
    if (usuario === 'admin' && senha === '1234') {
        return 'token-fake-123'; // aqui viria o token real da API
    }
    return null;
}
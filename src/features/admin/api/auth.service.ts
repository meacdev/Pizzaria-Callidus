export async function verificarLogin(usuario: string, senha: string): Promise<string | null> {
    // exemplo temporário
    if (usuario === 'admin' && senha === '1234') {
        return 'token-fake-123'; // aqui viria o token real da API
    }
    return null;
}
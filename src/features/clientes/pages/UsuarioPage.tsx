/**
 * @file UsuarioPage.tsx
 * @brief Página "Área do usuário" (rota /usuario): login, cadastro e conta do cliente.
 *
 * @details
 * Página multi-idioma (Português/Inglês/Espanhol via @see LocaleContext).
 * Três estados possíveis, todos nesta mesma rota:
 * - Não logado, aba "login" — formulário de autenticação (@see LoginCliente).
 * - Não logado, aba "cadastro" — formulário de criação de conta (@see CadastroCliente).
 * - Logado — resumo da conta, pontos de fidelidade e atalhos (@see ContaCliente).
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { useClienteAuth } from '../context/ClienteAuthContext';
import { autenticarCliente, cadastrarCliente } from '../api/cliente.service';
import { mascararCpf, mascararTelefone } from '../../pizzaria/utils/checkout.utils';
import { useLocale } from '../../../i18n/LocaleContext';
import type { ClienteCadastroInput, LoginClienteInput } from '../types/cliente';

/** @brief Valores iniciais (vazios) do formulário de login. */
const LOGIN_INICIAL: LoginClienteInput = { login: '', senha: '' };
/** @brief Valores iniciais (vazios) do formulário de cadastro. */
const CADASTRO_INICIAL: ClienteCadastroInput = {
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    login: '',
    senha: '',
};

/**
 * @brief Formulário de criação de conta do cliente.
 * @details Ao concluir com sucesso, já efetua login automaticamente
 * (@see ClienteAuthContext.entrar) com a conta recém-criada.
 */
function CadastroCliente() {
    const { entrar } = useClienteAuth();
    const { t } = useLocale();
    const [dados, setDados] = useState<ClienteCadastroInput>(CADASTRO_INICIAL);
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    /** @brief Atualiza um único campo do formulário de cadastro. */
    function atualizar<K extends keyof ClienteCadastroInput>(campo: K, valor: ClienteCadastroInput[K]) {
        setDados((atuais) => ({ ...atuais, [campo]: valor }));
    }

    /** @brief Envia o cadastro para a API e, em caso de sucesso, autentica o cliente. */
    async function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setErro('');
        setEnviando(true);
        try {
            const cliente = await cadastrarCliente(dados);
            entrar(cliente);
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível concluir o cadastro.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <form className="formulario-checkout" onSubmit={handleSubmit} noValidate>
            <fieldset className="grupo-formulario">
                <legend>{t('usuario.cadastroLegenda')}</legend>

                <div className="campo-formulario">
                    <label htmlFor="usuario-cadastro-nome">{t('usuario.cadastroNome')}</label>
                    <input
                        id="usuario-cadastro-nome"
                        type="text"
                        autoComplete="name"
                        required
                        value={dados.nome}
                        onChange={(e) => atualizar('nome', e.target.value)}
                    />
                </div>

                <div className="grade-formulario">
                    <div className="campo-formulario">
                        <label htmlFor="usuario-cadastro-email">{t('usuario.cadastroEmail')}</label>
                        <input
                            id="usuario-cadastro-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={dados.email}
                            onChange={(e) => atualizar('email', e.target.value)}
                        />
                    </div>
                    <div className="campo-formulario">
                        <label htmlFor="usuario-cadastro-telefone">{t('usuario.cadastroTelefone')}</label>
                        <input
                            id="usuario-cadastro-telefone"
                            type="tel"
                            inputMode="tel"
                            placeholder="(00) 00000-0000"
                            autoComplete="tel"
                            required
                            value={dados.telefone}
                            onChange={(e) => atualizar('telefone', mascararTelefone(e.target.value))}
                        />
                    </div>
                </div>

                <div className="grade-formulario">
                    <div className="campo-formulario">
                        <label htmlFor="usuario-cadastro-cpf">{t('usuario.cadastroCpf')}</label>
                        <input
                            id="usuario-cadastro-cpf"
                            type="text"
                            inputMode="numeric"
                            placeholder="000.000.000-00"
                            value={dados.cpf}
                            onChange={(e) => atualizar('cpf', mascararCpf(e.target.value))}
                        />
                    </div>
                    <div className="campo-formulario">
                        <label htmlFor="usuario-cadastro-login">{t('usuario.cadastroLogin')}</label>
                        <input
                            id="usuario-cadastro-login"
                            type="text"
                            autoComplete="username"
                            required
                            minLength={3}
                            value={dados.login}
                            onChange={(e) => atualizar('login', e.target.value)}
                        />
                    </div>
                </div>

                <div className="campo-formulario">
                    <label htmlFor="usuario-cadastro-senha">{t('usuario.cadastroSenha')}</label>
                    <input
                        id="usuario-cadastro-senha"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={4}
                        value={dados.senha}
                        onChange={(e) => atualizar('senha', e.target.value)}
                    />
                </div>
            </fieldset>

            {erro && <span className="erro-campo" role="alert">{erro}</span>}

            <div className="acoes-pagina">
                <button type="submit" className="botao-primario" disabled={enviando}>
                    {enviando ? t('usuario.cadastroBotaoCarregando') : t('usuario.cadastroBotao')}
                </button>
            </div>
        </form>
    );
}

/** @brief Formulário de login do cliente (por login/usuário ou e-mail). */
function LoginCliente() {
    const { entrar } = useClienteAuth();
    const { t } = useLocale();
    const [dados, setDados] = useState<LoginClienteInput>(LOGIN_INICIAL);
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    /** @brief Autentica o cliente e, em caso de sucesso, abre a sessão. */
    async function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setErro('');
        setEnviando(true);
        try {
            const resposta = await autenticarCliente(dados);
            entrar(resposta.cliente);
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <form className="formulario-checkout" onSubmit={handleSubmit} noValidate>
            <fieldset className="grupo-formulario">
                <legend>{t('usuario.loginLegenda')}</legend>

                <div className="campo-formulario">
                    <label htmlFor="usuario-login-login">{t('usuario.loginCampoLogin')}</label>
                    <input
                        id="usuario-login-login"
                        type="text"
                        autoComplete="username"
                        required
                        value={dados.login}
                        onChange={(e) => setDados((atuais) => ({ ...atuais, login: e.target.value }))}
                    />
                </div>

                <div className="campo-formulario">
                    <label htmlFor="usuario-login-senha">{t('usuario.loginCampoSenha')}</label>
                    <input
                        id="usuario-login-senha"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={dados.senha}
                        onChange={(e) => setDados((atuais) => ({ ...atuais, senha: e.target.value }))}
                    />
                </div>
            </fieldset>

            {erro && <span className="erro-campo" role="alert">{erro}</span>}

            <div className="acoes-pagina">
                <button type="submit" className="botao-primario" disabled={enviando}>
                    {enviando ? t('usuario.loginBotaoCarregando') : t('usuario.loginBotao')}
                </button>
            </div>
        </form>
    );
}

/** @brief Resumo da conta do cliente logado: saudação, pontos de fidelidade e atalhos. */
function ContaCliente() {
    const { cliente, sair } = useClienteAuth();
    const { t } = useLocale();
    if (!cliente) return null;

    return (
        <div className="usuario-conta">
            <div className="usuario-conta-cabecalho">
                <div>
                    <p className="usuario-conta-saudacao">
                        {t('usuario.saudacao', { nome: cliente.nome.split(' ')[0] })}
                    </p>
                    <p className="usuario-conta-email">{cliente.email}</p>
                </div>
                <button type="button" className="botao-secundario" onClick={sair}>{t('usuario.sair')}</button>
            </div>

            <div className="usuario-fidelidade">
                <span className="usuario-fidelidade-label">{t('usuario.fidelidadeLabel')}</span>
                <strong className="usuario-fidelidade-pontos">
                    {t('usuario.fidelidadePontos', { pontos: cliente.pontosFidelidade })}
                </strong>
                <span className="usuario-fidelidade-descricao">{t('usuario.fidelidadeDescricao')}</span>
            </div>

            <div className="usuario-acoes">
                <Link className="botao-primario" to="/compras">{t('usuario.acaoCompras')}</Link>
                <Link className="botao-secundario" to="/usuario/reservar">{t('usuario.acaoReservar')}</Link>
                <Link className="botao-secundario" to="/cardapio">{t('usuario.acaoCardapio')}</Link>
            </div>
        </div>
    );
}

/** @brief Página /usuario — login, cadastro ou resumo da conta, dependendo da sessão do cliente. */
export function UsuarioPage() {
    const { autenticado } = useClienteAuth();
    const { t } = useLocale();
    const [aba, setAba] = useState<'login' | 'cadastro'>('login');

    return (
        <>
            <main className="principal cabecalho-pagina">
                <span className="tag">{t('usuario.tag')}</span>
                <h1>{autenticado ? t('usuario.tituloConta') : t('usuario.tituloEntrar')}</h1>
                {!autenticado && <p>{t('usuario.subtitulo')}</p>}
            </main>

            <div className="principal usuario-layout">
                {autenticado ? (
                    <ContaCliente />
                ) : (
                    <div className="usuario-formulario">
                        <div className="usuario-abas" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={aba === 'login'}
                                className={`usuario-aba ${aba === 'login' ? 'usuario-aba-ativa' : ''}`}
                                onClick={() => setAba('login')}
                            >
                                {t('usuario.abaEntrar')}
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={aba === 'cadastro'}
                                className={`usuario-aba ${aba === 'cadastro' ? 'usuario-aba-ativa' : ''}`}
                                onClick={() => setAba('cadastro')}
                            >
                                {t('usuario.abaCadastrar')}
                            </button>
                        </div>

                        {aba === 'login' ? <LoginCliente /> : <CadastroCliente />}
                    </div>
                )}
            </div>
        </>
    );
}

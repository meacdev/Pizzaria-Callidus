import { useState } from 'react';
import { Link } from 'react-router';
import { useClienteAuth } from '../context/ClienteAuthContext';
import { autenticarCliente, cadastrarCliente } from '../api/cliente.service';
import { mascararCpf, mascararTelefone } from '../../pizzaria/utils/checkout.utils';
import type { ClienteCadastroInput, LoginClienteInput } from '../types/cliente';

const LOGIN_INICIAL: LoginClienteInput = { login: '', senha: '' };
const CADASTRO_INICIAL: ClienteCadastroInput = {
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    login: '',
    senha: '',
};

function CadastroCliente() {
    const { entrar } = useClienteAuth();
    const [dados, setDados] = useState<ClienteCadastroInput>(CADASTRO_INICIAL);
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

    function atualizar<K extends keyof ClienteCadastroInput>(campo: K, valor: ClienteCadastroInput[K]) {
        setDados((atuais) => ({ ...atuais, [campo]: valor }));
    }

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
                <legend>Criar minha conta</legend>

                <div className="campo-formulario">
                    <label htmlFor="usuario-cadastro-nome">Nome completo</label>
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
                        <label htmlFor="usuario-cadastro-email">E-mail</label>
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
                        <label htmlFor="usuario-cadastro-telefone">Telefone</label>
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
                        <label htmlFor="usuario-cadastro-cpf">CPF (opcional)</label>
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
                        <label htmlFor="usuario-cadastro-login">Login</label>
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
                    <label htmlFor="usuario-cadastro-senha">Senha</label>
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
                    {enviando ? 'Criando conta...' : 'Criar conta e entrar'}
                </button>
            </div>
        </form>
    );
}

function LoginCliente() {
    const { entrar } = useClienteAuth();
    const [dados, setDados] = useState<LoginClienteInput>(LOGIN_INICIAL);
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);

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
                <legend>Entrar na minha conta</legend>

                <div className="campo-formulario">
                    <label htmlFor="usuario-login-login">Login ou e-mail</label>
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
                    <label htmlFor="usuario-login-senha">Senha</label>
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
                    {enviando ? 'Entrando...' : 'Entrar'}
                </button>
            </div>
        </form>
    );
}

function ContaCliente() {
    const { cliente, sair } = useClienteAuth();
    if (!cliente) return null;

    return (
        <div className="usuario-conta">
            <div className="usuario-conta-cabecalho">
                <div>
                    <p className="usuario-conta-saudacao">Olá, {cliente.nome.split(' ')[0]}!</p>
                    <p className="usuario-conta-email">{cliente.email}</p>
                </div>
                <button type="button" className="botao-secundario" onClick={sair}>Sair da conta</button>
            </div>

            <div className="usuario-fidelidade">
                <span className="usuario-fidelidade-label">Programa de fidelidade</span>
                <strong className="usuario-fidelidade-pontos">{cliente.pontosFidelidade} ponto(s)</strong>
                <span className="usuario-fidelidade-descricao">
                    Você ganha 1 ponto a cada R$ 10 em pedidos feitos logado na sua conta.
                </span>
            </div>

            <div className="usuario-acoes">
                <Link className="botao-primario" to="/compras">Minhas compras</Link>
                <Link className="botao-secundario" to="/usuario/reservar">Reservar uma mesa</Link>
                <Link className="botao-secundario" to="/cardapio">Ver cardápio</Link>
            </div>
        </div>
    );
}

export function UsuarioPage() {
    const { autenticado } = useClienteAuth();
    const [aba, setAba] = useState<'login' | 'cadastro'>('login');

    return (
        <>
            <main className="principal cabecalho-pagina">
                <span className="tag">Área do usuário</span>
                <h1>{autenticado ? 'Minha conta' : 'Entrar ou criar conta'}</h1>
                {!autenticado && (
                    <p>Crie sua conta para acompanhar suas compras, reservar mesa e acumular pontos de fidelidade.</p>
                )}
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
                                Já tenho conta
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={aba === 'cadastro'}
                                className={`usuario-aba ${aba === 'cadastro' ? 'usuario-aba-ativa' : ''}`}
                                onClick={() => setAba('cadastro')}
                            >
                                Criar conta
                            </button>
                        </div>

                        {aba === 'login' ? <LoginCliente /> : <CadastroCliente />}
                    </div>
                )}
            </div>
        </>
    );
}

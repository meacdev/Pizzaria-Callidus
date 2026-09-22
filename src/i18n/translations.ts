/**
 * @file translations.ts
 * @brief Dicionário de textos multi-idioma da área do cliente.
 *
 * @details
 * Cobre só a "área do cliente" (login/cadastro em /usuario, histórico de
 * compras em /compras, reserva de mesa e o rótulo do botão de área do
 * usuário no cabeçalho) — o restante da loja (cardápio, checkout etc.)
 * continua só em português, por decisão de escopo.
 *
 * Cada idioma é um objeto aninhado com a mesma forma; @see LocaleContext
 * para a função `t()` que faz a busca por chave (ex: "usuario.sair") com
 * placeholders `{assim}` e fallback automático para o Português caso uma
 * chave não exista em outro idioma.
 */

/** @brief Idiomas suportados pela área do cliente. */
export type Idioma = 'pt' | 'en' | 'es';

/** @brief Metadados de cada idioma suportado, usados pelo seletor de idioma. */
export const IDIOMAS: readonly { readonly codigo: Idioma; readonly rotulo: string; readonly bandeira: string }[] = [
    { codigo: 'pt', rotulo: 'Português', bandeira: '🇧🇷' },
    { codigo: 'en', rotulo: 'English', bandeira: '🇺🇸' },
    { codigo: 'es', rotulo: 'Español', bandeira: '🇪🇸' },
];

/** @brief Estrutura (aninhada) de um dicionário de traduções — todo idioma segue essa mesma forma. */
export interface Dicionario {
    readonly header: {
        readonly areaUsuario: string;
        readonly ola: string;
    };
    readonly usuario: {
        readonly tag: string;
        readonly tituloEntrar: string;
        readonly tituloConta: string;
        readonly subtitulo: string;
        readonly abaEntrar: string;
        readonly abaCadastrar: string;
        readonly loginLegenda: string;
        readonly loginCampoLogin: string;
        readonly loginCampoSenha: string;
        readonly loginBotao: string;
        readonly loginBotaoCarregando: string;
        readonly cadastroLegenda: string;
        readonly cadastroNome: string;
        readonly cadastroEmail: string;
        readonly cadastroTelefone: string;
        readonly cadastroCpf: string;
        readonly cadastroLogin: string;
        readonly cadastroSenha: string;
        readonly cadastroBotao: string;
        readonly cadastroBotaoCarregando: string;
        readonly saudacao: string;
        readonly fidelidadeLabel: string;
        readonly fidelidadePontos: string;
        readonly fidelidadeDescricao: string;
        readonly acaoCompras: string;
        readonly acaoReservar: string;
        readonly acaoCardapio: string;
        readonly sair: string;
    };
    readonly compras: {
        readonly tag: string;
        readonly titulo: string;
        readonly subtitulo: string;
        readonly carregando: string;
        readonly vazioTitulo: string;
        readonly vazioTexto: string;
        readonly vazioBotao: string;
        readonly feitoEm: string;
        readonly status: {
            readonly recebido: string;
            readonly em_preparo: string;
            readonly pronto: string;
            readonly saiu_para_entrega: string;
            readonly entregue: string;
            readonly cancelado: string;
        };
    };
    readonly reserva: {
        readonly tag: string;
        readonly titulo: string;
        readonly subtitulo: string;
        readonly legendaMesa: string;
        readonly mesa: string;
        readonly legendaQuando: string;
        readonly campoData: string;
        readonly campoHora: string;
        readonly campoPessoas: string;
        readonly campoTelefone: string;
        readonly botaoCancelar: string;
        readonly botaoConfirmar: string;
        readonly botaoConfirmando: string;
        readonly sucessoTitulo: string;
        readonly sucessoTexto: string;
        readonly sucessoBotao: string;
        readonly erroMesa: string;
        readonly erroTelefone: string;
    };
}

/** @brief Textos em Português (idioma padrão da loja). */
const pt: Dicionario = {
    header: {
        areaUsuario: 'Área do usuário',
        ola: 'Olá, {nome}',
    },
    usuario: {
        tag: 'Área do usuário',
        tituloEntrar: 'Entrar ou criar conta',
        tituloConta: 'Minha conta',
        subtitulo: 'Crie sua conta para acompanhar suas compras, reservar mesa e acumular pontos de fidelidade.',
        abaEntrar: 'Já tenho conta',
        abaCadastrar: 'Criar conta',
        loginLegenda: 'Entrar na minha conta',
        loginCampoLogin: 'Login ou e-mail',
        loginCampoSenha: 'Senha',
        loginBotao: 'Entrar',
        loginBotaoCarregando: 'Entrando...',
        cadastroLegenda: 'Criar minha conta',
        cadastroNome: 'Nome completo',
        cadastroEmail: 'E-mail',
        cadastroTelefone: 'Telefone',
        cadastroCpf: 'CPF (opcional)',
        cadastroLogin: 'Login',
        cadastroSenha: 'Senha',
        cadastroBotao: 'Criar conta e entrar',
        cadastroBotaoCarregando: 'Criando conta...',
        saudacao: 'Olá, {nome}!',
        fidelidadeLabel: 'Programa de fidelidade',
        fidelidadePontos: '{pontos} ponto(s)',
        fidelidadeDescricao: 'Você ganha 1 ponto a cada R$ 10 em pedidos feitos logado na sua conta.',
        acaoCompras: 'Minhas compras',
        acaoReservar: 'Reservar uma mesa',
        acaoCardapio: 'Ver cardápio',
        sair: 'Sair da conta',
    },
    compras: {
        tag: 'Minha conta',
        titulo: 'Minhas compras',
        subtitulo: 'Histórico de pedidos feitos com a sua conta.',
        carregando: 'Carregando suas compras...',
        vazioTitulo: 'Você ainda não tem nenhuma compra',
        vazioTexto: 'Faça seu primeiro pedido pelo cardápio para vê-lo aqui.',
        vazioBotao: 'Ver cardápio',
        feitoEm: 'Feito em {data}',
        status: {
            recebido: 'Na fila',
            em_preparo: 'Em preparo',
            pronto: 'Concluído / aguardando envio',
            saiu_para_entrega: 'Saiu para entrega',
            entregue: 'Entregue',
            cancelado: 'Cancelado',
        },
    },
    reserva: {
        tag: 'Reserva de mesa',
        titulo: 'Reservar uma mesa',
        subtitulo: 'Escolha a mesa, a data e o número de pessoas. O garçom confirma sua reserva no salão.',
        legendaMesa: 'Escolha a mesa (até {capacidade} pessoas por mesa)',
        mesa: 'Mesa {numero}',
        legendaQuando: 'Quando',
        campoData: 'Data',
        campoHora: 'Hora',
        campoPessoas: 'Número de pessoas',
        campoTelefone: 'Telefone de contato',
        botaoCancelar: 'Cancelar',
        botaoConfirmar: 'Confirmar reserva',
        botaoConfirmando: 'Reservando...',
        sucessoTitulo: 'Reserva enviada!',
        sucessoTexto: 'Sua reserva da mesa {mesa} para {data} às {hora} foi registrada e já aparece para o garçom confirmar.',
        sucessoBotao: 'Voltar para minha conta',
        erroMesa: 'Escolha uma mesa.',
        erroTelefone: 'Informe um telefone de contato.',
    },
};

/** @brief Textos em Inglês. */
const en: Dicionario = {
    header: {
        areaUsuario: 'User area',
        ola: 'Hi, {nome}',
    },
    usuario: {
        tag: 'User area',
        tituloEntrar: 'Log in or create an account',
        tituloConta: 'My account',
        subtitulo: 'Create your account to track your orders, book a table and earn loyalty points.',
        abaEntrar: 'I already have an account',
        abaCadastrar: 'Create account',
        loginLegenda: 'Log in to my account',
        loginCampoLogin: 'Username or e-mail',
        loginCampoSenha: 'Password',
        loginBotao: 'Log in',
        loginBotaoCarregando: 'Logging in...',
        cadastroLegenda: 'Create my account',
        cadastroNome: 'Full name',
        cadastroEmail: 'E-mail',
        cadastroTelefone: 'Phone',
        cadastroCpf: 'CPF (optional)',
        cadastroLogin: 'Username',
        cadastroSenha: 'Password',
        cadastroBotao: 'Create account and log in',
        cadastroBotaoCarregando: 'Creating account...',
        saudacao: 'Hi, {nome}!',
        fidelidadeLabel: 'Loyalty program',
        fidelidadePontos: '{pontos} point(s)',
        fidelidadeDescricao: 'You earn 1 point for every R$ 10 spent on orders placed while logged in.',
        acaoCompras: 'My orders',
        acaoReservar: 'Book a table',
        acaoCardapio: 'View menu',
        sair: 'Log out',
    },
    compras: {
        tag: 'My account',
        titulo: 'My orders',
        subtitulo: 'History of orders placed with your account.',
        carregando: 'Loading your orders...',
        vazioTitulo: "You don't have any orders yet",
        vazioTexto: 'Place your first order from the menu to see it here.',
        vazioBotao: 'View menu',
        feitoEm: 'Placed on {data}',
        status: {
            recebido: 'In queue',
            em_preparo: 'Preparing',
            pronto: 'Ready / awaiting dispatch',
            saiu_para_entrega: 'Out for delivery',
            entregue: 'Delivered',
            cancelado: 'Cancelled',
        },
    },
    reserva: {
        tag: 'Table reservation',
        titulo: 'Book a table',
        subtitulo: 'Choose the table, date and number of guests. The waiter confirms your reservation at the venue.',
        legendaMesa: 'Choose a table (up to {capacidade} guests per table)',
        mesa: 'Table {numero}',
        legendaQuando: 'When',
        campoData: 'Date',
        campoHora: 'Time',
        campoPessoas: 'Number of guests',
        campoTelefone: 'Contact phone',
        botaoCancelar: 'Cancel',
        botaoConfirmar: 'Confirm reservation',
        botaoConfirmando: 'Booking...',
        sucessoTitulo: 'Reservation sent!',
        sucessoTexto: 'Your reservation for table {mesa} on {data} at {hora} has been registered and is now waiting for the waiter to confirm.',
        sucessoBotao: 'Back to my account',
        erroMesa: 'Choose a table.',
        erroTelefone: 'Enter a contact phone number.',
    },
};

/** @brief Textos em Espanhol. */
const es: Dicionario = {
    header: {
        areaUsuario: 'Área del usuario',
        ola: 'Hola, {nome}',
    },
    usuario: {
        tag: 'Área del usuario',
        tituloEntrar: 'Iniciar sesión o crear cuenta',
        tituloConta: 'Mi cuenta',
        subtitulo: 'Crea tu cuenta para seguir tus compras, reservar mesa y acumular puntos de fidelidad.',
        abaEntrar: 'Ya tengo cuenta',
        abaCadastrar: 'Crear cuenta',
        loginLegenda: 'Iniciar sesión en mi cuenta',
        loginCampoLogin: 'Usuario o correo electrónico',
        loginCampoSenha: 'Contraseña',
        loginBotao: 'Iniciar sesión',
        loginBotaoCarregando: 'Iniciando sesión...',
        cadastroLegenda: 'Crear mi cuenta',
        cadastroNome: 'Nombre completo',
        cadastroEmail: 'Correo electrónico',
        cadastroTelefone: 'Teléfono',
        cadastroCpf: 'CPF (opcional)',
        cadastroLogin: 'Usuario',
        cadastroSenha: 'Contraseña',
        cadastroBotao: 'Crear cuenta e iniciar sesión',
        cadastroBotaoCarregando: 'Creando cuenta...',
        saudacao: '¡Hola, {nome}!',
        fidelidadeLabel: 'Programa de fidelidad',
        fidelidadePontos: '{pontos} punto(s)',
        fidelidadeDescricao: 'Ganas 1 punto por cada R$ 10 en pedidos hechos con tu cuenta iniciada.',
        acaoCompras: 'Mis compras',
        acaoReservar: 'Reservar una mesa',
        acaoCardapio: 'Ver menú',
        sair: 'Cerrar sesión',
    },
    compras: {
        tag: 'Mi cuenta',
        titulo: 'Mis compras',
        subtitulo: 'Historial de pedidos hechos con tu cuenta.',
        carregando: 'Cargando tus compras...',
        vazioTitulo: 'Todavía no tienes ninguna compra',
        vazioTexto: 'Haz tu primer pedido desde el menú para verlo aquí.',
        vazioBotao: 'Ver menú',
        feitoEm: 'Hecho el {data}',
        status: {
            recebido: 'En cola',
            em_preparo: 'En preparación',
            pronto: 'Listo / esperando envío',
            saiu_para_entrega: 'En camino',
            entregue: 'Entregado',
            cancelado: 'Cancelado',
        },
    },
    reserva: {
        tag: 'Reserva de mesa',
        titulo: 'Reservar una mesa',
        subtitulo: 'Elige la mesa, la fecha y el número de personas. El camarero confirma tu reserva en el local.',
        legendaMesa: 'Elige la mesa (hasta {capacidade} personas por mesa)',
        mesa: 'Mesa {numero}',
        legendaQuando: 'Cuándo',
        campoData: 'Fecha',
        campoHora: 'Hora',
        campoPessoas: 'Número de personas',
        campoTelefone: 'Teléfono de contacto',
        botaoCancelar: 'Cancelar',
        botaoConfirmar: 'Confirmar reserva',
        botaoConfirmando: 'Reservando...',
        sucessoTitulo: '¡Reserva enviada!',
        sucessoTexto: 'Tu reserva de la mesa {mesa} para el {data} a las {hora} fue registrada y ya aparece para que el camarero la confirme.',
        sucessoBotao: 'Volver a mi cuenta',
        erroMesa: 'Elige una mesa.',
        erroTelefone: 'Ingresa un teléfono de contacto.',
    },
};

/** @brief Todos os dicionários de tradução, indexados pelo código do idioma. */
export const DICIONARIOS: Record<Idioma, Dicionario> = { pt, en, es };

/** @brief Locale do `Intl`/`toLocaleDateString` correspondente a cada idioma (formatação de datas). */
export const LOCALE_INTL: Record<Idioma, string> = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
};

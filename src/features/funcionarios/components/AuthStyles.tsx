/**
 * @file AuthStyles.tsx
 * @brief Componentes styled-components compartilhados entre as telas de login e cadastro de funcionário.
 *
 * @details
 * Usados pela tela de login (/admin, @see LoginPage), pelo login de
 * customização (@see CustomLoginPage) e pela tela de cadastro
 * (/admin/cadastro) dos funcionários, para manter a mesma identidade
 * visual entre elas.
 */
import styled, { css, keyframes } from 'styled-components';

// Estilos compartilhados entre a tela de login (/admin) e a de cadastro
// (/admin/cadastro) dos funcionários.

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.96);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
`;

/** @brief Animação de rotação contínua, usada no spinner de carregamento do botão. */
export const spin = keyframes`
    to { transform: rotate(360deg); }
`;

/** @brief Fundo escurecido em tela cheia que centraliza o modal de login/cadastro. */
export const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    overflow-y: auto;
    animation: ${fadeIn} 0.3s ease;
    z-index: 1000;
`;

/** @brief Cartão branco do formulário de login/cadastro. */
export const Modal = styled.div`
    background: #ffffff;
    padding: 2.5rem;
    border-radius: 16px;
    width: 100%;
    max-width: 420px;
    margin: auto;
    box-shadow:
        0 20px 60px rgba(15, 23, 42, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

/** @brief Cabeçalho centralizado do modal (ícone, título e subtítulo). */
export const Header = styled.div`
    text-align: center;
    margin-bottom: 2rem;
`;

/** @brief Emblema/ícone de destaque no topo do modal. */
export const Icon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 1.5rem;
    color: white;
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
`;

/** @brief Título principal do modal. */
export const Title = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.02em;
`;

/** @brief Texto de apoio abaixo do título do modal. */
export const Subtitle = styled.p`
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
`;

/** @brief Contêiner do formulário, empilhando os campos verticalmente. */
export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

/** @brief Linha de duas colunas para agrupar dois campos lado a lado. */
export const Linha = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

/** @brief Agrupa um rótulo (`Label`) e seu campo de entrada. */
export const Campo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
`;

/** @brief Rótulo de um campo do formulário. */
export const Label = styled.label`
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.01em;
`;

const camposBase = `
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
    color: #1a1a2e;
    background: #fafbfc;
    transition: all 0.2s ease;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;

    &:hover {
        border-color: #d1d5db;
        background: #ffffff;
    }

    &:focus {
        border-color: #4361ee;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.1);
    }
`;

/** @brief Campo de texto padrão do formulário. */
export const Input = styled.input`
    ${camposBase}

    &::placeholder {
        color: #9ca3af;
    }
`;

/** @brief Campo de seleção (dropdown) padrão do formulário. */
export const Select = styled.select`
    ${camposBase}
    cursor: pointer;
`;

/** @brief Mensagem de erro de validação exibida junto a um campo específico. */
export const CampoErro = styled.span`
    color: #dc2626;
    font-size: 0.75rem;
    font-weight: 500;
`;

/** @brief Mensagem de erro geral do formulário (ex: falha de login), com animação de "shake". */
export const Erro = styled.p`
    color: #dc2626;
    font-size: 0.8125rem;
    font-weight: 500;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    animation: ${shake} 0.4s ease;

    &::before {
        content: '⚠';
        font-size: 0.875rem;
    }
`;

/** @brief Mensagem de sucesso do formulário (ex: cadastro concluído). */
export const Sucesso = styled.p`
    color: #16a34a;
    font-size: 0.8125rem;
    font-weight: 500;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;

    &::before {
        content: '✓';
        font-size: 0.875rem;
    }
`;

/** @brief Botão primário do formulário; quando `$loading` é verdadeiro, oculta o texto e mostra um spinner. */
export const Botao = styled.button<{ $loading?: boolean }>`
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 0.875rem 1.5rem;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 14px rgba(67, 97, 238, 0.3);
    letter-spacing: 0.01em;
    margin-top: 0.5rem;
    position: relative;
    overflow: hidden;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    ${({ $loading }) =>
        $loading &&
        css`
            color: transparent;

            &::after {
                content: '';
                position: absolute;
                width: 18px;
                height: 18px;
                top: 50%;
                left: 50%;
                margin-left: -9px;
                margin-top: -9px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: ${spin} 0.8s linear infinite;
            }
        `}
`;

/** @brief Texto de rodapé do modal com um link de ação (ex: ir para o cadastro). */
export const LinkRodape = styled.p`
    text-align: center;
    margin: 1.5rem 0 0;
    font-size: 0.8125rem;
    color: #6b7280;

    a {
        color: #4361ee;
        font-weight: 600;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;

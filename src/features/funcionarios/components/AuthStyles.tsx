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

export const spin = keyframes`
    to { transform: rotate(360deg); }
`;

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

export const Header = styled.div`
    text-align: center;
    margin-bottom: 2rem;
`;

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

export const Title = styled.h2`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
    margin: 0.5rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

export const Linha = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

export const Campo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
`;

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

export const Input = styled.input`
    ${camposBase}

    &::placeholder {
        color: #9ca3af;
    }
`;

export const Select = styled.select`
    ${camposBase}
    cursor: pointer;
`;

export const CampoErro = styled.span`
    color: #dc2626;
    font-size: 0.75rem;
    font-weight: 500;
`;

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

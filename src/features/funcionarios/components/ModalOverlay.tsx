import { useEffect } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';

const Fundo = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(5, 2, 1, 0.72);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 100;
`;

const Cartao = styled.div<{ $largura: string }>`
    width: 100%;
    max-width: ${({ $largura }) => $largura};
    max-height: min(88vh, 780px);
    overflow-y: auto;
    background: #1f110d;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 20px;
    padding: 1.75rem;
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
    color: #fff;
    box-sizing: border-box;
`;

const Topo = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;

    h2 {
        margin: 0;
        font-size: 1.3rem;
    }

    p {
        margin: 0.35rem 0 0;
        color: #d7c9c4;
        font-size: 0.88rem;
    }
`;

const BotaoFechar = styled.button`
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: transparent;
    color: #fff;
    font-size: 1.1rem;
    cursor: pointer;

    &:hover {
        border-color: #ff5c5c;
        color: #ff5c5c;
    }
`;

interface ModalOverlayProps {
    readonly titulo: string;
    readonly descricao?: string;
    readonly largura?: string;
    readonly onFechar: () => void;
    readonly children: ReactNode;
}

export function ModalOverlay({ titulo, descricao, largura = '480px', onFechar, children }: Readonly<ModalOverlayProps>) {
    useEffect(() => {
        function aoTeclar(evento: KeyboardEvent) {
            if (evento.key === 'Escape') onFechar();
        }
        document.addEventListener('keydown', aoTeclar);
        return () => document.removeEventListener('keydown', aoTeclar);
    }, [onFechar]);

    return (
        <Fundo onClick={onFechar}>
            <Cartao $largura={largura} onClick={(evento) => evento.stopPropagation()}>
                <Topo>
                    <div>
                        <h2>{titulo}</h2>
                        {descricao && <p>{descricao}</p>}
                    </div>
                    <BotaoFechar type="button" onClick={onFechar} aria-label="Fechar">✕</BotaoFechar>
                </Topo>
                {children}
            </Cartao>
        </Fundo>
    );
}

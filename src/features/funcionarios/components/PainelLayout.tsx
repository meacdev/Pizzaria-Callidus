import styled from 'styled-components';
import { useNavigate } from 'react-router';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';

const Pagina = styled.div<{ $escuro: boolean }>`
    min-height: 100vh;
    background: ${({ $escuro }) => $escuro
        ? 'radial-gradient(circle at 15% 0%, rgba(255, 42, 42, 0.06), transparent 32%), #1a0d0a'
        : '#f4f5f7'};
    color: ${({ $escuro }) => ($escuro ? '#ffffff' : '#1a1a2e')};
    padding: 2rem 1.5rem;
    box-sizing: border-box;
`;

const Cabecalho = styled.header<{ $escuro: boolean }>`
    max-width: 1200px;
    margin: 0 auto 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
`;

const TituloWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.875rem;
`;

const Icone = styled.div<{ $escuro: boolean }>`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${({ $escuro }) => $escuro ? 'linear-gradient(135deg, #ff2a2a 0%, #8f1111 100%)' : 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.375rem;
`;

const Titulo = styled.h1<{ $escuro: boolean }>`
    margin: 0;
    font-size: 1.375rem;
    color: ${({ $escuro }) => ($escuro ? '#ffffff' : '#1a1a2e')};
`;

const Saudacao = styled.p<{ $escuro: boolean }>`
    margin: 0.125rem 0 0;
    font-size: 0.875rem;
    color: ${({ $escuro }) => ($escuro ? '#d7c9c4' : '#6b7280')};
`;

const BotaoSair = styled.button<{ $escuro: boolean }>`
    background: ${({ $escuro }) => ($escuro ? '#281410' : '#ffffff')};
    border: 1.5px solid ${({ $escuro }) => ($escuro ? 'rgba(255,255,255,.12)' : '#e5e7eb')};
    border-radius: 10px;
    padding: 0.625rem 1.125rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: ${({ $escuro }) => ($escuro ? '#ffffff' : '#374151')};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #ff2a2a;
        color: #ff5c5c;
    }
`;

const Conteudo = styled.main`
    max-width: 1200px;
    margin: 0 auto;
`;

interface PainelLayoutProps {
    icone: string;
    titulo: string;
    children: React.ReactNode;
    tema?: 'claro' | 'escuro';
}

export function PainelLayout({ icone, titulo, children, tema = 'claro' }: Readonly<PainelLayoutProps>) {
    const { funcionario, sair } = useFuncionarioAuth();
    const navigate = useNavigate();

    const sairDaConta = () => {
        sair();
        navigate('/admin');
    };

    const escuro = tema === 'escuro';

    return (
        <Pagina $escuro={escuro}>
            <Cabecalho $escuro={escuro}>
                <TituloWrapper>
                    <Icone $escuro={escuro}>{icone}</Icone>
                    <div>
                        <Titulo $escuro={escuro}>{titulo}</Titulo>
                        <Saudacao $escuro={escuro}>Olá, {funcionario?.nome}</Saudacao>
                    </div>
                </TituloWrapper>

                <BotaoSair $escuro={escuro} onClick={sairDaConta}>Sair</BotaoSair>
            </Cabecalho>

            <Conteudo>{children}</Conteudo>
        </Pagina>
    );
}

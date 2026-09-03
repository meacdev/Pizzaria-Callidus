import styled from 'styled-components';
import { useNavigate } from 'react-router';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';

const Pagina = styled.div`
    min-height: 100vh;
    background: #f4f5f7;
    padding: 2rem 1.5rem;
    box-sizing: border-box;
`;

const Cabecalho = styled.header`
    max-width: 960px;
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

const Icone = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.375rem;
`;

const Titulo = styled.h1`
    margin: 0;
    font-size: 1.375rem;
    color: #1a1a2e;
`;

const Saudacao = styled.p`
    margin: 0.125rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
`;

const BotaoSair = styled.button`
    background: #ffffff;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    padding: 0.625rem 1.125rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #dc2626;
        color: #dc2626;
    }
`;

const Conteudo = styled.main`
    max-width: 960px;
    margin: 0 auto;
`;

interface PainelLayoutProps {
    icone: string;
    titulo: string;
    children: React.ReactNode;
}

export function PainelLayout({ icone, titulo, children }: Readonly<PainelLayoutProps>) {
    const { funcionario, sair } = useFuncionarioAuth();
    const navigate = useNavigate();

    const sairDaConta = () => {
        sair();
        navigate('/admin');
    };

    return (
        <Pagina>
            <Cabecalho>
                <TituloWrapper>
                    <Icone>{icone}</Icone>
                    <div>
                        <Titulo>{titulo}</Titulo>
                        <Saudacao>Olá, {funcionario?.nome}</Saudacao>
                    </div>
                </TituloWrapper>

                <BotaoSair onClick={sairDaConta}>Sair</BotaoSair>
            </Cabecalho>

            <Conteudo>{children}</Conteudo>
        </Pagina>
    );
}

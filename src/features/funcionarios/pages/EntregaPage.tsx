import styled from 'styled-components';
import { PainelLayout } from '../components/PainelLayout';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';

const Cartao = styled.div`
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
`;

const Lista = styled.ul`
    margin: 1rem 0 0;
    padding-left: 1.25rem;
    color: #374151;
    line-height: 1.8;
`;

export function EntregaPage() {
    const { funcionario } = useFuncionarioAuth();

    return (
        <PainelLayout icone="🛵" titulo="Painel de Entrega">
            <Cartao>
                <h2 style={{ marginTop: 0 }}>Bem-vindo(a), {funcionario?.nome}!</h2>
                <p style={{ color: '#6b7280' }}>
                    {funcionario?.tempoExperiencia} ano(s) de experiência como entregador(a).
                </p>
                <p>
                    Esta é a tela exclusiva de entrega. Aqui entrará a lista de pedidos prontos
                    para saírem para entrega.
                </p>
                <Lista>
                    <li>Ver pedidos prontos para retirada</li>
                    <li>Marcar pedido como "saiu para entrega" / "entregue"</li>
                </Lista>
            </Cartao>
        </PainelLayout>
    );
}

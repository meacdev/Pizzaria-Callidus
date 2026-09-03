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

export function CozinhaPage() {
    const { funcionario } = useFuncionarioAuth();

    return (
        <PainelLayout icone="🍕" titulo="Painel da Cozinha">
            <Cartao>
                <h2 style={{ marginTop: 0 }}>Bem-vindo(a), {funcionario?.nome}!</h2>
                <p style={{ color: '#6b7280' }}>
                    {funcionario?.tempoExperiencia} ano(s) de experiência como cozinheiro(a).
                </p>
                <p>
                    Esta é a tela exclusiva da cozinha. Aqui entrará a fila de pedidos a preparar.
                </p>
                <Lista>
                    <li>Ver pedidos pendentes de preparo</li>
                    <li>Marcar pedido como "em preparo" / "pronto"</li>
                </Lista>
            </Cartao>
        </PainelLayout>
    );
}

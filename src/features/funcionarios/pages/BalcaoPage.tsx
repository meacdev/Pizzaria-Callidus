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

export function BalcaoPage() {
    const { funcionario } = useFuncionarioAuth();

    return (
        <PainelLayout icone="🧾" titulo="Painel do Balcão">
            <Cartao>
                <h2 style={{ marginTop: 0 }}>Bem-vindo(a), {funcionario?.nome}!</h2>
                <p style={{ color: '#6b7280' }}>
                    {funcionario?.tempoExperiencia} ano(s) de experiência como garçom/garçonete.
                </p>
                <p>
                    Esta é a tela exclusiva do balcão/atendimento. Aqui entrará o acompanhamento
                    dos pedidos dos clientes.
                </p>
                <Lista>
                    <li>Acompanhar pedidos em andamento</li>
                    <li>Confirmar retirada / entrega da mesa</li>
                </Lista>
            </Cartao>
        </PainelLayout>
    );
}

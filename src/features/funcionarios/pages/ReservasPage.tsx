import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PainelLayout } from '../components/PainelLayout';
import { listarReservas, atualizarStatusReserva } from '../../reservas/api/reserva.service';
import { STATUS_RESERVA_LABEL, type Reserva } from '../../reservas/types/reserva';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
`;

const Cabecalho = styled.div`
    padding: 1.75rem 2rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    background: linear-gradient(145deg, #281410, rgba(58, 28, 21, 0.82));
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
`;

const Titulo = styled.h2`
    margin: 0;
    font-size: clamp(1.45rem, 2.5vw, 2rem);
    color: #fff;
    letter-spacing: -0.02em;
`;

const Descricao = styled.p`
    margin: 0.55rem 0 0;
    color: #d7c9c4;
    line-height: 1.55;
    max-width: 850px;
`;

const Erro = styled.p`
    margin: 1rem 0 0;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(230, 0, 0, 0.3);
    border-radius: 12px;
    background: rgba(230, 0, 0, 0.09);
    color: #ffb0b0;
`;

const Filtro = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;

    input {
        border: 1.5px solid rgba(255, 255, 255, 0.16);
        border-radius: 8px;
        padding: 0.55rem 0.75rem;
        font-size: 0.9rem;
        color: #fff;
        background: #1a0d0a;
        color-scheme: dark;
    }
`;

const Lista = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
`;

const Card = styled.article`
    min-width: 0;
    padding: 1.15rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: #281410;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
`;

const Topo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    strong {
        font-size: 1rem;
        color: #fff;
    }
`;

const Status = styled.span<{ $status: string }>`
    flex-shrink: 0;
    padding: 0.38rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 800;
    white-space: nowrap;
    background: ${({ $status }) => $status === 'confirmada' ? 'rgba(42, 200, 110, 0.13)' : $status === 'cancelada' ? 'rgba(230, 0, 0, 0.12)' : 'rgba(255, 199, 44, 0.14)'};
    color: ${({ $status }) => $status === 'confirmada' ? '#8df0b5' : $status === 'cancelada' ? '#ffb0b0' : '#ffd86a'};
    border: 1px solid ${({ $status }) => $status === 'confirmada' ? 'rgba(42, 200, 110, 0.25)' : $status === 'cancelada' ? 'rgba(230, 0, 0, 0.25)' : 'rgba(255, 199, 44, 0.25)'};
`;

const Info = styled.p`
    margin: 0.95rem 0 0;
    color: #d7c9c4;
    line-height: 1.5;
    font-size: 0.9rem;

    strong {
        color: #fff;
    }
`;

const Acoes = styled.div`
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin-top: 1rem;
`;

const Botao = styled.button`
    min-height: 40px;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 0.6rem 0.9rem;
    font-weight: 800;
    background: #ff2a2a;
    color: #fff;

    &:hover:not(:disabled) {
        background: #ff5c5c;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const BotaoSecundario = styled(Botao)`
    background: #3a1c15;
    border-color: rgba(255, 255, 255, 0.12);

    &:hover:not(:disabled) {
        background: #47231a;
    }
`;

const Vazio = styled.div`
    min-height: 86px;
    padding: 1.4rem;
    display: grid;
    place-items: center;
    color: #d7c9c4;
    border: 1px dashed rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    text-align: center;
    background: rgba(0, 0, 0, 0.08);
`;

function formatarDataHora(data: string) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(data));
}

export function ReservasPage() {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [dataFiltro, setDataFiltro] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);

    async function carregar() {
        try {
            setReservas(await listarReservas(dataFiltro ? { data: dataFiltro } : undefined));
            setErro('');
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível carregar as reservas.');
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        void carregar();
        const intervalo = window.setInterval(() => void carregar(), 10000);
        return () => window.clearInterval(intervalo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataFiltro]);

    const ativas = useMemo(
        () => reservas.filter((r) => r.status !== 'cancelada').sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
        [reservas],
    );

    async function alterarStatus(id: string, status: 'confirmada' | 'cancelada') {
        try {
            const atualizada = await atualizarStatusReserva(id, status);
            setReservas((atuais) => atuais.map((r) => (r.id === id ? atualizada : r)));
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível atualizar a reserva.');
        }
    }

    return (
        <PainelLayout icone="📅" titulo="Reservas de mesa" tema="escuro">
            <Container>
                <Cabecalho>
                    <Titulo>Reservas feitas pelo site</Titulo>
                    <Descricao>
                        Reservas que os clientes fazem na conta deles (/usuario) aparecem aqui. Confirme ou cancele
                        conforme a disponibilidade do salão.
                    </Descricao>
                    {erro && <Erro role="alert"><strong>Erro:</strong> {erro}</Erro>}
                    <div style={{ marginTop: '1rem' }}>
                        <Filtro>
                            <label htmlFor="reservas-filtro-data" style={{ color: '#d7c9c4', fontSize: '0.88rem' }}>
                                Filtrar por data:
                            </label>
                            <input
                                id="reservas-filtro-data"
                                type="date"
                                value={dataFiltro}
                                onChange={(e) => setDataFiltro(e.target.value)}
                            />
                            {dataFiltro && (
                                <BotaoSecundario type="button" onClick={() => setDataFiltro('')}>
                                    Limpar filtro
                                </BotaoSecundario>
                            )}
                        </Filtro>
                    </div>
                </Cabecalho>

                {carregando ? (
                    <Vazio>Carregando reservas...</Vazio>
                ) : ativas.length === 0 ? (
                    <Vazio>Nenhuma reserva {dataFiltro ? 'para essa data' : 'pendente ou confirmada'}.</Vazio>
                ) : (
                    <Lista>
                        {ativas.map((reserva) => (
                            <Card key={reserva.id}>
                                <Topo>
                                    <strong>Mesa {reserva.mesa}</strong>
                                    <Status $status={reserva.status}>{STATUS_RESERVA_LABEL[reserva.status]}</Status>
                                </Topo>
                                <Info>
                                    <strong>{reserva.nome}</strong> • {reserva.telefone}
                                    <br />
                                    {formatarDataHora(reserva.dataHora)} • {reserva.pessoas} pessoa(s)
                                </Info>
                                <Acoes>
                                    {reserva.status === 'pendente' && (
                                        <Botao onClick={() => void alterarStatus(reserva.id, 'confirmada')}>
                                            Confirmar
                                        </Botao>
                                    )}
                                    <BotaoSecundario onClick={() => void alterarStatus(reserva.id, 'cancelada')}>
                                        Cancelar
                                    </BotaoSecundario>
                                </Acoes>
                            </Card>
                        ))}
                    </Lista>
                )}
            </Container>
        </PainelLayout>
    );
}

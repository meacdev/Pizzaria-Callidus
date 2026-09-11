import { useState } from 'react';
import { Link } from 'react-router';
import { useClienteAuth } from '../context/ClienteAuthContext';
import { criarReserva } from '../../reservas/api/reserva.service';
import { NUMEROS_DAS_MESAS, CAPACIDADE_MESA } from '../../pizzaria/constants/mesas';
import { mascararTelefone } from '../../pizzaria/utils/checkout.utils';

function amanha(): string {
    const data = new Date();
    data.setDate(data.getDate() + 1);
    return data.toISOString().slice(0, 10);
}

export function ReservarMesaPage() {
    const { cliente } = useClienteAuth();

    const [mesa, setMesa] = useState<number | null>(null);
    const [data, setData] = useState(amanha());
    const [hora, setHora] = useState('19:00');
    const [pessoas, setPessoas] = useState(2);
    const [telefone, setTelefone] = useState('');
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [confirmada, setConfirmada] = useState(false);

    if (!cliente) return null;

    async function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setErro('');

        if (!mesa) {
            setErro('Escolha uma mesa.');
            return;
        }
        if (!telefone.trim()) {
            setErro('Informe um telefone de contato.');
            return;
        }

        setEnviando(true);
        try {
            await criarReserva({
                clienteId: cliente!.id,
                nome: cliente!.nome,
                telefone,
                mesa,
                pessoas,
                dataHora: new Date(`${data}T${hora}:00`).toISOString(),
            });
            setConfirmada(true);
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível reservar a mesa.');
        } finally {
            setEnviando(false);
        }
    }

    if (confirmada) {
        return (
            <div className="principal usuario-layout">
                <div className="reserva-sucesso">
                    <h2>Reserva enviada!</h2>
                    <p>
                        Sua reserva da mesa {mesa} para {new Date(`${data}T${hora}:00`).toLocaleDateString('pt-BR')} às {hora} foi
                        registrada e já aparece para o garçom confirmar.
                    </p>
                    <div className="acoes-pagina">
                        <Link className="botao-primario" to="/usuario">Voltar para minha conta</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <main className="principal cabecalho-pagina">
                <span className="tag">Reserva de mesa</span>
                <h1>Reservar uma mesa</h1>
                <p>Escolha a mesa, a data e o número de pessoas. O garçom confirma sua reserva no salão.</p>
            </main>

            <div className="principal usuario-layout">
                <form className="formulario-checkout" onSubmit={handleSubmit} noValidate>
                    <fieldset className="grupo-formulario">
                        <legend>Escolha a mesa (até {CAPACIDADE_MESA} pessoas por mesa)</legend>
                        <div className="reserva-lista-mesas">
                            {NUMEROS_DAS_MESAS.map((numero) => (
                                <button
                                    key={numero}
                                    type="button"
                                    className={`reserva-opcao-mesa ${mesa === numero ? 'reserva-opcao-mesa-selecionada' : ''}`}
                                    aria-pressed={mesa === numero}
                                    onClick={() => setMesa(numero)}
                                >
                                    Mesa {numero}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="grupo-formulario">
                        <legend>Quando</legend>
                        <div className="grade-formulario">
                            <div className="campo-formulario">
                                <label htmlFor="reserva-data">Data</label>
                                <input
                                    id="reserva-data"
                                    type="date"
                                    required
                                    min={new Date().toISOString().slice(0, 10)}
                                    value={data}
                                    onChange={(e) => setData(e.target.value)}
                                />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="reserva-hora">Hora</label>
                                <input
                                    id="reserva-hora"
                                    type="time"
                                    required
                                    value={hora}
                                    onChange={(e) => setHora(e.target.value)}
                                />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="reserva-pessoas">Número de pessoas</label>
                                <input
                                    id="reserva-pessoas"
                                    type="number"
                                    min={1}
                                    max={CAPACIDADE_MESA}
                                    required
                                    value={pessoas}
                                    onChange={(e) => setPessoas(Number(e.target.value))}
                                />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="reserva-telefone">Telefone de contato</label>
                                <input
                                    id="reserva-telefone"
                                    type="tel"
                                    inputMode="tel"
                                    placeholder="(00) 00000-0000"
                                    required
                                    value={telefone}
                                    onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                                />
                            </div>
                        </div>
                    </fieldset>

                    {erro && <span className="erro-campo" role="alert">{erro}</span>}

                    <div className="acoes-pagina">
                        <Link className="botao-secundario" to="/usuario">Cancelar</Link>
                        <button type="submit" className="botao-primario" disabled={enviando}>
                            {enviando ? 'Reservando...' : 'Confirmar reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

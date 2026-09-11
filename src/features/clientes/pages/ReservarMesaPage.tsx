/**
 * @file ReservarMesaPage.tsx
 * @brief Página de reserva de mesa pelo cliente (rota /usuario/reservar).
 *
 * @details
 * Protegida por @see ClienteAutenticadoRoute. O cliente escolhe uma mesa,
 * data, hora e número de pessoas; a reserva é criada com status
 * "pendente" e passa a aparecer para o garçom confirmar no painel de
 * reservas (@see ReservasPage, em /admin/reservas). Página multi-idioma
 * (@see LocaleContext).
 */
import { useState } from 'react';
import { Link } from 'react-router';
import { useClienteAuth } from '../context/ClienteAuthContext';
import { criarReserva } from '../../reservas/api/reserva.service';
import { NUMEROS_DAS_MESAS, CAPACIDADE_MESA } from '../../pizzaria/constants/mesas';
import { mascararTelefone } from '../../pizzaria/utils/checkout.utils';
import { useLocale } from '../../../i18n/LocaleContext';

/** @brief Data de amanhã no formato "AAAA-MM-DD", usada como sugestão inicial no campo de data. */
function amanha(): string {
    const data = new Date();
    data.setDate(data.getDate() + 1);
    return data.toISOString().slice(0, 10);
}

/** @brief Página de reserva de mesa do cliente logado. */
export function ReservarMesaPage() {
    const { cliente } = useClienteAuth();
    const { t, localeIntl } = useLocale();

    const [mesa, setMesa] = useState<number | null>(null);
    const [data, setData] = useState(amanha());
    const [hora, setHora] = useState('19:00');
    const [pessoas, setPessoas] = useState(2);
    const [telefone, setTelefone] = useState('');
    const [erro, setErro] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [confirmada, setConfirmada] = useState(false);

    if (!cliente) return null;

    /** @brief Valida os campos e envia a reserva para a API. */
    async function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setErro('');

        if (!mesa) {
            setErro(t('reserva.erroMesa'));
            return;
        }
        if (!telefone.trim()) {
            setErro(t('reserva.erroTelefone'));
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
                    <h2>{t('reserva.sucessoTitulo')}</h2>
                    <p>
                        {t('reserva.sucessoTexto', {
                            mesa: mesa ?? '',
                            data: new Date(`${data}T${hora}:00`).toLocaleDateString(localeIntl),
                            hora,
                        })}
                    </p>
                    <div className="acoes-pagina">
                        <Link className="botao-primario" to="/usuario">{t('reserva.sucessoBotao')}</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <main className="principal cabecalho-pagina">
                <span className="tag">{t('reserva.tag')}</span>
                <h1>{t('reserva.titulo')}</h1>
                <p>{t('reserva.subtitulo')}</p>
            </main>

            <div className="principal usuario-layout">
                <form className="formulario-checkout" onSubmit={handleSubmit} noValidate>
                    <fieldset className="grupo-formulario">
                        <legend>{t('reserva.legendaMesa', { capacidade: CAPACIDADE_MESA })}</legend>
                        <div className="reserva-lista-mesas">
                            {NUMEROS_DAS_MESAS.map((numero) => (
                                <button
                                    key={numero}
                                    type="button"
                                    className={`reserva-opcao-mesa ${mesa === numero ? 'reserva-opcao-mesa-selecionada' : ''}`}
                                    aria-pressed={mesa === numero}
                                    onClick={() => setMesa(numero)}
                                >
                                    {t('reserva.mesa', { numero })}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="grupo-formulario">
                        <legend>{t('reserva.legendaQuando')}</legend>
                        <div className="grade-formulario">
                            <div className="campo-formulario">
                                <label htmlFor="reserva-data">{t('reserva.campoData')}</label>
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
                                <label htmlFor="reserva-hora">{t('reserva.campoHora')}</label>
                                <input
                                    id="reserva-hora"
                                    type="time"
                                    required
                                    value={hora}
                                    onChange={(e) => setHora(e.target.value)}
                                />
                            </div>
                            <div className="campo-formulario">
                                <label htmlFor="reserva-pessoas">{t('reserva.campoPessoas')}</label>
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
                                <label htmlFor="reserva-telefone">{t('reserva.campoTelefone')}</label>
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
                        <Link className="botao-secundario" to="/usuario">{t('reserva.botaoCancelar')}</Link>
                        <button type="submit" className="botao-primario" disabled={enviando}>
                            {enviando ? t('reserva.botaoConfirmando') : t('reserva.botaoConfirmar')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

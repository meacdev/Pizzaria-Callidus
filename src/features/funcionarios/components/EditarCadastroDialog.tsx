import { useState } from 'react';
import styled from 'styled-components';
import { ModalOverlay } from './ModalOverlay';
import { useFuncionarioAuth } from '../context/FuncionarioAuthContext';
import { atualizarFuncionario } from '../api/funcionario.service';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Campo = styled.label`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #d7c9c4;

    input {
        padding: 0.75rem 0.9rem;
        border-radius: 10px;
        border: 1.5px solid rgba(255, 255, 255, 0.16);
        background: #150b08;
        color: #fff;
        font-size: 0.95rem;
    }
`;

const Grade = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: 420px) {
        grid-template-columns: 1fr;
    }
`;

const Aviso = styled.p<{ $erro?: boolean }>`
    margin: 0;
    padding: 0.7rem 0.9rem;
    border-radius: 10px;
    font-size: 0.85rem;
    background: ${({ $erro }) => ($erro ? 'rgba(230,0,0,0.1)' : 'rgba(42,200,110,0.12)')};
    border: 1px solid ${({ $erro }) => ($erro ? 'rgba(230,0,0,0.3)' : 'rgba(42,200,110,0.3)')};
    color: ${({ $erro }) => ($erro ? '#ffb0b0' : '#8df0b5')};
`;

const Acoes = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.25rem;
`;

const BotaoPrimario = styled.button`
    border: none;
    border-radius: 10px;
    padding: 0.75rem 1.3rem;
    font-weight: 800;
    background: #ff2a2a;
    color: #fff;
    cursor: pointer;

    &:hover:not(:disabled) { background: #ff5c5c; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const BotaoSecundario = styled.button`
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 10px;
    padding: 0.75rem 1.3rem;
    font-weight: 700;
    background: transparent;
    color: #fff;
    cursor: pointer;
`;

interface EditarCadastroDialogProps {
    readonly onFechar: () => void;
}

export function EditarCadastroDialog({ onFechar }: Readonly<EditarCadastroDialogProps>) {
    const { funcionario, atualizar } = useFuncionarioAuth();
    const [nome, setNome] = useState(funcionario?.nome ?? '');
    const [idade, setIdade] = useState(String(funcionario?.idade ?? ''));
    const [tempoExperiencia, setTempoExperiencia] = useState(String(funcionario?.tempoExperiencia ?? ''));
    const [login, setLogin] = useState(funcionario?.login ?? '');
    const [novaSenha, setNovaSenha] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState(false);

    async function handleSubmit(evento: React.FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!funcionario) return;

        setErro('');
        setSucesso(false);

        if (nome.trim().length < 2) {
            setErro('Informe seu nome completo.');
            return;
        }

        if (novaSenha && novaSenha.length < 4) {
            setErro('A nova senha deve ter pelo menos 4 caracteres.');
            return;
        }

        setSalvando(true);
        try {
            const atualizado = await atualizarFuncionario(funcionario.id, {
                nome: nome.trim(),
                idade: Number(idade),
                tempoExperiencia: Number(tempoExperiencia),
                login: login.trim(),
                ...(novaSenha ? { senha: novaSenha } : {}),
            });
            atualizar(atualizado);
            setSucesso(true);
            setNovaSenha('');
        } catch (e) {
            setErro(e instanceof Error ? e.message : 'Não foi possível salvar as alterações.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <ModalOverlay titulo="Meu cadastro" descricao="Atualize seus dados. Deixe a senha em branco para mantê-la." onFechar={onFechar}>
            <Form onSubmit={handleSubmit}>
                {erro && <Aviso $erro>{erro}</Aviso>}
                {sucesso && !erro && <Aviso>Cadastro atualizado com sucesso.</Aviso>}

                <Campo>
                    Nome completo
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </Campo>

                <Grade>
                    <Campo>
                        Idade
                        <input type="number" min={16} max={100} value={idade} onChange={(e) => setIdade(e.target.value)} required />
                    </Campo>
                    <Campo>
                        Anos de experiência
                        <input type="number" min={0} max={80} value={tempoExperiencia} onChange={(e) => setTempoExperiencia(e.target.value)} required />
                    </Campo>
                </Grade>

                <Campo>
                    Login
                    <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
                </Campo>

                <Campo>
                    Nova senha (opcional)
                    <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Deixe em branco para não alterar" />
                </Campo>

                <Acoes>
                    <BotaoSecundario type="button" onClick={onFechar}>Fechar</BotaoSecundario>
                    <BotaoPrimario type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</BotaoPrimario>
                </Acoes>
            </Form>
        </ModalOverlay>
    );
}

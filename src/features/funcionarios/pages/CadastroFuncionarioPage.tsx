import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { cadastrarFuncionario } from '../api/funcionario.service';
import { PROFISSAO_LABEL, type Profissao } from '../types/funcionario';
import {
    Botao,
    Campo,
    CampoErro,
    Erro,
    Form,
    Header,
    Icon,
    Input,
    Label,
    Linha,
    LinkRodape,
    Modal,
    Overlay,
    Select,
    Subtitle,
    Sucesso,
    Title,
} from '../components/AuthStyles';

interface CadastroFormData {
    nome: string;
    idade: number;
    tempoExperiencia: number;
    profissao: Profissao;
    login: string;
    senha: string;
    confirmarSenha: string;
}

export function CadastroFuncionarioPage() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CadastroFormData>({
        defaultValues: { profissao: 'cozinheiro' },
    });
    const navigate = useNavigate();
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    const senha = watch('senha');

    const onSubmit = async (dados: CadastroFormData) => {
        setErro(null);
        setLoading(true);

        try {
            await cadastrarFuncionario({
                nome: dados.nome.trim(),
                idade: Number(dados.idade),
                tempoExperiencia: Number(dados.tempoExperiencia),
                login: dados.login.trim(),
                senha: dados.senha,
                profissao: dados.profissao,
            });

            setSucesso(true);
            setTimeout(() => navigate('/admin'), 1500);
        } catch (erroCapturado) {
            setErro(
                erroCapturado instanceof Error
                    ? erroCapturado.message
                    : 'Erro ao conectar. Tente novamente.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Overlay>
            <Modal>
                <Header>
                    <Icon>📝</Icon>
                    <Title>Cadastro de Funcionário</Title>
                    <Subtitle>
                        Preencha seus dados para criar seu acesso ao painel da pizzaria.
                    </Subtitle>
                </Header>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Campo>
                        <Label htmlFor="nome">Nome completo</Label>
                        <Input
                            id="nome"
                            placeholder="Seu nome completo"
                            {...register('nome', { required: 'Informe o nome.' })}
                        />
                        {errors.nome && <CampoErro>{errors.nome.message}</CampoErro>}
                    </Campo>

                    <Linha>
                        <Campo>
                            <Label htmlFor="idade">Idade</Label>
                            <Input
                                id="idade"
                                type="number"
                                min={16}
                                max={100}
                                placeholder="Ex: 25"
                                {...register('idade', {
                                    required: 'Informe a idade.',
                                    min: { value: 16, message: 'Idade mínima: 16' },
                                    max: { value: 100, message: 'Idade inválida' },
                                })}
                            />
                            {errors.idade && (
                                <CampoErro>{errors.idade.message}</CampoErro>
                            )}
                        </Campo>

                        <Campo>
                            <Label htmlFor="tempoExperiencia">Experiência (anos)</Label>
                            <Input
                                id="tempoExperiencia"
                                type="number"
                                min={0}
                                max={80}
                                placeholder="Ex: 2"
                                {...register('tempoExperiencia', {
                                    required: 'Informe o tempo de experiência.',
                                    min: { value: 0, message: 'Não pode ser negativo' },
                                })}
                            />
                            {errors.tempoExperiencia && (
                                <CampoErro>{errors.tempoExperiencia.message}</CampoErro>
                            )}
                        </Campo>
                    </Linha>

                    <Campo>
                        <Label htmlFor="profissao">Cargo</Label>
                        <Select id="profissao" {...register('profissao', { required: true })}>
                            {(Object.keys(PROFISSAO_LABEL) as Profissao[]).map((profissao) => (
                                <option key={profissao} value={profissao}>
                                    {PROFISSAO_LABEL[profissao]}
                                </option>
                            ))}
                        </Select>
                    </Campo>

                    <Campo>
                        <Label htmlFor="login">Login</Label>
                        <Input
                            id="login"
                            placeholder="Escolha um login"
                            autoComplete="username"
                            {...register('login', {
                                required: 'Informe um login.',
                                minLength: { value: 3, message: 'Mínimo de 3 caracteres' },
                            })}
                        />
                        {errors.login && <CampoErro>{errors.login.message}</CampoErro>}
                    </Campo>

                    <Linha>
                        <Campo>
                            <Label htmlFor="senha">Senha</Label>
                            <Input
                                id="senha"
                                type="password"
                                placeholder="Mínimo 4 caracteres"
                                autoComplete="new-password"
                                {...register('senha', {
                                    required: 'Informe uma senha.',
                                    minLength: { value: 4, message: 'Mínimo de 4 caracteres' },
                                })}
                            />
                            {errors.senha && (
                                <CampoErro>{errors.senha.message}</CampoErro>
                            )}
                        </Campo>

                        <Campo>
                            <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                            <Input
                                id="confirmarSenha"
                                type="password"
                                placeholder="Repita a senha"
                                autoComplete="new-password"
                                {...register('confirmarSenha', {
                                    required: 'Confirme a senha.',
                                    validate: (valor) => valor === senha || 'As senhas não coincidem',
                                })}
                            />
                            {errors.confirmarSenha && (
                                <CampoErro>{errors.confirmarSenha.message}</CampoErro>
                            )}
                        </Campo>
                    </Linha>

                    {erro && <Erro>{erro}</Erro>}
                    {sucesso && <Sucesso>Cadastro realizado! Redirecionando para o login...</Sucesso>}

                    <Botao type="submit" disabled={loading || sucesso} $loading={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Botao>
                </Form>

                <LinkRodape>
                    Já tem cadastro? <Link to="/admin">Faça login</Link>
                </LinkRodape>
            </Modal>
        </Overlay>
    );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { autenticarFuncionario } from '../../funcionarios/api/funcionario.service';
import { useFuncionarioAuth } from '../../funcionarios/context/FuncionarioAuthContext';
import {
    Botao,
    Campo,
    Erro,
    Form,
    Header,
    Icon,
    Input,
    Label,
    LinkRodape,
    Modal,
    Overlay,
    Subtitle,
    Title,
} from '../../funcionarios/components/AuthStyles';

interface LoginFormData {
    login: string;
    senha: string;
}

export function LoginPage() {
    const { register, handleSubmit } = useForm<LoginFormData>();
    const { entrar } = useFuncionarioAuth();
    const navigate = useNavigate();
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (dados: LoginFormData) => {
        setErro(null);
        setLoading(true);

        try {
            const resposta = await autenticarFuncionario(dados);
            entrar(resposta.funcionario);
            navigate(resposta.rota);
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
                    <Icon>🔒</Icon>
                    <Title>Login do Funcionário</Title>
                    <Subtitle>
                        Entre com seu login e senha. Você será direcionado para a tela do seu
                        cargo (cozinha, balcão ou entrega).
                    </Subtitle>
                </Header>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Campo>
                        <Label htmlFor="login">Login</Label>
                        <Input
                            id="login"
                            placeholder="Digite seu login"
                            autoComplete="username"
                            {...register('login', { required: true })}
                        />
                    </Campo>

                    <Campo>
                        <Label htmlFor="senha">Senha</Label>
                        <Input
                            id="senha"
                            type="password"
                            placeholder="Digite sua senha"
                            autoComplete="current-password"
                            {...register('senha', { required: true })}
                        />
                    </Campo>

                    {erro && <Erro>{erro}</Erro>}

                    <Botao type="submit" disabled={loading} $loading={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Botao>
                </Form>

                <LinkRodape>
                    Ainda não tem cadastro? <Link to="/admin/cadastro">Cadastre-se aqui</Link>
                </LinkRodape>
            </Modal>
        </Overlay>
    );
}

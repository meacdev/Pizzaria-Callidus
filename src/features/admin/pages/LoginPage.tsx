import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/AuthContext';
import { verificarLogin } from '../api/auth.service';
import './LoginPage.css';

interface LoginFormData {
    usuario: string;
    senha: string;
}

export function LoginPage() {
    const { register, handleSubmit } = useForm<LoginFormData>();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [erro, setErro] = useState<string | null>(null);

    const onSubmit = async (data: LoginFormData) => {
        setErro(null);
        const token = await verificarLogin(data.usuario, data.senha);

        if (!token) {
            setErro('Usuário ou senha incorretos.');
            return;
        }

        login(token);
        navigate('/admin/customizacao');
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Login Admin</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="usuario">Usuário</label>
                        <input id="usuario" {...register('usuario', { required: true })} />
                    </div>

                    <div>
                        <label htmlFor="senha">Senha</label>
                        <input id="senha" type="password" {...register('senha', { required: true })} />
                    </div>

                    {erro && <p className="erro">{erro}</p>}

                    <button type="submit">Entrar</button>
                </form>
            </div>
        </div>
    );
}
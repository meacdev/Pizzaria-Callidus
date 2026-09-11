/**
 * @file usePizzaAdmin.ts
 * @brief Hook do painel administrativo para listar, criar, atualizar e excluir pizzas.
 *
 * @details
 * Encapsula as chamadas a @see pizzaAdmin.service e mantém a lista de
 * pizzas em estado local, carregando-a automaticamente ao montar.
 */
import { useCallback, useEffect, useState } from 'react';
import type { Pizza } from '../../pizzaria/types/pizza';
import {
    atualizarPizzaAdmin,
    criarPizzaAdmin,
    excluirPizzaAdmin,
    listarPizzasAdmin,
    type PizzaFormData,
} from '../api/pizzaAdmin.service';

/**
 * @brief Hook de administração de pizzas: lista, carregando/erro e as ações criar/atualizar/excluir.
 * @return `pizzas`, `carregando`, `erro`, `carregar`, `criar`, `atualizar` e `excluir`.
 */
export function usePizzaAdmin() {
    const [pizzas, setPizzas] = useState<Pizza[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const dados = await listarPizzasAdmin();
            setPizzas(dados);
        } catch {
            setErro('Não foi possível carregar as pizzas.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const criar = useCallback(async (dados: PizzaFormData) => {
        const novaPizza = await criarPizzaAdmin(dados);
        setPizzas((atual) => [...atual, novaPizza]);
    }, []);

    const atualizar = useCallback(async (id: string, dados: PizzaFormData) => {
        const pizzaAtualizada = await atualizarPizzaAdmin(id, dados);
        setPizzas((atual) => atual.map((pizza) => (pizza.id === id ? pizzaAtualizada : pizza)));
    }, []);

    const excluir = useCallback(async (id: string) => {
        await excluirPizzaAdmin(id);
        setPizzas((atual) => atual.filter((pizza) => pizza.id !== id));
    }, []);

    return { pizzas, carregando, erro, carregar, criar, atualizar, excluir };
}

/**
 * @file CampoBusca.tsx
 * @brief Campo de busca genérico e reutilizável, com rótulo acessível.
 */
import { useId } from 'react';

/** @brief Props do componente @see CampoBusca. */
interface CampoBuscaProps {
  readonly valor:        string;
  readonly rotulo:       string;
  readonly placeholder?: string;
  readonly onChange:     (valor: string) => void;
}

/** @brief Campo de busca controlado, com `<label>` associado via `useId`. */
export function CampoBusca({ valor, rotulo, placeholder = 'Digite...', onChange }: CampoBuscaProps) {
    const campoid = useId();
    return (
        <div className="campo-busca">
            <label htmlFor={campoid}>{rotulo}</label>
            <input
                id={campoid}
                type="search"
                value={valor}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
import { useId } from 'react';

interface CampoBuscaProps {
  readonly valor:        string;
  readonly rotulo:       string;
  readonly placeholder?: string;
  readonly onChange:     (valor: string) => void;
}

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
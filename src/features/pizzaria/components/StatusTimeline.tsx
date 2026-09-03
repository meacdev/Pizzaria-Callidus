import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import type { StatusPedido } from '../../../store/pedido.store';

interface StatusTimelineProps {
  statusAtual: StatusPedido;
  className?: string;
}

const STATUS_CONFIG: Record<
  StatusPedido,
  { label: string; icone: string; descricao: string }
> = {
  recebido: {
    label: 'Pedido Recebido',
    icone: '📋',
    descricao: 'Seu pedido foi confirmado',
  },
  em_preparo: {
    label: 'Em Preparo',
    icone: '👨‍🍳',
    descricao: 'A cozinha está preparando',
  },
  pronto: {
    label: 'Pronto',
    icone: '📦',
    descricao: 'Pedido pronto para entrega',
  },
  saiu_para_entrega: {
    label: 'Saiu para Entrega',
    icone: '🛵',
    descricao: 'O entregador está a caminho',
  },
  entregue: {
    label: 'Entregue',
    icone: '✅',
    descricao: 'Bom apetite!',
  },
  cancelado: {
    label: 'Cancelado',
    icone: '❌',
    descricao: 'Pedido cancelado',
  },
};

const ORDEM_STATUS: readonly StatusPedido[] = [
  'recebido',
  'em_preparo',
  'pronto',
  'saiu_para_entrega',
  'entregue',
];

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 42, 42, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(255, 42, 42, 0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 24px 16px;
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--line);
`;

const TimelineHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
  }
  
  p {
    font-size: 0.875rem;
    color: var(--muted);
  }
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  padding: 0 8px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 8px;
    padding: 0;
  }
`;

const ProgressBar = styled.div<{ $progresso: number }>`
  position: absolute;
  top: 20px;
  left: 40px;
  right: 40px;
  height: 4px;
  background: var(--surface-light);
  border-radius: 2px;
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${(p) => p.$progresso}%;
    background: linear-gradient(90deg, var(--primary), var(--primary-light));
    border-radius: 2px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @media (max-width: 640px) {
    display: none;
  }
`;

const StepItem = styled.div<{
  $estado: 'concluido' | 'atual' | 'pendente' | 'cancelado';
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 640px) {
    flex-direction: row;
    gap: 16px;
    width: 100%;
    padding: 8px 0;
  }
  
  ${(p) =>
    p.$estado === 'atual' &&
    css`
      animation: ${slideIn} 0.5s ease;
    `}
`;

const StepIcon = styled.div<{
  $estado: 'concluido' | 'atual' | 'pendente' | 'cancelado';
}>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.4s ease;
  
  ${(p) => {
    switch (p.$estado) {
      case 'concluido':
        return css`
          background: var(--primary);
          border: 2px solid var(--primary);
          color: white;
        `;
      case 'atual':
        return css`
          background: var(--surface);
          border: 3px solid var(--primary);
          color: var(--primary);
          animation: ${pulse} 2s infinite;
        `;
      case 'cancelado':
        return css`
          background: var(--danger);
          border: 2px solid var(--danger);
          color: white;
        `;
      default:
        return css`
          background: var(--surface-light);
          border: 2px solid var(--line);
          color: var(--muted);
        `;
    }
  }}
`;

const StepLabel = styled.div<{
  $estado: 'concluido' | 'atual' | 'pendente' | 'cancelado';
}>`
  text-align: center;
  
  @media (max-width: 640px) {
    text-align: left;
  }
  
  .label {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${(p) =>
      p.$estado === 'atual'
        ? 'var(--primary)'
        : p.$estado === 'concluido'
        ? 'var(--text)'
        : 'var(--muted)'};
    text-transform: uppercase;
    letter-spacing: 0.025em;
    transition: color 0.3s ease;
  }
  
  .desc {
    font-size: 0.7rem;
    color: var(--muted);
    margin-top: 2px;
    display: none;
    
    @media (max-width: 640px) {
      display: block;
    }
  }
`;

const StatusBadge = styled.div<{ $status: StatusPedido }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 16px;
  align-self: center;
  
  ${(p) => {
    switch (p.$status) {
      case 'recebido':
        return css`
          background: rgba(255, 199, 44, 0.15);
          color: var(--warning);
        `;
      case 'em_preparo':
        return css`
          background: rgba(255, 42, 42, 0.15);
          color: var(--primary-light);
        `;
      case 'pronto':
        return css`
          background: rgba(116, 65, 216, 0.15);
          color: #a981f0;
        `;
      case 'saiu_para_entrega':
        return css`
          background: rgba(42, 157, 143, 0.15);
          color: #2a9d8f;
        `;
      case 'entregue':
        return css`
          background: rgba(42, 157, 143, 0.2);
          color: #2a9d8f;
        `;
      case 'cancelado':
        return css`
          background: rgba(230, 0, 0, 0.15);
          color: var(--danger);
        `;
    }
  }}
`;

const TempoEstimado = styled.div`
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  
  .titulo {
    font-size: 0.75rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }
  
  .tempo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
  }
  
  .info {
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: 4px;
  }
`;

function getEstadoStep(
  stepStatus: StatusPedido,
  statusAtual: StatusPedido
): 'concluido' | 'atual' | 'pendente' | 'cancelado' {
  if (statusAtual === 'cancelado') {
    return stepStatus === 'cancelado' ? 'cancelado' : 'pendente';
  }
  
  const idxStep = ORDEM_STATUS.indexOf(stepStatus);
  const idxAtual = ORDEM_STATUS.indexOf(statusAtual);
  
  if (idxStep < idxAtual) return 'concluido';
  if (idxStep === idxAtual) return 'atual';
  return 'pendente';
}

function calcularProgresso(statusAtual: StatusPedido): number {
  if (statusAtual === 'cancelado') return 0;
  const idx = ORDEM_STATUS.indexOf(statusAtual);
  if (idx === -1) return 0;
  return (idx / (ORDEM_STATUS.length - 1)) * 100;
}

function calcularTempoEstimado(statusAtual: StatusPedido): string {
  switch (statusAtual) {
    case 'recebido':
      return '30-45 min';
    case 'em_preparo':
      return '20-30 min';
    case 'pronto':
      return 'Aguardando entregador';
    case 'saiu_para_entrega':
      return '10-15 min';
    case 'entregue':
      return 'Entregue!';
    case 'cancelado':
      return '—';
  }
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  statusAtual,
  className,
}) => {
  const progresso = calcularProgresso(statusAtual);
  const configAtual = STATUS_CONFIG[statusAtual];
  
  // Se cancelado, mostra mensagem especial
  if (statusAtual === 'cancelado') {
    return (
      <TimelineContainer className={className}>
        <TimelineHeader>
          <h3>Pedido Cancelado</h3>
          <p>Entre em contato conosco para mais informações</p>
        </TimelineHeader>
        <StatusBadge $status="cancelado">
          ❌ Cancelado
        </StatusBadge>
      </TimelineContainer>
    );
  }
  
  return (
    <TimelineContainer className={className}>
      <TimelineHeader>
        <h3>Acompanhe seu Pedido</h3>
        <p>Status atual: {configAtual.label}</p>
      </TimelineHeader>
      
      <StepsContainer>
        <ProgressBar $progresso={progresso} />
        
        {ORDEM_STATUS.map((status) => {
          const estado = getEstadoStep(status, statusAtual);
          const config = STATUS_CONFIG[status];
          
          return (
            <StepItem key={status} $estado={estado}>
              <StepIcon $estado={estado}>
                {estado === 'concluido' ? '✓' : config.icone}
              </StepIcon>
              <StepLabel $estado={estado}>
                <div className="label">{config.label}</div>
                <div className="desc">{config.descricao}</div>
              </StepLabel>
            </StepItem>
          );
        })}
      </StepsContainer>
      
      <StatusBadge $status={statusAtual}>
        {configAtual.icone} {configAtual.label}
      </StatusBadge>
      
      <TempoEstimado>
        <div className="titulo">Tempo Estimado</div>
        <div className="tempo">{calcularTempoEstimado(statusAtual)}</div>
        <div className="info">
          {statusAtual === 'entregue'
            ? 'Obrigado pela preferência!'
            : 'Estamos trabalhando para entregar o mais rápido possível'}
        </div>
      </TempoEstimado>
    </TimelineContainer>
  );
};

export default StatusTimeline;
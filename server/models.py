"""!
@file models.py
@brief Modelos de domínio (SQLAlchemy) do painel administrativo da Pizzaria Callidus.

@details
Define as tabelas/classes usadas pelo backend: funcionários (com herança
polimórfica por profissão — cozinheiro, garçom, entregador, gerente),
clientes, reservas de mesa, comandas e pedidos. Também concentra as
constantes de validação (profissões e status válidos) compartilhadas
pelas rotas definidas em app.py.
"""

from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash


db = SQLAlchemy()

PROFISSOES_VALIDAS = ("cozinheiro", "garcom", "entregador", "gerente")
STATUS_PEDIDO_VALIDOS = (
    "recebido",
    "em_preparo",
    "pronto",
    "saiu_para_entrega",
    "entregue",
    "cancelado",
)
STATUS_COMANDA_VALIDOS = ("aberta", "paga", "encerrada")
STATUS_RESERVA_VALIDOS = ("pendente", "confirmada", "cancelada")
# 1 ponto de fidelidade para cada R$10 gastos (arredondado para baixo).
REAIS_POR_PONTO_FIDELIDADE = 10


class Funcionario(db.Model):
    """!
    @brief Classe-base (polimórfica) de todo funcionário do painel administrativo.

    @details
    Cada subclasse (Cozinheiro, Garcom, Entregador, Gerente) representa uma
    profissão e define sua própria rota de destino no painel admin via
    `rota_admin()`. A coluna `profissao` é o discriminador polimórfico do
    SQLAlchemy (`polymorphic_on`), ou seja, o próprio SQLAlchemy decide qual
    subclasse instanciar ao ler um funcionário do banco. As colunas
    principais são `login`/`senha_hash` (autenticação) e `nome`, `idade` e
    `tempo_experiencia` (dados cadastrais).
    """

    __tablename__ = "funcionarios"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    idade = db.Column(db.Integer, nullable=False)
    tempo_experiencia = db.Column(db.Integer, nullable=False)
    login = db.Column(db.String(80), unique=True, nullable=False, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    profissao = db.Column(db.String(20), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "funcionario",
        "polymorphic_on": profissao,
    }

    def definir_senha(self, senha: str) -> None:
        """!
        @brief Gera e armazena o hash da senha do funcionário (nunca a senha em texto puro).
        @param senha Senha em texto puro informada no cadastro/edição.
        @return None.
        """
        self.senha_hash = generate_password_hash(senha)

    def verificar_senha(self, senha: str) -> bool:
        """!
        @brief Confere se a senha informada no login corresponde ao hash armazenado.
        @param senha Senha em texto puro informada no login.
        @return True se a senha confere, False caso contrário.
        """
        return check_password_hash(self.senha_hash, senha)

    def rota_admin(self) -> str:
        """!
        @brief Rota do painel administrativo correspondente à profissão do funcionário.
        @details Deve ser sobrescrito por cada subclasse (Cozinheiro, Garcom,
        Entregador, Gerente); a classe-base sempre levanta NotImplementedError.
        @return Caminho da rota do painel (ex.: "/admin/cozinha").
        """
        raise NotImplementedError("Subclasses de Funcionario devem definir rota_admin().")

    def to_dict(self) -> dict:
        """!
        @brief Serializa o funcionário para um dicionário pronto para virar JSON de resposta.
        @details Nunca inclui `senha_hash`, propositalmente.
        @return Dicionário com id, nome, idade, tempo de experiência, login e profissão.
        """
        return {
            "id": self.id,
            "nome": self.nome,
            "idade": self.idade,
            "tempoExperiencia": self.tempo_experiencia,
            "login": self.login,
            "profissao": self.profissao,
        }


class Cozinheiro(Funcionario):
    """!
    @brief Funcionário responsável pelo preparo dos pedidos na cozinha.
    """

    __mapper_args__ = {"polymorphic_identity": "cozinheiro"}

    def rota_admin(self) -> str:
        """!
        @brief Rota do painel administrativo do cozinheiro.
        @return "/admin/cozinha".
        """
        return "/admin/cozinha"


class Garcom(Funcionario):
    """!
    @brief Funcionário responsável pelo balcão: comandas, mesas e reservas.
    """

    __mapper_args__ = {"polymorphic_identity": "garcom"}

    def rota_admin(self) -> str:
        """!
        @brief Rota do painel administrativo do garçom.
        @return "/admin/balcao".
        """
        return "/admin/balcao"


class Entregador(Funcionario):
    """!
    @brief Funcionário responsável por levar os pedidos de entrega (site) até o cliente.
    """

    __mapper_args__ = {"polymorphic_identity": "entregador"}

    def rota_admin(self) -> str:
        """!
        @brief Rota do painel administrativo do entregador.
        @return "/admin/entrega".
        """
        return "/admin/entrega"


class Gerente(Funcionario):
    """!
    @brief Funcionário responsável pelo painel gerencial (relatórios de vendas e rastreamento).
    """

    __mapper_args__ = {"polymorphic_identity": "gerente"}

    def rota_admin(self) -> str:
        """!
        @brief Rota do painel administrativo do gerente.
        @return "/admin/gerente".
        """
        return "/admin/gerente"


class Cliente(db.Model):
    """!
    @brief Cadastro de cliente da loja, com programa de fidelidade.

    @details
    Totalmente separado de Funcionario: um cliente nunca acessa as rotas
    /admin, só a área /usuario e o checkout do site. Principais colunas:
    `email`/`login` (identificação, ambos únicos), `senha_hash`
    (autenticação) e `pontos_fidelidade` (acumulados a cada compra, veja
    REAIS_POR_PONTO_FIDELIDADE e a rota POST /api/pedidos em app.py).
    """

    __tablename__ = "clientes"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False, index=True)
    telefone = db.Column(db.String(30), nullable=False)
    cpf = db.Column(db.String(20), nullable=True)
    login = db.Column(db.String(80), unique=True, nullable=False, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    pontos_fidelidade = db.Column(db.Integer, nullable=False, default=0)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def definir_senha(self, senha: str) -> None:
        """!
        @brief Gera e armazena o hash da senha do cliente (nunca a senha em texto puro).
        @param senha Senha em texto puro informada no cadastro/edição.
        @return None.
        """
        self.senha_hash = generate_password_hash(senha)

    def verificar_senha(self, senha: str) -> bool:
        """!
        @brief Confere se a senha informada no login corresponde ao hash armazenado.
        @param senha Senha em texto puro informada no login.
        @return True se a senha confere, False caso contrário.
        """
        return check_password_hash(self.senha_hash, senha)

    def to_dict(self) -> dict:
        """!
        @brief Serializa o cliente para um dicionário pronto para virar JSON de resposta.
        @details Nunca inclui `senha_hash`, propositalmente.
        @return Dicionário com id, nome, email, telefone, cpf, login e pontos de fidelidade.
        """
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
            "cpf": self.cpf,
            "login": self.login,
            "pontosFidelidade": self.pontos_fidelidade,
        }


class Reserva(db.Model):
    """!
    @brief Reserva de mesa feita pelo cliente pelo site.

    @details
    Aparece para o garçom no painel do balcão, separada das comandas (que
    são abertas só quando o cliente já está fisicamente na mesa). Colunas
    principais: `mesa`, `data_hora` e `pessoas` (dados da reserva) e
    `status` (um de STATUS_RESERVA_VALIDOS: pendente, confirmada,
    cancelada). `cliente_id` é opcional pois a reserva também pode ser
    feita sem login.
    """

    __tablename__ = "reservas"

    id = db.Column(db.String(64), primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"), nullable=True, index=True)
    nome = db.Column(db.String(120), nullable=False)
    telefone = db.Column(db.String(30), nullable=False)
    mesa = db.Column(db.Integer, nullable=False, index=True)
    pessoas = db.Column(db.Integer, nullable=False, default=1)
    data_hora = db.Column(db.DateTime, nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="pendente")
    criada_em = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        """!
        @brief Serializa a reserva para um dicionário pronto para virar JSON de resposta.
        @return Dicionário com id, clienteId, nome, telefone, mesa, pessoas, dataHora, status e criadaEm.
        """
        return {
            "id": self.id,
            "clienteId": self.cliente_id,
            "nome": self.nome,
            "telefone": self.telefone,
            "mesa": self.mesa,
            "pessoas": self.pessoas,
            "dataHora": self.data_hora.isoformat(),
            "status": self.status,
            "criadaEm": self.criada_em.isoformat(),
        }


class Comanda(db.Model):
    """!
    @brief Uma comanda individual aberta em uma mesa.

    @details
    Permite que uma mesa tenha várias comandas abertas ao mesmo tempo (uma
    por cliente/grupo), cada uma paga separadamente. A mesa só pode ser
    finalizada pelo caixa quando todas as comandas vinculadas a ela
    estiverem pagas (veja POST /api/mesas/<mesa>/finalizar em app.py).
    `status` é um de STATUS_COMANDA_VALIDOS (aberta, paga, encerrada) e
    `pedidos` é o relacionamento reverso com Pedido (via `comanda_id`).
    """

    __tablename__ = "comandas"

    id = db.Column(db.String(64), primary_key=True)
    mesa = db.Column(db.Integer, nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="aberta")
    forma_pagamento = db.Column(db.String(30), nullable=True)
    aberta_em = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    paga_em = db.Column(db.DateTime, nullable=True)

    pedidos = db.relationship("Pedido", backref="comanda", lazy="select")


class Pedido(db.Model):
    """!
    @brief Pedido compartilhado entre site, cozinha, balcão e entregador.

    @details
    `payload_json` guarda o corpo original do pedido (itens, total,
    origem, gorjeta etc.) serializado como JSON; `status` é um de
    STATUS_PEDIDO_VALIDOS. `comanda_id` vincula o pedido a uma comanda de
    mesa específica; `funcionario_id` é o funcionário responsável pelo
    pedido (garçom que lançou na mesa, ou entregador) para fins de
    repasse de gorjeta e rastreamento; `cliente_id` é o cliente cadastrado
    que fez o pedido pelo site (None para pedidos de totem/balcão); e
    `preparado_por_id` é o cozinheiro que marcou o pedido como pronto.
    """

    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    status = db.Column(db.String(30), nullable=False, default="recebido", index=True)
    payload_json = db.Column(db.Text, nullable=False)
    criado_em = db.Column(db.DateTime, nullable=False)
    atualizado_em = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    # Vincula o pedido a uma comanda específica da mesa (permite múltiplas
    # comandas por mesa, pagas separadamente).
    comanda_id = db.Column(db.String(64), db.ForeignKey("comandas.id"), nullable=True, index=True)
    # Funcionário "responsável" pelo pedido para fins de repasse de
    # gorjeta/taxa de serviço no relatório gerencial: o garçom que lançou
    # o pedido na mesa, ou o entregador que saiu com ele para entrega —
    # também é o dado usado no rastreamento ("qual entregador atendeu qual
    # cliente").
    funcionario_id = db.Column(db.Integer, db.ForeignKey("funcionarios.id"), nullable=True, index=True)
    # Cliente cadastrado que fez o pedido pelo site (None para pedidos do
    # totem/balcão, ou quando o cliente não estava logado no checkout).
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"), nullable=True, index=True)
    # Cozinheiro que preparou o pedido — marcado quando ele avança o
    # status para 'pronto', para fins de rastreamento do fluxo completo.
    preparado_por_id = db.Column(db.Integer, db.ForeignKey("funcionarios.id"), nullable=True, index=True)


CLASSE_POR_PROFISSAO = {
    "cozinheiro": Cozinheiro,
    "garcom": Garcom,
    "entregador": Entregador,
    "gerente": Gerente,
}

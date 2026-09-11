"""
Modelos de domínio do painel administrativo da Pizzaria Callidus.
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


class Funcionario(db.Model):
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
        self.senha_hash = generate_password_hash(senha)

    def verificar_senha(self, senha: str) -> bool:
        return check_password_hash(self.senha_hash, senha)

    def rota_admin(self) -> str:
        raise NotImplementedError("Subclasses de Funcionario devem definir rota_admin().")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "idade": self.idade,
            "tempoExperiencia": self.tempo_experiencia,
            "login": self.login,
            "profissao": self.profissao,
        }


class Cozinheiro(Funcionario):
    __mapper_args__ = {"polymorphic_identity": "cozinheiro"}

    def rota_admin(self) -> str:
        return "/admin/cozinha"


class Garcom(Funcionario):
    __mapper_args__ = {"polymorphic_identity": "garcom"}

    def rota_admin(self) -> str:
        return "/admin/balcao"


class Entregador(Funcionario):
    __mapper_args__ = {"polymorphic_identity": "entregador"}

    def rota_admin(self) -> str:
        return "/admin/entrega"


class Gerente(Funcionario):
    __mapper_args__ = {"polymorphic_identity": "gerente"}

    def rota_admin(self) -> str:
        return "/admin/gerente"


class Comanda(db.Model):
    """Uma comanda individual dentro de uma mesa — permite que uma mesa
    tenha várias comandas abertas (uma por cliente/grupo), cada uma paga
    separadamente. A mesa só pode ser finalizada pelo caixa quando todas
    as comandas vinculadas a ela estiverem pagas (veja /api/mesas/<mesa>/
    finalizar em app.py)."""

    __tablename__ = "comandas"

    id = db.Column(db.String(64), primary_key=True)
    mesa = db.Column(db.Integer, nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="aberta")
    forma_pagamento = db.Column(db.String(30), nullable=True)
    aberta_em = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    paga_em = db.Column(db.DateTime, nullable=True)

    pedidos = db.relationship("Pedido", backref="comanda", lazy="select")


class Pedido(db.Model):
    """Pedido compartilhado entre site, cozinha, balcão e entregador."""

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
    # o pedido na mesa, ou o entregador que saiu com ele para entrega.
    funcionario_id = db.Column(db.Integer, db.ForeignKey("funcionarios.id"), nullable=True, index=True)


CLASSE_POR_PROFISSAO = {
    "cozinheiro": Cozinheiro,
    "garcom": Garcom,
    "entregador": Entregador,
    "gerente": Gerente,
}

"""Modelos de persistência da Pizzaria Callidus.

O banco é compatível com SQLite para desenvolvimento e MySQL em produção.
As listas que antes eram arquivos JSON passam a ser persistidas aqui.
"""
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash


db = SQLAlchemy()

PROFISSOES_VALIDAS = ("cozinheiro", "garcom", "entregador")
STATUS_PEDIDO_VALIDOS = (
    "recebido",
    "em_preparo",
    "aguardando_envio",
    "saiu_para_entrega",
    "entregue",
    "cancelado",
)


class Pizza(db.Model):
    __tablename__ = "pizzas"
    id = db.Column(db.String(64), primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(160), unique=True, nullable=False, index=True)
    descricao = db.Column(db.Text, nullable=False, default="")
    preco_base = db.Column(db.Numeric(10, 2), nullable=False)
    img_url = db.Column(db.Text, nullable=False, default="")
    categoria = db.Column(db.String(30), nullable=False, index=True)
    tamanhos_disponiveis = db.Column(db.JSON, nullable=False, default=list)
    permite_borda = db.Column(db.Boolean, nullable=False, default=True)
    ingredientes = db.Column(db.JSON, nullable=False, default=list)
    ativo = db.Column(db.Boolean, nullable=False, default=True, index=True)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Combo(db.Model):
    __tablename__ = "combos"
    id = db.Column(db.String(64), primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(160), unique=True, nullable=False, index=True)
    descricao = db.Column(db.Text, nullable=False, default="")
    preco_base = db.Column(db.Numeric(10, 2), nullable=False)
    img_url = db.Column(db.Text, nullable=False, default="")
    categoria = db.Column(db.String(30), nullable=False, index=True)
    itens = db.Column(db.JSON, nullable=False, default=list)
    ativo = db.Column(db.Boolean, nullable=False, default=True, index=True)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Bebida(db.Model):
    __tablename__ = "bebidas"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(120), nullable=False)
    descricao = db.Column(db.Text, nullable=False, default="")
    preco = db.Column(db.Numeric(10, 2), nullable=False)
    img_url = db.Column(db.Text, nullable=False, default="")
    ativo = db.Column(db.Boolean, nullable=False, default=True, index=True)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Extra(db.Model):
    __tablename__ = "extras"
    id = db.Column(db.String(64), primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    preco = db.Column(db.Numeric(10, 2), nullable=False)
    ativo = db.Column(db.Boolean, nullable=False, default=True)


class Configuracao(db.Model):
    __tablename__ = "configuracoes"
    chave = db.Column(db.String(80), primary_key=True)
    dados = db.Column(db.JSON, nullable=False)
    atualizado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Pedido(db.Model):
    __tablename__ = "pedidos"
    id = db.Column(db.String(64), primary_key=True)
    status = db.Column(db.String(30), nullable=False, default="recebido", index=True)
    origem = db.Column(db.String(30), nullable=False, default="site", index=True)
    cliente = db.Column(db.JSON, nullable=False, default=dict)
    endereco = db.Column(db.JSON, nullable=False, default=dict)
    itens = db.Column(db.JSON, nullable=False, default=list)
    pagamento = db.Column(db.JSON, nullable=False, default=dict)
    observacoes = db.Column(db.Text, nullable=False, default="")
    total = db.Column(db.Numeric(10, 2), nullable=False)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    atualizado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Funcionario(db.Model):
    __tablename__ = "funcionarios"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    idade = db.Column(db.Integer, nullable=False)
    tempo_experiencia = db.Column(db.Integer, nullable=False)
    login = db.Column(db.String(80), unique=True, nullable=False, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    profissao = db.Column(db.String(20), nullable=False, index=True)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def definir_senha(self, senha: str) -> None:
        self.senha_hash = generate_password_hash(senha)

    def verificar_senha(self, senha: str) -> bool:
        return check_password_hash(self.senha_hash, senha)

    def rota_admin(self) -> str:
        return {
            "cozinheiro": "/admin/cozinha",
            "garcom": "/admin/balcao",
            "entregador": "/admin/entrega",
        }.get(self.profissao, "/admin")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nome": self.nome,
            "idade": self.idade,
            "tempoExperiencia": self.tempo_experiencia,
            "login": self.login,
            "profissao": self.profissao,
        }

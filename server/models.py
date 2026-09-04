"""
Modelos de domínio do painel administrativo da pizzaria.

Funcionario é a classe base: guarda os dados que todo funcionário tem
(nome, idade, tempo de experiência, login e senha). Cozinheiro, Garcom e
Entregador herdam de Funcionario e representam os três cargos que podem
se cadastrar e logar no painel.

A persistência usa SQLAlchemy com herança de tabela única (single table
inheritance): todos os funcionários ficam numa única tabela
"funcionarios", e a coluna "profissao" tanto identifica a subclasse
(polymorphic_on) quanto é, ela mesma, o atributo "profissão" pedido para
cada uma das classes que herdam de Funcionario.
"""

from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()

PROFISSOES_VALIDAS = ("cozinheiro", "garcom", "entregador")


class Funcionario(db.Model):
    """Classe base: dados comuns a qualquer funcionário da pizzaria."""

    __tablename__ = "funcionarios"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    idade = db.Column(db.Integer, nullable=False)
    tempo_experiencia = db.Column(db.Integer, nullable=False)  # em anos
    login = db.Column(db.String(80), unique=True, nullable=False, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Coluna discriminadora da herança (polymorphic_on) e, ao mesmo tempo,
    # o atributo "profissão" de cada subclasse.
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
        """Rota do painel para a qual esse funcionário deve ser levado após o login.

        Cada subclasse sobrescreve este método (polimorfismo) para apontar
        para a sua própria tela: /admin/cozinha, /admin/balcao ou /admin/entrega.
        """
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


CLASSE_POR_PROFISSAO = {
    "cozinheiro": Cozinheiro,
    "garcom": Garcom,
    "entregador": Entregador,
}


class Pedido(db.Model):
    """Pedido recebido pelos canais de atendimento e disponibilizado à cozinha."""

    __tablename__ = "pedidos"

    id = db.Column(db.String(80), primary_key=True)
    criado_em = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    atualizado_em = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    status = db.Column(db.String(30), nullable=False, default="recebido")
    origem = db.Column(db.String(20), nullable=False, default="site")
    cliente = db.Column(db.Text, nullable=False)
    endereco = db.Column(db.Text, nullable=False)
    itens = db.Column(db.Text, nullable=False)
    observacoes = db.Column(db.Text, nullable=False, default="")
    pagamento = db.Column(db.Text, nullable=False)
    total = db.Column(db.Float, nullable=False)

    def to_dict(self):
        import json
        return {
            "id": self.id, "status": self.status, "criadoEm": self.criado_em.isoformat(),
            "atualizadoEm": self.atualizado_em.isoformat(), "origem": self.origem,
            "dados": {**json.loads(self.cliente), **json.loads(self.endereco)},
            "itens": json.loads(self.itens), "observacoes": self.observacoes,
            "pagamento": json.loads(self.pagamento), "total": self.total,
        }

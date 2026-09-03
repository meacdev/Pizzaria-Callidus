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

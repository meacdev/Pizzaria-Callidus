"""API REST completa da Pizzaria Callidus.

- Produtos: pizzas, combos, bebidas e extras
- Configuração da loja
- Pedidos e fila cozinha/entrega
- Funcionários e autenticação

DATABASE_URL pode apontar para MySQL, por exemplo:
mysql+pymysql://root:senha@localhost:3306/pizzaria_callidus
Sem DATABASE_URL, o projeto usa SQLite em server/data/pizzaria.db.
"""
import json
import os
import uuid
from decimal import Decimal
from pathlib import Path
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

from models import (
    Bebida,
    Combo,
    Configuracao,
    Extra,
    Funcionario,
    Pizza,
    Pedido,
    PROFISSOES_VALIDAS,
    STATUS_PEDIDO_VALIDOS,
    db,
)

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
DEFAULT_DB = DATA_DIR / "pizzaria.db"
JSON_DIR = PROJECT_DIR / "public" / "api"

EXTRAS_PADRAO = [
    {"id": "bacon", "nome": "Bacon", "preco": 5.00},
    {"id": "catupiry", "nome": "Catupiry", "preco": 6.00},
    {"id": "cheddar", "nome": "Cheddar", "preco": 5.00},
    {"id": "calabresa", "nome": "Calabresa", "preco": 7.00},
    {"id": "mussarela", "nome": "Mussarela", "preco": 6.00},
]


def agora():
    return datetime.now(timezone.utc)


def iso(data):
    if data is None:
        return None
    if data.tzinfo is None:
        data = data.replace(tzinfo=timezone.utc)
    return data.isoformat()


def money(value):
    return float(Decimal(value or 0))


def slugify(text):
    import re
    import unicodedata
    value = unicodedata.normalize("NFD", str(text)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.strip()))


def load_json(name):
    path = JSON_DIR / name
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def pizza_dict(p):
    return {"id": p.id, "nome": p.nome, "slug": p.slug, "descricao": p.descricao,
            "precoBase": money(p.preco_base), "imgURL": p.img_url, "categoria": p.categoria,
            "tamanhosDisponiveis": p.tamanhos_disponiveis or [], "permiteBorda": p.permite_borda,
            "ingredientes": p.ingredientes or []}


def combo_dict(c):
    return {"id": c.id, "nome": c.nome, "slug": c.slug, "descricao": c.descricao,
            "precoBase": money(c.preco_base), "imgURL": c.img_url, "categoria": c.categoria,
            "itens": c.itens or []}


def bebida_dict(b):
    return {"id": b.id, "nome": b.nome, "descricao": b.descricao,
            "preco": money(b.preco), "imgURL": b.img_url}


def extra_dict(e):
    return {"id": e.id, "nome": e.nome, "preco": f"{money(e.preco):.2f}"}


def pedido_dict(p):
    dados = {
        "cliente": {**(p.cliente or {}), "cpf": (p.cliente or {}).get("cpf", "")},
        "endereco": p.endereco or {},
        "formaPagamento": (p.pagamento or {}).get("forma", ""),
        "trocoPara": (p.pagamento or {}).get("trocoPara", ""),
        "observacoes": p.observacoes or "",
    }
    return {"id": p.id, "status": p.status, "origem": p.origem, "dados": dados,
            "itens": p.itens or [], "total": money(p.total), "criadoEm": iso(p.criado_em),
            "atualizadoEm": iso(p.atualizado_em)}


def seed_catalogo():
    """Importa os JSON existentes apenas quando as respectivas tabelas estão vazias."""
    if Pizza.query.count() == 0:
        for item in load_json("todasPizzas.json"):
            db.session.add(Pizza(
                id=str(item["id"]), nome=item["nome"], slug=item.get("slug") or slugify(item["nome"]),
                descricao=item.get("descricao", ""), preco_base=Decimal(str(item.get("precoBase", 0))),
                img_url=item.get("imgURL", ""), categoria=item.get("categoria", "tradicional"),
                tamanhos_disponiveis=item.get("tamanhosDisponiveis", ["P", "M", "G"]),
                permite_borda=item.get("permiteBorda", True), ingredientes=item.get("ingredientes", [])))
    if Combo.query.count() == 0:
        for item in load_json("todosCombos.json"):
            db.session.add(Combo(
                id=str(item["id"]), nome=item["nome"], slug=item.get("slug") or slugify(item["nome"]),
                descricao=item.get("descricao", ""), preco_base=Decimal(str(item.get("precoBase", 0))),
                img_url=item.get("imgURL", ""), categoria=item.get("categoria", "especial"),
                itens=item.get("itens", [])))
    if Bebida.query.count() == 0:
        for item in load_json("todasBebidas.json"):
            db.session.add(Bebida(id=int(item["id"]), nome=item["nome"], descricao=item.get("descricao", ""),
                                   preco=Decimal(str(item.get("preco", 0))), img_url=item.get("imgURL", "")))
    if Extra.query.count() == 0:
        for item in EXTRAS_PADRAO:
            db.session.add(Extra(id=item["id"], nome=item["nome"], preco=Decimal(str(item["preco"]))))
    db.session.commit()


def criar_app():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    app = Flask(__name__)
    database_url = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB}")
    if database_url.startswith("mysql://"):
        database_url = database_url.replace("mysql://", "mysql+pymysql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    CORS(app)
    db.init_app(app)
    with app.app_context():
        db.create_all()
        seed_catalogo()
    registrar_rotas(app)
    return app


def body():
    return request.get_json(silent=True) or {}


def error(message, status=400):
    return jsonify({"erro": message}), status


def upsert_pizza(data, existing=None):
    required = ["nome", "precoBase", "categoria"]
    missing = [x for x in required if data.get(x) in (None, "")]
    if missing:
        raise ValueError("Campos obrigatórios: " + ", ".join(missing))
    p = existing or Pizza(id=str(data.get("id") or uuid.uuid4()))
    p.nome = str(data["nome"]).strip()
    p.slug = str(data.get("slug") or slugify(p.nome))
    p.descricao = str(data.get("descricao", p.nome))
    p.preco_base = Decimal(str(data["precoBase"]))
    p.img_url = str(data.get("imgURL", ""))
    p.categoria = str(data["categoria"])
    p.tamanhos_disponiveis = data.get("tamanhosDisponiveis") or ["P", "M", "G"]
    p.permite_borda = bool(data.get("permiteBorda", True))
    p.ingredientes = data.get("ingredientes") or []
    return p


def upsert_combo(data, existing=None):
    if data.get("nome") in (None, "") or data.get("precoBase") in (None, ""):
        raise ValueError("Nome e precoBase são obrigatórios.")
    c = existing or Combo(id=str(data.get("id") or uuid.uuid4()))
    c.nome = str(data["nome"]).strip(); c.slug = str(data.get("slug") or slugify(c.nome))
    c.descricao = str(data.get("descricao", c.nome)); c.preco_base = Decimal(str(data["precoBase"]))
    c.img_url = str(data.get("imgURL", "")); c.categoria = str(data.get("categoria", "especial")); c.itens = data.get("itens") or []
    return c


def upsert_bebida(data, existing=None):
    if data.get("nome") in (None, "") or data.get("preco") in (None, ""):
        raise ValueError("Nome e preco são obrigatórios.")
    b = existing or Bebida()
    if data.get("id") is not None and existing is None: b.id = int(data["id"])
    b.nome = str(data["nome"]).strip(); b.descricao = str(data.get("descricao", b.nome))
    b.preco = Decimal(str(data["preco"])); b.img_url = str(data.get("imgURL", ""))
    return b


def registrar_rotas(app):
    # ---------- catálogo público ----------
    @app.get("/api/todasPizzas.json")
    def legado_pizzas():
        return listar_pizzas()

    @app.get("/api/pizzas")
    def listar_pizzas():
        return jsonify([pizza_dict(p) for p in Pizza.query.filter_by(ativo=True).order_by(Pizza.nome).all()])

    @app.get("/api/pizzas/<string:slug>")
    def obter_pizza(slug):
        p = Pizza.query.filter_by(slug=slug, ativo=True).first()
        return jsonify(pizza_dict(p)) if p else error("Pizza não encontrada.", 404)

    @app.post("/api/pizzas")
    @app.put("/api/pizzas/<string:id>")
    def salvar_pizza(id=None):
        try:
            existing = Pizza.query.get(id) if id else None
            if id and not existing: return error("Pizza não encontrada.", 404)
            p = upsert_pizza(body(), existing); db.session.add(p); db.session.commit(); return jsonify(pizza_dict(p)), 201 if not existing else 200
        except Exception as exc:
            db.session.rollback(); return error(str(exc))

    @app.delete("/api/pizzas/<string:id>")
    def excluir_pizza(id):
        p = Pizza.query.get(id)
        if not p: return error("Pizza não encontrada.", 404)
        p.ativo = False; db.session.commit(); return ("", 204)

    @app.get("/api/todosCombos.json")
    def legado_combos():
        return listar_combos()

    @app.get("/api/combos")
    def listar_combos(): return jsonify([combo_dict(c) for c in Combo.query.filter_by(ativo=True).order_by(Combo.nome).all()])

    @app.get("/api/combos/<string:slug>")
    def obter_combo(slug):
        c = Combo.query.filter_by(slug=slug, ativo=True).first(); return jsonify(combo_dict(c)) if c else error("Combo não encontrado.", 404)

    @app.post("/api/combos")
    @app.put("/api/combos/<string:id>")
    def salvar_combo(id=None):
        try:
            existing = Combo.query.get(id) if id else None
            if id and not existing: return error("Combo não encontrado.", 404)
            c = upsert_combo(body(), existing); db.session.add(c); db.session.commit(); return jsonify(combo_dict(c)), 201 if not existing else 200
        except Exception as exc:
            db.session.rollback(); return error(str(exc))

    @app.delete("/api/combos/<string:id>")
    def excluir_combo(id):
        c = Combo.query.get(id)
        if not c: return error("Combo não encontrado.", 404)
        c.ativo = False; db.session.commit(); return ("", 204)

    @app.get("/api/todasBebidas.json")
    def legado_bebidas():
        return listar_bebidas()

    @app.get("/api/bebidas")
    def listar_bebidas(): return jsonify([bebida_dict(b) for b in Bebida.query.filter_by(ativo=True).order_by(Bebida.nome).all()])

    @app.get("/api/bebidas/<int:id>")
    def obter_bebida(id):
        b = Bebida.query.filter_by(id=id, ativo=True).first(); return jsonify(bebida_dict(b)) if b else error("Bebida não encontrada.", 404)

    @app.post("/api/bebidas")
    @app.put("/api/bebidas/<int:id>")
    def salvar_bebida(id=None):
        try:
            existing = Bebida.query.get(id) if id else None
            if id and not existing: return error("Bebida não encontrada.", 404)
            b = upsert_bebida(body(), existing); db.session.add(b); db.session.commit(); return jsonify(bebida_dict(b)), 201 if not existing else 200
        except Exception as exc:
            db.session.rollback(); return error(str(exc))

    @app.delete("/api/bebidas/<int:id>")
    def excluir_bebida(id):
        b = Bebida.query.get(id)
        if not b: return error("Bebida não encontrada.", 404)
        b.ativo = False; db.session.commit(); return ("", 204)

    @app.get("/api/extras")
    def listar_extras(): return jsonify([extra_dict(e) for e in Extra.query.filter_by(ativo=True).order_by(Extra.nome).all()])

    # ---------- configuração ----------
    @app.get("/api/configuracao")
    def obter_configuracao():
        item = Configuracao.query.get("loja")
        return jsonify(item.dados if item else {})

    @app.put("/api/configuracao")
    def salvar_configuracao():
        item = Configuracao.query.get("loja")
        if not item: item = Configuracao(chave="loja", dados={})
        item.dados = body(); db.session.add(item); db.session.commit(); return jsonify(item.dados)

    # ---------- pedidos ----------
    @app.post("/api/pedidos")
    def criar_pedido():
        data = body()
        pedido_id = str(data.get("pedidoId") or uuid.uuid4())
        if Pedido.query.get(pedido_id):
            return jsonify(pedido_dict(Pedido.query.get(pedido_id)))
        itens = data.get("itens") or []
        total = Decimal(str(data.get("total", 0)))
        if not itens: return error("O pedido precisa ter pelo menos um item.")
        pagamento = dict(data.get("pagamento") or {})
        pagamento["trocoPara"] = data.get("trocoPara", pagamento.get("trocoPara", ""))
        p = Pedido(id=pedido_id, status="recebido", origem=str(data.get("origem", "site")),
                   cliente=data.get("cliente") or {}, endereco=data.get("endereco") or {}, itens=itens,
                   pagamento=pagamento, observacoes=str(data.get("observacoes", "")), total=total)
        db.session.add(p); db.session.commit(); return jsonify(pedido_dict(p)), 201

    @app.get("/api/pedidos")
    def listar_pedidos():
        query = Pedido.query
        status = request.args.get("status")
        origem = request.args.get("origem")
        if status: query = query.filter_by(status=status)
        if origem: query = query.filter_by(origem=origem)
        return jsonify([pedido_dict(p) for p in query.order_by(Pedido.criado_em.desc()).all()])

    @app.get("/api/pedidos/<string:id>")
    def obter_pedido(id):
        p = Pedido.query.get(id); return jsonify(pedido_dict(p)) if p else error("Pedido não encontrado.", 404)

    @app.patch("/api/pedidos/<string:id>/status")
    def atualizar_status(id):
        p = Pedido.query.get(id)
        if not p: return error("Pedido não encontrado.", 404)
        status = body().get("status")
        if status not in STATUS_PEDIDO_VALIDOS: return error("Status inválido.")
        p.status = status; p.atualizado_em = agora(); db.session.commit(); return jsonify(pedido_dict(p))

    @app.get("/api/cozinha/pedidos")
    def fila_cozinha():
        statuses = ("recebido", "em_preparo")
        pedidos = Pedido.query.filter(Pedido.status.in_(statuses)).order_by(Pedido.criado_em.asc()).all()
        return jsonify([pedido_dict(p) for p in pedidos])

    @app.get("/api/entrega/pedidos")
    def fila_entrega():
        statuses = ("aguardando_envio", "saiu_para_entrega")
        pedidos = Pedido.query.filter(Pedido.status.in_(statuses)).order_by(Pedido.criado_em.asc()).all()
        return jsonify([pedido_dict(p) for p in pedidos])

    # ---------- funcionários ----------
    @app.post("/api/funcionarios")
    def cadastrar_funcionario():
        data = body(); campos = ["nome", "idade", "tempoExperiencia", "login", "senha", "profissao"]
        missing = [c for c in campos if data.get(c) in (None, "")]
        if missing: return error("Campos obrigatórios faltando: " + ", ".join(missing))
        profissao = str(data["profissao"]).strip()
        if profissao not in PROFISSOES_VALIDAS: return error("Profissão inválida.")
        login = str(data["login"]).strip()
        if Funcionario.query.filter_by(login=login).first(): return error("Login já cadastrado.", 409)
        try:
            f = Funcionario(nome=str(data["nome"]).strip(), idade=int(data["idade"]), tempo_experiencia=int(data["tempoExperiencia"]), login=login, profissao=profissao)
        except (TypeError, ValueError): return error("Idade e experiência devem ser números inteiros.")
        f.definir_senha(str(data["senha"])); db.session.add(f); db.session.commit(); return jsonify(f.to_dict()), 201

    @app.get("/api/funcionarios")
    def listar_funcionarios(): return jsonify([f.to_dict() for f in Funcionario.query.order_by(Funcionario.nome).all()])

    @app.post("/api/auth/login")
    def autenticar():
        data = body(); f = Funcionario.query.filter_by(login=str(data.get("login", "")).strip()).first()
        if not f or not f.verificar_senha(str(data.get("senha", ""))): return error("Login ou senha incorretos.", 401)
        return jsonify({"funcionario": f.to_dict(), "rota": f.rota_admin()})

    @app.get("/api/saude")
    def saude():
        return jsonify({"status": "ok", "database": app.config["SQLALCHEMY_DATABASE_URI"].split(":")[0]})


app = criar_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)), debug=True)

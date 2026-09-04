"""
Backend do painel administrativo da Pizzaria Callidus.

Responsável por cadastrar funcionários (cozinheiro, garçom e entregador)
e autenticá-los, direcionando cada um para a rota correta do painel.

Persistência: SQLite em server/data/pizzaria.db (pasta do próprio
projeto). Isso é temporário: quando o projeto tiver um banco de dados
"de verdade" em produção, basta trocar a SQLALCHEMY_DATABASE_URI abaixo
e o restante do código (modelos e rotas) continua igual.

Como rodar:
    cd server
    python3 -m venv .venv
    source .venv/bin/activate   (Windows: .venv\\Scripts\\activate)
    pip install -r requirements.txt
    python app.py

O servidor sobe em http://localhost:5001 por padrão. O front-end (Vite)
já está configurado para encaminhar chamadas de /api/* para essa porta
em desenvolvimento (veja vite.config.ts).
"""

import json
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request

from flask_cors import CORS

from models import (
    CLASSE_POR_PROFISSAO,
    PROFISSOES_VALIDAS,
    STATUS_PEDIDO_VALIDOS,
    Funcionario,
    Pedido,
    db,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "pizzaria.db")


def criar_app() -> Flask:
    os.makedirs(DATA_DIR, exist_ok=True)

    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()

    registrar_rotas(app)
    return app




def pedido_para_dict(pedido: Pedido) -> dict:
    try:
        payload = json.loads(pedido.payload_json)
    except (TypeError, json.JSONDecodeError):
        payload = {}

    payload["pedidoId"] = pedido.pedido_id
    payload["status"] = pedido.status
    payload["atualizadoEm"] = pedido.atualizado_em.isoformat()
    return payload


def registrar_rotas(app: Flask) -> None:
    @app.post("/api/funcionarios")
    def cadastrar_funcionario():
        dados = request.get_json(silent=True) or {}

        campos_obrigatorios = ["nome", "idade", "tempoExperiencia", "login", "senha", "profissao"]
        faltando = [
            campo for campo in campos_obrigatorios
            if dados.get(campo) is None or str(dados.get(campo)).strip() == ""
        ]
        if faltando:
            return jsonify({"erro": f"Campos obrigatórios faltando: {', '.join(faltando)}"}), 400

        profissao = str(dados["profissao"]).strip()
        if profissao not in PROFISSOES_VALIDAS:
            return jsonify({"erro": "Profissão inválida. Use cozinheiro, garcom ou entregador."}), 400

        try:
            idade = int(dados["idade"])
            tempo_experiencia = int(dados["tempoExperiencia"])
        except (TypeError, ValueError):
            return jsonify({"erro": "Idade e tempo de experiência devem ser números inteiros."}), 400

        if idade < 16 or idade > 100:
            return jsonify({"erro": "Idade inválida."}), 400
        if tempo_experiencia < 0 or tempo_experiencia > 80:
            return jsonify({"erro": "Tempo de experiência inválido."}), 400

        login = str(dados["login"]).strip()
        senha = str(dados["senha"])

        if len(login) < 3:
            return jsonify({"erro": "O login deve ter pelo menos 3 caracteres."}), 400
        if len(senha) < 4:
            return jsonify({"erro": "A senha deve ter pelo menos 4 caracteres."}), 400

        if Funcionario.query.filter_by(login=login).first() is not None:
            return jsonify({"erro": "Já existe um funcionário com esse login."}), 409

        nome = str(dados["nome"]).strip()
        if len(nome) < 2:
            return jsonify({"erro": "Informe o nome completo."}), 400

        classe_funcionario = CLASSE_POR_PROFISSAO[profissao]
        novo_funcionario = classe_funcionario(
            nome=nome,
            idade=idade,
            tempo_experiencia=tempo_experiencia,
            login=login,
        )
        novo_funcionario.definir_senha(senha)

        db.session.add(novo_funcionario)
        db.session.commit()

        return jsonify(novo_funcionario.to_dict()), 201

    @app.post("/api/auth/login")
    def autenticar():
        dados = request.get_json(silent=True) or {}
        login = str(dados.get("login", "")).strip()
        senha = str(dados.get("senha", ""))

        if not login or not senha:
            return jsonify({"erro": "Informe login e senha."}), 400

        funcionario = Funcionario.query.filter_by(login=login).first()

        if funcionario is None or not funcionario.verificar_senha(senha):
            return jsonify({"erro": "Login ou senha incorretos."}), 401

        return jsonify(
            {
                "funcionario": funcionario.to_dict(),
                "rota": funcionario.rota_admin(),
            }
        )

    @app.get("/api/funcionarios")
    def listar_funcionarios():
        funcionarios = Funcionario.query.order_by(Funcionario.nome).all()
        return jsonify([funcionario.to_dict() for funcionario in funcionarios])

    @app.post("/api/pedidos")
    def criar_pedido():
        dados = request.get_json(silent=True) or {}
        pedido_id = str(dados.get("pedidoId", "")).strip()

        if not pedido_id:
            return jsonify({"erro": "pedidoId é obrigatório."}), 400

        if not isinstance(dados.get("itens"), list) or not dados["itens"]:
            return jsonify({"erro": "O pedido precisa ter pelo menos um item."}), 400

        existente = Pedido.query.filter_by(pedido_id=pedido_id).first()
        if existente is not None:
            return jsonify(pedido_para_dict(existente)), 200

        status = "recebido"
        agora = datetime.now(timezone.utc)
        criado_em = agora
        criado_texto = dados.get("criadoEm")
        if criado_texto:
            try:
                criado_em = datetime.fromisoformat(str(criado_texto).replace("Z", "+00:00"))
            except ValueError:
                criado_em = agora

        novo_pedido = Pedido(
            pedido_id=pedido_id,
            status=status,
            payload_json=json.dumps(dados, ensure_ascii=False),
            criado_em=criado_em,
            atualizado_em=agora,
        )
        db.session.add(novo_pedido)
        db.session.commit()
        return jsonify(pedido_para_dict(novo_pedido)), 201

    @app.get("/api/pedidos")
    def listar_pedidos():
        status = request.args.get("status")
        consulta = Pedido.query.order_by(Pedido.criado_em.asc())

        if status:
            if status not in STATUS_PEDIDO_VALIDOS:
                return jsonify({"erro": "Status de pedido inválido."}), 400
            consulta = consulta.filter_by(status=status)

        return jsonify([pedido_para_dict(pedido) for pedido in consulta.all()])

    @app.get("/api/pedidos/<string:pedido_id>")
    def obter_pedido(pedido_id: str):
        pedido = Pedido.query.filter_by(pedido_id=pedido_id).first()
        if pedido is None:
            return jsonify({"erro": "Pedido não encontrado."}), 404
        return jsonify(pedido_para_dict(pedido))

    @app.patch("/api/pedidos/<string:pedido_id>/status")
    def atualizar_status_pedido(pedido_id: str):
        dados = request.get_json(silent=True) or {}
        status = str(dados.get("status", "")).strip()

        if status not in STATUS_PEDIDO_VALIDOS:
            return jsonify({"erro": "Status de pedido inválido."}), 400

        pedido = Pedido.query.filter_by(pedido_id=pedido_id).first()
        if pedido is None:
            return jsonify({"erro": "Pedido não encontrado."}), 404

        pedido.status = status
        pedido.atualizado_em = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify(pedido_para_dict(pedido))

    @app.get("/api/saude")
    def saude():
        return jsonify({"status": "ok"})


app = criar_app()

if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=porta, debug=True)

"""!
@file app.py
@brief Aplicação Flask com as rotas da API da pizzaria: funcionários, clientes, reservas, comandas e pedidos.

@details
Responsável por cadastrar funcionários (cozinheiro, garçom, entregador e
gerente) e clientes, autenticá-los e expor as rotas de reservas de mesa,
comandas, pedidos e relatórios gerenciais consumidas pelo front-end.

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
import uuid
from datetime import datetime, timezone

from flask import Flask, jsonify, request

from flask_cors import CORS

from models import (
    CLASSE_POR_PROFISSAO,
    PROFISSOES_VALIDAS,
    REAIS_POR_PONTO_FIDELIDADE,
    STATUS_COMANDA_VALIDOS,
    STATUS_PEDIDO_VALIDOS,
    STATUS_RESERVA_VALIDOS,
    Cliente,
    Comanda,
    Funcionario,
    Pedido,
    Reserva,
    db,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "pizzaria.db")


def criar_app() -> Flask:
    """!
    @brief Cria e configura a aplicação Flask: banco SQLite, CORS e registro das rotas.
    @details Garante que a pasta de dados exista, cria as tabelas do banco
    (`db.create_all()`) caso ainda não existam e registra todas as rotas
    via registrar_rotas().
    @return Instância de Flask pronta para rodar (usada tanto pelo `python app.py` quanto por testes).
    """
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
    """!
    @brief Converte um Pedido em dicionário JSON, mesclando o payload original com os campos vindos do banco.
    @param pedido Instância de Pedido a ser serializada.
    @return Dicionário com os dados do payload original (itens, total etc.)
    mais pedidoId, status, atualizadoEm, comandaId, funcionarioId,
    clienteId e preparadoPorId atualizados a partir do banco.
    """
    try:
        payload = json.loads(pedido.payload_json)
    except (TypeError, json.JSONDecodeError):
        payload = {}

    payload["pedidoId"] = pedido.pedido_id
    payload["status"] = pedido.status
    payload["atualizadoEm"] = pedido.atualizado_em.isoformat()
    payload["comandaId"] = pedido.comanda_id
    payload["funcionarioId"] = pedido.funcionario_id
    payload["clienteId"] = pedido.cliente_id
    payload["preparadoPorId"] = pedido.preparado_por_id
    return payload


def comanda_para_dict(comanda: Comanda) -> dict:
    """!
    @brief Converte uma Comanda em dicionário JSON, incluindo seus pedidos e o total calculado.
    @param comanda Instância de Comanda a ser serializada.
    @return Dicionário com id, mesa, status, formaPagamento, abertaEm,
    pagaEm, total (soma dos pedidos não cancelados), quantidadePedidos e a
    lista de pedidos serializados.
    """
    pedidos_validos = [p for p in comanda.pedidos if p.status != "cancelado"]
    total = 0.0
    for pedido in pedidos_validos:
        try:
            total += float(json.loads(pedido.payload_json).get("total") or 0)
        except (TypeError, json.JSONDecodeError):
            continue

    return {
        "id": comanda.id,
        "mesa": comanda.mesa,
        "status": comanda.status,
        "formaPagamento": comanda.forma_pagamento,
        "abertaEm": comanda.aberta_em.isoformat(),
        "pagaEm": comanda.paga_em.isoformat() if comanda.paga_em else None,
        "total": round(total, 2),
        "quantidadePedidos": len(pedidos_validos),
        "pedidos": [pedido_para_dict(p) for p in pedidos_validos],
    }


def registrar_rotas(app: Flask) -> None:
    """!
    @brief Registra todas as rotas (endpoints) da API no app Flask.
    @param app Instância de Flask onde as rotas serão registradas.
    @return None.
    """
    @app.post("/api/funcionarios")
    def cadastrar_funcionario():
        """!
        @brief POST /api/funcionarios — cadastra um novo funcionário (cozinheiro, garçom, entregador ou gerente).
        @details Valida campos obrigatórios, profissão, faixas de idade e
        tempo de experiência, e unicidade do login antes de criar o
        registro com a subclasse correspondente (@see CLASSE_POR_PROFISSAO).
        @return JSON do funcionário criado (201), ou um erro (400/409).
        """
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
        """!
        @brief POST /api/auth/login — autentica um funcionário e retorna a rota do seu painel.
        @return JSON com o funcionário e a rota do painel (200), ou erro (400/401).
        """
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
        """!
        @brief GET /api/funcionarios — lista todos os funcionários cadastrados, ordenados por nome.
        @return JSON com a lista de funcionários (200).
        """
        funcionarios = Funcionario.query.order_by(Funcionario.nome).all()
        return jsonify([funcionario.to_dict() for funcionario in funcionarios])

    @app.put("/api/funcionarios/<int:funcionario_id>")
    def atualizar_funcionario(funcionario_id: int):
        """!
        @brief PUT /api/funcionarios/<funcionario_id> — edita o próprio cadastro do funcionário.
        @details Permite alterar nome, idade, tempo de experiência, login e,
        opcionalmente, senha. A profissão não muda por aqui — ela é o que
        define o cargo/rota do funcionário.
        @param funcionario_id Id do funcionário a ser atualizado.
        @return JSON do funcionário atualizado (200), ou erro (400/404/409).
        """
        funcionario = Funcionario.query.get(funcionario_id)
        if funcionario is None:
            return jsonify({"erro": "Funcionário não encontrado."}), 404

        dados = request.get_json(silent=True) or {}

        if "nome" in dados:
            nome = str(dados["nome"]).strip()
            if len(nome) < 2:
                return jsonify({"erro": "Informe o nome completo."}), 400
            funcionario.nome = nome

        if "idade" in dados:
            try:
                idade = int(dados["idade"])
            except (TypeError, ValueError):
                return jsonify({"erro": "Idade deve ser um número inteiro."}), 400
            if idade < 16 or idade > 100:
                return jsonify({"erro": "Idade inválida."}), 400
            funcionario.idade = idade

        if "tempoExperiencia" in dados:
            try:
                tempo_experiencia = int(dados["tempoExperiencia"])
            except (TypeError, ValueError):
                return jsonify({"erro": "Tempo de experiência deve ser um número inteiro."}), 400
            if tempo_experiencia < 0 or tempo_experiencia > 80:
                return jsonify({"erro": "Tempo de experiência inválido."}), 400
            funcionario.tempo_experiencia = tempo_experiencia

        if "login" in dados:
            login = str(dados["login"]).strip()
            if len(login) < 3:
                return jsonify({"erro": "O login deve ter pelo menos 3 caracteres."}), 400
            existente = Funcionario.query.filter_by(login=login).first()
            if existente is not None and existente.id != funcionario.id:
                return jsonify({"erro": "Já existe um funcionário com esse login."}), 409
            funcionario.login = login

        senha = dados.get("senha")
        if senha:
            senha = str(senha)
            if len(senha) < 4:
                return jsonify({"erro": "A senha deve ter pelo menos 4 caracteres."}), 400
            funcionario.definir_senha(senha)

        db.session.commit()
        return jsonify(funcionario.to_dict())

    # ------------------------------------------------------------------
    # Clientes (cadastro / login / programa de fidelidade / compras)
    # ------------------------------------------------------------------

    @app.post("/api/clientes")
    def cadastrar_cliente():
        """!
        @brief POST /api/clientes — cadastra um novo cliente da loja.
        @details Valida campos obrigatórios, formato de e-mail e unicidade
        de e-mail e login antes de criar o registro.
        @return JSON do cliente criado (201), ou erro (400/409).
        """
        dados = request.get_json(silent=True) or {}

        campos_obrigatorios = ["nome", "email", "telefone", "login", "senha"]
        faltando = [
            campo for campo in campos_obrigatorios
            if dados.get(campo) is None or str(dados.get(campo)).strip() == ""
        ]
        if faltando:
            return jsonify({"erro": f"Campos obrigatórios faltando: {', '.join(faltando)}"}), 400

        nome = str(dados["nome"]).strip()
        if len(nome) < 2:
            return jsonify({"erro": "Informe o nome completo."}), 400

        email = str(dados["email"]).strip().lower()
        if "@" not in email:
            return jsonify({"erro": "Informe um e-mail válido."}), 400

        login = str(dados["login"]).strip()
        senha = str(dados["senha"])
        if len(login) < 3:
            return jsonify({"erro": "O login deve ter pelo menos 3 caracteres."}), 400
        if len(senha) < 4:
            return jsonify({"erro": "A senha deve ter pelo menos 4 caracteres."}), 400

        if Cliente.query.filter_by(email=email).first() is not None:
            return jsonify({"erro": "Já existe um cliente cadastrado com esse e-mail."}), 409
        if Cliente.query.filter_by(login=login).first() is not None:
            return jsonify({"erro": "Já existe um cliente com esse login."}), 409

        novo_cliente = Cliente(
            nome=nome,
            email=email,
            telefone=str(dados["telefone"]).strip(),
            cpf=str(dados.get("cpf") or "").strip() or None,
            login=login,
        )
        novo_cliente.definir_senha(senha)

        db.session.add(novo_cliente)
        db.session.commit()

        return jsonify(novo_cliente.to_dict()), 201

    @app.post("/api/auth/login-cliente")
    def autenticar_cliente():
        """!
        @brief POST /api/auth/login-cliente — autentica um cliente, aceitando login ou e-mail.
        @return JSON com o cliente autenticado (200), ou erro (400/401).
        """
        dados = request.get_json(silent=True) or {}
        login = str(dados.get("login", "")).strip()
        senha = str(dados.get("senha", ""))

        if not login or not senha:
            return jsonify({"erro": "Informe login e senha."}), 400

        cliente = Cliente.query.filter(
            (Cliente.login == login) | (Cliente.email == login.lower())
        ).first()

        if cliente is None or not cliente.verificar_senha(senha):
            return jsonify({"erro": "Login ou senha incorretos."}), 401

        return jsonify({"cliente": cliente.to_dict()})

    @app.put("/api/clientes/<int:cliente_id>")
    def atualizar_cliente(cliente_id: int):
        """!
        @brief PUT /api/clientes/<cliente_id> — edita o cadastro do cliente logado.
        @details Permite alterar nome, telefone, cpf, e-mail (validando
        formato e unicidade) e, opcionalmente, senha.
        @param cliente_id Id do cliente a ser atualizado.
        @return JSON do cliente atualizado (200), ou erro (400/404/409).
        """
        cliente = Cliente.query.get(cliente_id)
        if cliente is None:
            return jsonify({"erro": "Cliente não encontrado."}), 404

        dados = request.get_json(silent=True) or {}

        if "nome" in dados:
            nome = str(dados["nome"]).strip()
            if len(nome) < 2:
                return jsonify({"erro": "Informe o nome completo."}), 400
            cliente.nome = nome

        if "telefone" in dados:
            cliente.telefone = str(dados["telefone"]).strip()

        if "cpf" in dados:
            cliente.cpf = str(dados.get("cpf") or "").strip() or None

        if "email" in dados:
            email = str(dados["email"]).strip().lower()
            if "@" not in email:
                return jsonify({"erro": "Informe um e-mail válido."}), 400
            existente = Cliente.query.filter_by(email=email).first()
            if existente is not None and existente.id != cliente.id:
                return jsonify({"erro": "Já existe um cliente cadastrado com esse e-mail."}), 409
            cliente.email = email

        senha = dados.get("senha")
        if senha:
            senha = str(senha)
            if len(senha) < 4:
                return jsonify({"erro": "A senha deve ter pelo menos 4 caracteres."}), 400
            cliente.definir_senha(senha)

        db.session.commit()
        return jsonify(cliente.to_dict())

    @app.get("/api/clientes/<int:cliente_id>/pedidos")
    def listar_pedidos_cliente(cliente_id: int):
        """!
        @brief GET /api/clientes/<cliente_id>/pedidos — histórico de compras do cliente logado (seção "Compras").
        @param cliente_id Id do cliente cujos pedidos serão listados.
        @return JSON com a lista de pedidos do cliente, mais recentes primeiro (200), ou erro (404).
        """
        cliente = Cliente.query.get(cliente_id)
        if cliente is None:
            return jsonify({"erro": "Cliente não encontrado."}), 404

        pedidos = (
            Pedido.query.filter_by(cliente_id=cliente_id)
            .order_by(Pedido.criado_em.desc())
            .all()
        )
        return jsonify([pedido_para_dict(p) for p in pedidos])

    # ------------------------------------------------------------------
    # Reservas de mesa
    # ------------------------------------------------------------------

    @app.post("/api/reservas")
    def criar_reserva():
        """!
        @brief POST /api/reservas — cria uma nova reserva de mesa.
        @details Valida campos obrigatórios, número da mesa, data/hora
        (ISO 8601), quantidade de pessoas e, se informado, que o clienteId existe.
        @return JSON da reserva criada, com status "pendente" (201), ou erro (400/404).
        """
        dados = request.get_json(silent=True) or {}

        campos_obrigatorios = ["nome", "telefone", "mesa", "dataHora"]
        faltando = [
            campo for campo in campos_obrigatorios
            if dados.get(campo) is None or str(dados.get(campo)).strip() == ""
        ]
        if faltando:
            return jsonify({"erro": f"Campos obrigatórios faltando: {', '.join(faltando)}"}), 400

        try:
            mesa = int(dados["mesa"])
        except (TypeError, ValueError):
            return jsonify({"erro": "Mesa inválida."}), 400

        try:
            data_hora = datetime.fromisoformat(str(dados["dataHora"]).replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"erro": "Data/hora da reserva inválida. Use o formato ISO 8601."}), 400

        pessoas = dados.get("pessoas", 1)
        try:
            pessoas = int(pessoas)
        except (TypeError, ValueError):
            return jsonify({"erro": "Número de pessoas inválido."}), 400
        if pessoas < 1:
            return jsonify({"erro": "Informe ao menos 1 pessoa."}), 400

        cliente_id = dados.get("clienteId")
        if cliente_id is not None:
            try:
                cliente_id = int(cliente_id)
            except (TypeError, ValueError):
                return jsonify({"erro": "clienteId inválido."}), 400
            if Cliente.query.get(cliente_id) is None:
                return jsonify({"erro": "Cliente não encontrado."}), 404

        nova_reserva = Reserva(
            id=str(uuid.uuid4()),
            cliente_id=cliente_id,
            nome=str(dados["nome"]).strip(),
            telefone=str(dados["telefone"]).strip(),
            mesa=mesa,
            pessoas=pessoas,
            data_hora=data_hora,
            status="pendente",
        )
        db.session.add(nova_reserva)
        db.session.commit()
        return jsonify(nova_reserva.to_dict()), 201

    @app.get("/api/reservas")
    def listar_reservas():
        """!
        @brief GET /api/reservas — lista reservas, com filtros opcionais.
        @details Usado pelo garçom (painel de reservas, sem filtro ou
        filtrando por mesa/data) e pelo cliente (suas próprias reservas,
        via ?clienteId=). Aceita os parâmetros de query clienteId, mesa e
        data (AAAA-MM-DD).
        @return JSON com a lista de reservas ordenada por data/hora (200), ou erro (400) se algum filtro for inválido.
        """
        consulta = Reserva.query.order_by(Reserva.data_hora.asc())

        cliente_id = request.args.get("clienteId")
        if cliente_id is not None:
            try:
                consulta = consulta.filter(Reserva.cliente_id == int(cliente_id))
            except ValueError:
                return jsonify({"erro": "clienteId inválido."}), 400

        mesa = request.args.get("mesa")
        if mesa is not None:
            try:
                consulta = consulta.filter(Reserva.mesa == int(mesa))
            except ValueError:
                return jsonify({"erro": "Mesa inválida."}), 400

        data = request.args.get("data")
        if data:
            try:
                dia = datetime.fromisoformat(str(data)).date()
            except ValueError:
                return jsonify({"erro": "Data inválida. Use o formato AAAA-MM-DD."}), 400
            consulta = consulta.filter(db.func.date(Reserva.data_hora) == dia.isoformat())

        return jsonify([r.to_dict() for r in consulta.all()])

    @app.patch("/api/reservas/<string:reserva_id>/status")
    def atualizar_status_reserva(reserva_id: str):
        """!
        @brief PATCH /api/reservas/<reserva_id>/status — atualiza o status de uma reserva.
        @param reserva_id Id da reserva a ser atualizada.
        @return JSON da reserva atualizada (200), ou erro (400/404).
        """
        dados = request.get_json(silent=True) or {}
        status = str(dados.get("status", "")).strip()

        if status not in STATUS_RESERVA_VALIDOS:
            return jsonify({"erro": "Status de reserva inválido."}), 400

        reserva = Reserva.query.get(reserva_id)
        if reserva is None:
            return jsonify({"erro": "Reserva não encontrada."}), 404

        reserva.status = status
        db.session.commit()
        return jsonify(reserva.to_dict())

    @app.post("/api/pedidos")
    def criar_pedido():
        """!
        @brief POST /api/pedidos — cria um novo pedido (idempotente por pedidoId).
        @details Se um pedido com o mesmo pedidoId já existe, retorna esse
        pedido existente em vez de duplicar. Valida a comanda (quando
        informada) e o cliente (quando informado), e credita pontos de
        fidelidade ao cliente com base no total do pedido (@see
        REAIS_POR_PONTO_FIDELIDADE).
        @return JSON do pedido criado (201) ou já existente (200), ou erro (400/404/409).
        """
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

        comanda_id = dados.get("comandaId")
        if comanda_id:
            comanda_id = str(comanda_id)
            comanda = Comanda.query.get(comanda_id)
            if comanda is None:
                return jsonify({"erro": "Comanda não encontrada."}), 404
            if comanda.status != "aberta":
                return jsonify({"erro": "Essa comanda já foi paga ou encerrada."}), 409
        else:
            comanda_id = None

        funcionario_id = dados.get("funcionarioId")
        if funcionario_id is not None:
            try:
                funcionario_id = int(funcionario_id)
            except (TypeError, ValueError):
                return jsonify({"erro": "funcionarioId inválido."}), 400

        cliente_id = dados.get("clienteId")
        cliente = None
        if cliente_id is not None:
            try:
                cliente_id = int(cliente_id)
            except (TypeError, ValueError):
                return jsonify({"erro": "clienteId inválido."}), 400
            cliente = Cliente.query.get(cliente_id)
            if cliente is None:
                return jsonify({"erro": "Cliente não encontrado."}), 404

        novo_pedido = Pedido(
            pedido_id=pedido_id,
            status=status,
            payload_json=json.dumps(dados, ensure_ascii=False),
            criado_em=criado_em,
            atualizado_em=agora,
            comanda_id=comanda_id,
            funcionario_id=funcionario_id,
            cliente_id=cliente_id,
        )
        db.session.add(novo_pedido)

        # Programa de fidelidade: 1 ponto para cada REAIS_POR_PONTO_FIDELIDADE
        # gastos nesse pedido.
        if cliente is not None:
            total_pedido = float(dados.get("total") or 0)
            pontos_ganhos = int(total_pedido // REAIS_POR_PONTO_FIDELIDADE)
            if pontos_ganhos > 0:
                cliente.pontos_fidelidade += pontos_ganhos

        db.session.commit()
        return jsonify(pedido_para_dict(novo_pedido)), 201

    @app.get("/api/pedidos")
    def listar_pedidos():
        """!
        @brief GET /api/pedidos — lista pedidos, com filtro opcional por status.
        @return JSON com a lista de pedidos ordenada por data de criação (200), ou erro (400) se o status for inválido.
        """
        status = request.args.get("status")
        consulta = Pedido.query.order_by(Pedido.criado_em.asc())

        if status:
            if status not in STATUS_PEDIDO_VALIDOS:
                return jsonify({"erro": "Status de pedido inválido."}), 400
            consulta = consulta.filter_by(status=status)

        return jsonify([pedido_para_dict(pedido) for pedido in consulta.all()])

    @app.get("/api/pedidos/<string:pedido_id>")
    def obter_pedido(pedido_id: str):
        """!
        @brief GET /api/pedidos/<pedido_id> — obtém um pedido pelo seu pedidoId.
        @param pedido_id Identificador do pedido.
        @return JSON do pedido (200), ou erro (404).
        """
        pedido = Pedido.query.filter_by(pedido_id=pedido_id).first()
        if pedido is None:
            return jsonify({"erro": "Pedido não encontrado."}), 404
        return jsonify(pedido_para_dict(pedido))

    @app.patch("/api/pedidos/<string:pedido_id>/status")
    def atualizar_status_pedido(pedido_id: str):
        """!
        @brief PATCH /api/pedidos/<pedido_id>/status — atualiza o status de um pedido e, opcionalmente, quem é o responsável/preparador.
        @param pedido_id Identificador do pedido a ser atualizado.
        @return JSON do pedido atualizado (200), ou erro (400/404).
        """
        dados = request.get_json(silent=True) or {}
        status = str(dados.get("status", "")).strip()

        if status not in STATUS_PEDIDO_VALIDOS:
            return jsonify({"erro": "Status de pedido inválido."}), 400

        pedido = Pedido.query.filter_by(pedido_id=pedido_id).first()
        if pedido is None:
            return jsonify({"erro": "Pedido não encontrado."}), 404

        pedido.status = status
        pedido.atualizado_em = datetime.now(timezone.utc)

        funcionario_id = dados.get("funcionarioId")
        if funcionario_id is not None:
            try:
                pedido.funcionario_id = int(funcionario_id)
            except (TypeError, ValueError):
                return jsonify({"erro": "funcionarioId inválido."}), 400

        # Quem preparou: marcado pela cozinha (normalmente ao concluir o
        # preparo), usado só para rastreamento do fluxo do pedido.
        preparado_por_id = dados.get("preparadoPorId")
        if preparado_por_id is not None:
            try:
                pedido.preparado_por_id = int(preparado_por_id)
            except (TypeError, ValueError):
                return jsonify({"erro": "preparadoPorId inválido."}), 400

        db.session.commit()
        return jsonify(pedido_para_dict(pedido))

    @app.post("/api/comandas")
    def abrir_comanda():
        """!
        @brief POST /api/comandas — abre uma nova comanda para uma mesa.
        @details Uma mesa pode ter várias comandas abertas ao mesmo tempo
        (uma por cliente/grupo), cada uma paga separadamente.
        @return JSON da comanda criada, com status "aberta" (201), ou erro (400).
        """
        dados = request.get_json(silent=True) or {}
        try:
            mesa = int(dados.get("mesa"))
        except (TypeError, ValueError):
            return jsonify({"erro": "Informe o número da mesa."}), 400

        nova_comanda = Comanda(id=str(uuid.uuid4()), mesa=mesa, status="aberta")
        db.session.add(nova_comanda)
        db.session.commit()
        return jsonify(comanda_para_dict(nova_comanda)), 201

    @app.get("/api/comandas")
    def listar_comandas():
        """!
        @brief GET /api/comandas — lista as comandas não encerradas, com filtro opcional por mesa.
        @return JSON com a lista de comandas (200), ou erro (400) se a mesa for inválida.
        """
        mesa = request.args.get("mesa")
        consulta = Comanda.query.filter(Comanda.status != "encerrada").order_by(Comanda.aberta_em.asc())

        if mesa is not None:
            try:
                consulta = consulta.filter(Comanda.mesa == int(mesa))
            except ValueError:
                return jsonify({"erro": "Mesa inválida."}), 400

        return jsonify([comanda_para_dict(c) for c in consulta.all()])

    @app.patch("/api/comandas/<string:comanda_id>/pagar")
    def pagar_comanda(comanda_id: str):
        """!
        @brief PATCH /api/comandas/<comanda_id>/pagar — marca uma comanda como paga.
        @param comanda_id Id da comanda a ser paga.
        @return JSON da comanda atualizada (200), ou erro (404/409).
        """
        comanda = Comanda.query.get(comanda_id)
        if comanda is None:
            return jsonify({"erro": "Comanda não encontrada."}), 404
        if comanda.status != "aberta":
            return jsonify({"erro": "Essa comanda já foi paga ou encerrada."}), 409

        dados = request.get_json(silent=True) or {}
        forma_pagamento = str(dados.get("formaPagamento") or "dinheiro").strip() or "dinheiro"

        comanda.status = "paga"
        comanda.forma_pagamento = forma_pagamento
        comanda.paga_em = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify(comanda_para_dict(comanda))

    @app.post("/api/mesas/<int:mesa>/finalizar")
    def finalizar_mesa(mesa: int):
        """!
        @brief POST /api/mesas/<mesa>/finalizar — libera (encerra) uma mesa.
        @details O caixa só pode finalizar (liberar) a mesa quando TODAS as
        comandas vinculadas a ela já estiverem pagas.
        @param mesa Número da mesa a ser finalizada.
        @return JSON com a mesa e a quantidade de comandas encerradas (200), ou erro (409) se houver comanda(s) ainda não paga(s).
        """
        comandas_da_mesa = Comanda.query.filter(
            Comanda.mesa == mesa, Comanda.status != "encerrada"
        ).all()

        comandas_abertas = [c for c in comandas_da_mesa if c.status == "aberta"]
        if comandas_abertas:
            return jsonify(
                {"erro": f"Ainda há {len(comandas_abertas)} comanda(s) não paga(s) nessa mesa."}
            ), 409

        for comanda in comandas_da_mesa:
            comanda.status = "encerrada"
        db.session.commit()
        return jsonify({"mesa": mesa, "comandasEncerradas": len(comandas_da_mesa)})

    @app.get("/api/relatorios/vendas")
    def relatorio_vendas():
        """!
        @brief GET /api/relatorios/vendas — relatório gerencial de vendas em um período.
        @details Considera pedidos entre `inicio` e `fim` (query params,
        ISO 8601, inclusive), calculando o item mais vendido de
        pizza/bebida/combo, o repasse de gorjetas por funcionário e a
        proporção de vendas presenciais (totem/garçom) contra vendas por
        entrega (site). Pensado para alimentar o relatório em PDF do
        painel gerencial.
        @return JSON com o resumo do período (200), ou erro (400) se `inicio`/`fim` forem inválidos.
        """
        inicio_texto = request.args.get("inicio")
        fim_texto = request.args.get("fim")

        def parse_data(texto, nome_campo):
            """!
            @brief Converte um texto ISO 8601 em datetime, ou levanta ValueError(nome_campo) se inválido.
            @param texto Texto da data/hora a converter (pode ser vazio/None).
            @param nome_campo Nome do campo de origem, usado na mensagem de erro.
            @return O datetime convertido, ou None se `texto` estiver vazio.
            """
            if not texto:
                return None
            try:
                return datetime.fromisoformat(str(texto).replace("Z", "+00:00"))
            except ValueError:
                raise ValueError(nome_campo)

        try:
            inicio = parse_data(inicio_texto, "inicio")
            fim = parse_data(fim_texto, "fim")
        except ValueError as erro:
            return jsonify({"erro": f"Data inválida em '{erro.args[0]}'. Use o formato ISO 8601."}), 400

        consulta = Pedido.query.order_by(Pedido.criado_em.asc())
        if inicio is not None:
            consulta = consulta.filter(Pedido.criado_em >= inicio)
        if fim is not None:
            consulta = consulta.filter(Pedido.criado_em <= fim)

        pedidos = [p for p in consulta.all() if p.status != "cancelado"]

        total_pedidos = len(pedidos)
        total_vendas = 0.0
        total_gorjetas = 0.0
        quantidade_por_item = {"pizza": {}, "bebida": {}, "combo": {}}
        presencial = {"quantidade": 0, "total": 0.0}
        entrega = {"quantidade": 0, "total": 0.0}
        repasse_por_funcionario: dict[int, dict] = {}

        for pedido in pedidos:
            try:
                payload = json.loads(pedido.payload_json)
            except (TypeError, json.JSONDecodeError):
                payload = {}

            total_pedido = float(payload.get("total") or 0)
            total_vendas += total_pedido

            valor_gorjeta = float((payload.get("gorjeta") or {}).get("valor") or 0)
            total_gorjetas += valor_gorjeta

            if pedido.funcionario_id and valor_gorjeta > 0:
                info = repasse_por_funcionario.setdefault(
                    pedido.funcionario_id, {"totalGorjetas": 0.0, "quantidadePedidos": 0}
                )
                info["totalGorjetas"] += valor_gorjeta
                info["quantidadePedidos"] += 1

            origem = payload.get("origem")
            destino = entrega if origem == "site" else presencial
            destino["quantidade"] += 1
            destino["total"] += total_pedido

            for item in payload.get("itens") or []:
                tipo = item.get("tipo")
                if tipo not in quantidade_por_item:
                    continue
                nome = item.get("nome") or "Sem nome"
                quantidade = int(item.get("quantidade") or 0)
                quantidade_por_item[tipo][nome] = quantidade_por_item[tipo].get(nome, 0) + quantidade

        def mais_vendido(tipo):
            """!
            @brief Encontra o item mais vendido de um tipo (pizza, bebida ou combo) no período.
            @param tipo Chave do tipo de item ("pizza", "bebida" ou "combo").
            @return Dicionário com nome e quantidade do item mais vendido, ou None se nada foi vendido nesse tipo.
            """
            itens = quantidade_por_item[tipo]
            if not itens:
                return None
            nome, quantidade = max(itens.items(), key=lambda par: par[1])
            return {"nome": nome, "quantidade": quantidade}

        repasses = []
        for funcionario_id, info in repasse_por_funcionario.items():
            funcionario = Funcionario.query.get(funcionario_id)
            repasses.append(
                {
                    "funcionarioId": funcionario_id,
                    "nome": funcionario.nome if funcionario else "Funcionário removido",
                    "profissao": funcionario.profissao if funcionario else None,
                    "totalGorjetas": round(info["totalGorjetas"], 2),
                    "quantidadePedidos": info["quantidadePedidos"],
                }
            )
        repasses.sort(key=lambda r: r["totalGorjetas"], reverse=True)

        return jsonify(
            {
                "periodo": {
                    "inicio": inicio.isoformat() if inicio else None,
                    "fim": fim.isoformat() if fim else None,
                },
                "totalPedidos": total_pedidos,
                "totalVendas": round(total_vendas, 2),
                "totalGorjetas": round(total_gorjetas, 2),
                "faturamentoLoja": round(total_vendas - total_gorjetas, 2),
                "repasses": repasses,
                "maisVendidoPizza": mais_vendido("pizza"),
                "maisVendidoBebida": mais_vendido("bebida"),
                "maisVendidoCombo": mais_vendido("combo"),
                "presencial": {"quantidade": presencial["quantidade"], "total": round(presencial["total"], 2)},
                "entrega": {"quantidade": entrega["quantidade"], "total": round(entrega["total"], 2)},
            }
        )

    @app.get("/api/pedidos/rastreamento")
    def rastreamento_pedidos():
        """!
        @brief GET /api/pedidos/rastreamento — rastreamento do fluxo dos últimos pedidos (até 500).
        @details Alimenta o painel gerencial de rastreamento do fluxo de
        pedido: quem fez o pedido (cliente), quem preparou (cozinheiro) e
        quem ficou responsável por levá-lo até o cliente (garçom na mesa
        ou entregador) — pensado para resolver reclamações rapidamente.
        Aceita o parâmetro de query opcional `busca`, que filtra por
        pedidoId, nome do cliente, do cozinheiro ou do responsável.
        @return JSON com a lista de linhas de rastreamento (200).
        """
        termo = (request.args.get("busca") or "").strip().lower()

        consulta = Pedido.query.order_by(Pedido.criado_em.desc()).limit(500)
        pedidos = consulta.all()

        funcionarios_por_id = {f.id: f for f in Funcionario.query.all()}
        clientes_por_id = {c.id: c for c in Cliente.query.all()}

        linhas = []
        for pedido in pedidos:
            try:
                payload = json.loads(pedido.payload_json)
            except (TypeError, json.JSONDecodeError):
                payload = {}

            cliente_cadastrado = clientes_por_id.get(pedido.cliente_id) if pedido.cliente_id else None
            nome_cliente = (
                cliente_cadastrado.nome
                if cliente_cadastrado is not None
                else (payload.get("cliente") or {}).get("nome") or "Cliente não identificado"
            )

            cozinheiro = funcionarios_por_id.get(pedido.preparado_por_id) if pedido.preparado_por_id else None
            responsavel = funcionarios_por_id.get(pedido.funcionario_id) if pedido.funcionario_id else None

            linha = {
                "pedidoId": pedido.pedido_id,
                "status": pedido.status,
                "origem": payload.get("origem"),
                "mesa": payload.get("mesa"),
                "criadoEm": pedido.criado_em.isoformat(),
                "atualizadoEm": pedido.atualizado_em.isoformat(),
                "clienteId": pedido.cliente_id,
                "clienteNome": nome_cliente,
                "cozinheiroId": pedido.preparado_por_id,
                "cozinheiroNome": cozinheiro.nome if cozinheiro else None,
                "responsavelId": pedido.funcionario_id,
                "responsavelNome": responsavel.nome if responsavel else None,
                "responsavelProfissao": responsavel.profissao if responsavel else None,
                "total": float(payload.get("total") or 0),
            }

            if termo:
                alvo = " ".join(
                    str(valor).lower()
                    for valor in (
                        linha["pedidoId"],
                        linha["clienteNome"],
                        linha["cozinheiroNome"] or "",
                        linha["responsavelNome"] or "",
                    )
                )
                if termo not in alvo:
                    continue

            linhas.append(linha)

        return jsonify(linhas)

    @app.get("/api/saude")
    def saude():
        """!
        @brief GET /api/saude — endpoint simples de health check da API.
        @return JSON {"status": "ok"} (200).
        """
        return jsonify({"status": "ok"})


app = criar_app()

if __name__ == "__main__":
    porta = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=porta, debug=True)

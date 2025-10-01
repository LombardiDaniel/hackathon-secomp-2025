# Importa as classes e funções necessárias do Flask
import os
from datetime import datetime

import pymongo
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from generate_roadmap import gerar_plano_estudos
from pymongo import MongoClient

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Cria uma instância da aplicação Flask
app = Flask(__name__)

# Configuração do MongoDB
MONGO_URI = "mongodb://admin:quack@roady.patos.dev:27017/"  # Substitua pela sua connection string
DATABASE_NAME = "roadmaps"
COLLECTION_NAME = "roadmaps"


def get_mongo_client():
    """Função para obter cliente MongoDB"""
    return MongoClient(MONGO_URI)


@app.route("/receber", methods=["POST"])
def receber_string():
    """
    Endpoint para receber uma string de um cliente (front-end).
    Espera um JSON no formato: {"prompt": "algum texto aqui"}
    """

    try:
        dados = request.get_json()
        if not dados:
            # Retorna erro se nenhum JSON foi enviado
            return (
                jsonify({"erro": "O corpo da requisição está vazio ou não é JSON."}),
                400,
            )

        if "prompt" in dados:
            string_recebida = dados["prompt"]
            print(string_recebida)

            # Gerar o roadmap
            roadmap = gerar_plano_estudos(string_recebida)

            # Conectar ao MongoDB e salvar
            return jsonify(roadmap), 200

        else:
            # Retorna erro se a chave esperada não for encontrada
            return (
                jsonify({"erro": "A chave 'prompt' não foi encontrada no JSON."}),
                400,
            )

    except Exception as e:
        # Retorna um erro genérico caso algo inesperado aconteça
        print(f"Ocorreu um erro: {e}")
        return jsonify({"erro": "Ocorreu um erro interno no servidor."}), 500


if __name__ == "__main__":
    # Usa variáveis de ambiente para configuração
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    port = int(os.getenv("PORT", 5000))

    app.run(host="0.0.0.0", debug=debug_mode, port=port)

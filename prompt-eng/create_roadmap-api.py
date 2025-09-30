# Importa as classes e funções necessárias do Flask
from flask import Flask, request, jsonify
from prompt import gerar_plano_estudos
import pymongo
from pymongo import MongoClient 

# Cria uma instância da aplicação Flask
app = Flask(__name__)

@app.route('/receber', methods=['POST'])
def receber_string():
    """
    Endpoint para receber uma string de um cliente (front-end).
    Espera um JSON no formato: {"minha_string": "algum texto aqui"}
    """
    print("Requisição recebida em /receber...")

    try:
        dados = request.get_json()
        if not dados:
            # Retorna erro se nenhum JSON foi enviado
            return jsonify({"erro": "O corpo da requisição está vazio ou não é JSON."}), 400


        if 'prompt' in dados:
            string_recebida = dados['minha_string']
            
            roadmap = gerar_plano_estudos(string_recebida)
            
            cliente = pymongo.MongoClient("insira_a_connect_string_aqui")

            
        else:
            # Retorna erro se a chave esperada não for encontrada
            return jsonify({"erro": "A chave 'minha_string' não foi encontrada no JSON."}), 400

    except Exception as e:
        # Retorna um erro genérico caso algo inesperado aconteça
        print(f"Ocorreu um erro: {e}")
        return jsonify({"erro": "Ocorreu um erro interno no servidor."}), 500

@app.route('/dados', methods=['GET'])
def enviar_roadmap_frontend():
    """
    Endpoint que envia um objeto JSON para o front-end fazer o roadmap.
    """

    # O Flask converte automaticamente dicionários em uma resposta JSON
    # com o Content-Type: application/json
    return jsonify(dados_para_enviar), 200

# --- Bloco para executar a aplicação ---
if __name__ == '__main__':
    # O debug=True faz com que o servidor reinicie automaticamente após alterações no código.
    # Não use em produção!
    app.run(debug=True, port=5000)
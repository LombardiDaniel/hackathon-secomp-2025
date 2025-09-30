# Importa as classes e funções necessárias do Flask
from flask import Flask, request, jsonify
from prompt import gerar_plano_estudos
import pymongo
from pymongo import MongoClient 
from datetime import datetime

# Cria uma instância da aplicação Flask
app = Flask(__name__)

# Configuração do MongoDB
MONGO_URI = "mongodb://admin:quack@roady.patos.dev:27017/"  # Substitua pela sua connection string
DATABASE_NAME = "roadmaps"
COLLECTION_NAME = "roadmaps"

def get_mongo_client():
    """Função para obter cliente MongoDB"""
    return MongoClient(MONGO_URI)

@app.route('/receber', methods=['POST'])
def receber_string():
    """
    Endpoint para receber uma string de um cliente (front-end).
    Espera um JSON no formato: {"prompt": "algum texto aqui"}
    """

    try:
        dados = request.get_json()
        if not dados:
            # Retorna erro se nenhum JSON foi enviado
            return jsonify({"erro": "O corpo da requisição está vazio ou não é JSON."}), 400

        if 'prompt' in dados:
            string_recebida = dados['prompt']
            
            # Gerar o roadmap
            roadmap = gerar_plano_estudos(string_recebida)
            
            # Conectar ao MongoDB e salvar
            try:
                cliente = get_mongo_client()
                db = cliente[DATABASE_NAME]
                collection = db[COLLECTION_NAME]
                
                # Criar documento para salvar
                documento = {
                    "prompt_original": string_recebida,
                    "roadmap": roadmap,
                    "data_criacao": datetime.now(),
                    "timestamp": datetime.now().isoformat()
                }
                
                # Inserir no MongoDB
                resultado = collection.insert_one(documento)
                
                # Fechar conexão
                cliente.close()
                
                print(f"Roadmap salvo com ID: {resultado.inserted_id}")
                
                return jsonify({
                    "sucesso": True,
                    "mensagem": "Roadmap gerado e salvo com sucesso",
                    "roadmap_id": str(resultado.inserted_id),
                    "roadmap": roadmap
                }), 200
                
            except Exception as mongo_error:
                print(f"Erro ao salvar no MongoDB: {mongo_error}")
                return jsonify({
                    "erro": "Erro ao salvar no banco de dados",
                    "roadmap": roadmap  # Retorna o roadmap mesmo se não conseguir salvar
                }), 500
            
        else:
            # Retorna erro se a chave esperada não for encontrada
            return jsonify({"erro": "A chave 'prompt' não foi encontrada no JSON."}), 400

    except Exception as e:
        # Retorna um erro genérico caso algo inesperado aconteça
        print(f"Ocorreu um erro: {e}")
        return jsonify({"erro": "Ocorreu um erro interno no servidor."}), 500

@app.route('/dados', methods=['GET'])
def enviar_roadmap_frontend():
    """
    Endpoint que busca roadmaps salvos no MongoDB.
    """
    try:
        cliente = get_mongo_client()
        db = cliente[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Buscar todos os roadmaps (ou você pode filtrar por critérios específicos)
        roadmaps = list(collection.find({}, {"_id": 0}).sort("data_criacao", -1).limit(10))
        
        cliente.close()
        
        return jsonify({
            "sucesso": True,
            "roadmaps": roadmaps
        }), 200
        
    except Exception as e:
        print(f"Erro ao buscar dados: {e}")
        return jsonify({"erro": "Erro ao buscar dados do banco"}), 500

@app.route('/roadmap/<roadmap_id>', methods=['GET'])
def buscar_roadmap_por_id(roadmap_id):
    """
    Endpoint para buscar um roadmap específico por ID.
    """
    try:
        from bson import ObjectId
        
        cliente = get_mongo_client()
        db = cliente[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        roadmap = collection.find_one({"_id": ObjectId(roadmap_id)}, {"_id": 0})
        
        cliente.close()
        
        if roadmap:
            return jsonify({
                "sucesso": True,
                "roadmap": roadmap
            }), 200
        else:
            return jsonify({"erro": "Roadmap não encontrado"}), 404
            
    except Exception as e:
        print(f"Erro ao buscar roadmap: {e}")
        return jsonify({"erro": "Erro ao buscar roadmap"}), 500

# --- Bloco para executar a aplicação ---
if __name__ == '__main__':
    # O debug=True faz com que o servidor reinicie automaticamente após alterações no código.
    # Não use em produção!
    app.run(debug=True, port=5000)
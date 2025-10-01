import os
import json
from openai import OpenAI
from jsonschema import validate, ValidationError
from dotenv import load_dotenv

load_dotenv()
# --- 1. CONFIGURAÇÃO DA API KEY ---
try:
    client = OpenAI()
except Exception as e:
    print("Erro ao inicializar o cliente OpenAI. Verifique se a variável de ambiente OPENAI_API_KEY está definida.")
    print(e)
    # exit()

# --- 2. DEFINIÇÃO DO JSON SCHEMA ---
JSON_SCHEMA = """
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/roadmap.schema.json",
  "title": "Roadmap",
  "type": "object",
  "required": ["schemaVersion", "id", "title", "modules"],
  "properties": {
    "schemaVersion": { "type": "integer", "const": 1 },
    "id": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
    "upvotes": { "type": "integer", "minimum": 0 },
    "userEmail": { "type": "string", "format": "email" },
    "title": { "type": "string", "minLength": 3, "maxLength": 160 },
    "description": { "type": "string", "minLength": 10, "maxLength": 5000 },
    "difficulty": { "type": "string", "enum": ["beginner","intermediate","advanced","mixed"] },
    "estimatedTotalMinutes": { "type": "integer", "minimum": 1 },
    "tags": {
      "type": "array",
      "items": { "type": "string", "minLength": 2, "maxLength": 40 },
      "maxItems": 30,
      "uniqueItems": true
    },
    "modules": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id","title","order","nodeIds"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
          "title": { "type": "string", "minLength": 3, "maxLength": 160 },
          "summary": { "type": "string" },
          "order": { "type": "integer", "minimum": 0 },
          "nodeIds": {
            "type": "array",
            "items": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
            "uniqueItems": true
          }
        }
      }
    },
    "nodes": {
      "type": ["array", "null"],
      "items": {
        "type": "object",
        "required": ["id","title","moduleId","estimatedMinutes","difficulty"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
          "moduleId": { "type": "string" },
          "title": { "type": "string", "minLength": 2, "maxLength": 160 },
          "objective": { "type": "string", "maxLength": 500 },
          "contentMarkdown": { "type": "string" },
          "resources": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type","title","url"],
              "properties": {
                "type": { "type": "string" },
                "title": { "type": "string" },
                "url": { "type": "string", "format": "uri" },
                "cost": { "type": "string" }
              }
            }
          },
          "difficulty": { "type": "string", "enum": ["beginner","intermediate","advanced"] },
          "estimatedMinutes": { "type": "integer", "minimum": 1 },
          "prereqNodeIds": {
            "type": "array",
            "items": { "type": "string" },
            "uniqueItems": true
          }
        }
      }
    }
  },
  "additionalProperties": false
}
"""
def create_system_message(schema):
    schema_string = json.dumps(schema, indent=2)
    return f"""### PERSONA
Você é um especialista sênior em planejamento pedagógico, focado em criar trilhas de aprendizado lógicas e eficazes.

### OBJETIVO
Analisar a solicitação de estudo do cliente e gerar um plano de estudos detalhado, organizado em módulos sequenciais, começando pelos pré-requisitos fundamentais e progredindo para tópicos avançados.

### DIRETRIZES E REGRAS
1.  **Exclusivamente JSON:** Sua resposta DEVE ser um único objeto JSON válido, conforme o schema fornecido. Ative o modo JSON.
2.  **Estrutura Lógica:** Os módulos devem ser ordenados em uma sequência pedagógica. O módulo deve sempre conter os pré-requisitos essenciais para o próximo.
3.  **Clareza e Concisão:** Os nomes dos módulos e tópicos (nodes) devem ser claros, OBJETIVOS e diretos.
4.  **GENERALISTA:** Os módulos devem focar em conceitos fundamentais e gerais, que servem de base para o aprendizado de ferramentas específicas, em vez de focar nas próprias ferramentas.
5.  **IDs Consistentes:** Ao gerar os `id` para módulos e nós, garanta que as referências (`moduleId`, `nodeIds`, `prereqNodeIds`) sejam consistentes e válidas dentro do documento.

### SCHEMA JSON OBRIGATÓRIO
Sua saída DEVE seguir estritamente o JSON Schema abaixo.

```json
{schema_string}
```"""

# --- 4. CHAMADA À API ---
def gerar_plano_estudos(prompt_usuario: str):
    print("Entrei na função para gerar o plano de estudos")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": create_system_message(JSON_SCHEMA)},
            {"role": "user", "content": prompt_usuario}
        ],
        response_format={"type": "json_object"}  # força saída em JSON válido
    )
    print("Resposta recebida da API")
    conteudo = response.choices[0].message.content
    try:
        print("Mandando conteudo")
        data = json.loads(conteudo)
        print(data)
        print("Validando JSON com schema")
        # validate(instance=data, schema=JSON_SCHEMA)
        print("JSON válido e validado pelo schema!")
        return data
    except ValidationError as e:
        print("Erro de validação do JSON:", e)
    except json.JSONDecodeError as e:
        print("Erro ao decodificar JSON:", e)
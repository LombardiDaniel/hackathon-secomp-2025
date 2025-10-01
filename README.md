# 🚀 Roady - Gerador Inteligente de Roadmaps de Aprendizado

[![Licence](https://img.shields.io/github/license/LombardiDaniel/hackathon-secomp-2025?style=for-the-badge)](./LICENSE)

**Roady** é uma plataforma inovadora que utiliza Inteligência Artificial para gerar roadmaps personalizados de aprendizado. Desenvolvido durante o Hackathon SECOMP 2025, o projeto permite que usuários criem trilhas de estudo estruturadas e interativas baseadas em suas necessidades específicas.

## 🎯 Funcionalidades Principais

- **Geração Inteligente**: Cria roadmaps personalizados usando GPT-4 baseado em prompts do usuário
- **Visualização Interativa**: Interface moderna com fluxogramas interativos usando React Flow
- **Estrutura Modular**: Organiza o aprendizado em módulos sequenciais e tarefas específicas
- **Sistema de Votação**: Permite upvotes nos roadmaps mais úteis
- **Busca e Filtragem**: Encontre roadmaps por tags, dificuldade ou tema
- **Responsivo**: Interface otimizada para desktop e mobile

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │────│     Backend     │────│   Gen Service   │
│   (Next.js)     │    │      (Go)       │    │   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Flow    │    │    MongoDB      │    │   OpenAI API    │
│   Tailwind CSS  │    │   MinIO (S3)    │    │     GPT-4       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Componentes da Arquitetura

#### Frontend (Next.js)
- **Framework**: Next.js 15 com App Router
- **UI**: React 19, Tailwind CSS 4, React Flow
- **Funcionalidades**: 
  - Interface de criação de roadmaps
  - Visualização interativa com nodes e conexões
  - Sistema de busca e filtragem
  - Autenticação simplificada via cookies

#### Backend (Go)
- **Framework**: Gin com middlewares personalizados
- **Banco de Dados**: MongoDB para persistência
- **Storage**: MinIO (S3-compatible) para arquivos
- **APIs**: RESTful endpoints com documentação Swagger
- **Telemetria**: Sistema de métricas e eventos assíncronos

#### Serviço de Geração (Python)
- **Framework**: Flask para API HTTP
- **IA**: OpenAI GPT-4 para geração de conteúdo
- **Validação**: JSON Schema para garantir estrutura correta
- **Integração**: MongoDB para persistência dos roadmaps

## 📋 Schema de Dados

O projeto utiliza um schema JSON rigoroso para garantir a consistência dos roadmaps:

```json
{
  "schemaVersion": 1,
  "id": "roadmap-unique-id",
  "title": "Título do Roadmap",
  "description": "Descrição detalhada",
  "difficulty": "beginner|intermediate|advanced|mixed",
  "estimatedTotalMinutes": 1200,
  "tags": ["web", "javascript", "react"],
  "modules": [
    {
      "id": "module-1",
      "title": "Fundamentos",
      "order": 0,
      "nodeIds": ["node-1", "node-2"]
    }
  ],
  "nodes": [
    {
      "id": "node-1",
      "moduleId": "module-1",
      "title": "HTML Básico",
      "objective": "Aprender estrutura HTML",
      "difficulty": "beginner",
      "estimatedMinutes": 120,
      "resources": [
        {
          "type": "article",
          "title": "MDN HTML Guide",
          "url": "https://developer.mozilla.org/",
          "cost": "free"
        }
      ]
    }
  ]
}
```

## 🎮 Como Usar

### 1. Criando um Roadmap

1. Acesse a aplicação e faça login com um email
2. Navegue até "Criar Roadmap"
3. Digite um prompt descrevendo o que você quer aprender
4. Aguarde a IA gerar o roadmap estruturado
5. Visualize e navegue pelo roadmap interativo

### 2. Explorando Roadmaps

- **Home**: Veja roadmaps em destaque e recentes
- **Busca**: Encontre roadmaps por palavras-chave
- **Detalhes**: Clique em qualquer roadmap para ver detalhes completos

### 3. Exemplos de Prompts

```
"Quero aprender desenvolvimento web fullstack"
"Como me tornar um cientista de dados"
"Roadmap para aprender machine learning do zero"
"Trilha de estudos para DevOps engineer"
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com App Router
- **React 19**: Biblioteca de interface de usuário
- **Tailwind CSS 4**: Framework CSS utilitário
- **React Flow**: Biblioteca para fluxogramas interativos
- **Zod**: Validação de tipos TypeScript

### Backend
- **Go 1.24**: Linguagem de programação
- **Gin**: Framework web HTTP
- **MongoDB**: Banco de dados NoSQL
- **MinIO**: Storage compatível com S3
- **Swagger**: Documentação de API

### IA e Geração
- **Python 3.10**: Linguagem para processamento de IA
- **OpenAI GPT-4**: Modelo de linguagem para geração
- **Flask**: Micro-framework web
- **JSON Schema**: Validação de estrutura de dados

### Infraestrutura
- **Docker**: Containerização
- **Docker Compose**: Orquestração de serviços
- **MongoDB**: Banco de dados principal
- **MinIO**: Storage de objetos

## 📚 Estrutura do Projeto

```
hackathon-secomp-2025/
├── frontend/                 # Aplicação Next.js
│   ├── src/
│   │   ├── app/             # App Router (páginas)
│   │   ├── components/      # Componentes React
│   │   ├── libs/           # Utilitários e serviços
│   │   └── types/          # Definições TypeScript
│   └── package.json
├── backend/                 # API Go
│   ├── src/
│   │   ├── cmd/            # Ponto de entrada
│   │   ├── internal/       # Lógica de negócio
│   │   └── pkg/           # Pacotes reutilizáveis
│   └── docker-compose.yml
├── Roadmap-generate/        # Serviço Python de IA
│   ├── app.py             # API Flask
│   ├── generate_roadmap.py # Lógica de geração
│   └── requirements.txt
├── genservice/             # Container do serviço
├── infra/                  # Configurações de infraestrutura
└── prompt-eng/            # Scripts de prompt engineering
```

## 🔧 APIs Principais

### Backend Go (Port 8080)

```bash
GET  /v1/roadmaps          # Lista todos os roadmaps
GET  /v1/roadmaps/:id      # Busca roadmap por ID
GET  /v1/roadmaps/user     # Roadmaps do usuário
POST /v1/roadmaps          # Cria novo roadmap (via prompt)
```

### Serviço Python (Port 5000)

```bash
POST /receber              # Gera roadmap via GPT-4
GET  /dados               # Lista roadmaps salvos
GET  /roadmap/:id         # Busca roadmap por ID
```

## 🎯 Roadmap de Desenvolvimento

- [x] **MVP Core**: Geração básica de roadmaps
- [x] **Interface Visual**: React Flow para visualização
- [x] **Sistema de Busca**: Filtros e pesquisa
- [ ] **Autenticação OAuth**: Login social
- [ ] **Colaboração**: Roadmaps compartilhados
- [ ] **Progresso do Usuário**: Tracking de conclusão
- [ ] **Recomendações**: IA para sugestões personalizadas
- [ ] **Mobile App**: Aplicativo nativo

## 📄 Licença

Este projeto está licenciado sob a Licença BSD 3-Clause - veja o arquivo [LICENSE](./LICENSE) para detalhes.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 👥 Equipe

Desenvolvido durante o **Hackathon SECOMP 2025** por uma equipe apaixonada por educação e tecnologia.

## 🙏 Agradecimentos

- **SECOMP 2025** pela oportunidade do hackathon
- **OpenAI** pela API GPT-4
- **Comunidade Open Source** pelas ferramentas utilizadas

---

**🚀 Transformando a forma como aprendemos, um roadmap por vez!**


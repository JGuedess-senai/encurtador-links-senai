# 🔗 Encurta Link Senai - Compartilhe com Agilidade

Bem-vindo ao repositório oficial do **Encurta Link Senai**, a plataforma moderna, rápida e segura para encurtamento e rastreamento de URLs.

## 🚀 Tecnologias

- **React + Vite**: Performance ultrarrápida e build otimizado.
- **Tailwind CSS v4**: Design moderno focado em UI/UX com Glassmorphism.
- **Firebase Auth**: Autenticação segura via E-mail/Senha e Google Sign-In.
- **Cloud Firestore**: Banco de dados NoSQL com comunicação em tempo real.
- **Lucide React**: Biblioteca de ícones minimalistas e elegantes.

## 🛠️ Funcionalidades

- **Encurtador Inteligente**: Transforme links longos e complexos em URLs amigáveis de apenas 6 caracteres.
- **Rastreamento em Tempo Real**: Acompanhe o número de cliques em cada link. O painel atualiza o contador de cliques instantaneamente sem precisar recarregar a página.
- **Gerenciamento Seguro**: Apenas usuários autenticados têm acesso ao painel de criação e exclusão, garantindo privacidade (seus links são apenas seus).
- **Redirecionamento Ágil**: Acesso direto via rota `/r/:code` com sistema de expiração automática em 30 dias.
- **Design Premium**: Estética *Dark Mode* sofisticada com painéis translúcidos e interações fluídas, entregando uma experiência de alto nível.
- **Anti-Colisão**: Sistema robusto de verificação no banco que garante que seu link curto gerado seja 100% único.

## 📦 Como rodar localmente

1. Clone o repositório:
```bash
git clone https://github.com/JGuedess-senai/encurtador-links-senai.git
```

2. Entre na pasta do projeto:
```bash
cd encurtador-links-senai
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

> **Nota para desenvolvedores:** Para que a autenticação e o banco de dados funcionem localmente, as variáveis de configuração devem estar devidamente preenchidas no seu arquivo `src/firebase/config.js`.

---
*Conectando ideias, encurtando distâncias. Desenvolvido no SENAI.*

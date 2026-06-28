# 🌕 GUIA COMPLETO: EXPORTAÇÃO, HOSPEDAGEM E ROBUSTEZ DA IA
## Projeto: WhatIsRPG? (Nova RPG) — Astral-Solaria

Este guia foi criado especialmente para ajudar você, passo a passo, a entender como exportar seu projeto do Google AI Studio, onde hospedar o código utilizando **ferramentas 100% gratuitas**, como configurá-lo, e como executá-lo no seu próprio computador ou na nuvem.

Além disso, detalhamos as melhorias implementadas para garantir que a conexão com a inteligência artificial do Gemini e a internet seja **totalmente blindada contra quedas e instabilidades**.

---

## 🚀 PARTE 1: Como Exportar o Projeto do AI Studio

Para tirar o projeto do ambiente do Google AI Studio e salvá-lo em seu computador, siga os seguintes passos simples:

1. **Abra o menu de Configurações do AI Studio** (geralmente representado por uma engrenagem ou ícone de configurações no topo direito ou esquerdo da tela).
2. Procure por uma das seguintes opções de exportação:
   - **Export to ZIP** (Exportar como arquivo comprimido `.zip`): Baixará todo o projeto compactado para a sua máquina.
   - **Export to GitHub** (Exportar para o GitHub): Enviará o projeto diretamente para a sua conta do GitHub (altamente recomendado para hospedagem automática gratuita!).
3. Se você escolheu o arquivo `.zip`, descompacte-o em uma pasta no seu computador para ver os arquivos do projeto (como `package.json`, `server.ts`, `/src`, etc.).

---

## ☁️ PARTE 2: Onde e Como Hospedar na Internet (100% Gratuito)

Como este projeto é **Full-Stack** (possui uma interface visual em React no Front-end e um servidor lógico inteligente em Express Node.js no Back-end que protege a sua chave do Gemini), nós precisamos de plataformas que suportem servidores Node.js.

Aqui estão as duas melhores ferramentas gratuitas do mercado para fazer isso sem gastar nada:

### Opção Recomendada: Render (https://render.com)
A Render possui um plano gratuito excelente para hospedar aplicações Node.js e automatiza tudo direto do seu GitHub.

#### Passo a Passo para Hospedar no Render:
1. **Crie uma conta gratuita no GitHub** (https://github.com) se ainda não tiver uma.
2. **Crie um repositório** e envie os arquivos descompactados do seu projeto para lá (ou use a opção "Export to GitHub" do AI Studio).
3. **Crie uma conta gratuita no Render** (https://render.com), conectando-a com a sua conta do GitHub.
4. No painel do Render, clique no botão azul **New** (Novo) e selecione **Web Service** (Serviço Web).
5. Selecione o repositório do seu projeto do GitHub que você acabou de conectar.
6. Configure as opções do Serviço Web:
   - **Name (Nome):** Escolha um nome para seu aplicativo (ex: `meu-whatisrpg-jogo`).
   - **Language (Linguagem):** Selecione `Node`.
   - **Branch:** Selecione `main` (ou a branch onde estão seus arquivos).
   - **Build Command (Comando de Build):** `npm run build`
   - **Start Command (Comando de Inicialização):** `npm start`
7. Role para baixo até a seção **Environment Variables** (Variáveis de Ambiente) e clique em **Add Environment Variable** (Adicionar Variável).
8. Adicione as seguintes chaves:
   - Chave: `NODE_ENV` | Valor: `production`
   - Chave: `GEMINI_API_KEY` | Valor: *(Cole a sua chave gratuita do Gemini obtida no Google AI Studio)*
9. Clique em **Create Web Service** no final da página.
10. **Pronto!** O Render vai compilar e colocar seu jogo no ar de graça. Ele fornecerá um link seguro (terminado em `.onrender.com`) para você compartilhar com seus amigos e jogar!

*Nota do Plano Gratuito do Render:* Se o aplicativo ficar inativo sem receber visitas, o servidor entra em modo de repouso ("sleep"). Ao acessá-lo novamente, ele pode demorar cerca de 50 segundos para acordar. Isso é normal no plano gratuito!

---

## 💻 PARTE 3: Como Rodar o Jogo no Seu Computador (Local)

Se você quiser rodar e testar o jogo na sua própria máquina local, siga estes passos simples e gratuitos:

1. **Baixe e Instale o Node.js**:
   - Vá em https://nodejs.org, baixe a versão recomendada (LTS) e instale-a. É 100% gratuito.
2. **Abra o Terminal ou Prompt de Comando (CMD)**:
   - No Windows: Pressione a tecla Windows, digite `cmd` e dê Enter.
   - No Mac/Linux: Abra o aplicativo `Terminal`.
3. **Navegue até a pasta do projeto**:
   - Digite `cd` seguido de um espaço e arraste a pasta descompactada do projeto para dentro do terminal (isso colará o caminho da pasta), depois aperte Enter.
4. **Instale os componentes necessários**:
   - Digite o comando abaixo e aperte Enter:
     ```bash
     npm install
     ```
5. **Configure sua Chave de API**:
   - Crie um arquivo texto simples chamado `.env` na raiz da pasta do projeto.
   - Escreva o seguinte conteúdo nele:
     ```env
     GEMINI_API_KEY=COLE_AQUI_SUA_CHAVE_DO_GEMINI
     ```
6. **Inicie o servidor de testes**:
   - Digite o comando abaixo no terminal:
     ```bash
     npm run dev
     ```
7. **Jogue!**:
   - O terminal mostrará que o servidor está rodando. Abra seu navegador de internet e acesse:
     ```text
     http://localhost:3000
     ```

---

## 🛡️ PARTE 4: Conexões de IA e Internet Blindadas contra Erros

A pedido de você, as conexões rúnicas do jogo foram completamente reprojetadas para resistirem a qualquer oscilação de internet ou lentidão momentânea do servidor do Google Gemini. Aqui está como as conexões funcionam agora por trás dos panos:

### 1. Sistema de Retentativa Inteligente do Servidor (Backoff Exponencial)
Quando você faz uma escolha no chat, nosso servidor envia para o Gemini. Se a API do Google retornar que está sob alta demanda ou temporariamente indisponível (Erro 503 / Limit Exhausted):
- O servidor **não desiste**. Ele espera `1,5 segundos` e tenta novamente.
- Se falhar, ele espera `3 segundos` e tenta de novo.
- Se falhar mais uma vez, ele espera `6 segundos` e faz a tentativa final.

### 2. Rede de Segurança (Mantra de Emergência)
Caso a internet ou a API caiam totalmente após todas as tentativas, implementamos uma **fração de lore de emergência**:
- O servidor **nunca quebra ou trava** o jogo.
- Ele envia uma mensagem elegante simulando que ocorreu uma *"Turbulência de Mana"* ou *"Reinicialização das Lentes de Al-Kharid"*, mantendo o seu personagem, seus atributos, seus itens e seu diário intactos e salvos no seu navegador.
- Assim, você pode simplesmente clicar no botão ou enviar o comando novamente assim que a internet estabilizar!

### 3. Retentativa Automática do Navegador (Client-side Retry)
No painel visual que você joga no navegador, também adicionamos a função `fetchWithRetry`. Se o seu Wi-Fi ou dados móveis caírem no exato segundo em que você enviar a mensagem, o navegador detectará a falha física de internet e tentará reconectar a chamada automaticamente por 3 vezes seguidas antes de exibir qualquer aviso, garantindo uma jogabilidade fluida e livre de travamentos indesejados.

---

## 📂 ESTRUTURA DE ARQUIVOS (Onde Fica Cada Coisa)

Para ajudar você a se guiar pelo projeto, aqui está o mapa básico de onde os arquivos importantes estão localizados:

- 📂 `/` (Pasta Raiz)
  - `server.ts` - 💻 **O Servidor do Jogo**: Onde o Express gerencia as chamadas e executa o motor da IA do Gemini com segurança.
  - `package.json` - 📦 **Gerenciador de Dependências**: Contém os scripts de compilação e a lista de pacotes gratuitos usados no projeto.
  - `.env.example` - 📝 **Exemplo de Configuração**: Modelo mostrando como configurar a variável da chave de API.
- 📂 `/src` (Pasta de Código-Fonte do Front-end)
  - `types.ts` - 🗃️ **Ficha de Dados**: Onde estão descritas as regras de tipos do jogo (o que é uma Habilidade, Item, Estado de Jogo, etc.).
  - `App.tsx` - 🎨 **Interface do Jogo (A Tela Completa)**: Contém todo o design de chat imersivo estilo WhatsApp, o menu da Ficha de Personagem, a Bolsa de Inventário interativa, o Mapa Tático Dinâmico onde você pode viajar clicando, e o Diário Cósmico.
  - `index.css` - 💅 **Estilos de Design**: Onde importamos as fontes tipográficas e configuramos os temas de cores escuras de alta performance.

---
*Que os astros iluminem seu caminho em Astral-Solaria! Se tiver dúvidas sobre os comandos, leia este guia ou consulte o chat com o Mestre a qualquer momento.* 🌕✨

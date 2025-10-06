# TEMPORAN

Este é um aplicativo web que fornece previsões meteorológicas baseadas em IA para ajudar os usuários a planejar seus eventos ao ar livre. O aplicativo oferece previsões em tempo real para datas próximas e utiliza dados históricos para previsões de longo prazo, garantindo que você esteja sempre preparado.

## Funcionalidades

-   **Previsão Baseada em Localização e Data:** Insira qualquer local, data e hora para obter uma previsão do tempo detalhada.
-   **Análise de IA:** Utiliza IA generativa (Genkit com Gemini) para analisar dados meteorológicos e fornecer:
    -   **Pontuações de Probabilidade:** Avaliações percentuais para condições como "Muito Quente", "Muito Frio", "Muito Ventoso", "Muito Úmido" e "Desconfortável".
    -   **Relatório Detalhado:** Um resumo em linguagem natural sobre o que esperar, com conselhos personalizados com base nos detalhes do seu evento.
-   **Previsões em Tempo Real e Históricas:**
    -   Utiliza a API Open-Meteo para previsões em tempo real para os próximos 14 dias.
    -   Utiliza a API POWER da NASA para médias de dados históricos para datas futuras, além de 14 dias.
-   **Limiares de Conforto Personalizáveis:** Defina seus próprios limites para temperatura, umidade e velocidade do vento para obter uma pontuação de "desconforto" personalizada.
-   **Mapa Interativo:** Visualize a localização do seu evento em um mapa interativo (Leaflet) com camadas de satélite e nuvens.
-   **Exportação de Dados:** Faça o download dos dados completos da previsão em formato CSV com um único clique.
-   **Design Responsivo:** Interface de usuário construída com Tailwind CSS e ShadCN UI que funciona perfeitamente em dispositivos móveis e desktop.

## Pilha de Tecnologia

-   **Frontend:**
    -   [Next.js](https://nextjs.org/) (App Router)
    -   [React](https://reactjs.org/)
    -   [TypeScript](https://www.typescriptlang.org/)
-   **Estilo:**
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [ShadCN UI](https://ui.shadcn.com/)
-   **Inteligência Artificial:**
    -   [Genkit](https://firebase.google.com/docs/genkit)
    -   Google Gemini
-   **Mapas:**
    -   [Leaflet](https://leafletjs.com/)
    -   [React Leaflet](https://react-leaflet.js.org/)
-   **APIs de Dados:**
    -   [Open-Meteo](https://open-meteo.com/) (Geocodificação e Previsão em Tempo Real)
    -   [NASA POWER](https://power.larc.nasa.gov/) (Dados Meteorológicos Históricos)
    -   [OpenStreetMap](https://nominatim.openstreetmap.org/) (Geocodificação)

## Começando

Siga estas instruções para configurar e executar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

Antes de começar, certifique-se de que você tenha o seguinte software instalado em sua máquina:
-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js) ou outro gerenciador de pacotes como `yarn` ou `pnpm`.

### Guia de Instalação e Execução

1.  **Clone o Repositório**
    Abra seu terminal e clone o repositório do projeto para sua máquina local.
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```

2.  **Instale as Dependências**
    Dentro do diretório do projeto, execute o seguinte comando para instalar todas as dependências necessárias listadas no arquivo `package.json`.
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente**
    O aplicativo utiliza o modelo de IA generativa Gemini do Google, que requer uma chave de API para funcionar.

    -   Crie um arquivo chamado `.env` na raiz do projeto.
    -   Obtenha uma chave de API do Gemini no [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Adicione a chave ao arquivo `.env` da seguinte forma:
        ```
        GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
        ```

4.  **Execute o Servidor de Desenvolvimento**
    Após a conclusão da instalação e configuração, inicie o servidor de desenvolvimento do Next.js.
    ```bash
    npm run dev
    ```

5.  **Acesse a Aplicação**
    Abra seu navegador e acesse o seguinte endereço para ver a aplicação em funcionamento:
    [http://localhost:3000](http://localhost:3000)

Agora você está pronto para usar Temporan!

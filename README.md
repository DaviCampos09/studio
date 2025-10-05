# Outdoor Event Forecaster

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

### Pré-requisitos

-   Node.js (v18 ou superior)
-   npm, yarn ou pnpm

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DO_DIRETORIO>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione suas chaves de API, se necessário. O Genkit pode exigir uma chave de API do Gemini.
    ```
    GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
    ```

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

    Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o aplicativo em ação.

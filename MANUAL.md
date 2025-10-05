# Manual do Sistema - Outdoor Event Forecaster

Este documento descreve a arquitetura técnica do aplicativo, detalhando as telas, rotas e as principais estruturas de dados utilizadas.

## 1. Telas do Sistema

O aplicativo é uma Single-Page Application (SPA), com toda a interação do usuário ocorrendo em uma única tela principal.

### Tela Principal

-   **Componente Principal:** `src/app/page.tsx`
-   **Rota:** `/`

Esta tela é dividida em duas seções principais:

1.  **Formulário de Detalhes do Evento (`ForecasterForm`):**
    -   **Descrição:** Um formulário onde os usuários inserem as informações necessárias para gerar a previsão.
    -   **Campos:**
        -   `Location`: Local do evento (texto).
        -   `Date`: Data do evento (selecionador de data).
        -   `Time`: Hora do evento (seletor de tempo).
        -   `Event Details`: Descrição opcional do evento (área de texto).
        -   `Customize Thresholds` (Opcional, expansível):
            -   `Temp (°C)`: Limite de temperatura para desconforto.
            -   `Humidity (%)`: Limite de umidade para desconforto.
            -   `Wind (km/h)`: Limite de velocidade do vento para desconforto.

2.  **Exibição da Previsão (`ForecastDisplay`):**
    -   **Descrição:** Esta seção aparece após o envio do formulário e exibe os resultados da análise da IA.
    -   **Componentes:**
        -   **Resumo da Previsão (`LikelihoodScores`):**
            -   Exibe as pontuações de probabilidade (0-100%) para condições como "Muito Quente", "Muito Frio", "Muito Ventoso", etc.
            -   Contém o botão para download dos dados em formato CSV.
        -   **Mapa da Localização (`MapDisplay`):**
            -   Um mapa interativo (Leaflet) que mostra a localização do evento com camadas de mapa (Ruas, Satélite, Nuvens).
        -   **Relatório Detalhado (`DetailedReport`):**
            -   Exibe o texto gerado pela IA com a análise completa e conselhos personalizados.

## 2. Rotas e Lógica de Servidor

O aplicativo utiliza o Next.js App Router.

-   **Rota Principal (`/`):**
    -   Renderiza o componente `Home` de `src/app/page.tsx`, que é um Componente de Cliente (`"use client"`).

-   **Ações do Servidor (`src/app/actions.ts`):**
    -   **Descrição:** Este arquivo contém a lógica principal do backend que é executada no servidor. Ele não define rotas de API tradicionais, mas sim Server Actions que podem ser chamadas diretamente do frontend.
    -   **Função Principal: `getForecast(data: ForecasterSchema)`**
        1.  Recebe os dados do formulário.
        2.  Chama a função `geocodeLocation` para obter as coordenadas a partir do nome do local usando a API do OpenStreetMap.
        3.  Verifica se a data do evento está dentro de 14 dias ou no futuro distante.
        4.  Chama `getRealtimeForecast` (usando a API Open-Meteo) para datas próximas ou `getHistoricalForecast` (usando a API NASA POWER) para datas distantes.
        5.  Prepara o input para a IA com os dados meteorológicos.
        6.  Chama a função `conditionLikelihoodForecast` do Genkit (`src/ai/flows/condition-likelihood-forecast.ts`) para obter a análise da IA.
        7.  Retorna o resultado completo (ou um erro) para o frontend.

-   **Fluxo de IA (`src/ai/flows/condition-likelihood-forecast.ts`):**
    -   Define o "flow" do Genkit que interage com o modelo de linguagem do Google (Gemini) para analisar os dados meteorológicos e gerar o relatório e as pontuações de probabilidade.

## 3. Estrutura de Dados (Sem Banco de Dados)

O aplicativo não utiliza um banco de dados tradicional para armazenamento persistente. Os dados são transitórios e baseados em esquemas de validação e nas respostas das APIs externas.

### Principais Estruturas de Dados

1.  **Schema do Formulário (`ForecasterSchema`):**
    -   **Arquivo:** `src/lib/schemas.ts`
    -   **Descrição:** Define a estrutura e as regras de validação para os dados inseridos no formulário usando a biblioteca `zod`.
    -   **Campos:**
        -   `location: string`
        -   `eventDetails: string?`
        -   `date: Date`
        -   `time: string`
        -   `temperature: string?`
        -   `humidity: string?`
        -   `windSpeed: string?`

2.  **Input da IA (`ConditionLikelihoodForecastInput`):**
    -   **Arquivo:** `src/ai/flows/condition-likelihood-forecast.ts`
    -   **Descrição:** Define a estrutura dos dados enviados para o fluxo de IA do Genkit.
    -   **Campos:**
        -   `latitude: number`
        -   `longitude: number`
        -   `dateTime: string`
        -   `eventDetails: string?`
        -   `currentWeather: { temperature, humidity, windSpeed }`
        -   `comfortThresholds: { temperature?, humidity?, windSpeed? }?`
        -   `analysisType: 'realtime' | 'historical'`

3.  **Output da IA (`ConditionLikelihoodForecastOutput`):**
    -   **Arquivo:** `src/ai/flows/condition-likelihood-forecast.ts`
    -   **Descrição:** Define a estrutura dos dados retornados pela IA.
    -   **Campos:**
        -   `conditionLikelihoods: { veryHot, veryCold, veryWindy, veryHumid, uncomfortable }` (todos `number`)
        -   `detailedReport: string`
        -   `currentWeather: { temperature, humidity, windSpeed }`

### APIs Externas

-   **Geocodificação:** OpenStreetMap Nominatim API.
-   **Previsão em Tempo Real:** Open-Meteo API.
-   **Dados Históricos:** NASA POWER API.

# SmartCards

Sistema inteligente de estudos baseado em flashcards interativos, com acompanhamento de desempenho e visualização gráfica de evolução ao longo do tempo.

---

## 📚 Sobre o Projeto

O SmartCards é uma aplicação web desenvolvida com o objetivo de auxiliar estudantes na organização dos estudos por meio de flashcards digitais. A plataforma permite criar assuntos, cadastrar perguntas e respostas, estudar de forma dinâmica e acompanhar o progresso através de métricas e gráficos.

O sistema foi desenvolvido com separação entre front-end, back-end e banco de dados, seguindo o padrão de arquitetura baseada em API REST.

---

## 🎯 Objetivo

O projeto tem como objetivo aplicar conceitos de:

* Desenvolvimento web com HTML, CSS e JavaScript
* Integração entre front-end e back-end
* Consumo de API REST
* Modelagem e persistência de dados em banco relacional
* Organização modular de código
* Visualização de métricas de desempenho

Simulando um ambiente real de aplicação web.

---

## 🚀 Funcionalidades

* Autenticação de usuários (login e cadastro)
* Criação e gerenciamento de assuntos
* CRUD completo de flashcards
* Modo de estudo interativo
* Avaliação de desempenho por nível (Ruim, Médio, Bom, Excelente)
* Registro histórico de progresso por data
* Dashboard com métricas e gráfico de evolução
* Indicadores visuais de nível de domínio

---

## 🧠 Como Funciona o Sistema de Estudo

Durante o modo de estudo, o usuário visualiza a pergunta do flashcard e pode revelar a resposta. Após isso, ele avalia seu nível de domínio em quatro níveis:

* Ruim
* Médio
* Bom
* Excelente

Cada avaliação é registrada com data no banco de dados, permitindo gerar análises e gráficos de evolução ao longo do tempo.

---

## 🗄️ Banco de Dados

O sistema utiliza banco de dados relacional para garantir persistência e organização das informações.

A modelagem contempla:

* Usuários
* Assuntos vinculados ao usuário
* Flashcards vinculados ao assunto
* Registros de progresso com nota e data

Essa estrutura permite armazenar o histórico completo de desempenho e gerar métricas personalizadas para cada usuário.

---

## 🏗️ Arquitetura

A aplicação está organizada em camadas:

Front-end
Responsável pela interface, experiência do usuário e consumo da API.

Back-end
Responsável pela lógica de negócio, autenticação e disponibilização dos endpoints.

Banco de Dados
Responsável pela persistência e integridade das informações.

O front-end foi estruturado de forma modular, separando:

* Serviços de requisição
* Controle de autenticação
* Módulos por página
* Componentes reutilizáveis
* Utilitários

Essa organização facilita manutenção e escalabilidade.

---

## 🛠️ Tecnologias Utilizadas

Front-end

* HTML5
* CSS3
* JavaScript (ES6+)
* Chart.js

Back-end

* API REST

Banco de Dados

* Banco de Dados Relacional

---

## 📊 Diferenciais do Projeto

* Visualização gráfica da evolução de desempenho
* Estrutura modular organizada
* Separação clara entre camadas
* Sistema de avaliação com histórico temporal
* Simulação de ambiente real de aplicação web

---

## 👨‍💻 Programadores

* Guilherme dos Santos Barros Silva - Desenvolvedor Web Full-Stack
* Sérgio Lucas Pinto Souza - Desenvolvedor Back-end
* Alexandre Ben Cavalcanti Luna - Banco de Dados
* Rodrigo Batista de Farias - Banco de Dados

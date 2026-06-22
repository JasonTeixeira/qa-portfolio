---
title: "O que negociar futuros me ensinou sobre escrever software"
excerpt: "Negocio futuros de ES, NQ e CL todas as manhãs antes de escrever código. Os paralelos entre gestão de risco em negociações e gestão de risco em software são desconfortavelmente semelhantes."
sourceSlug: what-trading-futures-taught-me-about-writing-software
locale: pt
sourceHash: d440df8c786a8375
machineTranslated: true
---

# O Que o Trading de Futuros Me Ensinou Sobre Escrever Software

Toda manhã às 6h, antes de escrever uma única linha de código, estou olhando para gráficos de futuros. ES (S&P 500), NQ (Nasdaq), CL (Petróleo Bruto), GC (Ouro) — 8 símbolos no NinjaTrader, procurando setups.

Já opero há anos. E quanto mais faço ambos — trading e construção de software — mais percebo que são a mesma disciplina vestindo roupas diferentes.

## Lição 1: Gerenciamento de Risco > Estar Certo

No trading, você pode estar errado 60% das vezes e ainda assim ganhar dinheiro. Parece impossível, mas a matemática é simples: se seus ganhos são 2x o tamanho de suas perdas, você só precisa acertar 34% das vezes para empatar.

O mesmo vale para software. Você não precisa que toda decisão arquitetural seja perfeita. Você precisa que as falhas sejam pequenas e os sucessos se acumulem.

É por isso que eu:
- Faço deploys de mudanças pequenas (pequenas operações perdedoras)
- Uso feature flags para mudanças arriscadas (stop losses)
- Tenho procedimentos de rollback (estratégia de saída)
- Nunca faço deploy na sexta-feira (nunca seguro durante o fim de semana)

Um trader que arrisca toda sua conta em uma única operação vai explodir. Um desenvolvedor que faz deploy de uma mudança enorme e não testada em produção vai explodir. Mesma energia.

## Lição 2: O Setup Importa Mais Que a Entrada

Traders iniciantes obcecam com o timing da entrada. "Devo comprar a 4.521,25 ou 4.521,50?" Não importa. O que importa é o setup: A tendência está a seu favor? Existe um ponto de invalidação claro? O risco/retorno é de pelo menos 2:1?

Desenvolvedores iniciantes obcecam com a escolha da tecnologia. "Devo usar Prisma ou Drizzle?" Não importa. O que importa é a arquitetura: Seu modelo de dados é sólido? Suas APIs são bem projetadas? Você pode mudar de ideia depois sem reescrever tudo?

A ferramenta específica é a entrada. A arquitetura é o setup. Acertando o setup, a escolha da ferramenta vira um erro de arredondamento.

## Lição 3: Documente Tudo

Mantenho um diário de trading. Cada operação: entrada, saída, raciocínio, emoções, contexto de mercado, resultado, lições. Após 6 meses, padrões emergem. Eu opero demais às segundas-feiras. Seguro perdedores por tempo demais quando estou cansado. Aumento o tamanho agressivamente demais após uma sequência de vitórias.

Agora mantenho o equivalente em engenharia: registros de decisão arquitetural (ADRs). Cada decisão importante: o que escolhi, o que rejeitei, por quê, o que mudaria. Após um ano de desenvolvimento da Nexural, os padrões são claros. Invisto pouco em tratamento de erros no início. Projeto autenticação em excesso. Subestimo consistentemente a complexidade de migrações de banco de dados.

Autoconhecimento através da documentação. Mesma prática, domínio diferente.

## Lição 4: Sobreviventes São Chatos

Os traders mais bem-sucedidos que conheço são chatos. Eles operam os mesmos 2-3 setups, dia após dia, com os mesmos parâmetros de risco. Sem jogadas de YOLO. Sem "estou me sentindo sortudo hoje." Apenas execução consistente de uma vantagem comprovada.

As melhores bases de código em que trabalhei também são chatas. Padrões consistentes. Estruturas de arquivos previsíveis. Convenções de nomenclatura padrão. Sem hacks engenhosos. Sem "achei um jeito legal de fazer isso." Apenas código confiável e sustentável que faz o que diz.

Chato é subestimado em ambas as disciplinas.

## Lição 5: Você Está Negociando Contra Si Mesmo

Os mercados não se importam com você. Eles não estão contra você. Cada perda é consequência de suas decisões, não da malícia do mercado.

O software também não se importa com você. Bugs não são pessoais. Quedas de produção não são o universo te punindo. São consequências de decisões — geralmente tomadas semanas atrás sob restrições diferentes.

Assumir responsabilidade (no trading, chamam de "ser responsável pelo seu P&L") é o que separa profissionais de amadores em ambos os campos.

## A Meta-Lição

Tanto trading quanto engenharia de software são disciplinas de gerenciar complexidade sob incerteza. No trading, a incerteza é a direção do mercado. No software, a incerteza é o comportamento do usuário, a carga do sistema e os casos extremos.

As ferramentas são diferentes. Os princípios são idênticos:
- Gerencie o risco primeiro, busque o retorno depois
- Tenha um plano antes de executar
- Documente o que aconteceu e aprenda com isso
- Seja consistente, não engenhoso
- Sobreviva tempo suficiente para acumular sua vantagem

Construo software melhor porque opero. E opero melhor porque construo software. A polinização cruzada é real.

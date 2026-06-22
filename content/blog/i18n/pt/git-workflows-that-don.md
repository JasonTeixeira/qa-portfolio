---
title: "Fluxos de Git Que Não Te Fazem Querer Desistir"
excerpt: "Trunk-based vs GitFlow vs GitHub Flow — já usei os três. Aqui está o que realmente funciona para desenvolvedores solo e equipes pequenas, e por que a maioria dos fluxos de Git é excessivamente complicada."
sourceSlug: git-workflows-that-don
locale: pt
machineTranslated: true
---

# Fluxos de Trabalho com Git Que Não Te Fazem Querer Desistir

Já trabalhei com GitFlow em projetos maiores. Branches de funcionalidade, branches de desenvolvimento, branches de release, branches de hotfix. O gráfico de branches parecia um mapa de metrô. Fazer merge de uma funcionalidade exigia um doutorado em resolução de conflitos.

Agora uso desenvolvimento trunk-based. Uma branch. Envio a partir da main. Minha frequência de deploy passou de semanal para diária.

## Por Que a Maioria dos Fluxos de Trabalho com Git São Excessivamente Complicados

O GitFlow foi projetado para software que é lançado trimestralmente em mídia física. Se seu processo de deploy envolve queimar um CD, você precisa de branches de release.

Se você faz deploy ao fazer merge na main e o Vercel/GitHub Actions cuida do resto, você não precisa de 90% do GitFlow.

## O Que Eu Realmente Faço

\\\

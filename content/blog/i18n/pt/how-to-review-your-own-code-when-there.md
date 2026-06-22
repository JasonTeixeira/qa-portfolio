---
title: "Como Revisar Seu Próprio Código (Quando Não Há Mais Ninguém)"
excerpt: "Engenharia solo significa sem revisões de código. Desenvolvi um processo de auto-revisão que captura 80% do que um segundo par de olhos encontraria. Começa com se afastar."
sourceSlug: how-to-review-your-own-code-when-there
locale: pt
sourceHash: a3e8c4797df16be4
machineTranslated: true
---

# Como Revisar Seu Próprio Código (Quando Não Há Mais Ninguém)

Em equipes maiores, todo PR é revisado por pelo menos outro engenheiro. Na Sage Ideas, sou o único engenheiro. Ninguém revisa meu código.

Isso é um problema. Não porque eu escrevo código ruim — mas porque sou cego para minhas próprias suposições. Todo desenvolvedor é.

Desenvolvi um processo de auto-revisão que captura a maior parte do que um segundo par de olhos captaria. Não é perfeito, mas é dramaticamente melhor do que "parece bom, mesclar."

## A Regra das 24 Horas

Nunca reviso código que escrevi hoje. O intervalo mínimo entre escrever e revisar é de 24 horas. Idealmente 48.

Isso parece lento. Na verdade é rápido. Nessas 24 horas, estou construindo outra coisa. Quando volto para revisar, esqueci parcialmente minha implementação. Esse esquecimento é o ponto — ele me permite ler o código como se outra pessoa o tivesse escrito.

## A Lista de Verificação de Revisão

Eu reviso em 4 passagens. Cada passagem busca coisas diferentes:

### Passagem 1: Ler como um Usuário (5 minutos)
Não olhe para o código. Abra o diff do PR e leia apenas os nomes dos arquivos e a contagem de linhas.

Perguntas:
- A mudança faz sentido apenas pelos nomes dos arquivos?
- Está tocando muitos arquivos? (sinal de uma mudança acoplada)
- Existem arquivos que não deveriam estar nesta mudança?

### Passagem 2: Ler pela Lógica (15 minutos)
Agora leia o código. Mas não verifique estilo, nomenclatura ou formatação. Apenas lógica.

Perguntas:
- O caminho feliz funciona?
- O que acontece com entradas nulas/indefinidas?
- Existem casos em que isso falha silenciosamente?
- Estou tratando o caso de erro, ou apenas registrando e seguindo em frente?
- Existe uma condição de corrida? (Especialmente em código assíncrono)

### Passagem 3: Ler pela Segurança (10 minutos)

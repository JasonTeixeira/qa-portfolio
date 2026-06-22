---
title: "Git-Workflows, die einen nicht zum Aufgeben bringen"
excerpt: "Trunk-based vs. GitFlow vs. GitHub Flow – ich habe alle drei ausprobiert. Hier erfährst du, was für Solo-Entwickler und kleine Teams wirklich funktioniert und warum die meisten Git-Workflows übermäßig kompliziert sind."
sourceSlug: git-workflows-that-don
locale: de
machineTranslated: true
---

# Git-Workflows, die einen nicht zum Aufgeben bringen

Ich habe mit GitFlow an größeren Projekten gearbeitet. Feature-Branches, Develop-Branches, Release-Branches, Hotfix-Branches. Der Branch-Graph sah aus wie ein U-Bahn-Plan. Einen Feature zu mergen erforderte einen Doktortitel in Konfliktlösung.

Jetzt verwende ich trunk-based development. Ein Branch. Auslieferung von main. Meine Deploy-Frequenz stieg von wöchentlich auf täglich.

## Warum die meisten Git-Workflows überkompliziert sind

GitFlow wurde für Software entwickelt, die quartalsweise auf physischen Medien ausgeliefert wird. Wenn dein Deployment-Prozess das Brennen einer CD beinhaltet, brauchst du Release-Branches.

Wenn du deployst, indem du in main mergst und Vercel/GitHub Actions den Rest erledigt, brauchst du 90 % von GitFlow nicht.

## Was ich tatsächlich mache

\\\

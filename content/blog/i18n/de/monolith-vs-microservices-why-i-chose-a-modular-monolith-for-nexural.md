---
title: "Monolith vs. Microservices: Warum ich mich für einen modularen Monolithen bei Nexural entschieden habe"
excerpt: "Die Nexural-Plattform hat 7 Systeme, läuft aber als modularer Monolith, nicht als Microservices. Hier erfahren Sie, warum das für einen Solo-Entwickler die richtige Entscheidung war und wann ich aufteilen würde."
sourceSlug: monolith-vs-microservices-why-i-chose-a-modular-monolith-for-nexural
locale: de
sourceHash: bbc8c35698d66e27
machineTranslated: true
---

# Monolith vs Microservices: Warum ich mich für einen modularen Monolithen bei Nexural entschieden habe

Das Nexural-Ökosystem umfasst 7 miteinander verbundene Systeme: Trading-Dashboard, Discord-Bot, Research-Engine, Alert-System, Newsletter-Studio, Strategy-Tracker und Automatisierungs-Suite.

Es wäre naheliegend anzunehmen, dass es sich um eine Microservices-Architektur handelt. Ist es aber nicht. Es ist ein modularer Monolith – und das war bewusste Entscheidung.

## Der Entscheidungsrahmen

Ich habe drei Fragen gestellt:

1. **Wie viele Entwickler?** Einer (ich). Microservices vervielfachen den operativen Aufwand. Bei einem einzigen Entwickler bedeutet jeder neue Service eine weitere Deployment-Pipeline, ein weiteres Monitoring-Setup, eine weitere Fehlerquelle, die man um 2 Uhr morgens debuggen muss.

2. **Benötigen die Module unabhängige Skalierung?** Noch nicht. Das Trading-Dashboard und die Research-Engine laufen beide auf Vercel. Sie haben keine unterschiedlichen Skalierungsprofile, die eine separate Infrastruktur rechtfertigen würden.

3. **Benötigen die Module unterschiedliche Tech-Stacks?** Teilweise – der Discord-Bot ist Node.js, das Alert-System ist .NET. Das sind zwangsläufig separate Services. Aber die Web-Apps sind alle Next.js/TypeScript und teilen sich Typen, Hilfsfunktionen und Datenbankzugriff.

## Was "modularer Monolith" in der Praxis bedeutet

Die Codebasis ist als ein Repository mit klaren Domänengrenzen organisiert:

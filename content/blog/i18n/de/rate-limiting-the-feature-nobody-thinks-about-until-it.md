---
title: "Ratenbegrenzung: Die Funktion, an die niemand denkt, bis es zu spät ist"
excerpt: "Ihre API funktioniert perfekt bei 10 Anfragen pro Sekunde. Bei 10.000 bricht sie zusammen. So implementiere ich eine Ratenbegrenzung, die schützt, ohne legitime Nutzer zu stören."
sourceSlug: rate-limiting-the-feature-nobody-thinks-about-until-it
locale: de
sourceHash: c38601b0fe30159a
machineTranslated: true
---

# Rate Limiting: Die Funktion, an die niemand denkt – bis es zu spät ist

Niemand setzt "Rate Limiting implementieren" auf das Sprint Board. Es ist keine User Story. Es bewegt keine Metrik. Product fragt nie danach.

Dann, eines Tages, schickt jemand 50.000 Anfragen an deine API in 30 Sekunden und deine Datenbank schmilzt dahin. Oder schlimmer – ein einzelnes, außer Kontrolle geratenes Skript eines Users kostet dich über Nacht 800 $ an AWS Lambda-Aufrufen.

Beides ist mir passiert. Jetzt ist Rate Limiting in meiner Starter-Vorlage.

## Die drei Ebenen

Ich implementiere Rate Limiting auf drei Ebenen, weil jede unterschiedliche Missbrauchsmuster abfängt:

### Ebene 1: Edge (CloudFront / Vercel)

\\\

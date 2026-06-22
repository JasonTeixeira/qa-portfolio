---
title: "Warum ich meistens Raw SQL statt eines ORMs verwende"
excerpt: "ORMs sind großartig, bis sie es nicht sind. Nachdem ich generierte Abfragen debuggt habe, die 30 Sekunden auf einer Datenbank mit 185 Tabellen brauchten, bin ich für die heißen Pfade auf Raw SQL umgestiegen. Hier ist, wann jedes sinnvoll ist."
sourceSlug: why-i-use-raw-sql-instead-of-an-orm-most-of-the-time
locale: de
machineTranslated: true
---

# Warum ich (meistens) Raw SQL statt eines ORMs verwende

Das wird kontrovers sein, also fange ich mit dem Haftungsausschluss an: ORMs sind in Ordnung. Prisma, SQLAlchemy, Drizzle – das sind alles gute Werkzeuge, die von klugen Leuten entwickelt wurden. Ich verwende sie.

Aber für die Nexural-Plattform – 185 Tabellen, komplexe Joins, materialisierte Views, zeilenbasierte Sicherheit – war Raw SQL für die kritischen Pfade die richtige Entscheidung. Hier ist der Grund.

## Der Moment, als ich umstellte

Ich verwendete Prisma. Das Dashboard lud in 200ms lokal. In der Produktion mit echten Daten dauerte es 4,2 Sekunden.

Ich führte \\\

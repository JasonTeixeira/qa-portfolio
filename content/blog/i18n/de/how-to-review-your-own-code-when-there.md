---
title: "So überprüfst du deinen eigenen Code (wenn niemand sonst da ist)"
excerpt: "Solo-Entwicklung bedeutet keine Code-Reviews. Ich habe einen Selbstüberprüfungsprozess entwickelt, der 80 % dessen erfasst, was ein zweites Augenpaar finden würde. Es beginnt mit Abstandnehmen."
sourceSlug: how-to-review-your-own-code-when-there
locale: de
sourceHash: a3e8c4797df16be4
machineTranslated: true
---

# Wie man seinen eigenen Code reviewt (wenn niemand sonst da ist)

In größeren Teams wird jeder PR von mindestens einem anderen Entwickler reviewed. Bei Sage Ideas bin ich der einzige Entwickler. Niemand reviewt meinen Code.

Das ist ein Problem. Nicht, weil ich schlechten Code schreibe – sondern weil ich blind für meine eigenen Annahmen bin. Jeder Entwickler ist das.

Ich habe einen Selbst-Review-Prozess entwickelt, der das meiste abfängt, was ein zweites Augenpaar finden würde. Er ist nicht perfekt, aber deutlich besser als "sieht gut aus, mergen."

## Die 24-Stunden-Regel

Ich reviewe niemals Code, den ich heute geschrieben habe. Der Mindestabstand zwischen Schreiben und Reviewen beträgt 24 Stunden. Idealerweise 48.

Das klingt langsam. Es ist tatsächlich schnell. In diesen 24 Stunden baue ich etwas anderes. Wenn ich zum Review zurückkomme, habe ich meine Implementierung teilweise vergessen. Dieses Vergessen ist der Punkt – es erlaubt mir, den Code zu lesen, als hätte ihn jemand anderes geschrieben.

## Die Review-Checkliste

Ich reviewe in 4 Durchgängen. Jeder Durchgang sucht nach anderen Dingen:

### Durchgang 1: Wie ein Benutzer lesen (5 Minuten)
Schau nicht auf den Code. Öffne den PR-Diff und lies nur die Dateinamen und Zeilenanzahlen.

Fragen:
- Ergibt die Änderung allein anhand der Dateinamen Sinn?
- Betrifft sie zu viele Dateien? (Zeichen einer gekoppelten Änderung)
- Gibt es Dateien, die nicht in diese Änderung gehören?

### Durchgang 2: Auf Logik prüfen (15 Minuten)
Lies jetzt den Code. Aber prüfe nicht auf Stil, Benennung oder Formatierung. Nur die Logik.

Fragen:
- Funktioniert der Happy Path?
- Was passiert mit null/undefined-Eingaben?
- Gibt es Fälle, in denen dies stillschweigend fehlschlägt?
- Behandle ich den Fehlerfall oder logge ich nur und mache weiter?
- Gibt es eine Race Condition? (Besonders bei asynchronem Code)

### Durchgang 3: Auf Sicherheit prüfen (10 Minuten)

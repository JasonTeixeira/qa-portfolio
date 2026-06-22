---
title: "Authentifizierung ist schwieriger als man denkt"
excerpt: "Ich habe Auth in vier verschiedenen Projekten implementiert. Jedes Mal dachte ich, es würde 2 Tage dauern. Jedes Mal dauerte es 2 Wochen. Hier ist der Grund und was ich anders machen würde."
sourceSlug: authentication-is-harder-than-you-think
locale: de
sourceHash: e2ed3ac31387d42f
machineTranslated: true
---

# Authentifizierung ist schwieriger, als du denkst

Jeder Projektplan, den ich je geschrieben habe, enthielt einen Punkt: "Authentifizierung — 2 Tage."

Jedes Projekt-Retrospective hatte eine Notiz: "Auth hat 2 Wochen gedauert."

Ich habe Auth-Systeme jetzt 4 Mal gebaut. Jedes Mal unterschätze ich es. Hier ist der Grund und was ich endlich gelernt habe.

## Der Eisberg

Was du denkst, was Auth ist:
- Login-Formular
- Token speichern
- Prüfen, ob Token gültig ist
- Fertig

Was Auth tatsächlich ist:
- Login-Formular (E-Mail/Passwort + OAuth + Magic Links + MFA?)
- Passwort-Hashing (bcrypt, argon2, welcher Kostenfaktor?)
- Session-Management (JWT vs. Session-Cookie vs. beides?)
- Token-Refresh (stilles Refresh, Rotation, Widerruf)
- CSRF-Schutz (Same-Site-Cookies, Double-Submit-Token)
- Ratenbegrenzung (beim Login, bei Registrierung, beim Passwort-Reset)
- Passwort-Reset-Ablauf (Token-Generierung, Ablauf, Einmalverwendung)
- E-Mail-Verifizierung (Token, erneuter Versand, was wenn E-Mail geändert wird?)
- Kontosperrung (wie viele Versuche? Wie läuft die Entsperrung?)
- Rollenbasierte Zugriffskontrolle (Admin vs. Benutzer vs. Moderator)
- API-Key-Verwaltung (für programmatischen Zugriff)
- Session-Invalidierung bei Passwortänderung
- "Angemeldet bleiben" vs. "Nur diese Sitzung"
- Benachrichtigung bei Login von neuem Gerät
- Audit-Logging (wer hat sich wann von wo angemeldet)

Das sind 15+ Funktionen. Bei 1-2 Tagen pro Stück bist du bei einem Monat.

## Was ich jetzt mache: Supabase Auth verwenden und erweitern

Nachdem ich zweimal benutzerdefiniertes Auth gebaut und beide Male mein Leben gehasst habe, starte ich jetzt mit Supabase Auth (oder Clerk, oder Auth.js). Es übernimmt:

- E-Mail/Passwort mit bcrypt
- OAuth-Anbieter (Google, GitHub, Discord)
- JWT-Tokens mit Refresh
- E-Mail-Verifizierung
- Passwort-Reset
- Session-Management
- Ratenbegrenzung

Das sind 80% von Auth, erledigt von Leuten, die sich hauptberuflich mit Auth beschäftigen. Ich konzentriere mich auf die 20%, die für meine App spezifisch sind:

\\\

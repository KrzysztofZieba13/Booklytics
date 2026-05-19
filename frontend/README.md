# Booklytics – Uniwersalna Platforma do Rezerwacji Usług Online

Booklytics to nowoczesny system typu SaaS stworzony do cyfrowego zarządzania wizytami, obsługi harmonogramów oraz łączenia klientów z lokalnymi usługodawcami. Projekt realizowany w architekturze Monorepo (Frontend + Backend w jednym repozytorium).

---

## 🚀 Główne Funkcjonalności

*   **Dla Klienta:** Przeglądanie ofert lokalnych firm, rezerwacja wolnych terminów w czasie rzeczywistym z automatyczną blokadą czasową sesji, system powiadomień.
*   **Dla Administratora/Firmy:** Zarządzanie kalendarzem pracowników, bazą świadczonych usług oraz zaawansowany panel analityczny (analiza przychodów, obłożenia punktu i statystyk wizyt).
*   **Bezpieczeństwo:** Pełna autentykacja z podziałem na role (Klient / Admin / Pracownik).

---

## 🛠️ Stack Technologiczny

### Frontend
*   **React** (z wykorzystaniem najnowszych Hooków i Context API do zarządzania stanem)
*   **Vite** (szybkie narzędzie budujące)
*   **SCSS** (modułowe i skalowalne style architektoniczne)
*   **Clerk** (obsługa logowania i ról po stronie klienta)

### Backend
*   **Node.js** + **Express.js** (REST API)
*   **MongoDB** + **Mongoose** (baza danych NoSQL i modelowanie danych)
*   **Clerk SDK** (weryfikacja tokenów i zabezpieczanie endpointów)

---

## 📁 Struktura Projektu

```text
booklytics-app/
├── backend/          # Serwer Node.js + Express oraz modele bazy danych
└── frontend/         # Aplikacja React + Vite + SCSS
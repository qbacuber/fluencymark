# FluencyMark

FluencyMark to nowoczesna, responsywna aplikacja webowa do analizy tekstu, nauki języków oraz ćwiczenia płynności czytania i wymowy. Umożliwia użytkownikom interaktywną pracę z dowolnym tekstem poprzez zaznaczanie wyrazów, eksportowanie i importowanie postępów, a także porównywanie wyników z dwóch różnych plików.

---

## 🚀 Główne funkcje (Features)

*   **Tryb Edytora (Editor View):**
    *   Wygodne wprowadzanie surowego tekstu z automatyczną walidacją (aplikacja nie pozwala na przetwarzanie pustych tekstów).
    *   Wydajne i deterministyczne tokenizowanie tekstu na słowa z przypisywaniem unikalnych identyfikatorów (`word-${index}`).
*   **Interaktywny Tryb Pracy (Interactive View):**
    *   Klikalna prezentacja tekstu – słowo po słowie.
    *   Szybkie i proste zaznaczanie/odznaczanie słów kluczowych, trudnych wyrazów bądź błędów (za pomocą kliknięć myszką lub klawiatury – `Enter` / `Spacja`).
    *   Obsługa standardów dostępności (A11y) – przyciski z atrybutami `role="button"` i `aria-pressed`.
    *   Przystosowany tryb tylko do odczytu (`readonly`) blokujący edycję i czyszczący zbędne atrybuty interakcji.
*   **Panel Ustawień (Settings Panel):**
    *   Konfiguracja wizualna prezentacji słów (współczynnik skali tekstu, pogrubienie i podkreślenie pierwszej/wybranych liter w celu ułatwienia czytania).
*   **Porównywarka Wyników (Compare Page):**
    *   Możliwość importu dwóch plików JSON (eksportowanych w formacie v2) i porównania ich zawartości side-by-side.
    *   Atomowy, w pełni asynchroniczny import plików za pomocą `Promise.all` i `FileReader` – błąd w dowolnym pliku wstrzymuje operację i wyświetla czytelny komunikat, bez uszkodzenia aktualnego stanu.
    *   Wyświetlanie różnic: liczby zaznaczonych wyrazów, rozbieżności w tekstach źródłowych oraz graficzne podświetlenie różnic.
*   **Trwałość danych (Persistence) & Eksport/Import:**
    *   Automatyczny zapis stanu w pamięci podręcznej przeglądarki (`window.localStorage`).
    *   Bezpieczna serializacja stanu do formatu JSON v2 (zapewniająca spójność i niezmienność indeksów słów po imporcie).
*   **Drukuj (Print View):**
    *   Dedykowany, czysty i zoptymalizowany pod kątem wydruku widok zaznaczonego tekstu.

---

## 🛠️ Użyte technologie (Tech Stack)

Aplikacja została zbudowana w oparciu o nowoczesny, lekki i wydajny zestaw narzędzi:

1.  **Svelte 5** – framework frontendowy wykorzystujący reaktywne mechanizmy *Runes* (`$state`, `$derived`, `$effect`, `$effect.root`) dla optymalnej wydajności i czytelności kodu.
2.  **SvelteKit** – szkielet aplikacji zapewniający routing, kompilację oraz statyczną adaptację (`@sveltejs/adapter-static`).
3.  **TypeScript** – pełne typowanie statyczne zapewniające bezpieczeństwo kodu.
4.  **Vite** – super-szybki bundler i lokalny serwer deweloperski.
5.  **Vanilla CSS** – w pełni elastyczny, globalny i modułowy arkusz stylów (`src/routes/global.css`) ze zunifikowanymi klasami przycisków (`btn-primary`, `btn-secondary`) oraz nowoczesną typografią.
6.  **Vitest & Svelte Testing Library** – nowoczesne środowisko testowe oparte na `jsdom` i `@testing-library/jest-dom` do weryfikacji poprawności logiki, stanów (store) oraz komponentów interfejsu użytkownika.
7.  **Prettier & ESLint** – zautomatyzowane narzędzia dbające o spójność formatowania i jakość kodu.

---

## 🧪 Testy (Testing)

Środowisko testowe oparte jest o **Vitest** i uruchamia testy w izolowanym środowisku `jsdom`.

### Jak uruchomić testy lokalnie?

Zainstaluj najpierw zależności za pomocą pnpm:
```bash
pnpm install
```

Następnie możesz uruchomić testy w jednym z dwóch trybów:

*   **Tryb obserwatora (Watch mode):**
    Automatycznie uruchamia testy przy każdej zmianie w kodzie:
    ```bash
    pnpm run test
    ```

*   **Tryb jednorazowy (Single-run mode):**
    Uruchamia cały pakiet testów raz i kończy działanie (przydatne m.in. w procesach CI/CD):
    ```bash
    pnpm run test:run
    ```

Szybkie sprawdzenie poprawności typowania TypeScript:
```bash
pnpm run check
```

---

## 💻 Uruchomienie lokalne aplikacji (Development)

Aby uruchomić aplikację w trybie deweloperskim na swoim komputerze:

```bash
pnpm run dev
```

Aplikacja będzie dostępna pod adresem wskazanym w konsoli (domyślnie `http://localhost:5173/`).

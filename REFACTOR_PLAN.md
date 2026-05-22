# FluencyMark — Plan Refaktoru

## 1. Architektura i logika

### 1.1 Memory leak w `$effect.root` (documentStore)

**Plik:** `src/lib/stores/documentStore.svelte.ts`

`$effect.root` zwraca cleanup function, która nigdy nie jest wywoływana. Store jest singletonem modułowym więc w praktyce nie wycieknie, ale kod jest nieczytelny i podatny na błędy przy refaktorze.

**Akcja:** Dodać komentarz wyjaśniający celowe pominięcie cleanup, albo przenieść persist do jawnego debounced zapisu w komponencie.

---

### 1.2 `processText` generuje niedeterministyczne UUID

**Plik:** `src/lib/utils/textProcessor.ts`

Każde wywołanie `confirmText()` lub `reconstructFromV2()` tworzy nowe `id` przez `crypto.randomUUID()`. Po imporcie JSON-a słowa mają inne `id` niż przed eksportem.

**Akcja:** Rozważyć deterministyczne `id` (np. `word-${index}`), skoro eksport v2 i tak identyfikuje słowa po indeksie.

---

### 1.3 Martwy komentarz w `compareUtils.ts`

**Plik:** `src/lib/utils/compareUtils.ts`

Funkcja `validateAndReconstructWords` obsługuje tylko `version === 2`. Komentarz JSDoc mówi o obsłudze v1 (legacy), ale ta logika została usunięta.

**Akcja:** Usunąć nieaktualny komentarz o v1.

---

## 2. Potencjalne bugi

### 2.1 Race condition w `importFiles` (compare page)

**Plik:** `src/routes/compare/+page.svelte`

Jeśli jeden z plików nie przejdzie walidacji (early return po `setError`), `loadedCount` nigdy nie osiągnie `fileArray.length` i `assignLoadedFiles` się nie wywoła. Drugi plik zostaje w limbo.

**Akcja:** Traktować błąd walidacji dowolnego pliku jako przerwanie całego importu. Alternatywnie — użyć `Promise.all` z `FileReader` opakowanym w Promise.

---

### 2.2 Duplikacja `cleanText`

**Pliki:** `src/lib/components/PrintView.svelte`, `src/routes/compare/+page.svelte`

Ta sama funkcja strip-punctuation + lowercase istnieje w dwóch miejscach.

**Akcja:** Wyciągnąć do `src/lib/utils/textUtils.ts` i importować w obu miejscach.

---

## 3. UX i accessibility

### 3.1 Brak walidacji pustego tekstu

**Plik:** `src/lib/components/EditorView.svelte`

`handleConfirm()` pozwala przejść do pustego widoku interaktywnego gdy `rawText` jest pusty.

**Akcja:** Dodać guard:
```ts
function handleConfirm() {
  if (!documentStore.rawText.trim()) return;
  documentStore.confirmText();
}
```

---

### 3.2 Brak `aria-pressed` w WordDisplay

**Plik:** `src/lib/components/WordDisplay.svelte`

Element ma `role="button"` i `tabindex`, ale brakuje informacji o stanie zaznaczenia dla screen readerów.

**Akcja:** Dodać `aria-pressed={word.isMarked}` do `<span>`.

---

### 3.3 Brak `<title>` w head

**Plik:** `src/routes/+layout.svelte` lub `src/routes/+page.svelte`

Strona nie ustawia `<title>` — przeglądarka pokaże URL.

**Akcja:** Dodać `<svelte:head><title>FluencyMark</title></svelte:head>`.

---

## 4. Styl kodu i powtórzenia

### 4.1 Duplikacja stylów `.btn-primary` / `.btn-secondary`

**Pliki:** `InteractiveView.svelte`, `compare/+page.svelte`, `EditorView.svelte`

Te same style buttonów powtarzają się w trzech komponentach.

**Akcja:** Przenieść do `global.css` jako globalne klasy utility, albo stworzyć komponent `Button.svelte`.

---

### 4.2 Brak cleanup dla `errorTimeout` (compare page)

**Plik:** `src/routes/compare/+page.svelte`

Jeśli komponent zostanie odmontowany przed upływem timeout-u, callback nadal odpali.

**Akcja:** Użyć `$effect` z cleanup:
```ts
$effect(() => {
  if (!error) return;
  const id = setTimeout(() => (error = ''), 5000);
  return () => clearTimeout(id);
});
```

---

## 5. Konfiguracja i build

### 5.1 Niestandardowy meta tag

**Plik:** `src/app.html`

`<meta name="text-scale" content="scale" />` nie jest standardowym tagiem.

**Akcja:** Usunąć jeśli nie jest wymagany przez konkretne narzędzie.

---



---


## 7. Drobnostki

| # | Opis | Plik |
|---|------|------|
| 7.1 | `VALID_MODES` w storage.ts nie jest zsynchronizowany z typem `AppMode` — zmiana jednego wymaga ręcznej zmiany drugiego | `storage.ts` / `types.ts` |
| 7.2 | `handleContainerMouseUp` czyści selekcję po każdym mouseup — dodać komentarz wyjaśniający celowość | `InteractiveView.svelte` |
| 7.3 | Pusty plik `src/lib/index.ts` — usunąć lub wykorzystać jako barrel export | `src/lib/index.ts` |

---

## Priorytetyzacja

| Priorytet | Pozycje |
|-----------|---------|
| 🔴 Wysoki | 2.1 (race condition), 3.1 (pusty tekst), 3.2 (a11y) |
| 🟡 Średni | 2.2 (DRY cleanText), 4.1 (DRY buttony), 4.2 (cleanup timeout),
| 🟢 Niski | 1.1, 1.2, 1.3, 3.3, 5.1, 5.2, 7.x |

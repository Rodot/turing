# Coding rules and architecture

## Commands

You must run `npm run quality` after each modification.

If it fails, find the issue, fix it, and run `npm run quality` again.

If e2e fail, fix them as well. You can see the browser console output when you run the command, and the screenshots in the `test-results` folder.

## Architecture Overview

This is "The Turing Trial" - a multiplayer party game where players try to distinguish humans from AI in a chat environment.

## Stack

- **Frontend**: Next.js 15 with React 19, Material-UI, TypeScript
- **Backend**: Supabase (database, real-time subscriptions, edge functions)
- **State Management**: TanStack Query for server state
- **Testing**: Playwright for E2E testing
- **Deployment**: Static export build

## Key Architecture Patterns

**Game Flow Management**: The app uses a router pattern (`gameRouter.tsx`) that conditionally renders:

- `SignUp` component when user needs to join/create game
- `Lobby` component when game status is "lobby"
- `Chat` component during active gameplay

## Data Layers

### Both frontend and backend

- Domain model types defined in `./supabase/functions/_types/Database.type.ts`
- Utility functions in `./supabase/functions/_shared/`

### Backend

- Single source of truth stored in Supabase database, defined in `20240516183632_create_tables.sql`
- Repository to read/write to database in `./supabase/_queries`
- Supabase edge-function to mutate databases using the above repository, in `./supabase/functions`

### Front end

- All async queries and mutation are done using TanStack
- Read databases in realtime using custom hooks in `./hooks/use**Query.ts`
- Mutate state by calling mutations in `./hooks/use**Query.ts` that call supabase edge funtions
- Front always calls edge functions, never write to the database directly
- Components use hooks for data fetching rather than prop drilling
- `/components/` contains all UI components with clear single responsibilities
- Material-UI theming configured in `theme.ts`

## Internationalization (i18n)

### Frontend

`./locales/{en,fr}/common.json` for UI text

```typescript
import { useTranslation } from "next-i18next";
const { t } = useTranslation("common");
const text = t("buttons.newGame");
```

### Backend and edge functions

`./supabase/functions/_shared/locales/{en,fr}.ts` for system messages

```typescript
import { getTranslationFunction } from "../_shared/i18n.ts";
const t = getTranslationFunction(game.lang);
const message = t("messages.startedVote", { player: playerName });
```

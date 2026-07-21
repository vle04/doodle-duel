## Doodle Duel

A team-based online Pictionary game where two teams race to guess drawings faster than the opposing team.

## Running Locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Building

```bash
npm run build
```

## Testing

To run E2E (end-to-end) tests:
```bash
npm run test:e2e
```
This will also create a playwright report.

## Flows

Signup/Login flow:
user -> signup/login page -> supabase auth -> if login succeeds -> create profile (if it doesn't exist) -> redirect to dashboard
# Plan: Context-Aware Auth Footer — Sign-In-Only vs Sign-Up-Only Flows

## What we are building

Adjust the auth footer on three screens so the navigation intent is unambiguous:
- Welcome screen: the auth link must be sign-in **only** — no "Don't have an account? Sign up" toggle.
- Sign-in screen when reached from the driver onboarding path (`?from=driver-identity`): hide the "Don't have an account? Sign up" link so the user sees a pure sign-in form.
- Sign-up screen when reached from the driver onboarding path (`?from=driver-identity`): hide the "Already have an account? Sign in" link so the user sees a pure sign-up form.

No other auth or dashboard behaviour changes. The `sign-in-link` / `sign-up-link` footers on the non-driver paths remain intact.

---

## Current state (from code inspection)

| Screen | Current footer | Effect |
|---|---|---|
| `welcome.tsx` | `AuthFooter variant="sign-in-link"` | Renders **"Already have an account? Sign in"** — no sign-up toggle. This already matches the requirement. |
| `sign-in.tsx` | `AuthFooter variant="sign-up-link"` | Renders **"Don't have an account? Sign up"** — always visible, even when `?from=driver-identity`. |
| `sign-up.tsx` | `AuthFooter variant="sign-in-link"` | Renders **"Already have an account? Sign in"** — always visible, even when `?from=driver-identity`. |
| `forgot-password.tsx` | `variant="forgot-password-link"` | Unaffected. |

The `?from=driver-identity` query param already flows correctly from `driver-identity.tsx` → `sign-in` → `sign-up`. It is used today only to control the back-button target; it is not used to control footer visibility.

---

## Decision

**Add one new `AuthFooterVariant` (`sign-in-only`) instead of adding boolean props.**

Reasoning:
- The variant name describes exactly what the user sees: a plain "Sign in" link, no prefix text.
- Adding a boolean `hideText?: boolean` would silently break the "text + link" pattern for existing variants and create an inconsistent API surface.
- A new variant is a single, explicit opt-in change; all existing call sites continue to work without modification.

---

## Implementation plan

### 1. Add `sign-in-only` variant to `src/components/ui/auth-footer.tsx`

- Extend `AuthFooterVariant` type to include `"sign-in-only"`.
- Add a branch that renders only a centered **"Sign in"** pressable link (no prefix text, no wrapper sentence), styled identically to the existing `.link` style.
- The new variant ignores the `from` prop (no navigation target needed).

### 2. Update `src/app/(onboarding)/welcome.tsx`

- Change `AuthFooter variant="sign-in-link"` → `AuthFooter variant="sign-in-only"`.
- Result: footer shows only **"Sign in"** with no "Already have an account?" prefix. Matches the requirement exactly.

### 3. Update `src/app/(auth)/sign-in.tsx`

- Replace the unconditional `<AuthFooter variant="sign-up-link" …/>` with a conditional:
  - When `fromIdentity` is `true` → render `<AuthFooter variant="sign-in-only" />` (hides "Don't have an account? Sign up").
  - When `fromIdentity` is `false` → keep existing `<AuthFooter variant="sign-up-link" …/>` (preserves sign-in/sign-up toggle for owner/client/corporate paths).

### 4. Update `src/app/(auth)/sign-up.tsx`

- Wrap the existing `<AuthFooter variant="sign-in-link" …/>` in a conditional:
  - When `fromIdentity` is `true` → render nothing.
  - When `fromIdentity` is `false` → keep existing footer (preserves "Already have an account? Sign in" for non-driver paths).

---

## Affected boundaries

| File | What changes | Driver dashboard touched? |
|---|---|---|
| `components/ui/auth-footer.tsx` | New variant added, type extended | ❌ No |
| `app/(onboarding)/welcome.tsx` | Footer variant swapped | ❌ No |
| `app/(auth)/sign-in.tsx` | Footer conditional on `fromIdentity` | ❌ No |
| `app/(auth)/sign-up.tsx` | Footer hidden when `fromIdentity` | ❌ No |

---

## Unaffected flows (preserved as-is)

- Owner / Client / Corporate selecting role → `sign-in` (sign-up-link footer shows) → can switch to sign-up.
- Forgot-password → sign-in (back button target, no footer change).
- Driver-identity → sign-in (now sign-in-only, no sign-up toggle) → sign-up (now no sign-in toggle) → post-auth → driver dashboard.
- Google SSO buttons on sign-in and sign-up are untouched.

---

## Edge cases considered

| Edge case | Outcome |
|---|---|
| User bookmarks `/(auth)/sign-in` directly (no `?from`) | `fromIdentity = false` → existing `sign-up-link` footer renders. Sign-in toggle still available. |
| User taps browser back from sign-in to welcome | Back target is still `welcome` (controlled by `AuthBackButton`, unchanged). |
| User on sign-in (from driver-identity) uses Google SSO | Social buttons are above the footer, unaffected by footer change. |
| Clerk email verification screen (inside sign-up) | The `pendingVerification` branch in `sign-up.tsx` does not render an `AuthFooter` at all; unaffected. |
| Driver signs out from dashboard → returns to `welcome` | `role` is cleared in the store; welcome screen shows the new `sign-in-only` footer. |

---

## Validation steps

1. Run `bun run typecheck` — the new variant string must satisfy the `AuthFooterVariant` union type in all call sites.
2. Run `bun run lint` — no new warnings.
3. Manual E2E flows to verify:
   - **New driver**: welcome → role-question (driver) → driver-signup → driver-identity → sign-in (no "Sign up" footer) → sign-up (no "Sign in" footer) → verify → driver dashboard.
   - **Returning driver**: welcome → "Sign in" → enters credentials → driver dashboard.
   - **Non-driver (owner)**: welcome → role-question (owner) → sign-in ("Sign up" footer visible) → can switch to sign-up → owner dashboard.
   - **Direct sign-in bookmark**: `/(auth)/sign-in` → "Sign up" footer visible.

---

## Open questions

None — the requirement is unambiguous and the existing `?from=driver-identity` param already provides the signal needed to make the footer context-aware.

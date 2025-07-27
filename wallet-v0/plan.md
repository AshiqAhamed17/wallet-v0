# Project Plan: Refactoring Local Safe Multi-Signature Wallet (wallet-v0)

## Objective

Refactor and simplify the existing wallet-v0/wallet codebase to build a minimal, 100% local, self-hostable Safe multi-signature wallet, as described in scope.md. The new version should be easy to maintain, fast, modern, and bug-free, with a clean and responsive UI/UX.

---

## 1. Codebase Audit & Cleanup

- [ ] Review all folders and files in `wallet-v0/wallet`.
- [ ] Remove legacy, unused, or overly complex features (e.g., Safe Apps, notifications, social login, analytics, recovery modules, etc.).
- [ ] Remove or archive the old `todo.md` and any grant-specific artifacts.
- [ ] Remove all Redux-related files in `src/store/` and their usages across the codebase.
- [ ] Remove web3-onboard integration and related code in `src/services/onboard.ts`, `src/hooks/wallets/`, and any wallet connection logic not using wagmi/@web3modal/react.

## 2. State Management Migration

- [ ] Replace Redux with Zustand or React context/hooks for all global state (safes, transactions, settings, etc.).
- [ ] Refactor state logic in `src/store/` into new Zustand stores or React context/hooks in a new `src/state/` or `src/hooks/` subfolder.
- [ ] Update all components and hooks to use the new state management approach.
- [ ] Remove redux-persist and avoid serializing large state objects in localStorage.
- [ ] Scope Zustand stores per Safe to minimize re-renders and state bloat.


## 3. Wallet Connection Refactor

- [ ] Integrate wagmi and @web3modal/react for MetaMask and WalletConnect support.
- [ ] Remove all web3-onboard and legacy wallet connection code.
- [ ] Create a new `SafeConnectButton` component for wallet connection.
- [ ] Ensure wallet connection logic is simple, robust, and only supports MetaMask and WalletConnect.

## 4. Project Structure Simplification

- [ ] Refactor the project structure to:
  - `/app` (Next.js pages, e.g., dashboard, import, settings)
  - `/components` (UI components, e.g., SafeConnectButton, TransactionFlowStepper, SignatureShareModal)
  - `/utils` (helpers: safeClient.ts, transaction.ts, shareUtils.ts, etc.)
  - `/lib` (wagmi config, chain definitions)
  - `/tests` (Jest tests)
- [ ] Move or remove files as needed to match this structure.

## 5. UI/UX Redesign

- [ ] Redesign the UI using MUI for a clean, modern, and responsive look (mobile and desktop).
- [ ] Remove unnecessary navigation, sidebars, and settings that are not required for the minimal wallet.
- [ ] Focus on a simple dashboard, Safe import/export, transaction creation/signing, and signature sharing/import.
- [ ] Add modals and steppers for transaction and signature flows.
- [ ] Update branding, icons, and static assets in `/public/images/` as needed.

## 6. Core Features Implementation

- [ ] Implement Safe import/export (JSON, multi-network, localStorage).
- [ ] Integrate Safe Protocol Kit for Safe deployment, transaction creation, and signing.
- [ ] Implement EIP-712 off-chain signing and partial signature collection using Safe Protocol Kit’s `signTransaction`.
- [ ] Enable shareable link (base64-encoded URL) or JSON file generation for signatures. Serialize `{safeTxHash, signatures, txData}` to base64 and append to `?data=` URL, or export as JSON Blob for download.
- [ ] Allow importing signatures and executing transactions once the threshold is met.
- [ ] Add network switching and Safe list management (multi-network support). Accept a JSON list `{chainId, safeAddress}`; validate each via `protocolKit.getOwners` on selected chain. Persist list in localStorage under `importedSafes` key; render per-chain dashboards.
- [ ] Implement a web3 provider bridge: inject a stripped `window.ethereum` proxy that forwards `eth_requestAccounts`, `eth_sendTransaction`, and `personal_sign` to the connected Safe via Protocol Kit.

## 7. Performance & Security Improvements

- [ ] Use React Query for data fetching, batching, and memoization of Safe data (owners, threshold, etc.). Set `staleTime=45s` for Safe info queries.
- [ ] Replace single-call RPC strategy with batching: use `JsonRpcBatchProvider` (ethers v6) or viem’s batch client for all RPC calls. This will reduce HTTP calls by 10x.
- [ ] Memoize expensive hooks (e.g., `useSafeBalances`, `useTxHistory`) to avoid recalculating on every render.
- [ ] Upgrade ethers from v5 to v6 and import only required sub-packages for bundle size reduction and better performance.
- [ ] Validate all signatures, sanitize user inputs, and ensure no private key storage.
- [ ] Provide HTTPS guidance for self-hosted deployments.

## 8. Testing & Quality Assurance

- [ ] Add Jest tests for all key flows (Safe import, transaction creation/signing, signature sharing/import, execution).
- [ ] Test on both mobile and desktop browsers.
- [ ] Fix all known bugs and handle edge cases gracefully (e.g., failed signs, invalid imports).

## 9. Documentation & Finalization

- [ ] Update `.env.example` with all required environment variables.
- [ ] Update `README.md` with new setup, usage, and deployment instructions.
- [ ] Update or add any other relevant documentation in `/docs`.
- [ ] Perform a final code and security review.

---

## Notes

- Reference the checklist in `scope.md` for progress tracking.
- Use the Safe SDK documentation (https://docs.safe.global/) for integration details.
- Keep the codebase as minimal and maintainable as possible—remove anything not required for the core flows.
- For performance, always prefer batching, memoization, and minimal state serialization.
- For UX, prioritize speed, clarity, and simplicity in every flow.

---

**This plan is designed to be actionable and unambiguous for a developer team. Each step should be checked off as completed. If you need further breakdowns or task assignments, create sub-tasks as needed.**

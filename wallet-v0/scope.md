# Project Scope: Local Safe Multi-Signature Wallet (wallet-v0)

## Overview

Build a minimal, 100% local, self-hostable Safe multi-signature wallet using Next.js, TypeScript, and the Safe Protocol Kit. The project draws inspiration from the "wallet" (EternalSafe) folder but is refactored for speed, maintainability, and modern best practices. No centralized backend or transaction service; all operations are local or via user-shared files/links.

## Key Requirements

- **100% Local Operation:**
  - All signing and data handling in-browser or via user-shared files/links.
  - No backend or external APIs for core flows.
- **Self-hostable:**
  - Works via `yarn start` locally or static deploy.
- **Wallet Connections:**
  - Integrate MetaMask and WalletConnect using wagmi and @web3modal/react.
  - Allow connecting to other websites as a Web3 provider for signing transactions/messages.
- **Signing Flow:**
  - User creates/signs a transaction/message.
  - Generate a shareable link (base64-encoded URL) or JSON file with partial signatures.
  - Friends upload/import to their instance to add signatures.
  - Execute once threshold met. Use off-chain EIP-712 signing.
- **Multi-network Safe Imports:**
  - Allow importing a JSON list of Safe addresses across networks (e.g., Ethereum Sepolia, Polygon Mumbai).
  - Store in localStorage.
  - Support network switching with wagmi.
- **UI/Performance:**
  - Use MUI for clean, responsive UI (dashboards, modals, steppers).
  - Optimize with React Query for data fetching, code-splitting, and lazy loading.
  - Target both mobile and desktop.
- **Security:**
  - Validate signatures, sanitize inputs, use HTTPS for hosted versions.
  - No private key storage.
- **Tech Stack:**
  - Next.js (app router)
  - TypeScript
  - @safe-global/protocol-kit (core SDK for Safe deployment/signing)
  - ethers.js
  - wagmi
  - @web3modal/react
  - MUI
  - React Query (for optimized fetching)
  - file-saver (for JSON exports)
  - Avoid Redux if possible for lightness; use Zustand if state is complex.
- **Differences from Safe{Wallet}:**
  - No centralized transaction service; everything local/shared manually.
- **Improvements over EternalSafe:**
  - Fix slowness (batch RPCs, memoize Safe data like owners/threshold).
  - Resolve bugs (e.g., handle failed signs gracefully).
  - Add multi-network import UI.

## Project Structure

- **Root:**
  - `package.json`, `tsconfig.json`, `.env.example` (with keys like NEXT_PUBLIC_WC_PROJECT_ID, NEXT_PUBLIC_RPC_URL for multiple chains)
- **/app:**
  - Next.js pages (e.g., `/app/page.tsx` for dashboard, `/app/import` for Safe imports)
- **/components:**
  - Reusable UI (e.g., `SafeConnectButton.tsx`, `TransactionFlowStepper.tsx`, `SignatureShareModal.tsx`)
- **/utils:**
  - Helpers (e.g., `safeClient.ts` for Protocol Kit init, `transaction.ts` for building/signing, `shareUtils.ts` for link/file generation)
- **/lib:**
  - Wagmi config, chain definitions
- **/tests:**
  - Jest tests for key flows

## Reference & Inspiration

- Reference the "wallet" folder's structure (e.g., their `services/` and `components/`) but simplify and modernize.
- Use the Safe SDK documentation (https://docs.safe.global/) extensively for Safe integrations, especially `@safe-global/protocol-kit`.

---

**Next Steps:**
Proceed step-by-step, starting with project initialization and setup.

---

## TODO Checklist

- [ ] 1. Remove Redux and migrate state management to Zustand or React context/hooks.
- [ ] 2. Remove web3-onboard and integrate wagmi + @web3modal/react for MetaMask and WalletConnect.
- [ ] 3. Refactor project structure for clarity: /app, /components, /utils, /lib, /tests.
- [ ] 4. Add and configure dependencies: Next.js, TypeScript, MUI, wagmi, @web3modal/react, ethers v6, @safe-global/protocol-kit, Zustand, React Query, file-saver.
- [ ] 5. Create .env.example with required keys (NEXT_PUBLIC_WC_PROJECT_ID, NEXT_PUBLIC_RPC_URL, etc.).
- [ ] 6. Set up MUI theme and responsive layout (mobile/desktop).
- [ ] 7. Implement wallet connection UI and logic (MetaMask, WalletConnect).
- [ ] 8. Scaffold dashboard page (/app/page.tsx).
- [ ] 9. Implement Safe import/export UI and logic (JSON, multi-network, localStorage).
- [ ] 10. Set up wagmi config and chain definitions in /lib.
- [ ] 11. Integrate Safe Protocol Kit: initialize safeClient.ts helper.
- [ ] 12. Build transaction creation/signing flow (EIP-712, off-chain, partial signatures).
- [ ] 13. Implement shareable link/JSON file generation for signatures.
- [ ] 14. Add UI for importing signatures and executing transactions.
- [ ] 15. Validate signatures and handle errors robustly.
- [ ] 16. Optimize RPC calls (batching, memoization, React Query).
- [ ] 17. Add modals/steppers for transaction and signature flows.
- [ ] 18. Implement network switching and Safe list management.
- [ ] 19. Add tests for key flows (Jest).
- [ ] 20. Polish UI, accessibility, and mobile experience.
- [ ] 21. Final security review (input sanitization, no private key storage, HTTPS guidance).
- [ ] 22. Update README and documentation.

---

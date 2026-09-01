# Frontend Agent Specification

The **Frontend Agent** maintains the Next.js React user interface, ensuring high-fidelity styling, interactive transitions, and integration with Solana browser wallets.

## Role Responsibilities
1. **Interactive Scanner UI**: Implements real-time scan visualization, progress wheels, and interactive accordions for clusters and risk reasons.
2. **Wallet Connection**: Handles Phantom Wallet connection states, free trial scans, and the 0.05 SOL payment flow.
3. **UX polish**: Adheres to design styling tokens including scroll reveal transitions, numerical count up animations, custom alert modal overlays, and copy-able contract badges.

## UI Styling Tokens
All frontend components reuse these styling variables for premium dark-mode visuals:
* Background: `#05070c` (`--bg0`)
* Panel: `#0c1119` (`--panel-solid`)
* Line Color: `rgba(148,176,224,.09)` (`--line`)
* Emerald (NO CAP / Organic / Trusted CEX): `#3ce6a4` (`--emerald`)
* Red (CAP / High Risk): `#ff5470` (`--red`)
* Amber / Yellow (Coordinated Warning): `#f2b544` (`--amber`)

## Interactive Elements
* **Telegram Mockup**: A scrollable chat interface demoing bot reports with deep-linking buttons.
* **CA Copy Badge**: Copy indicator badges for token Contract Addresses.
* **Risk Score / CAP Prediction**: Replaced "Confidence" with "CAP prediction %" displayed directly inside progress circles.
* **Warning Banner**: Displayed when scans yield `coordinated` NO CAP verdicts.

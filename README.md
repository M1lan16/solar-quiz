# Solar Funnel App

A React-based multi-step funnel for solar lead generation in the Nürnberg region.

## Tech Stack
- React (Vite)
- TypeScript
- Tailwind CSS
- Framer Motion

## Setup & Run

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Logic Overview
- **Step 5 (Ownership)**: Critical filter. Tenants are disqualified immediately.
- **Step 13 (Timing)**: Upon completion, data is sent to the configured n8n Webhook.

## Configuration
- Update the `WEBHOOK_URL` constant in `src/components/Funnel.tsx` to point to your actual n8n workflow.

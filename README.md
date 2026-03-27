# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```
PGWEB
├─ .hintrc
├─ backend
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ App.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  └─ router.jsx
│  ├─ assets
│  │  ├─ icons
│  │  │  ├─ basura.png
│  │  │  ├─ carrito-de-compras.png
│  │  │  └─ lista.png
│  │  └─ react.svg
│  ├─ cart
│  │  ├─ CartButton.jsx
│  │  └─ useCartStore.js
│  ├─ components
│  │  ├─ layout
│  │  │  ├─ Drawer.jsx
│  │  │  └─ Header.jsx
│  │  └─ UI
│  │     ├─ iOSModal.jsx
│  │     └─ Toast.jsx
│  ├─ constants
│  │  └─ medidas.js
│  ├─ delivery
│  │  ├─ Delivery.jsx
│  │  └─ useDeliveryStore.js
│  ├─ features
│  │  └─ auth
│  │     ├─ AuthContext.jsx
│  │     ├─ Login.jsx
│  │     └─ useAuth.js
│  ├─ hooks
│  │  ├─ useAudio.js
│  │  ├─ useHaptic.js
│  │  └─ useNotificationSound.js
│  ├─ index.css
│  ├─ main.jsx
│  ├─ orders
│  │  ├─ Confirmed.jsx
│  │  ├─ Tracking.jsx
│  │  └─ useOrderStore.js
│  ├─ pages
│  │  ├─ Home.jsx
│  │  └─ Payment.jsx
│  ├─ products
│  │  ├─ CanvasPreview.jsx
│  │  ├─ FacturaList.jsx
│  │  ├─ TabLienzos.jsx
│  │  └─ TabTodos.jsx
│  ├─ services
│  │  └─ apiClient.js
│  └─ styles
│     ├─ actions.css
│     ├─ animations.css
│     ├─ canvas-preview.css
│     ├─ cards.css
│     ├─ cart.css
│     ├─ confirmed.css
│     ├─ delivery.css
│     ├─ drawer.css
│     ├─ globals.css
│     ├─ header.css
│     ├─ layout.css
│     ├─ login.css
│     ├─ menu.css
│     ├─ payment.css
│     ├─ preview.css
│     ├─ tab-lienzos.css
│     ├─ tab-shared.css
│     ├─ tab-todos.css
│     ├─ tabs.css
│     └─ tracking.css
└─ vite.config.js

```
```
PGWEB
├─ .hintrc
├─ backend
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ App.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  └─ router.jsx
│  ├─ assets
│  │  ├─ icons
│  │  │  ├─ basura.png
│  │  │  ├─ carrito-de-compras.png
│  │  │  └─ lista.png
│  │  └─ react.svg
│  ├─ cart
│  │  ├─ CartButton.jsx
│  │  └─ useCartStore.js
│  ├─ components
│  │  ├─ layout
│  │  │  ├─ Drawer.jsx
│  │  │  └─ Header.jsx
│  │  └─ UI
│  │     ├─ iOSModal.jsx
│  │     └─ Toast.jsx
│  ├─ constants
│  │  └─ medidas.js
│  ├─ delivery
│  │  ├─ Delivery.jsx
│  │  └─ useDeliveryStore.js
│  ├─ features
│  │  └─ auth
│  │     ├─ AuthContext.jsx
│  │     ├─ Login.jsx
│  │     └─ useAuth.js
│  ├─ hooks
│  │  ├─ useAudio.js
│  │  ├─ useHaptic.js
│  │  └─ useNotificationSound.js
│  ├─ index.css
│  ├─ main.jsx
│  ├─ orders
│  │  ├─ Confirmed.jsx
│  │  ├─ Tracking.jsx
│  │  └─ useOrderStore.js
│  ├─ pages
│  │  ├─ Home.jsx
│  │  └─ Payment.jsx
│  ├─ products
│  │  ├─ CanvasPreview.jsx
│  │  ├─ FacturaList.jsx
│  │  ├─ TabLienzos.jsx
│  │  └─ TabTodos.jsx
│  ├─ services
│  │  └─ apiClient.js
│  └─ styles
│     ├─ actions.css
│     ├─ animations.css
│     ├─ canvas-preview.css
│     ├─ cards.css
│     ├─ cart.css
│     ├─ confirmed.css
│     ├─ delivery.css
│     ├─ drawer.css
│     ├─ globals.css
│     ├─ header.css
│     ├─ layout.css
│     ├─ login.css
│     ├─ menu.css
│     ├─ payment.css
│     ├─ preview.css
│     ├─ tab-lienzos.css
│     ├─ tab-shared.css
│     ├─ tab-todos.css
│     ├─ tabs.css
│     └─ tracking.css
└─ vite.config.js

```
```
PGWEB
├─ .hintrc
├─ backend
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ api
│  │  └─ supabase.js
│  ├─ app
│  │  ├─ App.jsx
│  │  ├─ ProtectedRoute.jsx
│  │  └─ router.jsx
│  ├─ assets
│  │  ├─ icons
│  │  │  ├─ basura.png
│  │  │  ├─ carrito-de-compras.png
│  │  │  └─ lista.png
│  │  └─ react.svg
│  ├─ cart
│  │  ├─ cart.css
│  │  ├─ CartButton.jsx
│  │  └─ useCartStore.js
│  ├─ components
│  │  ├─ layout
│  │  │  ├─ drawer.css
│  │  │  ├─ Drawer.jsx
│  │  │  ├─ header.css
│  │  │  ├─ Header.jsx
│  │  │  └─ menu.css
│  │  └─ UI
│  │     ├─ cards.css
│  │     ├─ iOSModal.jsx
│  │     └─ Toast.jsx
│  ├─ constants
│  │  └─ medidas.js
│  ├─ delivery
│  │  ├─ delivery.css
│  │  ├─ Delivery.jsx
│  │  └─ useDeliveryStore.js
│  ├─ features
│  │  └─ auth
│  │     ├─ AuthContext.jsx
│  │     ├─ login.css
│  │     ├─ Login.jsx
│  │     └─ useAuth.js
│  ├─ hooks
│  │  ├─ useAudio.js
│  │  ├─ useHaptic.js
│  │  └─ useNotificationSound.js
│  ├─ index.css
│  ├─ main.jsx
│  ├─ orders
│  │  ├─ confirmed.css
│  │  ├─ Confirmed.jsx
│  │  ├─ payment.css
│  │  ├─ tracking.css
│  │  ├─ Tracking.jsx
│  │  └─ useOrderStore.js
│  ├─ pages
│  │  ├─ Home.jsx
│  │  └─ Payment.jsx
│  ├─ products
│  │  ├─ canvas-preview.css
│  │  ├─ CanvasPreview.jsx
│  │  ├─ FacturaList.jsx
│  │  ├─ tab-lienzos.css
│  │  ├─ tab-todos.css
│  │  ├─ TabLienzos.jsx
│  │  ├─ tabs.css
│  │  └─ TabTodos.jsx
│  ├─ services
│  │  └─ apiClient.js
│  └─ styles
│     ├─ actions.css
│     ├─ animations.css
│     ├─ globals.css
│     ├─ layout.css
│     ├─ preview.css
│     └─ tab-shared.css
└─ vite.config.js

```
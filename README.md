# OnlyFarmers 🌾

OnlyFarmers is a purpose-built online platform that empowers farmers and agricultural buyers through transparent auctions and direct sales. Built with modern web technologies, it aims to revolutionize agricultural commerce by connecting farmers directly with buyers.

## 🌟 Features

- **Live Auctions**: Farmers can create and manage auctions for their produce, livestock, and equipment
- **Direct Sales**: Fixed-price listings for immediate purchase
- **User Profiles**: Verified profiles with ratings and reviews
- **Messaging System**: Direct communication between buyers and sellers
- **News Feed**: Agricultural news and market updates
- **Responsive Design**: Mobile-first approach for accessibility

## 🛠️ Technologies

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with modern features
- **Authentication**: Firebase
- **Real-time Updates**: Firebase Realtime Database
- **Deployment**: [Deployment platform details]

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Helix-1716/Onlyfarmers.git
   ```

2. Install dependencies:
   ```bash
   cd Onlyfarmers
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Firebase configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Project Structure

- `/src` - Source code
  - `/components` - Reusable React components
  - `/context` - React context providers
  - `/services` - Firebase and other service integrations
  - `/assets` - Images and static files

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# Onlyfarmers
It is  website for Farmers and auction purposes
>>>>>>> 6e058adf402edaa0172ccd267162890256aacabf

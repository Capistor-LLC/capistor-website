# Capistor Website

A modern web application built with Vite, React, and Tailwind CSS.

## Tech Stack

- **Vite** - Build tool and development server
- **React 18** - UI library with TypeScript support
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety and better developer experience
- **ESLint** - Code linting and formatting

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd capistor-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
capistor-website/
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind imports
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── eslint.config.js     # ESLint configuration
```

## Deployment

This project is configured to work with Vercel out of the box. Simply connect your repository to Vercel and it will automatically deploy your application.

The build command (`npm run build`) creates optimized production files in the `dist` directory.

## Tailwind CSS

Tailwind CSS is pre-configured and ready to use. You can start using Tailwind utility classes immediately in your components.

Custom configurations can be added to `tailwind.config.js`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Build the project: `npm run build`
6. Submit a pull request.

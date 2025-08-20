import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
  { ignores: ['dist', 'node_modules', 'build'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      
      // Disable prop-types since we're using TypeScript
      'react/prop-types': 'off',
      
      // Allow unused variables in development
      'no-unused-vars': 'warn',
      
      // Allow console statements in development
      'no-console': 'off',
      
      // Allow unused React imports for JSX
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      
      // Allow unknown properties for CSS classes
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      
      // Allow unescaped entities in JSX
      'react/no-unescaped-entities': 'off',
      
      // Allow target blank
      'react/jsx-no-target-blank': 'off',
      
      // React refresh warnings
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Allow global variables in config files
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      
      // Disable prop-types since we're using TypeScript
      'react/prop-types': 'off',
      
      // Allow unused variables in development
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'off',
      
      // Allow console statements in development
      'no-console': 'off',
      
      // Allow any types in development
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      
      // Allow unused React imports for JSX
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      
      // Allow unknown properties for CSS classes
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      
      // Allow unescaped entities in JSX
      'react/no-unescaped-entities': 'off',
      
      // Allow target blank
      'react/jsx-no-target-blank': 'off',
      
      // React refresh warnings
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Allow global variables in config files
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.config.js', '**/*.config.ts', 'vite.config.js', 'tailwind.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
  {
    files: ['tests/**/*.js', 'tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
]

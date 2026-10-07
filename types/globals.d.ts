/**
 * Ambient-типы для IDE (убирают красные подчёркивания).
 */

// CSS — в Plasmo объявлен только *.module.css
declare module "*.css"

// Jest-DOM: expect(...).toBeInTheDocument / toBeDisabled / toHaveTextContent
/// <reference types="@testing-library/jest-dom/vitest" />

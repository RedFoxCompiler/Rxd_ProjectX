/**
 * @fileoverview Centralized color settings for the Slide Generator interface.
 * This file exports Tailwind CSS class strings to be used in slide-generator related components,
 * allowing for easy and consistent styling adjustments from a single location for its dark theme.
 */

export const colorSettings = {
  // Page container
  pageBackground: 'bg-black text-white',
  
  // Header
  headerBorder: 'border-zinc-800',
  headerIcon: 'text-primary',
  headerTitle: 'text-lg font-semibold',
  downloadButton: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg transition-transform transform hover:scale-105',

  // Chat View
  chat: {
    placeholderText: 'text-zinc-500',
    loadingText: 'text-zinc-400',
    userBubble: 'bg-zinc-700 rounded-br-none',
    aiBubble: 'bg-zinc-800 rounded-bl-none',
    avatarFallback: 'bg-zinc-800',
    userAvatarFallback: 'bg-zinc-700',
  },

  // Input Footer
  input: {
    background: 'bg-zinc-900',
    placeholder: 'placeholder:text-zinc-500',
    sendButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
  }
};

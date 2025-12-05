/**
 * @fileoverview Centralized color settings for the Chat interface.
 * This file exports Tailwind CSS class strings to be used in chat-related components,
 * allowing for easy and consistent styling adjustments from a single location.
 */

export const colorSettings = {
  // Page specific styles
  pageBackground: 'bg-black',
  
  // Header specific styles
  headerText: 'text-zinc-400',
  headerIconBorder: 'border-zinc-800/80',
  headerIconBackground: 'bg-zinc-900/80',

  // Message bubble specific styles
  userBubbleBackground: 'bg-zinc-800 shadow-md',
  userBubbleText: 'text-zinc-100',
  aiText: 'text-zinc-200',
  typingIndicator: 'bg-zinc-500',

  // Input area specific styles
  inputBackground: 'bg-zinc-900/80', // Neutral glassmorphism background
  inputPlaceholder: 'placeholder:text-zinc-500',
  inputText: 'text-zinc-100',
  inputButton: 'text-zinc-400 hover:text-destructive',
};

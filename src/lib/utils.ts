import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidDiscordWebhookUrl(url: string): boolean {
  if (!url) return false
  return url.startsWith('https://discord.com/api/webhooks/')
}

export function isValidEmail(email: string): boolean {
  if (!email) return false
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailPattern.test(email)
}

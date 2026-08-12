export const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"
}

export const getStoreName = () => {
  return process.env.NEXT_PUBLIC_STORE_NAME?.trim() || "Goyezi"
}

/**
 * WhatsApp number in international format, digits only (e.g. "2348025033600").
 * Returns "" when unset so callers can hide the enquiry route entirely rather
 * than render a dead link.
 */
export const getWhatsAppNumber = (): string => {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || ""
  // wa.me only accepts digits — strip "+", spaces and separators.
  return raw.replace(/\D/g, "")
}

/**
 * Builds a wa.me deep link with a prefilled message.
 * Returns null when no number is configured.
 */
export const buildWhatsAppLink = (message: string): string | null => {
  const number = getWhatsAppNumber()

  if (!number) {
    return null
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

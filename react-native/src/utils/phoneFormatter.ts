/**
 * Formats a phone number with E.164-like formatting
 * Defaults to USA formatting if no country code is provided
 * No strict enforcement - allows any format
 */
export function formatPhoneNumber(input: string): string {
  // Remove all non-numeric characters except +
  const cleaned = input.replace(/[^\d+]/g, '');

  // If empty, return empty
  if (!cleaned) return '';

  // If starts with +, it's international format - just return as is with formatting
  if (cleaned.startsWith('+')) {
    return formatInternational(cleaned);
  }

  // Default to USA formatting (1 + 10 digits)
  return formatUSA(cleaned);
}

function formatInternational(input: string): string {
  // Keep the + and all digits
  const digits = input.substring(1); // Remove +

  if (digits.length === 0) return '+';
  if (digits.length <= 3) return `+${digits}`;
  if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // Full international format
  return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)} ${digits.slice(10)}`;
}

function formatUSA(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // If more than 10 digits, assume it has country code
  return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Gets the raw phone number (removes formatting)
 */
export function getRawPhoneNumber(formatted: string): string {
  return formatted.replace(/[^\d+]/g, '');
}

/**
 * Converts to E.164 format for dialing
 * Adds +1 for USA numbers if no country code
 */
export function toE164(input: string): string {
  const raw = getRawPhoneNumber(input);

  if (!raw) return '';
  if (raw.startsWith('+')) return raw;

  // Default to USA country code
  if (raw.length === 10) {
    return `+1${raw}`;
  }

  if (raw.length === 11 && raw.startsWith('1')) {
    return `+${raw}`;
  }

  // Return as-is if it doesn't match expected format
  return raw.startsWith('+') ? raw : `+${raw}`;
}

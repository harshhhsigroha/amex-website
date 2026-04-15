// Shared input sanitization utilities for edge functions

/**
 * Sanitize a string: trim, strip HTML tags, remove dangerous chars, enforce max length.
 */
export function sanitizeString(value: unknown, maxLength: number = 500): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/<[^>]*>/g, "")       // strip HTML tags
    .replace(/[<>"'`;\\]/g, "")    // remove dangerous chars
    .replace(/javascript:/gi, "")  // remove JS protocol
    .replace(/data:/gi, "")        // remove data URIs
    .replace(/on\w+\s*=/gi, "")    // remove inline event handlers
    .substring(0, maxLength);
}

/**
 * Validate and sanitize an email address.
 * Returns sanitized email or null if invalid.
 */
export function sanitizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase().substring(0, 255);
  // RFC 5322 simplified
  const emailRegex = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  if (!emailRegex.test(email)) return null;
  return email;
}

/**
 * Sanitize boolean input.
 */
export function sanitizeBool(value: unknown): boolean {
  return value === true || value === "true";
}

/**
 * Validate UK National Insurance number.
 */
export function isValidNI(ni: string): boolean {
  if (!ni) return true; // optional
  return /^[A-Z]{2}\d{6}[A-D]$/i.test(ni.replace(/\s/g, ""));
}

/**
 * Validate a UUID string.
 */
export function isValidUUID(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Escape HTML entities for safe embedding in HTML email templates.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validate password strength.
 */
export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (typeof password !== "string") return { valid: false, error: "Password is required" };
  if (password.length < 8) return { valid: false, error: "Password must be at least 8 characters" };
  if (password.length > 128) return { valid: false, error: "Password must be less than 128 characters" };
  if (!/[A-Z]/.test(password)) return { valid: false, error: "Password must contain an uppercase letter" };
  if (!/[a-z]/.test(password)) return { valid: false, error: "Password must contain a lowercase letter" };
  if (!/[0-9]/.test(password)) return { valid: false, error: "Password must contain a number" };
  return { valid: true };
}

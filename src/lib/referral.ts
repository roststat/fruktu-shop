const STORAGE_KEY = "referral-code";

export function captureReferralCode() {
  if (typeof window === "undefined") return;
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, ref);
  }
}

export function getReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

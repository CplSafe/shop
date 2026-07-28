"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag } from "./cookies"

export type WholesaleApplication = {
  id: string
  status: "pending" | "approved" | "rejected"
  company_name: string
  contact_name: string | null
  phone: string | null
  expected_volume: string | null
  note: string | null
  created_at: string
}

export type WholesaleStatus = {
  application: WholesaleApplication | null
  is_wholesale: boolean
}

/**
 * Fetches the current customer's wholesale application + approval status.
 * Per-customer, approval-sensitive data — never cached, so a staff decision
 * (approve / reject) is reflected on the customer's next page load.
 * Returns null application / false when unauthenticated or none exists.
 */
export const getWholesaleStatus = async (): Promise<WholesaleStatus> => {
  const headers = { ...(await getAuthHeaders()) }

  return sdk.client
    .fetch<WholesaleStatus>(`/store/wholesale-applications/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .catch(() => ({ application: null, is_wholesale: false }))
}

/**
 * Form action: submits (or updates) the customer's wholesale application.
 */
export const submitWholesaleApplication = async (
  _prev: unknown,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const headers = { ...(await getAuthHeaders()) }

  const companyName = (formData.get("company_name") as string)?.trim()
  if (!companyName) {
    return { success: false, error: "Company name is required." }
  }

  const body = {
    company_name: companyName,
    contact_name: (formData.get("contact_name") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    expected_volume: (formData.get("expected_volume") as string) || undefined,
    note: (formData.get("note") as string) || undefined,
  }

  return sdk.client
    .fetch(`/store/wholesale-applications`, {
      method: "POST",
      body,
      headers,
    })
    .then(async () => {
      const tag = await getCacheTag("wholesale")
      if (tag) revalidateTag(tag)
      return { success: true, error: null }
    })
    .catch((err: unknown) => ({
      success: false,
      error: err instanceof Error ? err.message : "Submission failed.",
    }))
}

import crypto from "crypto";
import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
} from "@medusajs/framework/utils";
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types";

/**
 * Interswitch payment provider for Medusa v2 (WebPAY / Quickteller flow).
 *
 * Interswitch uses a redirect + requery flow:
 *   1. initiatePayment  -> generate a unique transaction reference, store it +
 *      the WebPAY redirect params in the session data.
 *   2. Storefront posts/redirects the customer to the Interswitch payment page.
 *   3. On return, we call the Transaction Query (requery) API to confirm.
 *   4. authorizePayment / getPaymentStatus -> map the requery ResponseCode
 *      ("00" = successful) to a Medusa payment status.
 *
 * Auth: Interswitch APIs use OAuth2 client credentials (client_id/secret) for
 * bearer tokens, plus a hash on WebPAY params. Configure the merchant code and
 * pay item id from your Interswitch merchant profile.
 *
 * NOTE: HTTP calls are stubbed with TODOs pending real sandbox credentials.
 * The class satisfies the AbstractPaymentProvider contract so it registers and
 * appears at checkout.
 */

type InterswitchOptions = {
  clientId: string;
  clientSecret: string;
  merchantCode: string;
  payItemId: string;
  /** sandbox base url by default; swap to production when going live */
  baseUrl?: string;
  /** absolute URL Interswitch redirects the customer back to */
  redirectUrl?: string;
  debug?: boolean;
};

type InterswitchSessionData = {
  txnRef: string;
  merchantCode: string;
  payItemId: string;
  amountMinor: number;
  currencyCode: string;
  paymentUrl?: string;
};

type InjectedDependencies = {
  logger: Logger;
};

const SANDBOX_BASE_URL = "https://sandbox.interswitchng.com";

// ISO-4217 numeric currency codes Interswitch expects on WebPAY params.
const ISO_NUMERIC_CURRENCY: Record<string, string> = {
  ngn: "566",
  ghs: "936",
  kes: "404",
  usd: "840",
  xof: "952",
  tzs: "834",
  ugx: "800",
};

class InterswitchPaymentProviderService extends AbstractPaymentProvider<InterswitchOptions> {
  static identifier = "interswitch";

  protected readonly options_: InterswitchOptions;
  protected readonly logger_: Logger;
  protected readonly baseUrl_: string;

  constructor(container: InjectedDependencies, options: InterswitchOptions) {
    super(container, options);
    this.options_ = options;
    this.logger_ = container.logger;
    this.baseUrl_ = options.baseUrl || SANDBOX_BASE_URL;
  }

  static validateOptions(options: Record<string, unknown>): void {
    const required = ["clientId", "clientSecret", "merchantCode", "payItemId"];
    for (const key of required) {
      if (!options[key]) {
        throw new Error(
          `Interswitch payment provider: missing required option "${key}"`
        );
      }
    }
  }

  protected debug_(...args: unknown[]): void {
    if (this.options_.debug) {
      this.logger_.info(`[Interswitch] ${args.map(String).join(" ")}`);
    }
  }

  /** WebPAY SHA-512 hash of concatenated params + secret. */
  protected hashWebPayParams_(concatenated: string): string {
    return crypto
      .createHash("sha512")
      .update(concatenated + this.options_.clientSecret)
      .digest("hex");
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code } = input;
    const txnRef = `isw_${crypto.randomUUID()}`;
    const currencyCode = ISO_NUMERIC_CURRENCY[currency_code.toLowerCase()] ?? "566";
    // Interswitch expects the amount in minor units (kobo/cents).
    const amountMinor = Math.round(Number(amount) * 100);

    this.debug_("initiatePayment", txnRef, amountMinor, currency_code);

    const sessionData: InterswitchSessionData = {
      txnRef,
      merchantCode: this.options_.merchantCode,
      payItemId: this.options_.payItemId,
      amountMinor,
      currencyCode,
      // paymentUrl is composed on the storefront from these WebPAY params,
      // or created via the Interswitch Payment Initialization API.
      paymentUrl: undefined,
    };

    return {
      id: txnRef,
      data: sessionData as unknown as Record<string, unknown>,
    };
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const status = await this.getPaymentStatus(input);
    return { status: status.status, data: input.data };
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const data = input.data as unknown as InterswitchSessionData;
    this.debug_("getPaymentStatus", data?.txnRef);

    // TODO: GET `${this.baseUrl_}/collections/api/v1/gettransaction.json`
    //   ?merchantcode=...&transactionreference=...&amount=...
    //   with an OAuth2 bearer token; ResponseCode "00" -> captured.
    return { status: PaymentSessionStatus.PENDING, data: input.data };
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return { data: input.data };
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    // TODO: call Interswitch refund API with input.amount.
    this.debug_("refundPayment", input.amount);
    return { data: input.data };
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return { data: input.data };
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: input.data };
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data };
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    return { data: input.data };
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    // TODO: verify Interswitch notification signature, then map to an action.
    this.debug_("webhook received", JSON.stringify(payload?.data ?? {}));
    return { action: "not_supported" };
  }
}

export default InterswitchPaymentProviderService;

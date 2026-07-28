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
 * OPay payment provider for Medusa v2.
 *
 * OPay uses a redirect + callback flow:
 *   1. initiatePayment  -> create a cashier/checkout transaction, store the
 *      reference + hosted checkout URL in the session data.
 *   2. Storefront redirects the customer to `opayCheckoutUrl`.
 *   3. OPay redirects back and/or fires a webhook -> we verify status.
 *   4. authorizePayment / getPaymentStatus -> query OPay's status API.
 *
 * Auth: requests are signed with HMAC SHA-512 using the merchant private key,
 * with `MerchantId` in the headers. Success responses carry status code "00".
 *
 * Docs: https://documentation.opaycheckout.com/
 *
 * NOTE: The HTTP calls are stubbed with TODOs pending real sandbox credentials.
 * The class already satisfies the AbstractPaymentProvider contract so it
 * registers and appears at checkout.
 */

type OPayOptions = {
  merchantId: string;
  publicKey: string;
  privateKey: string;
  /** sandbox base url by default; swap to production when going live */
  baseUrl?: string;
  /** absolute URL OPay redirects the customer back to after payment */
  callbackUrl?: string;
  debug?: boolean;
};

type OPaySessionData = {
  opayReference: string;
  opayCheckoutUrl?: string;
  opayOrderNo?: string;
};

type InjectedDependencies = {
  logger: Logger;
};

const SANDBOX_BASE_URL = "https://sandboxapi.opaycheckout.com";

class OPayPaymentProviderService extends AbstractPaymentProvider<OPayOptions> {
  static identifier = "opay";

  protected readonly options_: OPayOptions;
  protected readonly logger_: Logger;
  protected readonly baseUrl_: string;

  constructor(container: InjectedDependencies, options: OPayOptions) {
    super(container, options);
    this.options_ = options;
    this.logger_ = container.logger;
    this.baseUrl_ = options.baseUrl || SANDBOX_BASE_URL;
  }

  static validateOptions(options: Record<string, unknown>): void {
    const required = ["merchantId", "publicKey", "privateKey"];
    for (const key of required) {
      if (!options[key]) {
        throw new Error(`OPay payment provider: missing required option "${key}"`);
      }
    }
  }

  /** HMAC SHA-512 signature over the raw request body using the private key. */
  protected sign_(payload: string): string {
    return crypto
      .createHmac("sha512", this.options_.privateKey)
      .update(payload)
      .digest("hex");
  }

  protected debug_(...args: unknown[]): void {
    if (this.options_.debug) {
      this.logger_.info(`[OPay] ${args.map(String).join(" ")}`);
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code } = input;
    const reference = `opay_${crypto.randomUUID()}`;

    this.debug_("initiatePayment", reference, amount, currency_code);

    // TODO: POST `${this.baseUrl_}/api/v1/international/payment/create`
    //   headers: { Signature: this.sign_(body), MerchantId: this.options_.merchantId }
    //   body: { reference, amount: { total, currency }, callbackUrl, ... }
    // Parse response (status "00") -> cashierUrl / orderNo.
    const sessionData: OPaySessionData = {
      opayReference: reference,
      opayCheckoutUrl: undefined, // filled from OPay create response
      opayOrderNo: undefined,
    };

    return { id: reference, data: sessionData as unknown as Record<string, unknown> };
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    // TODO: query OPay status API; map "SUCCESS" -> AUTHORIZED/CAPTURED.
    const status = await this.getPaymentStatus(input);
    return { status: status.status, data: input.data };
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const data = input.data as unknown as OPaySessionData;
    this.debug_("getPaymentStatus", data?.opayReference);

    // TODO: POST `${this.baseUrl_}/api/v1/international/payment/status`
    //   -> map OPay statuses: SUCCESS -> captured, PENDING/INITIAL -> pending,
    //      FAILED/CLOSED -> error.
    // Until wired, report pending so the flow does not falsely complete.
    return { status: PaymentSessionStatus.PENDING, data: input.data };
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    // OPay captures on success; nothing extra to do server-side.
    return { data: input.data };
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    // TODO: call OPay refund API with input.amount.
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
    // TODO: fetch the latest transaction snapshot from OPay.
    return { data: input.data };
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    // Amount can change when the cart changes; re-init on the next step.
    return { data: input.data };
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    // TODO: verify the webhook Signature header against this.sign_(rawData),
    // then map the event to an action. Returning not_supported keeps the
    // pipeline safe until verification is implemented.
    this.debug_("webhook received", JSON.stringify(payload?.data ?? {}));
    return { action: "not_supported" };
  }
}

export default OPayPaymentProviderService;

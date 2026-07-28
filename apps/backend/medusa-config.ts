import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

// Redis is opt-in via USE_REDIS=true. Local dev defaults to the in-memory
// cache/event-bus (fast boot). Production sets USE_REDIS=true against a
// dedicated Redis instance. See .env for REDIS_URL.
const REDIS_URL = process.env.REDIS_URL;
const USE_REDIS = process.env.USE_REDIS === "true" && !!REDIS_URL;

// Payment providers are gated on their credentials so a missing key never
// crashes boot. Fill the keys in .env to activate each provider.
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const OPAY_MERCHANT_ID = process.env.OPAY_MERCHANT_ID;
const OPAY_PUBLIC_KEY = process.env.OPAY_PUBLIC_KEY;
const OPAY_PRIVATE_KEY = process.env.OPAY_PRIVATE_KEY;
const HAS_OPAY = !!(OPAY_MERCHANT_ID && OPAY_PUBLIC_KEY && OPAY_PRIVATE_KEY);

const ISW_CLIENT_ID = process.env.INTERSWITCH_CLIENT_ID;
const ISW_CLIENT_SECRET = process.env.INTERSWITCH_CLIENT_SECRET;
const ISW_MERCHANT_CODE = process.env.INTERSWITCH_MERCHANT_CODE;
const ISW_PAY_ITEM_ID = process.env.INTERSWITCH_PAY_ITEM_ID;
const HAS_INTERSWITCH = !!(
  ISW_CLIENT_ID &&
  ISW_CLIENT_SECRET &&
  ISW_MERCHANT_CODE &&
  ISW_PAY_ITEM_ID
);

const paymentProviders = [
  ...(PAYSTACK_SECRET_KEY
    ? [
        {
          resolve: "medusa-payment-paystack",
          id: "paystack",
          options: {
            secret_key: PAYSTACK_SECRET_KEY,
          },
        },
      ]
    : []),
  ...(HAS_OPAY
    ? [
        {
          resolve: "./src/modules/payment-opay",
          id: "opay",
          options: {
            merchantId: OPAY_MERCHANT_ID,
            publicKey: OPAY_PUBLIC_KEY,
            privateKey: OPAY_PRIVATE_KEY,
            baseUrl: process.env.OPAY_BASE_URL,
            callbackUrl: process.env.OPAY_CALLBACK_URL,
            debug: process.env.NODE_ENV !== "production",
          },
        },
      ]
    : []),
  ...(HAS_INTERSWITCH
    ? [
        {
          resolve: "./src/modules/payment-interswitch",
          id: "interswitch",
          options: {
            clientId: ISW_CLIENT_ID,
            clientSecret: ISW_CLIENT_SECRET,
            merchantCode: ISW_MERCHANT_CODE,
            payItemId: ISW_PAY_ITEM_ID,
            baseUrl: process.env.INTERSWITCH_BASE_URL,
            redirectUrl: process.env.INTERSWITCH_REDIRECT_URL,
            debug: process.env.NODE_ENV !== "production",
          },
        },
      ]
    : []),
];

module.exports = defineConfig({
  admin: {
    // Allow large product media uploads (default is 1MB).
    maxUploadFileSize: 20 * 1024 * 1024, // 20MB
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    ...(USE_REDIS ? { redisUrl: REDIS_URL } : {}),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    ...(USE_REDIS
      ? [
          {
            resolve: "@medusajs/medusa/cache-redis",
            options: { redisUrl: REDIS_URL },
          },
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: { redisUrl: REDIS_URL },
          },
        ]
      : []),
    ...(paymentProviders.length > 0
      ? [
          {
            resolve: "@medusajs/medusa/payment",
            options: {
              providers: paymentProviders,
            },
          },
        ]
      : []),
    // Wholesale application module (B2B approval workflow).
    {
      resolve: "./src/modules/wholesale",
    },
  ],
});

import { z } from "zod";

export const NETWORKS = [
  "Ethereum",
  "Bitcoin",
  "Solana",
  "Tron",
  "BNB Smart Chain",
  "Polygon",
  "Avalanche",
  "Arbitrum",
  "Optimism",
  "Base",
] as const;

export const CRYPTO_TYPES = [
  "USDT",
  "USDC",
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "TRX",
  "MATIC",
  "AVAX",
] as const;

export const sendEmailSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(
      /^\d+(\.\d{1,8})?$/,
      "Amount must be a valid number (up to 8 decimal places)"
    ),
  cryptoType: z.enum(CRYPTO_TYPES, {
    errorMap: () => ({ message: "Invalid crypto type" }),
  }),
  network: z.enum(NETWORKS, {
    errorMap: () => ({ message: "Invalid network" }),
  }),
  receiverEmail: z
    .string()
    .min(1, "Receiver email is required")
    .email("Invalid email address")
    .max(254),
  referenceId: z
    .string()
    .min(1, "Reference ID is required")
    .max(64, "Reference ID must be 64 characters or less")
    .trim(),
  message: z
    .string()
    .max(500, "Message must be 500 characters or less")
    .optional()
    .default(""),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

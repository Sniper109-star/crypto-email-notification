import { z } from 'zod';

export const emailSchema = z.object({
  name: z.string().min(2).max(255),
  amount: z.string().min(1).max(50),
  cryptoType: z.enum(['BTC', 'ETH', 'USDT', 'SOL']),
  network: z.enum(['Bitcoin', 'Ethereum', 'Solana', 'Polygon']),
  receiverEmail: z.string().email(),
  referenceId: z.string().min(3).max(200),
  message: z.string().max(1000).optional().default(''),
});

export type EmailInput = z.infer<typeof emailSchema>;

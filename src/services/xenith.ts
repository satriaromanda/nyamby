import crypto, { timingSafeEqual } from 'crypto';

// ── Environment Validation ──────────────────────────────────────────────────
function getEnvOrThrow(name: string): string {
    const val = process.env[name];
    if (!val) throw new Error(`Environment variable ${name} is required`);
    return val;
}

const API_BASE_URL = process.env.XENITH_API_URL || 'https://openapi.sandbox.xenithpay.com';
const API_KEY = getEnvOrThrow('XENITH_API_KEY');
const SECRET_KEY = getEnvOrThrow('XENITH_SECRET_KEY');
const WEBHOOK_SECRET = process.env.XENITH_WEBHOOK_SECRET || SECRET_KEY;

// ── Signature Utilities ─────────────────────────────────────────────────────

export function generateSignature(payloadStr: string, method: string, uri: string, timestamp: string): string {
    const signaturePayload = `${method}\n${uri}\n${timestamp}\n${payloadStr}`;
    return crypto
        .createHmac('sha256', SECRET_KEY)
        .update(signaturePayload)
        .digest('base64');
}

export function verifyWebhookSignature(payloadStr: string, signature: string): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payloadStr)
        .digest('base64');

    try {
        return timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(signature)
        );
    } catch {
        // Buffer lengths differ → signatures don't match
        return false;
    }
}

export function isWebhookTimestampValid(timestampStr: string): boolean {
    const timestamp = new Date(timestampStr).getTime();
    const now = Date.now();
    const diffInMinutes = Math.abs(now - timestamp) / (1000 * 60);
    return diffInMinutes <= 5;
}

// ── Pay In ──────────────────────────────────────────────────────────────────

export async function createPayIn(data: {
    initiatedAmount: number;
    currency?: string;
    paymentMethod: string;
    customerReference: string;
    customerName: string;
    description: string;
    callbackUrl: string;
}) {
    const uri = '/v1/payins';
    const method = 'POST';
    const timestamp = new Date().toISOString();

    if (!data.currency) data.currency = "IDR";

    const payloadStr = JSON.stringify(data);
    const signature = generateSignature(payloadStr, method, uri, timestamp);

    const response = await fetch(`${API_BASE_URL}${uri}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Xenith-Api-Key': API_KEY,
            'Xenith-Request-Timestamp': timestamp,
            'Xenith-Request-Signature': signature
        },
        body: payloadStr
    });

    const result = await response.json();
    if (!response.ok) {
        console.error("[Xenith] Create Pay In Error:", result);
        throw new Error(`Xenith Pay In Error: ${response.statusText}`);
    }
    return result;
}

// ── Pay Out ─────────────────────────────────────────────────────────────────

export async function createPayOut(data: {
    initiatedAmount: number;
    currency?: string;
    destinationPayoutMethod: string;
    destinationPayoutChannel: string;
    destinationPayoutAccount: string;
    destinationPayoutAccountName: string;
    referenceCode: string;
    customerReference: string;
    description: string;
    callbackUrl: string;
}, idempotencyKey: string) {
    const uri = '/v1/payouts';
    const method = 'POST';
    const timestamp = new Date().toISOString();

    if (!data.currency) data.currency = "IDR";

    const payloadStr = JSON.stringify(data);
    const signature = generateSignature(payloadStr, method, uri, timestamp);

    const response = await fetch(`${API_BASE_URL}${uri}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Xenith-Api-Key': API_KEY,
            'Xenith-Request-Timestamp': timestamp,
            'Xenith-Request-Signature': signature,
            'X-Idempotency-Key': idempotencyKey
        },
        body: payloadStr
    });

    const result = await response.json();
    if (!response.ok) {
        console.error("[Xenith] Create Pay Out Error:", result);
        throw new Error(`Xenith Pay Out Error: ${response.statusText}`);
    }
    return result;
}

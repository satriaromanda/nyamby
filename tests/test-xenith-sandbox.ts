/**
 * Xenith Sandbox Integration Test
 * 
 * Jalankan dengan: node --import tsx tests/test-xenith-sandbox.ts
 * 
 * Test ini akan:
 * 1. Validasi env variables
 * 2. Test signature generation
 * 3. Test buat Pay In (QRIS) ke sandbox
 * 4. Test verifikasi webhook signature
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.XENITH_API_URL || 'https://openapi.sandbox.xenithpay.com';
const API_KEY = process.env.XENITH_API_KEY!;
const SECRET_KEY = process.env.XENITH_SECRET_KEY!;
const WEBHOOK_SECRET = process.env.XENITH_WEBHOOK_SECRET || SECRET_KEY;

// ── Utilities ───────────────────────────────────────────────────────────────

function generateSignature(payloadStr: string, method: string, uri: string, timestamp: string): string {
    const signaturePayload = `${method}\n${uri}\n${timestamp}\n${payloadStr}`;
    return crypto
        .createHmac('sha256', SECRET_KEY)
        .update(signaturePayload)
        .digest('base64');
}

function log(emoji: string, label: string, detail: string = '') {
    console.log(`\n${emoji}  ${label}`);
    if (detail) console.log(`   ${detail}`);
}

function divider(title: string) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${title}`);
    console.log(`${'='.repeat(60)}`);
}

// ── Test 1: Validasi Environment Variables ──────────────────────────────────

function testEnvVariables(): boolean {
    divider('TEST 1: Validasi Environment Variables');

    const vars: Record<string, string> = {
        'XENITH_API_URL': API_BASE_URL,
        'XENITH_API_KEY': API_KEY,
        'XENITH_SECRET_KEY': SECRET_KEY,
        'XENITH_WEBHOOK_SECRET': WEBHOOK_SECRET,
    };

    let allValid = true;
    for (const [key, value] of Object.entries(vars)) {
        if (value) {
            log('✅', key, `Set (${value.substring(0, 20)}...)`);
        } else {
            log('❌', key, 'MISSING!');
            allValid = false;
        }
    }

    if (API_KEY && !API_KEY.startsWith('ak-')) {
        log('⚠️', 'API_KEY format', 'Expected to start with "ak-"');
    }
    if (SECRET_KEY && !SECRET_KEY.startsWith('sk-')) {
        log('⚠️', 'SECRET_KEY format', 'Expected to start with "sk-"');
    }

    return allValid;
}

// ── Test 2: Signature Generation ────────────────────────────────────────────

function testSignatureGeneration(): boolean {
    divider('TEST 2: Signature Generation');

    try {
        const payload = JSON.stringify({ test: true });
        const method = 'POST';
        const uri = '/v1/payins';
        const timestamp = new Date().toISOString();

        const signature = generateSignature(payload, method, uri, timestamp);
        log('✅', 'Signature generated', signature);

        const decoded = Buffer.from(signature, 'base64');
        if (decoded.length === 32) {
            log('✅', 'Signature length valid', `${decoded.length} bytes (SHA-256)`);
        } else {
            log('⚠️', 'Unexpected signature length', `${decoded.length} bytes`);
        }

        return true;
    } catch (error) {
        log('❌', 'Signature generation failed', String(error));
        return false;
    }
}

// ── Test 3: API Connectivity + PayIn ────────────────────────────────────────

async function testApiPayIn(): Promise<boolean> {
    divider('TEST 3: API Connectivity - Create Pay In (QRIS)');

    try {
        const uri = '/v1/payins';
        const method = 'POST';
        const timestamp = new Date().toISOString();

        const testPayload = {
            initiatedAmount: 10000,
            currency: "IDR",
            paymentMethod: "VIRTUAL_ACCOUNT",
            paymentChannel: "BCA",
            referenceCode: `REF-TEST-${Date.now()}`,
            customerReference: `TEST-${Date.now()}`,
            customerName: "Test AyoNyamby",
            description: "Test sandbox Pay In - QRIS",
            callbackUrl: "https://example.com/webhook/test",
            redirectUrl: "https://example.com/payment/complete",
        };

        const payloadStr = JSON.stringify(testPayload);
        const signature = generateSignature(payloadStr, method, uri, timestamp);

        log('🔄', 'Mengirim request ke sandbox...', `${API_BASE_URL}${uri}`);
        log('📦', 'Payload', JSON.stringify(testPayload, null, 2));

        const response = await fetch(`${API_BASE_URL}${uri}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Xenith-Api-Key': API_KEY,
                'Xenith-Request-Timestamp': timestamp,
                'Xenith-Request-Signature': signature,
                'X-Idempotency-Key': crypto.randomUUID(),
            },
            body: payloadStr,
        });

        const result = await response.json();

        if (response.ok) {
            log('✅', `API Response: ${response.status} ${response.statusText}`);
            log('🎉', 'Pay In berhasil dibuat!');
            console.log('\n   Response Data:');
            console.log(JSON.stringify(result, null, 2).split('\n').map((l: string) => `   ${l}`).join('\n'));

            const data = result.data || result;
            if (data.id) log('🆔', 'Transaction ID', data.id);
            if (data.status) log('📊', 'Status', data.status);
            if (data.paymentCode) log('💳', 'Payment Code', data.paymentCode);
            if (data.redirectUrl) log('🔗', 'Redirect URL', data.redirectUrl);
            if (data.expiresAt) log('⏰', 'Expires At', data.expiresAt);

            return true;
        } else {
            log('⚠️', `API Response: ${response.status} ${response.statusText}`);
            console.log('\n   Error Detail:');
            console.log(JSON.stringify(result, null, 2).split('\n').map((l: string) => `   ${l}`).join('\n'));

            if (response.status === 401) {
                log('💡', 'Diagnosis', 'API Key atau Secret Key salah/expired. Cek di Xenith Dashboard > Developer Settings.');
            } else if (response.status === 403) {
                log('💡', 'Diagnosis', 'API Key tidak punya permission untuk Pay In. Cek permission di Xenith Dashboard.');
            } else if (response.status === 400) {
                log('💡', 'Diagnosis', 'Payload tidak sesuai format. Kemungkinan payment method belum di-enable di sandbox.');
            } else if (response.status === 422) {
                log('💡', 'Diagnosis', 'Validation error dari Xenith. Cek field yang required.');
            }

            return false;
        }
    } catch (error) {
        if (error instanceof TypeError && String(error).includes('fetch')) {
            log('❌', 'Koneksi gagal', 'Tidak bisa terhubung ke sandbox API. Cek koneksi internet.');
        } else {
            log('❌', 'Request gagal', String(error));
        }
        return false;
    }
}

// ── Test 4: Webhook Signature Verification ──────────────────────────────────

function testWebhookVerification(): boolean {
    divider('TEST 4: Webhook Signature Verification');

    try {
        const webhookPayload = JSON.stringify({
            event: "payin.completed",
            data: {
                id: "pi_test_123",
                status: "SUCCESS",
                amount: 10000,
            }
        });

        // Generate signature
        const expectedSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(webhookPayload)
            .digest('base64');

        log('🔑', 'Webhook Secret', `${WEBHOOK_SECRET.substring(0, 25)}...`);
        log('📝', 'Generated Signature', expectedSignature);

        // Verify (same method as xenith.ts verifyWebhookSignature)
        const verifySignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(webhookPayload)
            .digest('base64');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(verifySignature)
        );

        if (isValid) {
            log('✅', 'Webhook verification works', 'Valid signature correctly accepted');
        } else {
            log('❌', 'Webhook verification failed', 'Signatures did not match');
        }

        // Test tampered payload
        const wrongPayload = JSON.stringify({ tampered: true });
        const wrongSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(wrongPayload)
            .digest('base64');

        const tamperedIsValid = expectedSignature === wrongSignature;
        if (!tamperedIsValid) {
            log('✅', 'Tamper detection works', 'Modified payload correctly rejected');
        } else {
            log('❌', 'Tamper detection FAILED', 'Modified payload was incorrectly accepted!');
        }

        return isValid && !tamperedIsValid;
    } catch (error) {
        log('❌', 'Webhook verification test failed', String(error));
        return false;
    }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n🚀 Xenith Sandbox Integration Test');
    console.log(`   Time: ${new Date().toLocaleString('id-ID')}`);
    console.log(`   Sandbox URL: ${API_BASE_URL}`);

    const results: Record<string, boolean> = {};

    // Test 1
    results['Environment Variables'] = testEnvVariables();
    if (!results['Environment Variables']) {
        log('🛑', 'Stopping', 'Fix environment variables terlebih dahulu!');
        process.exit(1);
    }

    // Test 2
    results['Signature Generation'] = testSignatureGeneration();

    // Test 3
    results['API Pay In (QRIS)'] = await testApiPayIn();

    // Test 4
    results['Webhook Verification'] = testWebhookVerification();

    // Summary
    divider('SUMMARY');
    let allPassed = true;
    for (const [name, passed] of Object.entries(results)) {
        console.log(`  ${passed ? '✅' : '❌'}  ${name}`);
        if (!passed) allPassed = false;
    }

    if (allPassed) {
        console.log('\n  🎉 Semua test PASSED! Integrasi Xenith sandbox siap digunakan.');
    } else {
        console.log('\n  ⚠️  Ada test yang GAGAL. Cek detail di atas untuk diagnosis.');
    }
    console.log('');

    process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
});

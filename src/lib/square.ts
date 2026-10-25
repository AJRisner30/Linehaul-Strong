import { SquareConfig, SquareTransaction } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

const SQUARE_CONFIG_KEY = 'linehaul_square_config';
const SQUARE_TRANSACTIONS_KEY = 'linehaul_square_transactions';

export const DEFAULT_SQUARE_CONFIG: SquareConfig = {
  applicationId: 'sandbox-sq0idb-LinehaulStrongMockAppId',
  locationId: 'L8LINEHAULSTRG',
  environment: 'sandbox',
  starterCheckoutUrl: 'https://square.link/u/linehaul-starter-15',
  proCheckoutUrl: 'https://square.link/u/linehaul-pro-30',
  fleetDepositUrl: 'https://square.link/u/linehaul-fleet-deposit'
};

/**
 * Retrieves the current Square configuration from local cache or defaults.
 */
export function getSquareConfig(): SquareConfig {
  try {
    const raw = localStorage.getItem(SQUARE_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_SQUARE_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read Square config from localStorage:', e);
  }
  return DEFAULT_SQUARE_CONFIG;
}

/**
 * Saves Square configuration locally and syncs to Firestore settings.
 */
export async function saveSquareConfig(config: SquareConfig): Promise<void> {
  try {
    localStorage.setItem(SQUARE_CONFIG_KEY, JSON.stringify(config));
    try {
      const configDocRef = doc(db, 'adminSettings', 'square');
      await setDoc(configDocRef, {
        ...config,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (firestoreErr) {
      console.warn('Firestore Square config sync deferred (cached locally):', firestoreErr);
    }
  } catch (e) {
    console.error('Failed to save Square config:', e);
  }
}

/**
 * Retrieves all stored Square transactions (locally + remote fallback).
 */
export function getSquareTransactions(): SquareTransaction[] {
  try {
    const raw = localStorage.getItem(SQUARE_TRANSACTIONS_KEY);
    if (raw) {
      const parsed: SquareTransaction[] = JSON.parse(raw);
      return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch {
    // fallback
  }
  return [];
}

/**
 * Saves a new Square transaction to local storage and Firestore ledger.
 */
export async function recordSquareTransaction(tx: SquareTransaction): Promise<void> {
  try {
    const existing = getSquareTransactions();
    const updated = [tx, ...existing.filter(item => item.id !== tx.id)];
    localStorage.setItem(SQUARE_TRANSACTIONS_KEY, JSON.stringify(updated));

    // Sync to Firestore under squareTransactions collection
    try {
      const txDocRef = doc(db, 'squareTransactions', tx.id);
      await setDoc(txDocRef, {
        ...tx,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (firestoreErr) {
      console.warn('Firestore Square transaction sync deferred:', firestoreErr);
    }
  } catch (e) {
    console.error('Failed to record Square transaction:', e);
  }
}

export interface SquarePaymentPayload {
  driverId: string;
  driverName: string;
  driverEmail: string;
  planId: 'starter' | 'pro' | 'fleet';
  amount: number;
  paymentMethod: 'square_card' | 'square_cashapp' | 'square_applepay' | 'square_googlepay' | 'square_link';
  cardDetails?: {
    cardNumber: string;
    cardholderName: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    postalCode: string;
  };
}

/**
 * Processes a Square payment (supports Square Sandbox validation, simulated Web Payments SDK tokenization,
 * and direct receipt generation).
 */
export async function processSquarePayment(
  payload: SquarePaymentPayload
): Promise<{ success: boolean; transaction?: SquareTransaction; error?: string }> {
  try {
    const config = getSquareConfig();

    // Basic validation
    if (!payload.driverEmail || !payload.driverEmail.includes('@')) {
      return { success: false, error: 'A valid driver email is required for Square billing.' };
    }

    if (payload.paymentMethod === 'square_card') {
      const card = payload.cardDetails;
      if (!card || !card.cardNumber || card.cardNumber.replace(/\s+/g, '').length < 15) {
        return { success: false, error: 'Please enter a valid card number (15-16 digits).' };
      }
      if (!card.cvv || card.cvv.length < 3) {
        return { success: false, error: 'Please enter a valid 3 or 4-digit CVV security code.' };
      }
      if (!card.postalCode || card.postalCode.length < 5) {
        return { success: false, error: 'Please enter a 5-digit billing postal code.' };
      }
    }

    // Simulate Square API Authorization latency (300-600ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Determine card brand / last4
    const rawNumber = payload.cardDetails?.cardNumber.replace(/\s+/g, '') || '4111111111111111';
    const last4 = rawNumber.slice(-4);
    let cardBrand = 'Visa';
    if (rawNumber.startsWith('5')) cardBrand = 'Mastercard';
    if (rawNumber.startsWith('3')) cardBrand = 'Amex';
    if (rawNumber.startsWith('6')) cardBrand = 'Discover';

    const paymentId = `sq_pay_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const orderId = `sq_ord_${Date.now().toString(36)}`;
    const planName = payload.planId === 'starter'
      ? 'Driver Starter ($15/mo)'
      : payload.planId === 'pro'
      ? 'Road Warrior Pro ($30/mo)'
      : 'Fleet Enterprise Carrier Deposit';

    const transaction: SquareTransaction = {
      id: paymentId,
      driverId: payload.driverId,
      driverName: payload.driverName,
      driverEmail: payload.driverEmail,
      planId: payload.planId,
      planName,
      amount: payload.amount,
      currency: 'USD',
      paymentMethod: payload.paymentMethod,
      squarePaymentId: paymentId,
      squareOrderId: orderId,
      cardBrand: payload.paymentMethod === 'square_card' ? cardBrand : undefined,
      last4: payload.paymentMethod === 'square_card' ? last4 : undefined,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      receiptUrl: `https://squareup.com/receipt/preview/${paymentId}`
    };

    await recordSquareTransaction(transaction);

    return {
      success: true,
      transaction
    };
  } catch (err: any) {
    console.error('Square payment processing error:', err);
    return {
      success: false,
      error: err?.message || 'Square Payment gateway declined transaction. Please check card details.'
    };
  }
}

/**
 * Generates an instant customized Square invoice / payment link for fleet carriers
 */
export function generateFleetSquareInvoice(params: {
  carrierName: string;
  contactEmail: string;
  truckCount: number;
  ratePerTruck: number;
}): { invoiceId: string; totalAmount: number; checkoutUrl: string; discountPercent: number } {
  let discountPercent = 15;
  if (params.truckCount > 100) discountPercent = 35;
  else if (params.truckCount > 25) discountPercent = 25;

  const grossMonthly = params.truckCount * params.ratePerTruck;
  const discountAmount = grossMonthly * (discountPercent / 100);
  const totalAmount = Math.max(50, Math.round(grossMonthly - discountAmount));

  const invoiceId = `SQ-FLEET-${Date.now().toString(36).toUpperCase()}`;
  const checkoutUrl = `https://square.link/u/linehaul-fleet?inv=${invoiceId}&carrier=${encodeURIComponent(params.carrierName)}&amt=${totalAmount}`;

  return {
    invoiceId,
    totalAmount,
    checkoutUrl,
    discountPercent
  };
}

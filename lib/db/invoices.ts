import { getMySQLPool } from "@/lib/mysql/pool";
import { createInvoice as createBillingInvoice, listUserInvoices } from "@/lib/mysql/billing";
import type { InvoiceRow } from "./types";

function mapInvoice(row: Awaited<ReturnType<typeof listUserInvoices>>[number]): InvoiceRow {
  return {
    id: row.id,
    user_id: row.userId,
    subscription_id: row.subscriptionId,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    description: row.description,
    payment_method: row.paymentMethod,
    download_url: row.downloadUrl,
    stripe_invoice_id: null,
    issued_at: row.issuedAt,
    paid_at: row.paidAt,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function getUserInvoices(userId: string): Promise<InvoiceRow[]> {
  try {
    const invoices = await listUserInvoices(userId, 100);
    return invoices.map(mapInvoice);
  } catch (error) {
    console.error("[db] Error fetching invoices:", error);
    return [];
  }
}

export async function getInvoiceById(invoiceId: string): Promise<InvoiceRow | null> {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT
          id,
          user_id,
          subscription_id,
          amount,
          currency,
          status,
          description,
          payment_method,
          download_url,
          issued_at,
          paid_at,
          created_at,
          updated_at
        FROM user_invoices
        WHERE id = ?
        LIMIT 1
      `,
      [invoiceId],
    );

    const row = (rows as Array<{
      id: string;
      user_id: string;
      subscription_id: string | null;
      amount: number | string;
      currency: string;
      status: InvoiceRow["status"];
      description: string | null;
      payment_method: string | null;
      download_url: string | null;
      issued_at: string | null;
      paid_at: string | null;
      created_at: string;
      updated_at: string;
    }>)[0];

    if (!row) {
      return null;
    }

    return {
      ...row,
      amount: Number(row.amount || 0),
      stripe_invoice_id: null,
    };
  } catch (error) {
    console.error("[db] Error fetching invoice:", error);
    return null;
  }
}

export async function createInvoice(
  userId: string,
  subscriptionId: string,
  amount: number,
): Promise<InvoiceRow | null> {
  try {
    const invoice = await createBillingInvoice({
      userId,
      subscriptionId,
      amount,
      status: "pending",
      description: "Plan change invoice",
    });

    return mapInvoice(invoice);
  } catch (error) {
    console.error("[db] Error creating invoice:", error);
    return null;
  }
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  stripeInvoiceId?: string,
): Promise<InvoiceRow | null> {
  try {
    const pool = getMySQLPool();
    await pool.query(
      `
        UPDATE user_invoices
        SET status = 'paid',
            paid_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `,
      [invoiceId],
    );

    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return null;
    }

    return {
      ...invoice,
      stripe_invoice_id: stripeInvoiceId || null,
    };
  } catch (error) {
    console.error("[db] Error marking invoice as paid:", error);
    return null;
  }
}

export async function getSubscriptionInvoices(subscriptionId: string): Promise<InvoiceRow[]> {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `
        SELECT
          id,
          user_id,
          subscription_id,
          amount,
          currency,
          status,
          description,
          payment_method,
          download_url,
          issued_at,
          paid_at,
          created_at,
          updated_at
        FROM user_invoices
        WHERE subscription_id = ?
        ORDER BY created_at DESC
      `,
      [subscriptionId],
    );

    return (rows as Array<{
      id: string;
      user_id: string;
      subscription_id: string | null;
      amount: number | string;
      currency: string;
      status: InvoiceRow["status"];
      description: string | null;
      payment_method: string | null;
      download_url: string | null;
      issued_at: string | null;
      paid_at: string | null;
      created_at: string;
      updated_at: string;
    }>).map((row) => ({
      ...row,
      amount: Number(row.amount || 0),
      stripe_invoice_id: null,
    }));
  } catch (error) {
    console.error("[db] Error fetching subscription invoices:", error);
    return [];
  }
}

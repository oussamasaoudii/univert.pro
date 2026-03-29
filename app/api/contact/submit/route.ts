import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getMySQLPool } from '@/lib/mysql/pool';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  inquiryType: z.enum(['general', 'pricing', 'templates', 'support', 'partnership', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = contactFormSchema.parse(body);

    // Insert into database
    const pool = getMySQLPool();
    const [result] = await pool.query<any>(
      `INSERT INTO contact_messages (name, email, inquiry_type, message, status, received_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        validatedData.name,
        validatedData.email,
        validatedData.inquiryType,
        validatedData.message,
        'received'
      ]
    );

    const messageId = (result as any).insertId;

    return NextResponse.json(
      {
        success: true,
        message: 'Message received successfully! Our support team will review and respond within 1-2 business days.',
        messageId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error processing contact form:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message. Please try again later or contact support directly.',
      },
      { status: 500 }
    );
  }
}

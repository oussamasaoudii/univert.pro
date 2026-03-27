import { NextResponse, NextRequest } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/api-auth';
import { createTicket, getUserTickets, updateTicketStatus } from '@/lib/support/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const tickets = await getUserTickets(user.id, status || undefined);
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedRequestUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, category, priority } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticket = await createTicket(
      user.id,
      title,
      description,
      category || null,
      priority || 'medium'
    );

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  appendMenuItemRow,
  deleteMenuItemRow,
  listMenuItemsFromSheet,
  type MinimalMenuItem,
} from '@/lib/googleSheets';

export async function GET() {
  try {
    const items = await listMenuItemsFromSheet();
    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch menu items';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, price, description, category, imageUrl } = body || {};

    if (!name || price == null) {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
    }

    const priceNum = typeof price === 'number' ? price : parseFloat(String(price));
    if (Number.isNaN(priceNum)) {
      return NextResponse.json({ error: 'price must be a number' }, { status: 400 });
    }

    const item: MinimalMenuItem = {
      id: uuidv4(),
      name: String(name),
      price: priceNum,
      description: String(description || ''),
      category: String(category || ''),
      imageUrl: String(imageUrl || ''),
    };

    const created = await appendMenuItemRow(item);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    const message = error?.message || 'Failed to create menu item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || undefined;
    const name = searchParams.get('name') || undefined;
    if (!id && !name) {
      return NextResponse.json({ error: 'Provide id or name to delete' }, { status: 400 });
    }
    const ok = await deleteMenuItemRow({ id, name });
    if (!ok) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    const message = error?.message || 'Failed to delete menu item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



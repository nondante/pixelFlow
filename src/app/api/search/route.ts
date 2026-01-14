import { NextRequest, NextResponse } from 'next/server';
import { unsplashClient } from '@/lib/unsplash';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
        },
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '30');
    const orientation = searchParams.get('orientation') as 'landscape' | 'portrait' | 'squarish' | undefined;
    const color = searchParams.get('color') as string | undefined;
    const orderBy = (searchParams.get('order_by') as 'relevant' | 'latest') || 'relevant';

    const result = await unsplashClient.searchPhotos({
      query,
      page,
      per_page: perPage,
      orientation,
      color: color as any,
      order_by: orderBy,
    });

    return NextResponse.json({
      success: true,
      data: result.results,
      total: result.total,
      total_pages: result.total_pages,
      page,
      per_page: perPage,
    });
  } catch (error) {
    console.error('Error searching photos:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search photos',
      },
      { status: 500 }
    );
  }
}

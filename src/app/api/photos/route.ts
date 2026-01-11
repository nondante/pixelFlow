import { NextRequest, NextResponse } from 'next/server';
import { unsplashClient } from '@/lib/unsplash';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '30');
    const orderBy = searchParams.get('order_by') as 'latest' | 'oldest' | 'popular' || 'latest';

    const photos = await unsplashClient.getPhotos({
      page,
      per_page: perPage,
      order_by: orderBy,
    });

    return NextResponse.json({
      success: true,
      data: photos,
      page,
      per_page: perPage,
    });
  } catch (error) {
    console.error('Error fetching photos:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch photos',
      },
      { status: 500 }
    );
  }
}

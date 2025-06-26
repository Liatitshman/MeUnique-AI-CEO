import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check Supabase connection
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                connected: false,
                error: 'Missing credentials'
            }, { status: 500 });
        }

        // Try to ping Supabase
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        return NextResponse.json({
            connected: response.ok,
            status: response.status,
            url: supabaseUrl
        });
    } catch (error) {
        return NextResponse.json({
            connected: false,
            error: error.message
        }, { status: 500 });
    }
} 
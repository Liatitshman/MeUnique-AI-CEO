import { NextResponse } from 'next/server';

export async function GET() {
    const apis = {
        openai: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('YOUR_'),
        linkedin: !!process.env.LINKEDIN_COOKIE && !process.env.LINKEDIN_COOKIE.includes('your_'),
        github: !!process.env.GITHUB_TOKEN && !process.env.GITHUB_TOKEN.includes('your_'),
        salesNavigator: !!process.env.SALES_NAVIGATOR_TOKEN && !process.env.SALES_NAVIGATOR_TOKEN.includes('your_')
    };

    return NextResponse.json(apis);
} 
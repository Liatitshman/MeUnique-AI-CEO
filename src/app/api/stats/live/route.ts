import { NextResponse } from 'next/server';

export async function GET() {
    // In production, these would come from your database
    // For now, returning realistic demo data
    const stats = {
        totalAgents: 15,
        activeAgents: Math.floor(Math.random() * 5) + 10, // 10-15 active
        totalCandidates: Math.floor(Math.random() * 100) + 450, // 450-550
        todayScans: Math.floor(Math.random() * 50) + 150, // 150-200
        responseRate: Math.floor(Math.random() * 10) + 40, // 40-50%
        costSaved: 70,
        lastUpdate: new Date().toISOString()
    };

    return NextResponse.json(stats);
} 
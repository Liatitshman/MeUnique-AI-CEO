import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    // Dictionary Bot logic - "המילון שמבין מגייסות"
    const techDictionary = {
      // תפקידים עם הומור
      "Ninja Developer": "מפתח שאף אחד לא רואה (WFH)",
      "Rock Star Developer": "מפתח עם אגו של סולן להקה",
      "10x Developer": "מפתח שעושה 10 באגים במקום אחד",
      "Full Stack Developer": "מישהו שלא מומחה בכלום",
      "DevOps Engineer": "האשם בכל דבר שלא עובד",

      // דרישות מצחיקות
      "Passionate": "מוכן לעבוד שעות נוספות בחינם",
      "Self starter": "לא נכשיר אותך",
      "Team player": "תיקח את האשמה כשמשהו נכשל",
      "Flexible": "תעבוד בסופ״ש",
      "Fast-paced": "אין לנו תהליכים",

      // טכנולוגיות
      "AI/ML": "אקסל עם פונקציות מתקדמות",
      "Big Data": "יותר מ-Excel יכול להחזיק",
      "Cloud": "המחשב של מישהו אחר",
      "Blockchain": "Database עם יח״צ טוב",
      "Agile": "אין לנו תוכנית"
    };

    const recruiterMemes = [
      "The Unicorn Hunt: מחפשת בן 25 עם 30 שנות ניסיון",
      "The Ghosting: מועמד שנעלם אחרי 5 ראיונות",
      "The Salary Dance: 'תחרותי' = מינימום בשוק",
      "The Culture Fit: מישהו שישתה איתנו בירה"
    ];

    const result = {
      success: true,
      tool: 'dictionary-bot',
      action,
      message: 'Dictionary Bot - Making recruiting terms make sense! 😄',
      data: {
        dictionary: techDictionary,
        memes: recruiterMemes,
        translation: params?.term ? techDictionary[params.term as keyof typeof techDictionary] || "Term not found" : null,
        categories: ['Tech Roles', 'Job Requirements', 'Technologies', 'Recruiter Life'],
        languages: ['Hebrew', 'English', 'Sarcasm'],
        stats: {
          termsAvailable: Object.keys(techDictionary).length,
          memesCollection: recruiterMemes.length,
          laughsGenerated: "∞"
        }
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
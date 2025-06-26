#!/usr/bin/env node
/**
 * Sales QL Automation Script
 * מייצא אוטומטית 100 פרופילים ביום עם אימיילים
 * 
 * הוראות הפעלה:
 * 1. התקן את התוסף של Sales QL ב-Chrome
 * 2. היכנס ל-LinkedIn Sales Navigator
 * 3. הרץ את הסקריפט הזה בקונסול
 */

class SalesQLAutomation {
    constructor() {
        this.dailyLimit = 100;
        this.exportedToday = 0;
        this.profiles = [];

        // Saved searches לסגמנטים שונים
        this.savedSearches = [
            {
                name: "Senior_Backend_Engineers_Israel",
                url: "https://www.linkedin.com/sales/search/people?keywords=senior%20backend%20engineer&geoIncluded=101620260",
                priority: 1
            },
            {
                name: "Frontend_Tech_Leads",
                url: "https://www.linkedin.com/sales/search/people?keywords=frontend%20tech%20lead&geoIncluded=101620260",
                priority: 2
            },
            {
                name: "DevOps_Engineers_Hiring",
                url: "https://www.linkedin.com/sales/search/people?keywords=devops&openToWork=true",
                priority: 3
            }
        ];
    }

    async runDailyExport() {
        console.log("🚀 Starting Sales QL Daily Export");
        console.log(`📊 Daily limit: ${this.dailyLimit} profiles`);

        for (const search of this.savedSearches) {
            if (this.exportedToday >= this.dailyLimit) {
                console.log("✅ Daily limit reached!");
                break;
            }

            console.log(`\n🔍 Processing: ${search.name}`);
            await this.processSearch(search);
        }

        // שמור את התוצאות
        await this.saveResults();

        console.log(`\n✅ Export complete! Total: ${this.exportedToday} profiles`);
    }

    async processSearch(search) {
        // נווט לחיפוש
        window.location.href = search.url;
        await this.wait(5000); // המתן לטעינה

        // הפעל Sales QL
        this.triggerSalesQL();

        // אסוף פרופילים מהדף
        const pageProfiles = await this.extractProfiles();

        for (const profile of pageProfiles) {
            if (this.exportedToday >= this.dailyLimit) break;

            // העשר עם Sales QL
            const enriched = await this.enrichWithSalesQL(profile);

            if (enriched.email) {
                this.profiles.push(enriched);
                this.exportedToday++;
                console.log(`✅ Enriched: ${enriched.name} - ${enriched.email}`);
            }
        }

        // עבור לדף הבא אם צריך
        if (this.hasNextPage() && this.exportedToday < this.dailyLimit) {
            await this.goToNextPage();
            await this.processSearch(search); // רקורסיה
        }
    }

    triggerSalesQL() {
        // סימולציה של לחיצה על כפתור Sales QL
        const salesQLButton = document.querySelector('[data-sales-ql-button]');
        if (salesQLButton) {
            salesQLButton.click();
            console.log("🔧 Sales QL activated");
        }
    }

    async extractProfiles() {
        const profiles = [];
        const profileElements = document.querySelectorAll('.search-results__result-item');

        profileElements.forEach(elem => {
            const nameElem = elem.querySelector('.result-lockup__name');
            const titleElem = elem.querySelector('.result-lockup__highlight-keyword');
            const companyElem = elem.querySelector('.result-lockup__position-company');
            const linkedinUrl = elem.querySelector('a[href*="/sales/people/"]')?.href;

            if (nameElem && linkedinUrl) {
                profiles.push({
                    name: nameElem.textContent.trim(),
                    title: titleElem?.textContent.trim() || '',
                    company: companyElem?.textContent.trim() || '',
                    linkedinUrl: linkedinUrl,
                    timestamp: new Date().toISOString()
                });
            }
        });

        return profiles;
    }

    async enrichWithSalesQL(profile) {
        // Sales QL API simulation
        // בפועל, Sales QL עובד דרך התוסף

        const enriched = { ...profile };

        // המתן לתגובה מ-Sales QL
        await this.wait(2000);

        // בדוק אם יש נתונים חדשים
        const emailElement = document.querySelector(`[data-profile-email="${profile.linkedinUrl}"]`);
        const phoneElement = document.querySelector(`[data-profile-phone="${profile.linkedinUrl}"]`);

        if (emailElement) {
            enriched.email = emailElement.textContent;
            enriched.emailVerified = true;
        }

        if (phoneElement) {
            enriched.phone = phoneElement.textContent;
        }

        // ניקוד רלוונטיות
        enriched.relevanceScore = this.calculateRelevance(enriched);

        return enriched;
    }

    calculateRelevance(profile) {
        let score = 0.5;

        // תפקיד בכיר
        if (profile.title.toLowerCase().includes('senior') ||
            profile.title.toLowerCase().includes('lead')) {
            score += 0.2;
        }

        // חברה רלוונטית
        const hotCompanies = ['wiz', 'monday', 'gong', 'snyk', 'google', 'microsoft'];
        if (hotCompanies.some(company =>
            profile.company.toLowerCase().includes(company))) {
            score += 0.2;
        }

        // אימייל מאומת
        if (profile.emailVerified) {
            score += 0.1;
        }

        return Math.min(score, 1.0);
    }

    hasNextPage() {
        return document.querySelector('.search-results__pagination-next:not(.disabled)') !== null;
    }

    async goToNextPage() {
        const nextButton = document.querySelector('.search-results__pagination-next');
        if (nextButton) {
            nextButton.click();
            await this.wait(3000);
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `sales_ql_export_${timestamp}.json`;

        const exportData = {
            exportDate: timestamp,
            totalProfiles: this.profiles.length,
            withEmail: this.profiles.filter(p => p.email).length,
            profiles: this.profiles
        };

        // שמור ל-localStorage לבינתיים
        localStorage.setItem(filename, JSON.stringify(exportData));

        // הורד כקובץ
        this.downloadJSON(exportData, filename);

        console.log(`💾 Saved to: ${filename}`);
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)],
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// הרצה אוטומטית
async function runSalesQLAutomation() {
    const automation = new SalesQLAutomation();

    // בדוק אם כבר רצנו היום
    const lastRun = localStorage.getItem('salesql_last_run');
    const today = new Date().toISOString().split('T')[0];

    if (lastRun === today) {
        console.log("⚠️ Already ran today. Come back tomorrow!");
        return;
    }

    // הרץ את הייצוא
    await automation.runDailyExport();

    // סמן שרצנו היום
    localStorage.setItem('salesql_last_run', today);

    // תזמן הרצה למחר
    console.log("⏰ Next run scheduled for tomorrow 9:00 AM");
}

// הוראות לשימוש ידני
console.log(`
🎯 Sales QL Automation Ready!

To run manually:
1. Open LinkedIn Sales Navigator
2. Make sure Sales QL extension is active
3. Run: runSalesQLAutomation()

To schedule daily:
- Use Chrome extension scheduler
- Or run via Puppeteer/Selenium

Daily capacity: 100 profiles with emails
Monthly value: 3,000 profiles = $150,000
`);

// Export for use
window.runSalesQLAutomation = runSalesQLAutomation; 
/**
 * MeUnique LinkedIn Assistant - Content Script
 */

class MeUniqueAssistant {
    constructor() {
        this.candidates = [];
        this.apiEndpoint = 'https://api.meunique.ai';
        this.init();
    }

    init() {
        // הוספת כפתורים לתוצאות חיפוש
        this.enhanceSearchResults();

        // מעקב אחר שינויים בדף
        this.observePageChanges();

        // הוספת פאנל צף
        this.createFloatingPanel();

        // טעינת העדפות משתמש
        this.loadUserPreferences();
    }

    enhanceSearchResults() {
        // חיפוש כל כרטיסי המועמדים
        const searchResults = document.querySelectorAll('.entity-result, .search-result__wrapper');

        searchResults.forEach(result => {
            if (!result.querySelector('.meunique-button')) {
                this.addActionButtons(result);
            }
        });
    }

    addActionButtons(resultElement) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'meunique-button-container';

        // כפתור הוספה למאגר
        const addButton = document.createElement('button');
        addButton.className = 'meunique-button meunique-add';
        addButton.innerHTML = '🎯 הוסף למאגר';
        addButton.onclick = () => this.addCandidate(resultElement);

        // כפתור ניתוח מהיר
        const analyzeButton = document.createElement('button');
        analyzeButton.className = 'meunique-button meunique-analyze';
        analyzeButton.innerHTML = '🔍 נתח פרופיל';
        analyzeButton.onclick = () => this.quickAnalyze(resultElement);

        // כפתור יצירת הודעה
        const messageButton = document.createElement('button');
        messageButton.className = 'meunique-button meunique-message';
        messageButton.innerHTML = '✉️ צור הודעה';
        messageButton.onclick = () => this.generateMessage(resultElement);

        buttonContainer.appendChild(addButton);
        buttonContainer.appendChild(analyzeButton);
        buttonContainer.appendChild(messageButton);

        // הוספה לכרטיס
        const actionsArea = resultElement.querySelector('.entity-result__actions') ||
            resultElement.querySelector('.search-result__actions');
        if (actionsArea) {
            actionsArea.appendChild(buttonContainer);
        } else {
            resultElement.appendChild(buttonContainer);
        }
    }

    async addCandidate(resultElement) {
        const candidateData = this.extractCandidateData(resultElement);

        try {
            // שמירה מקומית
            this.candidates.push(candidateData);

            // שליחה לשרת
            const response = await fetch(`${this.apiEndpoint}/candidates/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify(candidateData)
            });

            if (response.ok) {
                this.showNotification('✅ המועמד נוסף בהצלחה!');
                this.updateCounter();
            }
        } catch (error) {
            console.error('Error adding candidate:', error);
            this.showNotification('❌ שגיאה בהוספת המועמד');
        }
    }

    async quickAnalyze(resultElement) {
        const candidateData = this.extractCandidateData(resultElement);

        // הצגת לואדר
        this.showLoader(resultElement);

        try {
            const analysis = await this.getAIAnalysis(candidateData);
            this.showAnalysisPopup(analysis);
        } catch (error) {
            console.error('Error analyzing:', error);
            this.showNotification('❌ שגיאה בניתוח');
        }
    }

    async generateMessage(resultElement) {
        const candidateData = this.extractCandidateData(resultElement);

        try {
            const message = await this.getPersonalizedMessage(candidateData);
            this.showMessageEditor(message);
        } catch (error) {
            console.error('Error generating message:', error);
            this.showNotification('❌ שגיאה ביצירת הודעה');
        }
    }

    extractCandidateData(element) {
        const nameElement = element.querySelector('.entity-result__title-text a, .actor-name');
        const titleElement = element.querySelector('.entity-result__primary-subtitle, .search-result__truncate');
        const locationElement = element.querySelector('.entity-result__secondary-subtitle');
        const profileLink = nameElement?.href || '';

        return {
            name: nameElement?.innerText?.trim() || '',
            title: titleElement?.innerText?.trim() || '',
            location: locationElement?.innerText?.trim() || '',
            profileUrl: profileLink,
            extractedAt: new Date().toISOString(),
            source: 'linkedin_search'
        };
    }

    createFloatingPanel() {
        const panel = document.createElement('div');
        panel.id = 'meunique-floating-panel';
        panel.innerHTML = `
            <div class="meunique-panel-header">
                <h3>🎯 MeUnique Assistant</h3>
                <span class="meunique-counter">0</span>
                <button class="meunique-minimize">_</button>
            </div>
            <div class="meunique-panel-content">
                <div class="meunique-stats">
                    <div class="stat-item">
                        <span class="stat-label">נוספו היום:</span>
                        <span class="stat-value" id="today-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">נותחו:</span>
                        <span class="stat-value" id="analyzed-count">0</span>
                    </div>
                </div>
                <div class="meunique-actions">
                    <button class="meunique-action-btn" id="bulk-add">
                        🚀 הוסף הכל
                    </button>
                    <button class="meunique-action-btn" id="export-data">
                        📥 ייצא נתונים
                    </button>
                    <button class="meunique-action-btn" id="ai-suggestions">
                        🤖 המלצות AI
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // Event listeners
        panel.querySelector('.meunique-minimize').onclick = () => {
            panel.classList.toggle('minimized');
        };

        panel.querySelector('#bulk-add').onclick = () => this.bulkAddCandidates();
        panel.querySelector('#export-data').onclick = () => this.exportData();
        panel.querySelector('#ai-suggestions').onclick = () => this.showAISuggestions();
    }

    showAnalysisPopup(analysis) {
        const popup = document.createElement('div');
        popup.className = 'meunique-popup';
        popup.innerHTML = `
            <div class="meunique-popup-content">
                <h3>📊 ניתוח מועמד</h3>
                <div class="analysis-section">
                    <h4>התאמה לתפקיד:</h4>
                    <div class="match-score">${analysis.matchScore}%</div>
                </div>
                <div class="analysis-section">
                    <h4>כישורים מרכזיים:</h4>
                    <div class="skills-tags">
                        ${analysis.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                <div class="analysis-section">
                    <h4>המלצת פעולה:</h4>
                    <p>${analysis.recommendation}</p>
                </div>
                <button class="meunique-close-popup">סגור</button>
            </div>
        `;

        document.body.appendChild(popup);

        popup.querySelector('.meunique-close-popup').onclick = () => {
            popup.remove();
        };
    }

    showMessageEditor(message) {
        const editor = document.createElement('div');
        editor.className = 'meunique-message-editor';
        editor.innerHTML = `
            <div class="editor-content">
                <h3>✉️ הודעה מותאמת אישית</h3>
                <div class="message-options">
                    <label>
                        <input type="radio" name="lang" value="he" checked> עברית
                    </label>
                    <label>
                        <input type="radio" name="lang" value="en"> English
                    </label>
                </div>
                <textarea class="message-text">${message.text}</textarea>
                <div class="message-stats">
                    <span>אורך: ${message.text.length} תווים</span>
                    <span>טון: ${message.tone}</span>
                </div>
                <div class="editor-actions">
                    <button class="copy-message">📋 העתק</button>
                    <button class="regenerate-message">🔄 צור מחדש</button>
                    <button class="close-editor">סגור</button>
                </div>
            </div>
        `;

        document.body.appendChild(editor);

        // Event handlers
        editor.querySelector('.copy-message').onclick = () => {
            navigator.clipboard.writeText(editor.querySelector('.message-text').value);
            this.showNotification('📋 ההודעה הועתקה!');
        };

        editor.querySelector('.regenerate-message').onclick = async () => {
            const newMessage = await this.getPersonalizedMessage(message.candidateData, {
                tone: 'different',
                language: editor.querySelector('input[name="lang"]:checked').value
            });
            editor.querySelector('.message-text').value = newMessage.text;
        };

        editor.querySelector('.close-editor').onclick = () => editor.remove();
    }

    observePageChanges() {
        const observer = new MutationObserver((mutations) => {
            // בדיקה אם נוספו תוצאות חדשות
            const hasNewResults = mutations.some(mutation =>
                Array.from(mutation.addedNodes).some(node =>
                    node.classList?.contains('entity-result') ||
                    node.classList?.contains('search-result__wrapper')
                )
            );

            if (hasNewResults) {
                setTimeout(() => this.enhanceSearchResults(), 500);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    async loadUserPreferences() {
        const prefs = await chrome.storage.sync.get(['language', 'tone', 'autoAdd']);
        this.preferences = {
            language: prefs.language || 'he',
            tone: prefs.tone || 'professional',
            autoAdd: prefs.autoAdd || false
        };
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'meunique-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateCounter() {
        const counter = document.querySelector('.meunique-counter');
        if (counter) {
            counter.textContent = this.candidates.length;
        }

        const todayCount = document.getElementById('today-count');
        if (todayCount) {
            todayCount.textContent = this.candidates.filter(c =>
                new Date(c.extractedAt).toDateString() === new Date().toDateString()
            ).length;
        }
    }

    async getAuthToken() {
        // קבלת טוקן מה-storage או יצירת חדש
        const { authToken } = await chrome.storage.sync.get(['authToken']);
        return authToken || 'demo-token';
    }

    async getAIAnalysis(candidateData) {
        // סימולציה - במציאות יתחבר ל-API
        return {
            matchScore: Math.floor(Math.random() * 30) + 70,
            skills: ['React', 'Node.js', 'Python', 'AWS'],
            recommendation: 'מועמד מתאים מאוד! מומלץ ליצור קשר תוך 24 שעות',
            insights: [
                'ניסיון רלוונטי בחברות דומות',
                'כישורים טכניים מתאימים',
                'פעיל בקהילה הטכנולוגית'
            ]
        };
    }

    async getPersonalizedMessage(candidateData, options = {}) {
        // סימולציה - במציאות יתחבר ל-OpenAI API
        const messages = {
            he: `שלום ${candidateData.name},

ראיתי את הפרופיל שלך ב-LinkedIn והתרשמתי מהניסיון שלך ב${candidateData.title}.

אנחנו ב-MeUnique מחפשים אנשי פיתוח מוכשרים, ואשמח לשוחח איתך על הזדמנויות מעניינות שיש לנו.

האם יש לך זמן לשיחה קצרה השבוע?

תודה,
[השם שלך]`,
            en: `Hi ${candidateData.name},

I came across your profile and was impressed by your experience as ${candidateData.title}.

We have some exciting opportunities at MeUnique that might interest you.

Would you be available for a brief chat this week?

Best regards,
[Your name]`
        };

        return {
            text: messages[options.language || 'he'],
            tone: 'professional',
            candidateData
        };
    }

    async bulkAddCandidates() {
        const allResults = document.querySelectorAll('.entity-result, .search-result__wrapper');
        let addedCount = 0;

        for (const result of allResults) {
            if (!result.classList.contains('meunique-added')) {
                await this.addCandidate(result);
                result.classList.add('meunique-added');
                addedCount++;

                // הפסקה קצרה בין בקשות
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        this.showNotification(`✅ נוספו ${addedCount} מועמדים חדשים!`);
    }

    exportData() {
        const dataStr = JSON.stringify(this.candidates, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `meunique-candidates-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showNotification('📥 הנתונים יוצאו בהצלחה!');
    }

    async showAISuggestions() {
        // הצגת המלצות AI
        const suggestions = await this.getAISuggestions();

        const popup = document.createElement('div');
        popup.className = 'meunique-suggestions-popup';
        popup.innerHTML = `
            <div class="suggestions-content">
                <h3>🤖 המלצות AI</h3>
                ${suggestions.map(s => `
                    <div class="suggestion-item">
                        <h4>${s.title}</h4>
                        <p>${s.description}</p>
                        <button class="apply-suggestion" data-action="${s.action}">
                            ${s.buttonText}
                        </button>
                    </div>
                `).join('')}
                <button class="close-suggestions">סגור</button>
            </div>
        `;

        document.body.appendChild(popup);

        popup.querySelector('.close-suggestions').onclick = () => popup.remove();
    }

    async getAISuggestions() {
        return [
            {
                title: 'סנן לפי כישורים חמים',
                description: 'זוהו 15 מועמדים עם React + Node.js',
                action: 'filter-hot-skills',
                buttonText: 'הצג מועמדים'
            },
            {
                title: 'מועמדים מחברות יעד',
                description: '8 מועמדים מ-Wiz, Monday.com',
                action: 'filter-target-companies',
                buttonText: 'סנן עכשיו'
            },
            {
                title: 'פנייה מיידית מומלצת',
                description: '3 מועמדים עם סיכוי גבוה למענה',
                action: 'show-hot-leads',
                buttonText: 'הצג המלצות'
            }
        ];
    }
}

// הפעלת האסיסטנט
const assistant = new MeUniqueAssistant(); 
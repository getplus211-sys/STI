/**
 * ==========================================
 * AUTOMATIC QUIZ LOADER - PAGE DETECTION
 * ==========================================
 * Created by: devendra_dd | KAPiLa Institute
 * 
 * Usage: માત્ર તમારા પેજમાં આ નાખો:
 * 
 * <div id="quiz-container"></div>
 * <script src="quiz-loader.js"></script>
 * 
 * Automatic page detect કરીને quizzes બતાવશે!
 * ==========================================
 */

(function() {
  'use strict';

  /* ================= CONFIG ================= */
  const SUPABASE_URL = "https://bhmycvrbucmbbrpzeane.supabase.co";
  const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobXljdnJidWNtYmJycHplYW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTQwOTYsImV4cCI6MjA4MDI3MDA5Nn0.qQ3bw9cADG0P8hbGwx76Oeg54l-9FbRWxc92nZdSPL4";
  const TEST_ENGINE_URL = "quiz-engine.html";
  const TIMEOUT_MS = 15000;

  /* ================= DETECT PAGE ================= */
  function getCurrentPageSlug() {
    // URL માંથી page name લો (without .html)
    const path = window.location.pathname;
    const filename = path.split('/').pop(); // "gujarati-vyakaran.html"
    const pageSlug = filename.replace('.html', ''); // "gujarati-vyakaran"
    
    console.log('📄 Current Page Slug:', pageSlug);
    return pageSlug;
  }

  /* ================= STYLES ================= */
  const styles = `
    <style>
    .quiz-loader-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .quiz-loader-title {
      text-align: center;
      color: #1e293b;
      margin-bottom: 30px;
      font-size: 2em;
    }

    .quiz-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .quiz-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .quiz-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border-color: #667eea;
    }

    .quiz-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    .quiz-badge.free {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .quiz-badge.paid {
      background: linear-gradient(135deg, #f093fb, #f5576c);
      color: white;
    }

    .quiz-card h3 {
      font-size: 1.3em;
      margin: 10px 0;
      color: #1e293b;
    }

    .quiz-card p {
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 15px;
      font-size: 0.95em;
    }

    .quiz-info {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 10px;
      font-size: 0.9em;
    }

    .quiz-info-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #475569;
    }

    .quiz-start-btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 10px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .quiz-start-btn:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .quiz-start-btn:active {
      transform: scale(0.98);
    }

    .quiz-start-btn.locked {
      opacity: 0.6;
      cursor: not-allowed;
      background: #94a3b8;
    }

    .quiz-loader-loading {
      text-align: center;
      padding: 60px 20px;
    }

    .quiz-loader-spinner {
      font-size: 50px;
      animation: spin 2s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .quiz-loader-error {
      background: #fee;
      border: 2px solid #fcc;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      color: #c00;
      margin: 20px;
    }

    .quiz-loader-empty {
      background: white;
      border-radius: 16px;
      padding: 60px 30px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .quiz-loader-empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }

    .quiz-loader-empty h3 {
      color: #1e293b;
      font-size: 1.5em;
      margin-bottom: 10px;
    }

    .quiz-loader-empty p {
      color: #64748b;
      font-size: 1.1em;
    }
    </style>
  `;

  /* ================= INIT ================= */
  async function init() {
    const container = document.getElementById('quiz-container');
    
    if (!container) {
      console.error('❌ quiz-container element not found!');
      return;
    }

    // Add styles
    const styleSheet = document.createElement('div');
    styleSheet.innerHTML = styles;
    document.head.appendChild(styleSheet.firstElementChild);

    // Get current page slug
    const pageSlug = getCurrentPageSlug();

    // Show loading
    container.innerHTML = `
      <div class="quiz-loader-loading">
        <div class="quiz-loader-spinner">⏳</div>
        <h3>Loading Quizzes...</h3>
        <p>કૃપા કરીને રાહ જુઓ</p>
      </div>
    `;

    try {
      // Initialize Supabase
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

      // Check internet
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      // Fetch quizzes for this page
      const { data: quizzes, error } = await Promise.race([
        sb
          .from("quiz_list")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS)
        )
      ]);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to load quizzes: ' + error.message);
      }

      if (!quizzes || quizzes.length === 0) {
        container.innerHTML = `
          <div class="quiz-loader-empty">
            <div class="quiz-loader-empty-icon">📭</div>
            <h3>આ પેજ માટે કોઈ Quiz ઉપલબ્ધ નથી</h3>
            <p>હાલમાં આ વિષય માટે quiz available નથી.<br>કૃપા કરીને પછીથી ચેક કરો.</p>
          </div>
        `;
        return;
      }

      // Check user for paid quizzes
      const { data: { user } } = await sb.auth.getUser();

      // Render quizzes
      let html = '<div class="quiz-loader-container">';
      html += '<div class="quiz-grid">';

      for (const quiz of quizzes) {
        let canAccess = quiz.is_free;

        // Check access for paid quizzes
        if (!quiz.is_free && user) {
          const { data: access } = await sb
            .from("user_test_access")
            .select("has_access")
            .eq("user_id", user.id)
            .eq("test_id", quiz.quiz_id)
            .maybeSingle();

          canAccess = access && access.has_access;
        }

        // Get question count
        const { count } = await sb
          .from("questions")
          .select("*", { count: 'exact', head: true })
          .eq("test_id", quiz.quiz_id);

        const questionCount = count || quiz.total_questions || 0;

        html += `
          <div class="quiz-card">
            <span class="quiz-badge ${quiz.badge_class}">${quiz.badge_text}</span>
            <h3>${quiz.quiz_name}</h3>
            <p>${quiz.description || 'Mock test તૈયારી માટે'}</p>
            
            <div class="quiz-info">
              <div class="quiz-info-item">
                <span>📝</span>
                <span><strong>${questionCount}</strong> પ્રશ્નો</span>
              </div>
              <div class="quiz-info-item">
                <span>${quiz.is_free ? '✅' : '💎'}</span>
                <span><strong>${quiz.is_free ? 'Free' : 'Paid'}</strong></span>
              </div>
            </div>

            <button 
              class="quiz-start-btn ${!canAccess ? 'locked' : ''}"
              onclick="window.startQuiz_${quiz.quiz_id.replace(/[^a-z0-9]/gi, '_')}()"
              ${!canAccess ? 'disabled' : ''}
            >
              ${canAccess ? '🚀 Start Test' : '🔒 Locked - Payment Required'}
            </button>
          </div>
        `;

        // Create individual start function for each quiz
        window[`startQuiz_${quiz.quiz_id.replace(/[^a-z0-9]/gi, '_')}`] = function() {
          if (canAccess) {
            window.location.href = `${TEST_ENGINE_URL}?quiz=${quiz.quiz_id}`;
          } else {
            alert('🔒 આ test માટે payment જરૂરી છે.\n\nકૃપા કરીને admin સાથે સંપર્ક કરો.');
          }
        };
      }

      html += '</div></div>';
      container.innerHTML = html;

      console.log(`✅ Loaded ${quizzes.length} quizzes for page: ${pageSlug}`);

    } catch (err) {
      console.error('❌ Error loading quizzes:', err);
      container.innerHTML = `
        <div class="quiz-loader-error">
          <h3>⚠️ Error Loading Quizzes</h3>
          <p>${err.message}</p>
          <button onclick="location.reload()" style="margin-top:15px; padding:10px 20px; background:#667eea; color:white; border:none; border-radius:8px; cursor:pointer;">
            Retry
          </button>
        </div>
      `;
    }
  }

  /* ================= AUTO RUN ================= */
  // Wait for Supabase library and DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(init, 100); // Small delay for Supabase to load
    });
  } else {
    setTimeout(init, 100);
  }

})();

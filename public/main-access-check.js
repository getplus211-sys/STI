// Supabase Public/Anon Key નો ઉપયોગ કરીને ક્લાયન્ટ-સાઇડ ક્લાયન્ટ બનાવો
const SUPABASE_URL = "https://bhmycvrbucmbbrpzeane.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobXljdnJidWNtYmJycHplYW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTQwOTYsImV4cCI6MjA4MDI3MDA5Nn0.qQ3bw9cADG0P8hbGwx76Oeg54l-9FbRWxc92nZdSPL4";

// Note: Client-side માં Service Role Key ક્યારેય ન મુકવી!
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. પેજ પરનું કન્ટેન્ટ છુપાવો અને લોડિંગ મેસેજ દેખાડો
function setupPage() {
    const premiumContent = document.getElementById('premium-content');
    const deniedMessage = document.getElementById('access-denied-message');

    if (premiumContent) {
        premiumContent.style.display = 'none'; // Default: છુપાયેલું
    }
    if (deniedMessage) {
        deniedMessage.innerHTML = '<p>Access checking...</p>'; // લોડિંગ મેસેજ
        deniedMessage.style.display = 'block';
    }
}

// 2. મુખ્ય એક્સેસ ચેક ફંક્શન
async function checkPremiumAccess() {
    setupPage();
    
    // a. યુઝર લૉગિન થયેલ છે કે નહીં તે ચેક કરો (Supabase Auth)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // જો યુઝર લૉગિન ન હોય, તો લૉગિન મેસેજ દેખાડો
        const deniedMessage = document.getElementById('access-denied-message');
        if (deniedMessage) {
            deniedMessage.innerHTML = `
                <p>કૃપા કરીને પહેલા લોગિન કરો.</p>
                <button onclick="supabase.auth.signInWithOAuth({ provider: 'google' })">Google વડે લોગિન કરો</button>
            `;
        }
        return; // આગળ વધશો નહીં
    }

    // b. સુરક્ષિત Serverless Function ને કૉલ કરો
    try {
        const response = await fetch('/api/check-payment', { // Vercel API endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
        });

        const result = await response.json();

        const premiumContent = document.getElementById('premium-content');
        const deniedMessage = document.getElementById('access-denied-message');

        if (result.hasAccess === true) {
            // c. જો પેમેન્ટ સફળ હોય તો કન્ટેન્ટ દેખાડો
            if (premiumContent) premiumContent.style.display = 'block';
            if (deniedMessage) deniedMessage.style.display = 'none';
        } else {
            // d. જો પેમેન્ટ ન હોય તો પેમેન્ટ મેસેજ દેખાડો
            if (premiumContent) premiumContent.style.display = 'none';
            if (deniedMessage) {
                deniedMessage.innerHTML = `
                    <p>આ પ્રીમિયમ કન્ટેન્ટ છે. એક્સેસ મેળવવા માટે સબ્સ્ક્રાઇબ કરો.</p>
                    <button onclick="window.location.href='/payment-page.html'">હવે સબ્સ્ક્રાઇબ કરો</button>
                `;
                deniedMessage.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('API Call Error:', error);
        alert('એક્સેસ ચેક કરવામાં ભૂલ આવી.');
    }
}

// પેજ લોડ થાય ત્યારે શરૂ કરો
document.addEventListener('DOMContentLoaded', checkPremiumAccess);

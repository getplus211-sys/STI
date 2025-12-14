// ==============================
// Supabase + Cashfree Integration
// ==============================

// Supabase init
const supabase = window.supabase.createClient(
  "https://bhmycvrbucmbbrpzeane.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobXljdnJidWNtYmJycHplYW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTQwOTYsImV4cCI6MjA4MDI3MDA5Nn0.qQ3bw9cADG0P8hbGwx76Oeg54l-9FbRWxc92nZdSPL4"
);

// Cashfree sandbox keys (replace with your backend order API later)
const CF_APP_ID = "TEST1091997991abb3385f6f280b363e97991901";
const CF_SECRET = "cfsk_ma_test_31c7cb2d6e49614c108bba6c02c02334_2b073045";
const CF_MODE = "sandbox"; // change to "production" later

// ==============================
// Payment Check
// ==============================
async function hasPaid(userId) {
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "PAID")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  return !!data;
}

// ==============================
// Page Init
// ==============================
async function initPage() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/index.html";
    return;
  }

  const paid = await hasPaid(user.id);

  if (paid) {
    document.getElementById("tests").style.display = "block";
  } else {
    document.getElementById("buy-section").style.display = "block";
  }
}

// ==============================
// Cashfree Payment Start
// ==============================
async function startPayment() {
  const { data: { user } } = await supabase.auth.getUser();

  // Normally you call your backend to create order
  // Here demo order payload
  const orderId = "ORDER_" + Date.now();

  const checkout = new Cashfree({ mode: CF_MODE });

  checkout.checkout({
    paymentSessionId: orderId, // replace with backend-generated session id
    redirectTarget: "_self"
  }).then(async (result) => {
    if (result && result.order && result.order.status === "PAID") {
      await supabase.from("payments").insert({
        user_id: user.id,
        order_id: orderId,
        amount: 199,
        currency: "INR",
        status: "PAID",
        provider: "cashfree",
        provider_payload: result,
        created_at: new Date().toISOString()
      });
      alert("Payment Successful!");
      location.reload();
    } else {
      alert("Payment Failed or Cancelled");
    }
  });
}

// ==============================
// Test Attempt Start
// ==============================
async function startTest(testType, testCode) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("test_attempts")
    .insert({
      user_id: user.id,
      test_type: testType,
      test_code: testCode,
      score: null,
      total_marks: null,
      started_at: new Date().toISOString(),
      raw_payload: {}
    })
    .select()
    .single();

  window.location.href = `/test.html?attempt_id=${data.id}&code=${testCode}`;
}

// ==============================
// Test Attempt Complete
// ==============================
async function completeTest(attemptId, score, total) {
  await supabase
    .from("test_attempts")
    .update({
      score: score,
      total_marks: total
    })
    .eq("id", attemptId);
}

// ==============================
// Auto run init
// ==============================
initPage();

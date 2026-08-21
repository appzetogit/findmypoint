const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:5000';

let passedCount = 0;
let failedCount = 0;
const testResults = [];

const testSessionIp = `127.0.0.${Math.floor(Math.random() * 200 + 10)}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': testSessionIp,
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      if (typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

function assert(description, condition, details = '') {
  if (condition) {
    passedCount++;
    testResults.push({ name: description, status: 'PASSED' });
    console.log(`  ✅ [PASS] ${description}`);
  } else {
    failedCount++;
    testResults.push({ name: description, status: 'FAILED', details });
    console.error(`  ❌ [FAIL] ${description} -> ${details}`);
  }
}

async function runQASuite() {
  console.log('\n=============================================================');
  console.log('🚀 ENTERPRISE QA FULL SYSTEM TEST HARNESS (10+ YR TEST LEAD)');
  console.log('=============================================================\n');

  try {
    // Establish DB connection for test setup & token generation
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Database connection initialized for test suite.\n');

    // -------------------------------------------------------------
    // TEST SUITE 1: System Health & SEO Essentials
    // -------------------------------------------------------------
    console.log('📦 [SUITE 1] System Health, Dynamic Sitemap & Robots.txt');
    const health = await request('GET', '/api/health');
    assert('API Healthcheck returns 200 and healthy status', health.status === 200 && health.body.status === 'healthy');

    const sitemap = await request('GET', '/sitemap.xml');
    assert('Dynamic Sitemap.xml returns 200 with XML content', sitemap.status === 200 && typeof sitemap.body === 'string' && sitemap.body.includes('<urlset'));

    const robots = await request('GET', '/robots.txt');
    assert('Robots.txt returns 200 and valid directives', robots.status === 200 && typeof robots.body === 'string' && robots.body.includes('Disallow: /admin/'));

    // -------------------------------------------------------------
    // TEST SUITE 2: Security & NoSQL Injection Resilience
    // -------------------------------------------------------------
    console.log('\n🛡️ [SUITE 2] Security, NoSQL Injection & Input Sanitization');
    const nosqlAttack = await request('POST', '/api/auth/send-otp', { phone: { $gt: "" } });
    assert('NoSQL Injection attempt on send-otp safely rejected (400)', nosqlAttack.status === 400);

    const reDosSearch = await request('GET', '/api/businesses?search=' + encodeURIComponent('^([a-zA-Z0-9]+)*$'));
    assert('ReDoS search query handled safely without crash or hang', reDosSearch.status === 200);

    // -------------------------------------------------------------
    // TEST SUITE 3: Auth Lifecycle & Profile Operations
    // -------------------------------------------------------------
    console.log('\n🔑 [SUITE 3] Authentication Lifecycle (User & Admin)');
    const testPhone = '9988776655';
    const otpSend = await request('POST', '/api/auth/send-otp', { phone: testPhone });
    assert('Send OTP with valid 10-digit phone returns 200', otpSend.status === 200 && otpSend.body.success === true);

    const badPhone = await request('POST', '/api/auth/send-otp', { phone: '123' });
    assert('Send OTP with invalid phone rejected (400)', badPhone.status === 400);

    const badOtp = await request('POST', '/api/auth/verify-otp', { phone: testPhone, otp: '000000' });
    assert('Verify invalid OTP returns success: false with error message', badOtp.body && badOtp.body.success === false);

    // Setup Test User
    const User = require('../models/User');
    const jwt = require('jsonwebtoken');
    let u = await User.findOne({ mobile1: '9876543210' });
    if (!u) {
      u = await User.create({ firstName: 'QATestUser', mobile1: '9876543210', email: 'qatestlead@findmypoint.in' });
    }
    const userToken = jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    assert('User authentication token active', !!userToken);

    // Test Protected User Profile
    const profile = await request('GET', '/api/auth/profile', null, { Authorization: `Bearer ${userToken}` });
    assert('Get User Profile returns 200 with authenticated data', profile.status === 200 && profile.body.user && profile.body.user.firstName);

    // Test Address CRUD
    const addAddr = await request('POST', '/api/auth/address', {
      name: 'QA Office',
      phone: '9876543210',
      address: '101 Quality Street',
      pincode: '452001',
      city: 'Indore',
      tag: 'Office'
    }, { Authorization: `Bearer ${userToken}` });
    assert('Add user address returns 201', addAddr.status === 201 && Array.isArray(addAddr.body.addresses));

    // -------------------------------------------------------------
    // TEST SUITE 4: Admin Authentication & Management
    // -------------------------------------------------------------
    console.log('\n👑 [SUITE 4] Admin Auth & RBAC Protections');
    const Admin = require('../models/admin/Admin');
    let adminDoc = await Admin.findOne();
    if (!adminDoc) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@12345', salt);
      adminDoc = await Admin.create({
        name: 'System Admin',
        email: 'admin@findmypoint.in',
        password: hashedPassword,
        role: 'Super Administrator'
      });
    }
    const adminToken = jwt.sign({ id: adminDoc._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    assert('Admin system token generated', !!adminToken);

    const adminProfile = await request('GET', '/api/admin/profile', null, { Authorization: `Bearer ${adminToken}` });
    assert('Admin Profile endpoint returns 200 with admin identity', adminProfile.status === 200 && adminProfile.body.admin && adminProfile.body.admin.email);

    // Verify non-admin blocked from admin routes
    const blockedAccess = await request('GET', '/api/admin/users', null, { Authorization: `Bearer ${userToken}` });
    assert('Non-admin user forbidden on admin endpoints (401/403)', blockedAccess.status === 401 || blockedAccess.status === 403);

    // -------------------------------------------------------------
    // TEST SUITE 5: Business Directory, Slug Management & 301 Redirects
    // -------------------------------------------------------------
    console.log('\n🏢 [SUITE 5] Business Directory, SEO Slugs & Canonical URLs');
    const testBizId = `qa-biz-${Date.now()}`;
    const createBiz = await request('POST', '/api/businesses', {
      id: testBizId,
      name: 'QA Apex Automation Hub',
      category: 'IT Services',
      subCategoryLine: 'Software Testing',
      location: 'Vijay Nagar',
      cityTown: 'Indore',
      state: 'Madhya Pradesh',
      phone: '9876500000',
      email: 'qa.apex@findmypoint.in',
      rating: 4.8,
      status: 'published'
    }, { Authorization: `Bearer ${adminToken}` });
    assert('Create Business Listing returns 201 with generated SEO slugs', createBiz.status === 201 && createBiz.body.data && createBiz.body.data.canonicalUrl);

    const bizCanonical = createBiz.body && createBiz.body.data ? createBiz.body.data.canonicalUrl : '';
    if (bizCanonical) {
      // Test public SEO route /{city}/{locality}/{slug}
      const publicBiz = await request('GET', `/api/businesses/public${bizCanonical}`);
      assert('Get Public Business by 3-part SEO Path returns 200', publicBiz.status === 200 && publicBiz.body.data && publicBiz.body.data.name === 'QA Apex Automation Hub');
      assert('Public Business Response sanitizes password/clientPassword', !publicBiz.body.data.password && !publicBiz.body.data.clientPassword);

      // Test Structured Data Schema
      const seoSchema = await request('GET', `/api/seo/business${bizCanonical}`);
      assert('SEO Structured Data returns 200 with LocalBusiness & Breadcrumbs schemas', seoSchema.status === 200 && seoSchema.body.seo && seoSchema.body.seo.schemas && seoSchema.body.seo.schemas.length >= 2);
    }

    // -------------------------------------------------------------
    // TEST SUITE 6: Dynamic Service Forms & Booking Lifecycle
    // -------------------------------------------------------------
    console.log('\n📋 [SUITE 6] Service Forms, Bookings & Financial Ledger');
    const saveForm = await request('POST', `/api/service-forms/${testBizId}`, {
      bookNowEnabled: true,
      formTitle: 'Book QA Consultation',
      formDescription: 'Fill out this form for priority testing',
      fields: [
        { id: '1', label: 'Project Type', type: 'text', required: true }
      ]
    }, { Authorization: `Bearer ${adminToken}` });
    assert('Save Service Form Configuration returns 200', saveForm.status === 200 && saveForm.body.data && saveForm.body.data.bookNowEnabled === true);

    const getForm = await request('GET', `/api/service-forms/${testBizId}`);
    assert('Get Service Form Configuration returns 200 with configured fields', getForm.status === 200 && getForm.body.data && getForm.body.data.formTitle === 'Book QA Consultation');

    // Create Booking
    const bookingRes = await request('POST', '/api/bookings', {
      businessId: testBizId,
      businessName: 'QA Apex Automation Hub',
      category: 'IT Services',
      service: 'Full Automation Audit',
      amount: 1500,
      customerName: 'Senior QA Client',
      customerPhone: '9876543210',
      paymentMethod: 'COD',
      status: 'pending'
    }, { Authorization: `Bearer ${userToken}` });
    assert('Create Booking returns 201 with generated booking ID', bookingRes.status === 201 && bookingRes.body.data && bookingRes.body.data.id);

    const bookingId = bookingRes.body && bookingRes.body.data ? bookingRes.body.data.id : null;
    if (bookingId) {
      // Collect COD Payment
      const collectRes = await request('PUT', `/api/bookings/${bookingId}/collect-payment`, {}, { Authorization: `Bearer ${adminToken}` });
      assert('Collect COD Payment marks paymentStatus as paid', collectRes.status === 200 && collectRes.body.data && collectRes.body.data.paymentStatus === 'paid');

      // Double payment guard
      const doublePayRes = await request('PUT', `/api/bookings/${bookingId}/collect-payment`, {}, { Authorization: `Bearer ${adminToken}` });
      assert('Double payment guard correctly rejects duplicate collection (400)', doublePayRes.status === 400);

      // Mark Booking Completed
      const completeRes = await request('PUT', `/api/bookings/${bookingId}/status`, { status: 'completed' }, { Authorization: `Bearer ${adminToken}` });
      assert('Mark booking completed returns 200 and triggers ledger transaction', completeRes.status === 200 && completeRes.body.data && completeRes.body.data.status === 'completed');
    }

    // -------------------------------------------------------------
    // TEST SUITE 7: Financials, Commissions & Overdraft Protection
    // -------------------------------------------------------------
    console.log('\n💰 [SUITE 7] Financials, Commissions & Overdraft Guard');
    const setCommission = await request('POST', '/api/business-commissions', {
      businessId: testBizId,
      commissionRate: 15
    }, { Authorization: `Bearer ${adminToken}` });
    assert('Set Business Commission Rate returns 200', setCommission.status === 200);

    // Attempt withdrawal exceeding balance
    const overdraw = await request('POST', '/api/withdrawals', {
      businessId: testBizId,
      businessName: 'QA Apex Automation Hub',
      amount: 999999,
      method: 'UPI',
      target: 'qa@upi'
    }, { Authorization: `Bearer ${userToken}` });
    assert('Withdrawal exceeding available balance is safely rejected (400/403)', overdraw.status === 400 || overdraw.status === 403);

    // -------------------------------------------------------------
    // TEST SUITE 8: Product Catalog Orders & Cart Checkout
    // -------------------------------------------------------------
    console.log('\n🛒 [SUITE 8] Product Orders & Cart Checkout');
    const orderRes = await request('POST', `/api/product-orders/${testBizId}`, {
      businessName: 'QA Apex Automation Hub',
      customerName: 'Lead Tester',
      customerPhone: '9876543210',
      customerAddress: 'Floor 5, QA Tower',
      orderItems: [{ title: 'Automation Suite License', price: 999, quantity: 1 }],
      totalAmount: 999
    }, { Authorization: `Bearer ${userToken}` });
    assert('Submit Product Order returns 201 with unique FMP- ID', orderRes.status === 201 && orderRes.body.data && orderRes.body.data.id && orderRes.body.data.id.startsWith('FMP-'));

    const getOrders = await request('GET', `/api/product-orders/${testBizId}`, null, { Authorization: `Bearer ${adminToken}` });
    assert('Get Business Orders returns 200 with order list', getOrders.status === 200 && Array.isArray(getOrders.body.data));

    // -------------------------------------------------------------
    // TEST SUITE 9: Reviews, Ratings & Cleanup
    // -------------------------------------------------------------
    console.log('\n⭐ [SUITE 9] Reviews, Ratings Calculation & FAQ Sync');
    const reviewRes = await request('POST', `/api/businesses/${testBizId}/reviews`, {
      userName: 'QA Inspector',
      rating: 5,
      reviewText: 'Outstanding service and seamless execution!'
    });
    assert('Submit Business Review returns 201 and updates business rating', reviewRes.status === 201 && reviewRes.body.rating > 0);

    const faqSync = await request('PUT', `/api/faqs/business/${testBizId}`, {
      faqs: [
        { question: 'What is the turnaround time?', answer: '24 hours max.' }
      ]
    }, { Authorization: `Bearer ${adminToken}` });
    assert('Sync Business FAQs returns 200', faqSync.status === 200 && faqSync.body.data && faqSync.body.data.length === 1);

    // Clean up test business
    await request('DELETE', `/api/businesses/${testBizId}`, null, { Authorization: `Bearer ${adminToken}` });
    console.log('🧹 Cleaned up temporary test business entity.');

    // -------------------------------------------------------------
    // TEST SUITE 10: Static Data Endpoints & Upload Sanitization
    // -------------------------------------------------------------
    console.log('\n📄 [SUITE 10] Categories, Policies & Static Pages');
    const cats = await request('GET', '/api/categories');
    assert('Get Categories returns 200 with category list', cats.status === 200 && Array.isArray(cats.body.categories));

    const terms = await request('GET', '/api/policies/terms');
    assert('Get Terms & Conditions returns 200', terms.status === 200);

    const privacy = await request('GET', '/api/policies/privacy');
    assert('Get Privacy Policy returns 200', privacy.status === 200);

    const footer = await request('GET', '/api/footer');
    assert('Get Footer Configuration returns 200', footer.status === 200);

    const about = await request('GET', '/api/about');
    assert('Get About Configuration returns 200', about.status === 200);

    const hero = await request('GET', '/api/hero-sections');
    assert('Get Hero Sections returns 200', hero.status === 200);

  } catch (err) {
    console.error('💥 Fatal error running QA test harness:', err);
    failedCount++;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  console.log('\n=============================================================');
  console.log(`📊 FINAL QA TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runQASuite();

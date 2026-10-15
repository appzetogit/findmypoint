const axios = require('axios');
const https = require('https');
const path = require('path');
const dotenv = require('dotenv');

// BhashSMS only serves HTTPS. Some VPS environments hang on TLS handshake when strict cert
// validation is used. rejectUnauthorized:false + TLSv1_2 resolves the hang without
// compromising the payload (credentials are already in the URL query string).
const keepAliveHttpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,  // skip cert-chain validation that causes TLS hang on VPS
  secureProtocol: 'TLSv1_2_method' // force TLS 1.2; some VPS firewalls block TLS 1.3 negotiation
});

const REQUEST_TIMEOUT_MS = 20000; // 20s — generous but not excessive

function buildRequestOptions(timeoutMs = REQUEST_TIMEOUT_MS) {
  return {
    headers: {
      'User-Agent': 'FindmyPoint/1.0',
      'Accept': '*/*'
    },
    timeout: timeoutMs,
    httpsAgent: keepAliveHttpsAgent
  };
}

dotenv.config();
if (!process.env.BHASHSMS_USER) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

/**
 * BhashSMS WhatsApp Service for FindmyPoint
 * All credentials and endpoint configs are dynamically loaded from process.env.
 */
class BhashWhatsAppService {
  /**
   * Dynamically fetch credentials from environment variables
   */
  getConfig() {
    const rawEndpoint = process.env.BHASHSMS_ENDPOINT?.trim() || 'https://bhashsms.com/api/sendmsgutil.php';
    // Prefer HTTPS on live server to prevent firewall / ECONNRESET drops
    const endpoint = rawEndpoint.startsWith('http://')
      ? rawEndpoint.replace('http://', 'https://')
      : rawEndpoint;

    return {
      user: process.env.BHASHSMS_USER?.trim() || '',
      pass: process.env.BHASHSMS_PASS?.trim() || '',
      sender: process.env.BHASHSMS_SENDER?.trim() || '',
      endpoint: endpoint,
      regTemplate: process.env.BHASHSMS_REG_TEMPLATE?.trim() || 'registration_portal_02',
      bookingTemplate: process.env.BHASHSMS_BOOKING_TEMPLATE?.trim() || 'service_booking_update_01',
      serviceBookingTemplate: process.env.BHASHSMS_SERVICE_BOOKING_TEMPLATE?.trim() || 'service_booking_update_01',
      leadPaidTemplate: process.env.BHASHSMS_LEAD_PAID_TEMPLATE?.trim() || 'lead_paid_01',
      leadPendingTemplate: process.env.BHASHSMS_LEAD_PENDING_TEMPLATE?.trim() || 'lead_pending_02',
      clientPortalUrl: process.env.CLIENT_PORTAL_URL?.trim() || (process.env.SITE_URL ? `${process.env.SITE_URL}/client` : 'https://findmypoint.app/client')
    };
  }

  /**
   * Check if all required credentials are set in .env
   */
  isConfigured() {
    const config = this.getConfig();
    return !!(config.user && config.pass && config.sender);
  }

  /**
   * Normalize Indian phone number to 10 digits
   * @param {string} phone 
   * @returns {string} 10-digit mobile number
   */
  normalizePhoneNumber(phone) {
    if (!phone) return '';
    // Strip non-digit characters
    const digits = String(phone).replace(/\D/g, '');

    // If 12 digits starting with 91, extract the last 10 digits
    if (digits.length === 12 && digits.startsWith('91')) {
      return digits.slice(-10);
    }
    // If 11 digits starting with 0, extract the last 10 digits
    if (digits.length === 11 && digits.startsWith('0')) {
      return digits.slice(-10);
    }
    // Standard 10-digit number
    if (digits.length === 10) {
      return digits;
    }
    // Fallback: take last 10 digits if longer
    if (digits.length > 10) {
      return digits.slice(-10);
    }
    return digits;
  }

  /**
   * Sanitize an individual parameter string so it doesn't break comma-separated values in BhashSMS URL
   * @param {any} val
   * @returns {string}
   */
  cleanParam(val) {
    if (val === undefined || val === null) return '-';
    // Replace commas with space, ampersands with 'and', strip newlines
    return String(val)
      .replace(/,/g, ' ')
      .replace(/&/g, 'and')
      .replace(/[\r\n]+/g, ' ')
      .trim() || '-';
  }

  /**
   * Send WhatsApp Message via BhashSMS API
   * @param {Object} options
   * @param {string} options.phone - Recipient mobile number
   * @param {string} [options.template] - Template name (text parameter), defaults to BHASHSMS_REG_TEMPLATE from .env
   * @param {Array<string>} [options.params] - Dynamic variables to substitute
   * @returns {Promise<Object>}
   */
  async sendWhatsApp({ phone, template, params = [] }) {
    try {
      const config = this.getConfig();

      if (!config.user || !config.pass || !config.sender) {
        throw new Error('BhashSMS credentials missing in .env (BHASHSMS_USER, BHASHSMS_PASS, BHASHSMS_SENDER). Please configure them in backend/.env.');
      }

      const templateName = (template || config.regTemplate)?.trim();
      if (!templateName) {
        throw new Error('WhatsApp template name missing. Please specify template or set BHASHSMS_REG_TEMPLATE in backend/.env.');
      }

      const cleanPhone = this.normalizePhoneNumber(phone);
      if (!cleanPhone || cleanPhone.length !== 10) {
        throw new Error(`Invalid recipient phone number: "${phone}". Expected 10-digit Indian mobile number.`);
      }

      // Format comma-separated Params
      const cleanedParams = params.map(p => this.cleanParam(p)).join(',');

      // Prepare query parameters
      const queryParams = new URLSearchParams({
        user: config.user,
        pass: config.pass,
        sender: config.sender,
        phone: cleanPhone,
        text: templateName,
        priority: 'wa',
        stype: 'normal'
      });

      // BhashSMS expects literal commas separating each parameter value, with spaces encoded as %20
      let requestUrl = `${config.endpoint}?${queryParams.toString()}`;
      if (cleanedParams.length > 0) {
        requestUrl += `&Params=${encodeURI(cleanedParams)}`;
      }

      console.log(`[WhatsApp API] Sending WhatsApp to: ${cleanPhone} | Template: ${templateName} | Params count: ${params.length}`);

      // bhashsms.com only works over HTTPS (HTTP returns ECONNRESET).
      // TLS hang on VPS is handled by rejectUnauthorized:false + TLSv1_2 on the agent above.
      const startedAt = Date.now();

      // Ensure URL is always HTTPS
      if (requestUrl.startsWith('http://')) {
        requestUrl = requestUrl.replace('http://', 'https://');
      }

      const response = await axios.get(requestUrl, buildRequestOptions());

      const responseData = typeof response.data === 'string'
        ? response.data.trim()
        : JSON.stringify(response.data);

      console.log(`[WhatsApp API] Response for ${cleanPhone} in ${Date.now() - startedAt} ms:`, responseData);

      // Check success condition: BhashSMS returns "S.XXXXX" or "s.XXXXX" or "Message id s.XXXXX"
      const lowerResp = responseData.toLowerCase();
      const isSuccess = lowerResp.startsWith('s.') ||
        lowerResp.includes('message id') ||
        lowerResp.includes('success') ||
        /^s\.\d+/i.test(responseData);

      if (isSuccess) {
        return {
          success: true,
          phone: cleanPhone,
          template: templateName,
          response: responseData,
          messageId: responseData
        };
      }

      // Anything that is not an accepted-message id is a rejection (e.g. "Only Utility or
      // Authentication Templates Supported") — never report it as sent
      throw new Error(`BhashSMS WhatsApp Error: ${responseData || 'empty response'}`);
    } catch (error) {
      console.error(`[WhatsApp API Error]:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send Client Business Registration Credentials to WhatsApp
   * @param {Object} details
   * @param {string} details.phone - Client mobile number
   * @param {string} details.ownerName - Owner or contact name
   * @param {string} details.businessName - Name of the registered business
   * @param {string} details.userId - Login user ID (usually phone or slug)
   * @param {string} details.password - Plain text account password
   * @param {string} details.listingUrl - Public URL of the business listing
   * @param {string} [details.portalUrl] - Login URL for client panel
   * @returns {Promise<Object>}
   */
  async sendBusinessRegistrationCredentials({
    phone,
    ownerName,
    businessName,
    userId,
    password,
    listingUrl,
    portalUrl
  }) {
    const config = this.getConfig();
    const finalPortal = portalUrl || config.clientPortalUrl;
    const finalOwner = ownerName || businessName || 'Valued Partner';
    const finalListing = listingUrl || (process.env.SITE_URL || 'https://findmypoint.app');
    const templateName = config.regTemplate;

    // Guarantee 7-param format for registration_portal_02 and registration_demo
    const includeLabelParam = process.env.BHASHSMS_INCLUDE_LABEL_PARAM === 'true' || 
      templateName === 'registration_portal_02' || 
      templateName === 'registration_demo' ||
      !templateName;
    const labelText = process.env.BHASHSMS_PASSWORD_LABEL?.trim() || 'Password';

    const cleanUserId = this.normalizePhoneNumber(userId) || this.normalizePhoneNumber(phone) || userId || phone;

    let params;
    if (includeLabelParam) {
      params = [
        finalOwner,        // {{1}} Owner Name
        businessName,      // {{2}} Business Name
        finalPortal,       // {{3}} Portal URL
        cleanUserId,       // {{4}} User ID / Mobile
        labelText,         // {{5}} Label (e.g. "Password" or "Access Key")
        password,          // {{6}} Password value
        finalListing       // {{7}} Live Listing URL
      ];
    } else {
      params = [
        finalOwner,        // {{1}} Owner Name
        businessName,      // {{2}} Business Name
        finalPortal,       // {{3}} Portal URL
        cleanUserId,       // {{4}} User ID / Mobile
        password,          // {{5}} Password value
        finalListing       // {{6}} Live Listing URL
      ];
    }

    // If using the sample 'booking_findmy' template which expects 9 params,
    // fill trailing params gracefully so the template doesn't reject
    if (templateName === 'booking_findmy' && params.length < 9) {
      while (params.length < 9) {
        params.push(params.length === 6 ? 'FindmyPoint' : (params.length === 7 ? 'support@findmypoint.app' : 'Active'));
      }
    }

    return await this.sendWhatsApp({
      phone,
      template: templateName,
      params
    });
  }

  /**
   * Send Booking Confirmation to Customer via WhatsApp
   * Approved Template: booking_findmy
   *
   * Template Body:
   * Booking Confirmed! 🎉
   *
   * Namaste {{1}},
   *
   * Aapki booking successfully confirm ho gayi hai! Details neeche di gayi hain:
   *
   * 📋 Booking Details:
   * * Booking ID: #{{2}}
   * * Business/Profile: {{3}}
   * * Service: {{4}}
   * * Date & Time: {{5}} | {{6}}
   * * Total Amount: ₹{{7}} ({{8}})
   * * Location: {{9}}
   *
   * Aapki booking ke related kuch bhi issue ho to Support se connect kare . 
   * Thank you,
   * Team FindmyPoint
   *
   * @param {Object} details
   * @param {string} details.phone - Recipient mobile number
   * @param {string} details.customerName - {{1}} Name
   * @param {string} details.bookingId - {{2}} Booking ID
   * @param {string} details.businessName - {{3}} Business/Profile
   * @param {string} details.service - {{4}} Service
   * @param {string} details.date - {{5}} Date
   * @param {string} details.time - {{6}} Time
   * @param {string|number} details.amount - {{7}} Total Amount
   * @param {string} [details.paymentStatus] - {{8}} Payment mode/status (e.g., "Paid Online" or "COD")
   * @param {string} [details.location] - {{9}} Location/Address
   * @returns {Promise<Object>}
   */
  async sendBookingConfirmation({
    phone,
    customerName,
    bookingId,
    businessName,
    service,
    date,
    time,
    amount,
    paymentStatus,
    location,
    formData
  }) {
    const config = this.getConfig();
    const templateName = config.bookingTemplate || 'booking_findmy';

    // If configured template is service_booking_update_01, gracefully delegate to dynamic 8-param template
    if (templateName === 'service_booking_update_01' || config.serviceBookingTemplate === templateName) {
      return await this.sendDynamicServiceBookingConfirmation({
        phone,
        customerName,
        bookingId,
        businessName,
        serviceTitle: service,
        dynamicDetails: formData || service || 'Service Booking',
        schedule: date && time ? `${date} | ${time}` : (date || time || 'As Scheduled'),
        amount,
        paymentStatus,
        location
      });
    }

    const params = [
      customerName || 'Customer',
      bookingId || 'BK' + Date.now().toString().slice(-6),
      businessName || 'FindmyPoint Partner',
      service || 'Service Booking',
      date || 'Scheduled Date',
      time || 'Scheduled Time',
      String(amount !== undefined && amount !== null ? amount : '0'),
      paymentStatus || 'Paid Online',
      location || 'Indore, MP'
    ];

    return await this.sendWhatsApp({
      phone,
      template: templateName,
      params
    });
  }

  /**
   * Intelligently format custom dynamic form fields into a compact key-value summary.
   * Filters out common standard anchors to avoid redundancy and prevents comma splitting.
   * @param {Object} formData - Dynamic form payload
   * @param {Array<string>} [excludeKeys] - Keys already handled in other template parameters
   * @param {number} [maxChars] - Maximum characters to prevent overly long messages (default: 250)
   * @returns {string} Clean summary like "Doctor: Dr. Verma | Symptoms: Fever | Age: 28"
   */
  buildDynamicSummary(formData, excludeKeys = [], maxChars = 250) {
    if (!formData || typeof formData !== 'object') return 'Service Request Details';

    const defaultExcludes = [
      'name', 'fullname', 'full_name', 'customername', 'customer_name', 'yourname', 'your_name',
      'phone', 'phonenumber', 'phone_number', 'mobile', 'mobilenumber', 'contact', 'whatsapp',
      'email', 'emailaddress', 'email_address',
      'date', 'appointmentdate', 'bookingdate', 'time', 'slot', 'timeslot',
      'amount', 'total', 'price', 'fee', 'payment', 'paymentstatus',
      'address', 'location', 'city', 'id', '_id'
    ];

    const normalizedExcludes = new Set(
      [...defaultExcludes, ...excludeKeys].map(k => String(k).toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    const pairs = [];
    for (const [rawKey, rawVal] of Object.entries(formData)) {
      if (rawVal === undefined || rawVal === null || rawVal === '') continue;

      const normKey = String(rawKey).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedExcludes.has(normKey)) continue;

      let valStr = '';
      if (Array.isArray(rawVal)) {
        valStr = rawVal.join(' + ');
      } else if (typeof rawVal === 'object') {
        valStr = JSON.stringify(rawVal);
      } else {
        valStr = String(rawVal);
      }

      // Replace commas with spaces to prevent breaking BhashSMS comma delimiter
      valStr = valStr.replace(/,/g, ' ').replace(/[\r\n]+/g, ' ').trim();
      const cleanKey = String(rawKey).replace(/,/g, ' ').replace(/[\r\n]+/g, ' ').trim();

      if (cleanKey && valStr) {
        pairs.push(`${cleanKey}: ${valStr}`);
      }
    }

    if (pairs.length === 0) {
      return 'Service Request Submitted';
    }

    let summary = pairs.join(' | ');
    if (summary.length > maxChars) {
      summary = summary.slice(0, maxChars - 3) + '...';
    }
    return summary;
  }

  /**
   * Send Dynamic Service Booking / Order Confirmation to Customer via WhatsApp
   * Approved Template: service_booking_update_01
   *
   * Template Body:
   * Booking Confirmed! 🎉
   *
   * Dear {{1}},
   *
   * Your booking / service request has been successfully received. Here are your details:
   *
   * 📋 Request Details:
   * * Request ID: #{{2}}
   * * Business: {{3}}
   * * Service: {{4}}
   * * Details: {{5}}
   * * Schedule: {{6}}
   * * Amount: {{7}}
   *
   * 📍 Location / Contact: {{8}}
   *
   * For any queries or assistance, please contact the business or FindmyPoint support.
   *
   * Thank you,
   * Team FindmyPoint
   *
   * @param {Object} details
   * @param {string} details.phone - Customer mobile number
   * @param {string} [details.customerName] - {{1}} Customer Name
   * @param {string} [details.bookingId] - {{2}} Request/Booking ID
   * @param {string} [details.businessName] - {{3}} Business Name
   * @param {string} [details.serviceTitle] - {{4}} Service / Form Title
   * @param {string|Object} [details.dynamicDetails] - {{5}} Formatted dynamic summary string OR raw formData
   * @param {string} [details.schedule] - {{6}} Date & Time or Slot
   * @param {string|number} [details.amount] - {{7}} Total amount or "Pay on Visit / Free Consultation"
   * @param {string} [details.paymentStatus] - Payment status / mode
   * @param {string} [details.location] - {{8}} Business location / contact phone
   * @returns {Promise<Object>}
   */
  async sendDynamicServiceBookingConfirmation({
    phone,
    customerName,
    bookingId,
    businessName,
    serviceTitle,
    dynamicDetails,
    schedule,
    amount,
    paymentStatus,
    location
  }) {
    const config = this.getConfig();
    const templateName = config.serviceBookingTemplate || 'service_booking_update_01';

    // Format {{5}} Details: if dynamicDetails is an object, format via buildDynamicSummary
    let finalDetails = '';
    if (typeof dynamicDetails === 'object' && dynamicDetails !== null) {
      finalDetails = this.buildDynamicSummary(dynamicDetails);
    } else {
      finalDetails = dynamicDetails ? String(dynamicDetails) : 'Service Request Submitted';
    }

    // Format {{7}} Amount
    let finalAmount = '';
    const numericAmount = Number(String(amount || '').replace(/[^0-9.]/g, ''));
    const isPaid = Boolean(
      paymentStatus && (
        String(paymentStatus).toLowerCase().includes('paid') ||
        String(paymentStatus).toLowerCase() === 'completed' ||
        String(paymentStatus).toLowerCase() === 'success'
      )
    );

    if (numericAmount > 0) {
      if (isPaid) {
        finalAmount = `Rs. ${numericAmount} (Paid)`;
      } else {
        finalAmount = `Rs. ${numericAmount} (Pending)`;
      }
    } else if (isPaid) {
      finalAmount = 'Paid';
    } else {
      finalAmount = 'Pending';
    }

    const params = [
      customerName || 'Valued Customer',
      bookingId || 'BK' + Date.now().toString().slice(-6),
      businessName || 'FindmyPoint Partner',
      serviceTitle || 'Service Request',
      finalDetails,
      schedule || 'As Scheduled',
      finalAmount,
      location || 'Indore, MP'
    ];

    return await this.sendWhatsApp({
      phone,
      template: templateName,
      params
    });
  }

  /**
   * Send Field Work Listing / Business Lead Generation Confirmation to WhatsApp
   * Approved Templates:
   *   - lead_paid_01 (When payment status is Received / Paid)
   *   - lead_pending_02 (When payment status is Pending)
   *
   * Template Body (lead_paid_01):
   *   *Business Registration Confirmed! 🎉*
   *   Dear {{1}},
   *   Congratulations! Your business registration request has been successfully received on FindmyPoint.
   *   📋 *Registration Details:*
   *   *Business Name:* {{2}}
   *   *Category:* {{3}}
   *   *Request ID:* #{{4}}
   *   *Payment Status:* Received
   *   *Amount Paid:* {{5}}
   *   Your payment has been successfully received. Team FindmyPoint is committed to helping you scale and grow your business. Our team is now reviewing your listing for portal activation.
   *   Thank you,
   *   Team FindmyPoint
   *
   * Template Body (lead_pending_02):
   *   *Business Registration Received! 📋*
   *   Dear {{1}},
   *   Thank you for initiating your business registration request on FindmyPoint.
   *   📋 *Registration Details:*
   *   *Business Name:* {{2}}
   *   *Category:* {{3}}
   *   *Request ID:* #{{4}}
   *   *Payment Status:* Pending
   *   *Amount Due:* {{5}}
   *   Please complete your payment to activate your business listing. Team FindmyPoint is committed to helping you scale and accelerate your business growth.
   *   Thank you,
   *   Team FindmyPoint
   *
   * Both templates use 5 parameters:
   *   {{1}} Owner Name
   *   {{2}} Business Name
   *   {{3}} Category
   *   {{4}} Request ID
   *   {{5}} Amount Paid / Due
   *
   * @param {Object} details
   * @param {string} details.phone - WhatsApp mobile number
   * @param {string} [details.ownerName] - {{1}} Owner Name
   * @param {string} [details.businessName] - {{2}} Business Name
   * @param {string} [details.category] - {{3}} Category of Business
   * @param {string} [details.requestId] - {{4}} Request ID
   * @param {number|string} [details.amount] - {{5}} Amount (Paid or Due)
   * @param {'Paid'|'Pending'} [details.status] - 'Paid' or 'Pending'
   * @returns {Promise<Object>}
   */
  async sendBusinessLeadNotification({
    phone,
    ownerName,
    businessName,
    category,
    requestId,
    amount,
    status = 'Paid'
  }) {
    const config = this.getConfig();
    const isPaid = String(status).toLowerCase() === 'paid';
    const templateName = isPaid ? config.leadPaidTemplate : config.leadPendingTemplate;

    const formattedAmount = (amount !== undefined && amount !== null && Number(amount) > 0)
      ? `Rs. ${amount}`
      : (isPaid ? 'Free' : 'Rs. 0');

    const params = [
      ownerName || 'Valued Partner',                         // {{1}}
      businessName || 'Business Listing',                   // {{2}}
      category || 'General',                                // {{3}}
      requestId || 'REQ' + Date.now().toString().slice(-6), // {{4}}
      formattedAmount                                       // {{5}}
    ];

    return await this.sendWhatsApp({
      phone,
      template: templateName,
      params
    });
  }
}

const bhashWhatsAppService = new BhashWhatsAppService();
module.exports = bhashWhatsAppService;

const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

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
      bookingTemplate: process.env.BHASHSMS_BOOKING_TEMPLATE?.trim() || 'booking_findmy',
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

      // Try secure HTTPS first, fallback to HTTP if SSL error occurs on VPS
      let response;
      try {
        response = await axios.get(requestUrl, {
          headers: {
            'User-Agent': 'FindmyPoint/1.0',
            'Accept': '*/*'
          },
          timeout: 10000 // 10 sec timeout
        });
      } catch (reqErr) {
        if (requestUrl.startsWith('https://')) {
          const httpFallback = requestUrl.replace('https://', 'http://');
          console.warn(`[WhatsApp API] HTTPS request failed (${reqErr.message}), trying HTTP fallback...`);
          response = await axios.get(httpFallback, {
            headers: {
              'User-Agent': 'FindmyPoint/1.0',
              'Accept': '*/*'
            },
            timeout: 10000
          });
        } else {
          throw reqErr;
        }
      }

      const responseData = typeof response.data === 'string'
        ? response.data.trim()
        : JSON.stringify(response.data);

      console.log(`[WhatsApp API] Response for ${cleanPhone}:`, responseData);

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

      // Check known error messages
      if (lowerResp.includes('error') ||
          lowerResp.includes('deactivated') ||
          lowerResp.includes('incorrect') ||
          lowerResp.includes('not exist') ||
          lowerResp.includes('invalid')) {
        throw new Error(`BhashSMS WhatsApp Error: ${responseData}`);
      }

      // Fallback
      return {
        success: true,
        phone: cleanPhone,
        template: templateName,
        response: responseData
      };
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
    location
  }) {
    const config = this.getConfig();
    const templateName = config.bookingTemplate || 'booking_findmy';

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
}

const bhashWhatsAppService = new BhashWhatsAppService();
module.exports = bhashWhatsAppService;

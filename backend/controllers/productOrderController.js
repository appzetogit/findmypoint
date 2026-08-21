const mongoose = require('mongoose');
const ProductOrder = require('../models/ProductOrder');
const Business = require('../models/Business');
const { slugify } = require('../utils/slugify');

// Helper to verify caller owns the business listing or is an Admin
const verifyBusinessAccess = async (req, businessId) => {
  if (!req.user) return false;
  if (req.user.isAdmin === true) return true;
  if (req.user.isBusiness === true && req.user.businessId === businessId) return true;
  if (req.user._id) {
    const isObjectId = mongoose.isValidObjectId(businessId);
    const business = await Business.findOne({
      $or: [
        { id: businessId },
        { slug: slugify(businessId) },
        ...(isObjectId ? [{ _id: businessId }] : [])
      ]
    });
    if (business && (
      (business.owner && business.owner.toString() === req.user._id.toString()) ||
      (req.user.isBusiness && req.user.businessId === business.id)
    )) {
      return true;
    }
  }
  return false;
};

// @desc    Submit a new product order (Cart Checkout)
// @route   POST /api/product-orders/:businessId
// @access  Private (Logged-in customer)
const createOrder = async (req, res) => {
  try {
    const { businessName, customerName, customerPhone, customerAddress, orderItems, totalAmount, notes } = req.body;
    const businessId = req.params.businessId;

    if (!customerName || !customerPhone || !orderItems || !totalAmount) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const formatDateTimeDMY = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // Generate a unique high-entropy FMP-XXXXXX order ID without blocking loops (BUG-016 fix)
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const timeSuffix = Date.now().toString().slice(-4);
    const orderId = `FMP-${timeSuffix}${randSuffix}`;

    const normalizedItems = Array.isArray(orderItems)
      ? orderItems.map(item => ({
          name: item.name || item.title || 'Product Item',
          title: item.title || item.name || 'Product Item',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1
        }))
      : [];

    const order = await ProductOrder.create({
      id: orderId,
      businessId,
      businessName: businessName || '',
      customerName,
      customerPhone,
      customerAddress: customerAddress || '',
      orderItems: normalizedItems,
      totalAmount: Number(totalAmount),
      notes: notes || '',
      status: 'completed', // Defaults to completed since payment is done
      timestamp: formatDateTimeDMY(new Date())
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all product orders for a businessId
// @route   GET /api/product-orders/:businessId
// @access  Private (Client Owner / Admin Auth)
const getOrders = async (req, res) => {
  try {
    const { businessId } = req.params;
    const hasAccess = await verifyBusinessAccess(req, businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to view orders for this business' });
    }

    const orders = await ProductOrder.find({ businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a single product order
// @route   DELETE /api/product-orders/:businessId/:orderId
// @access  Private (Client Owner / Admin Auth)
const deleteOrder = async (req, res) => {
  try {
    const { businessId, orderId } = req.params;
    const hasAccess = await verifyBusinessAccess(req, businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete orders for this business' });
    }

    const result = await ProductOrder.findOneAndDelete({
      id: orderId,
      businessId
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all product orders for a businessId
// @route   DELETE /api/product-orders/:businessId
// @access  Private (Client Owner / Admin Auth)
const clearOrders = async (req, res) => {
  try {
    const { businessId } = req.params;
    const hasAccess = await verifyBusinessAccess(req, businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to clear orders for this business' });
    }

    await ProductOrder.deleteMany({ businessId });
    res.status(200).json({ success: true, message: 'All orders cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  deleteOrder,
  clearOrders
};

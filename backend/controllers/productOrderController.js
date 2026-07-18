const ProductOrder = require('../models/ProductOrder');

// @desc    Submit a new product order (Cart Checkout)
// @route   POST /api/product-orders/:businessId
// @access  Public
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

    // Generate a unique FMP-XXXX format order ID
    let orderId;
    let isUnique = false;
    while (!isUnique) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      orderId = `FMP-${randNum}`;
      const existing = await ProductOrder.findOne({ id: orderId });
      if (!existing) {
        isUnique = true;
      }
    }

    const order = await ProductOrder.create({
      id: orderId,
      businessId,
      businessName: businessName || '',
      customerName,
      customerPhone,
      customerAddress,
      orderItems,
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
// @access  Private (Client/Admin Auth)
const getOrders = async (req, res) => {
  try {
    const orders = await ProductOrder.find({ businessId: req.params.businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a single product order
// @route   DELETE /api/product-orders/:businessId/:orderId
// @access  Private (Client/Admin Auth)
const deleteOrder = async (req, res) => {
  try {
    const result = await ProductOrder.findOneAndDelete({
      id: req.params.orderId,
      businessId: req.params.businessId
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
// @access  Private (Client/Admin Auth)
const clearOrders = async (req, res) => {
  try {
    await ProductOrder.deleteMany({ businessId: req.params.businessId });
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

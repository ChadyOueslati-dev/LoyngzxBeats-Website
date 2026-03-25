const Order = require('../models/Order');
const Beat = require('../models/Beat');

// GET all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('beat').sort({ createdAt: -1 });
    const stats = {
      total: orders.length,
      completed: orders.filter(o => o.status === 'completed').length,
      revenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0)
    };
    res.render('orders/index', { orders, stats });
  } catch (err) {
    req.session.error = 'Failed to load orders';
    res.redirect('/');
  }
};

// GET single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('beat');
    if (!order) return res.status(404).render('404');
    res.render('orders/show', { order });
  } catch (err) {
    res.status(404).render('404');
  }
};

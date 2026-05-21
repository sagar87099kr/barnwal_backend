const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Product = require('../models/Product');

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('products.product');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a bill and reduce stock
router.post('/', async (req, res) => {
  const session = await Bill.startSession();
  session.startTransaction();
  
  try {
    const { products, totalAmount } = req.body;
    
    // Generate bill number (simple logic: current timestamp)
    const billNumber = `INV-${Date.now()}`;
    
    // Create new bill
    const newBill = new Bill({
      billNumber,
      products,
      totalAmount
    });
    
    await newBill.save({ session });
    
    // Reduce stock for each product
    for (const item of products) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }
      
      if (product.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${item.name}. Available: ${product.quantity}`);
      }
      
      product.quantity -= item.quantity;
      await product.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json(newBill);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ quantity: { $lt: 10 } }); // Threshold 10
    
    // Today's sales
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaysBills = await Bill.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const todaysRevenue = todaysBills.reduce((acc, bill) => acc + bill.totalAmount, 0);
    const todaysSalesCount = todaysBills.length;
    
    // Total revenue
    const allBills = await Bill.find();
    const totalRevenue = allBills.reduce((acc, bill) => acc + bill.totalAmount, 0);
    
    res.json({
      totalProducts,
      lowStockProducts,
      todaysSalesCount,
      todaysRevenue,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

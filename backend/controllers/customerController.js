import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';

// @desc  Get all customers
// @route GET /api/customers
const getCustomers = async (req, res) => {
    const customers = await Customer.find({}).sort({ totalSpent: -1 });
    res.json(customers);
};

// @desc  Get single customer with purchase history
// @route GET /api/customers/:id
const getCustomerById = async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) { res.status(404); throw new Error('Customer not found'); }

    const sales = await Sale.find({ customer: customer._id })
        .populate('products.product', 'name price')
        .sort({ createdAt: -1 })
        .limit(20);

    res.json({ customer, sales });
};

// @desc  Create customer
// @route POST /api/customers
const createCustomer = async (req, res) => {
    const { name, email, phone, address, notes } = req.body;
    if (!name) { res.status(400); throw new Error('Name is required'); }

    const customer = await Customer.create({
        name, email, phone, address, notes, user: req.user._id
    });
    res.status(201).json(customer);
};

// @desc  Update customer
// @route PUT /api/customers/:id
const updateCustomer = async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) { res.status(404); throw new Error('Customer not found'); }

    Object.assign(customer, req.body);
    const updated = await customer.save();
    res.json(updated);
};

// @desc  Delete customer
// @route DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) { res.status(404); throw new Error('Customer not found'); }
    res.json({ message: 'Customer deleted' });
};

// @desc  Search customers
// @route GET /api/customers/search?q=
const searchCustomers = async (req, res) => {
    const { q } = req.query;
    const customers = await Customer.find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } },
        ]
    }).limit(10);
    res.json(customers);
};

export { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, searchCustomers };

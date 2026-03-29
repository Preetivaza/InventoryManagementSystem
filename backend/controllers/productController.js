import Product from '../models/Product.js';

// @desc    Fetch all products with pagination and search
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
        ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { sku: { $regex: req.query.keyword, $options: 'i' } },
                { barcode: { $regex: req.query.keyword, $options: 'i' } }
            ]
        }
        : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { name, price, costPrice, description, image, category, quantity, sku, barcode, supplier, minStockLevel, tags } = req.body;

    if (!name || !price || !sku) {
        res.status(400);
        throw new Error('Name, price, and SKU are required');
    }

    const product = new Product({
        name,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice) || 0,
        user: req.user._id,
        image: image || '/images/sample.jpg',
        category: category || 'Other',
        quantity: parseInt(quantity) || 0,
        description: description || '',
        sku,
        barcode: barcode || '',
        supplier: supplier || '',
        minStockLevel: parseInt(minStockLevel) || 10,
        tags: tags || []
    });

    const created = await product.save();
    res.status(201).json(created);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, price, costPrice, description, image, category, quantity, sku, barcode, supplier, minStockLevel, tags } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.name = name ?? product.name;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.costPrice = costPrice !== undefined ? parseFloat(costPrice) : product.costPrice;
    product.description = description ?? product.description;
    product.image = image ?? product.image;
    product.category = category ?? product.category;
    product.quantity = quantity !== undefined ? parseInt(quantity) : product.quantity;
    product.sku = sku ?? product.sku;
    product.barcode = barcode ?? product.barcode;
    product.supplier = supplier ?? product.supplier;
    product.minStockLevel = minStockLevel !== undefined ? parseInt(minStockLevel) : product.minStockLevel;
    product.tags = tags ?? product.tags;

    const updated = await product.save();
    res.json(updated);
};

export { getProducts, getProductById, deleteProduct, createProduct, updateProduct };

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all active categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ order: 1, name: 1 })
            .select('-__v');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get single category
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// Create category (protected - admin only for now, using auth middleware)
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, icon, order } = req.body;

        // Check if category already exists
        const existing = await Category.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const category = new Category({
            name: name.trim(),
            description: description?.trim(),
            icon: icon || '📁',
            order: order || 0
        });

        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Update category
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description, icon, isActive, order } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (name) category.name = name.trim();
        if (description !== undefined) category.description = description?.trim();
        if (icon) category.icon = icon;
        if (isActive !== undefined) category.isActive = isActive;
        if (order !== undefined) category.order = order;

        await category.save();
        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;

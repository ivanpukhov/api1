const Order = require('../models/Order');

const orderController = {
    createOrder(req, res) {
        const {firstName, lastName, phoneNumber, address, products, deliveryMethod, paymentMethod} = req.body;
        if (!firstName || !lastName || !phoneNumber || !address || !products || !products.length || !deliveryMethod || !paymentMethod) {
            return res.status(400).json({error: 'All fields are required'});
        }

        Order.create({
            firstName,
            lastName,
            phoneNumber,
            address,
            products,
            deliveryMethod,
            paymentMethod
        }, function (err) {
            if (err) {
                console.error("Error occurred:", err);
                return res.status(500).json({error: 'Failed to create order'});
            }
            res.status(200).json({message: 'Order created successfully'});
        });
    },

    deleteOrder(req, res) {
        Order.delete(req.params.id, function(err) {
            if (err) return res.status(500).json({error: 'Failed to delete order'});
            res.status(200).json({message: 'Order deleted successfully'});
        });
    },

    updateOrder(req, res) {
        const {firstName, lastName, phoneNumber, address, products, deliveryMethod, paymentMethod} = req.body;
        Order.update(req.params.id, {firstName, lastName, phoneNumber, address, products, deliveryMethod, paymentMethod}, function(err) {
            if (err) return res.status(500).json({error: 'Failed to update order'});
            res.status(200).json({message: 'Order updated successfully'});
        });
    },


    getAllOrders(req, res) {
        Order.getAll(function (err, orders) {
            if (err) return res.status(500).json({error: 'Failed to fetch orders'});
            res.status(200).json(orders);
        });
    }, getOrderById(req, res) {
        Order.getById(req.params.id, function (err, order) {
            if (err) return res.status(500).json({error: 'Failed to fetch order'});
            if (!order) return res.status(404).json({error: 'Order not found'});
            res.status(200).json(order);
        });
    }, updateOrderStatus(req, res) {
        Order.updateStatus(req.params.id, req.body.status, function (err) {
            if (err) return res.status(500).json({error: 'Failed to update order status'});
            res.status(200).json({message: 'Order status updated successfully'});
        });
    },
};

module.exports = orderController;

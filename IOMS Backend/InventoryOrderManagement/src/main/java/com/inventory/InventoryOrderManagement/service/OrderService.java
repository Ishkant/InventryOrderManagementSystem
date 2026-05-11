package com.inventory.InventoryOrderManagement.service;

import com.inventory.InventoryOrderManagement.entity.Order;
import com.inventory.InventoryOrderManagement.entity.Product;
import com.inventory.InventoryOrderManagement.repository.OrderRepository;
import com.inventory.InventoryOrderManagement.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    // Create a new order (no stock check here, just creating the order)
    public Order createOrder(Order order) {
        logger.info("Creating order: {}", order);
        return orderRepository.save(order);
    }

    // Place an order (check stock, reduce quantity, and save order)
    public Order placeOrder(Order order) {
        logger.info("Placing order: {}", order);

        // Validate the order object
        if (order == null || order.getProductId() == null || order.getQuantity() <= 0) {
            logger.error("Invalid order data: {}", order);
            throw new RuntimeException("Invalid order data");
        }

        // Fetch the product from the database
        Product product = productRepository.findById(order.getProductId())
                .orElseThrow(() -> {
                    logger.error("Product not found with ID: {}", order.getProductId());
                    return new RuntimeException("Product not found with ID: " + order.getProductId());
                });

        // Check if there is sufficient stock
        if (product.getQuantity() < order.getQuantity()) {
            logger.error("Insufficient stock for product: {}", product.getName());
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }

        // Update product stock
        product.setQuantity(product.getQuantity() - order.getQuantity());
        productRepository.save(product);

        // Set additional fields in the order
        order.setProductName(product.getName()); // Set product name
        order.setStatus("pending"); // Default status
        order.setOrderDate(java.time.LocalDate.now()); // Set order date

        // Save the order
        return orderRepository.save(order);
    }

    // Get all orders
    public List<Order> getAllOrders() {
        logger.info("Fetching all orders");
        return orderRepository.findAll();
    }

    // Update order status
    public Order updateOrderStatus(Long id, String status) {
        logger.info("Updating order status for order ID: {} to status: {}", id, status);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Order not found with ID: {}", id);
                    return new RuntimeException("Order not found with ID: " + id);
                });
        order.setStatus(status);
        return orderRepository.save(order);
    }

    // Delete an order
    public void deleteOrder(Long id) {
        logger.info("Deleting order with ID: {}", id);
        if (!orderRepository.existsById(id)) {
            logger.error("Order not found with ID: {}", id);
            throw new RuntimeException("Order not found with ID: " + id);
        }
        orderRepository.deleteById(id); // Delete the order by ID
    }
}
package com.inventory.InventoryOrderManagement.controller;

import com.inventory.InventoryOrderManagement.entity.Order;
import com.inventory.InventoryOrderManagement.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://127.0.0.1:5500") // Allow requests from frontend
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    // Create a new order
    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        try {
            logger.info("Received request to create order: {}", order);
            Order createdOrder = orderService.createOrder(order);
            return ResponseEntity.ok(createdOrder);
        } catch (RuntimeException e) {
            logger.error("Error creating order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Get all orders
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            logger.info("Fetching all orders");
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            logger.error("Error fetching orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Place an order (place order after checking stock and updating quantity)
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        try {
            logger.info("Received request to place order: {}", order);
            if (order.getOrderDate() == null) {
                order.setOrderDate(LocalDate.now()); // Set order date if not provided
            }
            Order placedOrder = orderService.placeOrder(order);
            return ResponseEntity.ok(placedOrder);
        } catch (RuntimeException e) {
            logger.error("Error placing order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Update the order's status
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody String status) {
        try {
            logger.info("Received request to update order status for order ID: {} to status: {}", id, status);
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            logger.error("Error updating order status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Remove an order
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            logger.info("Received request to delete order with ID: {}", id);
            orderService.deleteOrder(id); // Call the service to delete the order
            return ResponseEntity.noContent().build(); // Return a 204 No Content response
        } catch (RuntimeException e) {
            logger.error("Error deleting order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); // Return 404 if the order is not found
        }
    }
}
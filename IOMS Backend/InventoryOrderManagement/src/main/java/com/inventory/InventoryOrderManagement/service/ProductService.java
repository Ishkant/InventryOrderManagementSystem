package com.inventory.InventoryOrderManagement.service;

import com.inventory.InventoryOrderManagement.entity.Product;
import com.inventory.InventoryOrderManagement.exception.TotalProductLimitExceededException;
import com.inventory.InventoryOrderManagement.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private static final int MAX_TOTAL_QUANTITY = 100000;

    @Autowired
    private ProductRepository productRepository;

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Search products by name or category
    public List<Product> searchProducts(String name, String category) {
        if (category != null && !category.isEmpty()) {
            return productRepository.findByCategory(category);
        } else {
            return productRepository.findByNameContainingIgnoreCase(name);
        }
    }

    // Create or update product
    public Product createProduct(Product product) {
        int currentTotal = calculateTotalQuantity();
        if (currentTotal + product.getQuantity() > MAX_TOTAL_QUANTITY) {
            throw new TotalProductLimitExceededException(
                    "Cannot add product. Total quantity exceeds the limit of " + MAX_TOTAL_QUANTITY);
        }
        return productRepository.save(product);
    }

    // Update an existing product by ID
    public Product updateProduct(Long id, Product product) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product existing = existingProduct.get();
            int currentTotal = calculateTotalQuantity() - existing.getQuantity();
            if (currentTotal + product.getQuantity() > MAX_TOTAL_QUANTITY) {
                throw new TotalProductLimitExceededException(
                        "Cannot update product. Total quantity exceeds the limit of " + MAX_TOTAL_QUANTITY);
            }

            product.setId(id);
            return productRepository.save(product);
        }
        throw new RuntimeException("Product not found");  // Throw an exception if product not found
    }

    // Delete product by ID
    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            reorderProductIds();  // Reorder IDs after deletion
            return true;
        }
        return false;
    }

    // Reorder product IDs sequentially
    private void reorderProductIds() {
        List<Product> products = productRepository.findAll();
        long newId = 1;
        for (Product product : products) {
            product.setId(newId++);
            productRepository.save(product);
        }
    }

    // Save a product (this is similar to createProduct)
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    // Get product by ID
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    // Calculate Total Quantity
    private int calculateTotalQuantity() {
        return productRepository.findAll()
                .stream()
                .mapToInt(Product::getQuantity)
                .sum();
    }
}
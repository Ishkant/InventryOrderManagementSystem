package com.inventory.InventoryOrderManagement.controller;

import com.inventory.InventoryOrderManagement.entity.Product;
import com.inventory.InventoryOrderManagement.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Get all products or search by name/category
    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) String search,
                                        @RequestParam(required = false) String category) {
        if (search == null && category == null) {
            return productService.getAllProducts();
        }
        return productService.searchProducts(search, category);
    }

    // Get a product by its ID
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // Add a new product with total quantity limitation
    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        if (product.getName() == null || product.getName().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be null or empty");
        }
        return productService.createProduct(product);
    }

    // Update an existing product with total quantity limitation
    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        if (product.getName() == null || product.getName().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be null or empty");
        }
        return productService.updateProduct(id, product);
    }

    // Delete a product by ID
    @DeleteMapping("/{id}")
    public boolean deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id);
    }
}

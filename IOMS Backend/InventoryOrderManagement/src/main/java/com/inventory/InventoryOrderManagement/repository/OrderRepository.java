package com.inventory.InventoryOrderManagement.repository;

import com.inventory.InventoryOrderManagement.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {}

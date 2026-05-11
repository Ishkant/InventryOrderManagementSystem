package com.inventory.InventoryOrderManagement.exception;

public class TotalProductLimitExceededException extends RuntimeException {
    public TotalProductLimitExceededException(String message) {
        super(message);
    }
}

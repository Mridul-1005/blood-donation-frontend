// exception/ResourceNotFoundException.java
package com.blooddonation.demo.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
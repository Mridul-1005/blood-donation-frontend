// exception/DuplicateResourceException.java
package com.blooddonation.demo.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
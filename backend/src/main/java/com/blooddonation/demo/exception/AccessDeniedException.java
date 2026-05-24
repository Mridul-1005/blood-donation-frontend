// exception/AccessDeniedException.java
package com.blooddonation.demo.exception;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}
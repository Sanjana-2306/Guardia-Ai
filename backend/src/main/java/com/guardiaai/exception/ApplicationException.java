package com.guardiaai.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Custom application exception for consistent error handling
 */
@Getter
public class ApplicationException extends RuntimeException {
    private final HttpStatus status;
    private final String details;

    public ApplicationException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.details = message;
    }

    public ApplicationException(String message, HttpStatus status, String details) {
        super(message);
        this.status = status;
        this.details = details;
    }

    public static ApplicationException badRequest(String message) {
        return new ApplicationException(message, HttpStatus.BAD_REQUEST);
    }

    public static ApplicationException unauthorized(String message) {
        return new ApplicationException(message, HttpStatus.UNAUTHORIZED);
    }

    public static ApplicationException forbidden(String message) {
        return new ApplicationException(message, HttpStatus.FORBIDDEN);
    }

    public static ApplicationException notFound(String message) {
        return new ApplicationException(message, HttpStatus.NOT_FOUND);
    }

    public static ApplicationException internalError(String message) {
        return new ApplicationException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

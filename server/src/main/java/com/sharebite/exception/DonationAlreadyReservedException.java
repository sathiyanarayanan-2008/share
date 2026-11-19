package com.sharebite.exception;

public class DonationAlreadyReservedException extends RuntimeException {
    public DonationAlreadyReservedException(String message) {
        super(message);
    }
}

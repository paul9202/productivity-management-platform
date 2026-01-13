package com.productivityx.service;

import com.productivityx.model.DeviceCertificate;

public interface CertificateService {
    /**
     * Issue a certificate for a device.
     * @param deviceId The device ID (CN).
     * @param password The password to protect the PFX.
     * @return Byte array containing the PFX data.
     */
    byte[] issueCertificate(String deviceId, String password, String thumbprintHolder);
}

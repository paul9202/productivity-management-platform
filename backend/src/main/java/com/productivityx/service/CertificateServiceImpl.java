package com.productivityx.service;

import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Service
@Slf4j
public class CertificateServiceImpl implements CertificateService {

    @Value("${productivityx.security.pki-mode:MOCK}")
    private String pkiMode;

    @Override
    public byte[] issueCertificate(String deviceId, String password, String thumbprintHolder) {
        if ("REAL".equalsIgnoreCase(pkiMode)) {
            return generateRealPfx(deviceId, password, thumbprintHolder);
        } else {
            return generateMockPfx(deviceId);
        }
    }

    private byte[] generateMockPfx(String deviceId) {
        log.info("Generating MOCK PFX for device: {}", deviceId);
        String mockContent = "MOCK_PFX_DATA_BASE64_ENCODED_FOR_" + deviceId;
        return mockContent.getBytes();
    }

    private byte[] generateRealPfx(String deviceId, String password, String thumbprintHolder) {
        log.info("Generating REAL PFX (Self-Signed) for device: {}", deviceId);
        try {
            // 1. Generate KeyPair (RSA 2048)
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(2048);
            KeyPair keyPair = keyGen.generateKeyPair();

            // 2. Build Certificate
            long now = System.currentTimeMillis();
            Date startDate = new Date(now);
            Date endDate = new Date(now + 365L * 24 * 60 * 60 * 1000); // 1 Year

            X500Name subject = new X500Name("CN=" + deviceId + ", O=ProductivityX, OU=Devices");
            BigInteger serial = new BigInteger(64, new java.security.SecureRandom());

            X509v3CertificateBuilder certBuilder = new JcaX509v3CertificateBuilder(
                    subject, // Issuer (Self-signed)
                    serial,
                    startDate,
                    endDate,
                    subject, // Subject
                    keyPair.getPublic()
            );

            ContentSigner signer = new JcaContentSignerBuilder("SHA256WithRSA").build(keyPair.getPrivate());
            X509Certificate cert = new JcaX509CertificateConverter().getCertificate(certBuilder.build(signer));

            // 3. Store in PFX (PKCS12)
            KeyStore pfxStore = KeyStore.getInstance("PKCS12");
            pfxStore.load(null, null);
            pfxStore.setKeyEntry("identity", keyPair.getPrivate(), password.toCharArray(), new java.security.cert.Certificate[]{cert});

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            pfxStore.store(baos, password.toCharArray());
            
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate real PFX", e);
            throw new RuntimeException("Certificate Generation Failed", e);
        }
    }
}

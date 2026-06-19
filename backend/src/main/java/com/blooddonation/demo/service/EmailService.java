package com.blooddonation.demo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private static final String FROM_EMAIL = "BloodLink <mhmridul193@gmail.com>";

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        String subject = "BloodLink - Password Reset Request";
        String htmlContent = buildPasswordResetHtmlEmail(userName, resetLink);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage(), e);
        }
    }

    private String buildPasswordResetHtmlEmail(String userName, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #e53935 0%%, #c62828 100%%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">BloodLink</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Save Lives, Share Life</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #333333; margin: 0 0 20px; font-size: 22px;">Hello, %s!</h2>

                        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                            We received a request to reset your password. Click the button below to create a new password for your account.
                        </p>

                        <div style="text-align: center; margin: 35px 0;">
                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #e53935 0%%, #c62828 100%%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 10px rgba(229,57,53,0.3);">
                                Reset Password
                            </a>
                        </div>

                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                            Or copy and paste this link into your browser:
                        </p>

                        <p style="color: #e53935; font-size: 13px; word-break: break-all; margin: 0 0 30px;">
                            %s
                        </p>

                        <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; border-radius: 0 5px 5px 0; margin: 25px 0;">
                            <p style="color: #e65100; font-size: 13px; margin: 0; line-height: 1.5;">
                                <strong>Security Notice:</strong> This link will expire in 60 minutes. If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                            </p>
                        </div>

                        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">

                        <p style="color: #999999; font-size: 12px; margin: 0; text-align: center;">
                            This is an automated message from BloodLink. Please do not reply to this email.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="background: #f5f5f5; padding: 20px; text-align: center;">
                        <p style="color: #999999; font-size: 12px; margin: 0;">
                            &copy; 2024 BloodLink. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, resetLink, resetLink);
    }
}
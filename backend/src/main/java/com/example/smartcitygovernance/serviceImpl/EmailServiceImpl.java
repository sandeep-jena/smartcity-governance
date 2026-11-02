package com.example.smartcitygovernance.serviceImpl;

import com.example.smartcitygovernance.service.EmailService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }



    @Override
    public void sendAssignmentEmail(String toEmail, String officerName,
                                    String complaintTitle, Long complaintId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(toEmail);
            helper.setSubject("🏙️ New Complaint Assigned — SmartCity Governance");
            helper.setText(buildEmailTemplate(officerName, complaintTitle, complaintId), true);
            mailSender.send(message);
            System.out.println("✅ Email sent to: " + toEmail);
        } catch (Exception e) {
            // Don't crash — just log the error
            System.err.println("⚠️ Email failed (non-critical): " + e.getMessage());
        }
    }
    private String buildEmailTemplate(String officerName,
                                      String complaintTitle,
                                      Long complaintId) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a4731; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px;">🏙️ SmartCity Governance</h1>
                    <p style="color: #4caf7d; margin: 8px 0 0;">Complaint Assignment Notification</p>
                </div>
                <div style="background: #fff; padding: 32px; border: 1px solid #e0ede5;">
                    <h2 style="color: #1a2e1f;">Hello, %s 👮</h2>
                    <p style="color: #6b9e80; font-size: 16px;">
                        A new complaint has been assigned to you. Please review and take action.
                    </p>
                    <div style="background: #f0f7f0; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf7d;">
                        <p style="margin: 0; color: #1a4731; font-weight: bold;">Complaint #%d</p>
                        <p style="margin: 8px 0 0; color: #1a2e1f; font-size: 18px;">%s</p>
                    </div>
                    <a href="http://localhost:3000/officer"
                       style="display: inline-block; background: #1a4731; color: #fff;
                              padding: 12px 24px; border-radius: 8px; text-decoration: none;
                              font-weight: bold; margin-top: 16px;">
                        View Complaint →
                    </a>
                </div>
                <div style="background: #f8fbf9; padding: 16px; border-radius: 0 0 12px 12px;
                            text-align: center; border: 1px solid #e0ede5; border-top: none;">
                    <p style="color: #6b9e80; font-size: 12px; margin: 0;">
                        SmartCity Governance Portal — Bhubaneswar
                    </p>
                </div>
            </div>
            """.formatted(officerName, complaintId, complaintTitle);
    }
}

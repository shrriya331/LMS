package com.infy.lms.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:#{null}}")
    private String fromAddress;

    @Value("${app.mail.from-name:#{null}}")
    private String fromName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Simple email (text/html allowed)
     */
    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            if (fromAddress != null && !fromAddress.isBlank()) {
                helper.setFrom(fromAddress, fromName == null ? null : fromName);
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true -> HTML
            mailSender.send(msg);
        } catch (Exception e) {
            // Logging rather than failing the app — admin action should not crash whole request
            e.printStackTrace();
            // Optionally rethrow if you want it to be a hard failure.
        }
    }

    /**
     * Send email and attach a file from filesystem (pathFromServer must be accessible)
     */
    public void sendEmailWithAttachment(String to, String subject, String htmlBody, String pathFromServer) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            if (fromAddress != null && !fromAddress.isBlank()) {
                helper.setFrom(fromAddress, fromName == null ? null : fromName);
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            if (pathFromServer != null && !pathFromServer.isBlank()) {
                File file = new File(pathFromServer);
                if (file.exists() && file.isFile()) {
                    FileSystemResource fr = new FileSystemResource(file);
                    helper.addAttachment(file.getName(), fr);
                }
            }

            mailSender.send(msg);
        } catch (MessagingException me) {
            me.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

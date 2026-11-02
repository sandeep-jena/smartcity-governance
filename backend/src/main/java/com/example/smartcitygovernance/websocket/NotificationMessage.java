package com.example.smartcitygovernance.websocket;

public class NotificationMessage {
    private String type;
    private String message;
    private Long complaintId;
    private String complaintTitle;
    private String officerUsername;

    public NotificationMessage() {}

    public NotificationMessage(String type, String message,
                               Long complaintId, String complaintTitle,
                               String officerUsername) {
        this.type            = type;
        this.message         = message;
        this.complaintId     = complaintId;
        this.complaintTitle  = complaintTitle;
        this.officerUsername = officerUsername;
    }

    public String getType()            { return type; }
    public String getMessage()         { return message; }
    public Long getComplaintId()       { return complaintId; }
    public String getComplaintTitle()  { return complaintTitle; }
    public String getOfficerUsername() { return officerUsername; }

    public void setType(String type)                       { this.type = type; }
    public void setMessage(String message)                 { this.message = message; }
    public void setComplaintId(Long complaintId)           { this.complaintId = complaintId; }
    public void setComplaintTitle(String complaintTitle)   { this.complaintTitle = complaintTitle; }
    public void setOfficerUsername(String officerUsername) { this.officerUsername = officerUsername; }
}
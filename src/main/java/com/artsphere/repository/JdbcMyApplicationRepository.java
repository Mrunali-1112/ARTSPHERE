package com.artsphere.repository;

import com.artsphere.model.dto.MyApplicationItemResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Repository
public class JdbcMyApplicationRepository implements MyApplicationRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcMyApplicationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<MyApplicationItemResponse> eventRowMapper = (rs, rowNum) -> {
        MyApplicationItemResponse item = new MyApplicationItemResponse();
        item.setId(rs.getLong("registration_id"));
        item.setType("EVENT");
        Long eventId = rs.getLong("event_id");
        item.setReferenceId(eventId);
        String eventType = rs.getString("event_type");
        item.setTag(eventType != null && !eventType.isBlank() ? eventType : "Workshop");
        item.setTitle(rs.getString("title"));
        String organizer = rs.getString("organizer");
        item.setOrganizer(organizer != null && !organizer.isBlank() ? organizer : "ArtSphere Community");
        item.setDate(rs.getString("event_date"));
        item.setTime(rs.getString("event_time"));
        String venue = rs.getString("venue");
        String location = rs.getString("location");
        item.setLocation(venue != null && !venue.isBlank() ? venue : location);
        String img = rs.getString("image_url");
        item.setImageUrl(img != null && !img.isBlank() ? img : "/images/comm_event_watercolor.png");
        item.setStatus("Registered");
        item.setStatusGroup("UPCOMING");
        item.setStatusMessage("See you there!");
        item.setDetailUrl("/pages/event-details.html?id=" + eventId);

        Timestamp regAt = rs.getTimestamp("registered_at");
        if (regAt != null) {
            item.setAppliedAt(regAt.toLocalDateTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        }
        return item;
    };

    private final RowMapper<MyApplicationItemResponse> collabRowMapper = (rs, rowNum) -> {
        MyApplicationItemResponse item = new MyApplicationItemResponse();
        item.setId(rs.getLong("request_id"));
        item.setType("COLLABORATION");
        long collabId = rs.getLong("collaboration_id");
        item.setReferenceId(collabId > 0 ? collabId : 501L);
        String collabType = rs.getString("collaboration_type");
        item.setTag(collabType != null && !collabType.isBlank() ? collabType : "Collaboration");
        String collabTitle = rs.getString("collab_title");
        String receiverName = rs.getString("receiver_name");
        item.setTitle(collabTitle != null && !collabTitle.isBlank() ? collabTitle : ("Collaboration with " + (receiverName != null ? receiverName : "Artist")));
        item.setOrganizer(receiverName != null && !receiverName.isBlank() ? receiverName : "Creative Artist");

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            item.setDate(createdAt.toLocalDateTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
            item.setAppliedAt(createdAt.toLocalDateTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        } else {
            item.setDate("Recent");
        }
        item.setTime("Flexible");
        String collabLoc = rs.getString("collab_location");
        item.setLocation(collabLoc != null && !collabLoc.isBlank() ? collabLoc : "Online / Remote");

        String avatar = rs.getString("receiver_avatar");
        item.setImageUrl(avatar != null && !avatar.isBlank() ? avatar : "/images/opp_dance_performance.png");

        String statusStr = rs.getString("status");
        if (statusStr != null) {
            statusStr = statusStr.trim().toUpperCase();
        } else {
            statusStr = "PENDING";
        }

        if ("APPROVED".equals(statusStr) || "ACCEPTED".equals(statusStr)) {
            item.setStatus("Accepted");
            item.setStatusGroup("ACCEPTED");
            item.setStatusMessage("Congratulations! Connected.");
        } else if ("REJECTED".equals(statusStr)) {
            item.setStatus("Rejected");
            item.setStatusGroup("REJECTED");
            item.setStatusMessage("Application not selected");
        } else {
            item.setStatus("Under Review");
            item.setStatusGroup("PENDING");
            item.setStatusMessage("We're reviewing your application.");
        }

        item.setDetailUrl("/pages/collaboration-details.html?id=" + item.getReferenceId());
        item.setNotes(rs.getString("message"));
        return item;
    };

    private final RowMapper<MyApplicationItemResponse> oppRowMapper = (rs, rowNum) -> {
        MyApplicationItemResponse item = new MyApplicationItemResponse();
        item.setId(rs.getLong("application_id"));
        item.setType("OPPORTUNITY");
        Long oppId = rs.getLong("opportunity_id");
        item.setReferenceId(oppId);
        String category = rs.getString("category");
        item.setTag(category != null && !category.isBlank() ? category : "Opportunity");
        item.setTitle(rs.getString("title"));
        String organizer = rs.getString("organizer");
        item.setOrganizer(organizer != null && !organizer.isBlank() ? organizer : "Opportunity Organizer");
        item.setDate(rs.getString("deadline"));
        String duration = rs.getString("duration");
        item.setTime(duration != null && !duration.isBlank() ? duration : "All Day");
        item.setLocation(rs.getString("location"));
        String img = rs.getString("image_url");
        item.setImageUrl(img != null && !img.isBlank() ? img : "/images/opp_campus_art_exhibition.png");

        String rawStatus = rs.getString("status");
        String statusUpper = rawStatus != null ? rawStatus.trim().toUpperCase() : "PENDING";

        if ("ACCEPTED".equals(statusUpper) || "APPROVED".equals(statusUpper)) {
            item.setStatus("Accepted");
            item.setStatusGroup("ACCEPTED");
            item.setStatusMessage("Congratulations!");
        } else if ("SHORTLISTED".equals(statusUpper)) {
            item.setStatus("Shortlisted");
            item.setStatusGroup("ACCEPTED");
            item.setStatusMessage("Next steps will be shared soon.");
        } else if ("REJECTED".equals(statusUpper)) {
            item.setStatus("Rejected");
            item.setStatusGroup("REJECTED");
            item.setStatusMessage("Not selected this time");
        } else {
            item.setStatus("Pending");
            item.setStatusGroup("PENDING");
            item.setStatusMessage("We'll update you soon.");
        }

        item.setDetailUrl("/pages/opportunity-details.html?id=" + oppId);
        item.setNotes(rs.getString("notes"));

        Timestamp appliedAt = rs.getTimestamp("applied_at");
        if (appliedAt != null) {
            item.setAppliedAt(appliedAt.toLocalDateTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        }
        return item;
    };

    @Override
    public List<MyApplicationItemResponse> findEventRegistrationsByUserId(Long userId) {
        String sql = """
            SELECT
                er.id AS registration_id,
                er.event_id,
                er.user_id,
                er.registered_at,
                e.title,
                e.organizer,
                e.event_date,
                e.event_time,
                e.location,
                e.venue,
                e.image_url,
                e.event_type
            FROM event_registrations er
            JOIN events e ON er.event_id = e.id
            WHERE er.user_id = ?
            ORDER BY er.registered_at DESC, er.id DESC
        """;
        return jdbcTemplate.query(sql, eventRowMapper, userId);
    }

    @Override
    public List<MyApplicationItemResponse> findCollaborationRequestsByUserId(Long userId) {
        String sql = """
            SELECT
                cr.id AS request_id,
                cr.collaboration_id,
                cr.sender_id,
                cr.receiver_id,
                cr.message,
                cr.status,
                cr.created_at,
                c.title AS collab_title,
                c.collaboration_type,
                c.location AS collab_location,
                u.full_name AS receiver_name,
                u.profile_picture AS receiver_avatar
            FROM collaboration_requests cr
            LEFT JOIN collaborations c ON cr.collaboration_id = c.id
            LEFT JOIN users u ON cr.receiver_id = u.id
            WHERE cr.sender_id = ?
            ORDER BY cr.created_at DESC, cr.id DESC
        """;
        return jdbcTemplate.query(sql, collabRowMapper, userId);
    }

    @Override
    public List<MyApplicationItemResponse> findOpportunityApplicationsByUserId(Long userId) {
        String sql = """
            SELECT
                a.id AS application_id,
                a.opportunity_id,
                a.user_id,
                a.status,
                a.notes,
                a.applied_at,
                o.title,
                o.organizer,
                o.location,
                o.deadline,
                o.duration,
                o.category,
                o.art_category,
                o.image_url
            FROM applications a
            JOIN opportunities o ON a.opportunity_id = o.id
            WHERE a.user_id = ?
            ORDER BY a.applied_at DESC, a.id DESC
        """;
        return jdbcTemplate.query(sql, oppRowMapper, userId);
    }

    @Override
    public List<MyApplicationItemResponse> findAllByUserId(Long userId) {
        List<MyApplicationItemResponse> all = new ArrayList<>();
        all.addAll(findEventRegistrationsByUserId(userId));
        all.addAll(findCollaborationRequestsByUserId(userId));
        all.addAll(findOpportunityApplicationsByUserId(userId));
        return all;
    }
}

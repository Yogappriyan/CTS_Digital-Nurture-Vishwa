SELECT
    u.user_id,
    u.full_name,
    COUNT(DISTINCT r.registration_id) AS registrations,
    COUNT(DISTINCT f.feedback_id) AS feedbacks,
    (
        COUNT(DISTINCT r.registration_id) +
        COUNT(DISTINCT f.feedback_id)
    ) AS engagement_score
FROM Users u
LEFT JOIN Registrations r
    ON u.user_id = r.user_id
LEFT JOIN Feedback f
    ON u.user_id = f.user_id
GROUP BY u.user_id, u.full_name
ORDER BY engagement_score DESC;
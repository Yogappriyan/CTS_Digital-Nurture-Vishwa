SELECT
    u.user_id,
    u.full_name,
    COUNT(f.feedback_id) AS total_feedbacks
FROM Users u
JOIN Feedback f
    ON u.user_id = f.user_id
GROUP BY u.user_id, u.full_name
HAVING COUNT(f.feedback_id) = (
    SELECT MAX(feedback_count)
    FROM (
        SELECT COUNT(feedback_id) AS feedback_count
        FROM Feedback
        GROUP BY user_id
    ) t
);
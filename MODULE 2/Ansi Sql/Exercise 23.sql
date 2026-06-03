SELECT
    DATE(registration_date) AS registration_day,
    COUNT(registration_id) AS total_registrations
FROM Registrations
GROUP BY DATE(registration_date)
ORDER BY registration_day;
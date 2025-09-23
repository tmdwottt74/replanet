CREATE OR REPLACE VIEW v_daily_saving AS
SELECT
    user_id,
    DATE(started_at) AS saving_date,
    SUM(co2_saved_g) AS total_co2_saved_g
FROM
    mobility_logs
GROUP BY
    user_id, DATE(started_at);
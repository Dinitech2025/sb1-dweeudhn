-- Create functions for reports
CREATE OR REPLACE FUNCTION get_sales_report(
  start_date date,
  end_date date,
  report_type text -- 'daily', 'weekly', or 'monthly'
)
RETURNS TABLE (
  period text,
  total_sales bigint,
  total_revenue numeric,
  unique_customers bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN report_type = 'daily' THEN TO_CHAR(date, 'YYYY-MM-DD')
      WHEN report_type = 'weekly' THEN 'Week ' || DATE_PART('week', date)::text || ' ' || DATE_PART('year', date)::text
      ELSE TO_CHAR(date, 'Month YYYY')
    END as period,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT customer_id) as unique_customers
  FROM sales
  WHERE 
    status = 'completed' AND
    date BETWEEN start_date AND end_date
  GROUP BY 
    CASE 
      WHEN report_type = 'daily' THEN TO_CHAR(date, 'YYYY-MM-DD')
      WHEN report_type = 'weekly' THEN 'Week ' || DATE_PART('week', date)::text || ' ' || DATE_PART('year', date)::text
      ELSE TO_CHAR(date, 'Month YYYY')
    END,
    CASE 
      WHEN report_type = 'daily' THEN date
      WHEN report_type = 'weekly' THEN DATE_TRUNC('week', date)
      ELSE DATE_TRUNC('month', date)
    END
  ORDER BY MIN(date) DESC;
END;
$$ LANGUAGE plpgsql;
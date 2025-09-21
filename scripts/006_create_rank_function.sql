-- Create function to get user rank
CREATE OR REPLACE FUNCTION get_user_rank(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank_position INTO user_rank
    FROM (
        SELECT 
            user_id as uid,
            ROW_NUMBER() OVER (ORDER BY points DESC) as rank_position
        FROM user_points
    ) ranked_users
    WHERE uid = user_id;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- Utility functions for PeerConnect

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  
  -- Initialize user points
  INSERT INTO public.user_points (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update user points after session completion
CREATE OR REPLACE FUNCTION public.update_user_points_after_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update points when session status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Award points to mentor (teaching)
    UPDATE public.user_points 
    SET 
      points = points + 20,
      total_sessions_taught = total_sessions_taught + 1,
      updated_at = NOW()
    WHERE user_id = NEW.mentor_id;
    
    -- Award points to learner (learning)
    UPDATE public.user_points 
    SET 
      points = points + 10,
      total_sessions_learned = total_sessions_learned + 1,
      updated_at = NOW()
    WHERE user_id = NEW.learner_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for session completion
DROP TRIGGER IF EXISTS on_session_completed ON public.peer_sessions;
CREATE TRIGGER on_session_completed
  AFTER UPDATE ON public.peer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points_after_session();

-- Function to calculate user level based on points
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Level calculation: Level = floor(sqrt(points/100)) + 1
  RETURN FLOOR(SQRT(user_points::FLOAT / 100.0)) + 1;
END;
$$;

-- Function to update user levels
CREATE OR REPLACE FUNCTION public.update_user_levels()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_points 
  SET level = public.calculate_user_level(points)
  WHERE level != public.calculate_user_level(points);
END;
$$;

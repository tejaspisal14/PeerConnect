-- Add session reviews table for rating and feedback system
CREATE TABLE IF NOT EXISTS public.session_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.peer_sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  helpful_rating BOOLEAN, -- Was the session helpful?
  would_recommend BOOLEAN, -- Would recommend this peer?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, reviewer_id) -- One review per user per session
);

-- Add engagement history tracking for AI matching
CREATE TABLE IF NOT EXISTS public.user_engagement_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  avg_rating_received DECIMAL(3,2) DEFAULT 0.00, -- Average rating as mentor/learner
  total_reviews_received INTEGER DEFAULT 0,
  successful_sessions INTEGER DEFAULT 0, -- Sessions rated 7+ 
  total_completed_sessions INTEGER DEFAULT 0,
  response_rate DECIMAL(3,2) DEFAULT 1.00, -- How often they accept/respond to requests
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.session_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_reviews
CREATE POLICY "Users can view reviews for their sessions" ON public.session_reviews 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.peer_sessions 
      WHERE id = session_id AND (mentor_id = auth.uid() OR learner_id = auth.uid())
    )
  );

CREATE POLICY "Users can create reviews for their completed sessions" ON public.session_reviews 
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.peer_sessions 
      WHERE id = session_id 
      AND (mentor_id = auth.uid() OR learner_id = auth.uid())
      AND status = 'completed'
    )
  );

-- RLS Policies for user_engagement_stats
CREATE POLICY "Anyone can view engagement stats" ON public.user_engagement_stats FOR SELECT USING (true);
CREATE POLICY "Users can manage own engagement stats" ON public.user_engagement_stats FOR ALL USING (auth.uid() = user_id);

-- Function to update engagement stats after review
CREATE OR REPLACE FUNCTION update_engagement_stats_after_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reviewee's engagement stats
  INSERT INTO public.user_engagement_stats (user_id, avg_rating_received, total_reviews_received, successful_sessions, total_completed_sessions)
  VALUES (NEW.reviewee_id, NEW.rating, 1, CASE WHEN NEW.rating >= 7 THEN 1 ELSE 0 END, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    avg_rating_received = (
      (user_engagement_stats.avg_rating_received * user_engagement_stats.total_reviews_received + NEW.rating) 
      / (user_engagement_stats.total_reviews_received + 1)
    ),
    total_reviews_received = user_engagement_stats.total_reviews_received + 1,
    successful_sessions = user_engagement_stats.successful_sessions + CASE WHEN NEW.rating >= 7 THEN 1 ELSE 0 END,
    total_completed_sessions = user_engagement_stats.total_completed_sessions + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update engagement stats when review is added
CREATE TRIGGER update_engagement_stats_trigger
  AFTER INSERT ON public.session_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_engagement_stats_after_review();

-- Seed achievements for the gamification system

INSERT INTO public.achievements (name, description, icon, points_required, achievement_type, criteria) VALUES
-- Learning Achievements
('First Steps', 'Complete your first learning session', '🎯', 0, 'session', '{"sessions_learned": 1}'),
('Knowledge Seeker', 'Complete 5 learning sessions', '📚', 50, 'session', '{"sessions_learned": 5}'),
('Learning Enthusiast', 'Complete 15 learning sessions', '🔥', 150, 'session', '{"sessions_learned": 15}'),
('Master Learner', 'Complete 50 learning sessions', '🏆', 500, 'session', '{"sessions_learned": 50}'),

-- Teaching Achievements
('First Mentor', 'Complete your first teaching session', '🌟', 0, 'session', '{"sessions_taught": 1}'),
('Knowledge Sharer', 'Complete 5 teaching sessions', '💡', 75, 'session', '{"sessions_taught": 5}'),
('Mentor Master', 'Complete 20 teaching sessions', '👨‍🏫', 300, 'session', '{"sessions_taught": 20}'),
('Teaching Legend', 'Complete 100 teaching sessions', '🎖️', 1000, 'session', '{"sessions_taught": 100}'),

-- Skill Achievements
('Skill Explorer', 'Add 3 different skills to your profile', '🗺️', 25, 'skill', '{"total_skills": 3}'),
('Renaissance Person', 'Add skills from 5 different categories', '🎨', 100, 'skill', '{"skill_categories": 5}'),
('Jack of All Trades', 'Add 15 different skills', '🔧', 200, 'skill', '{"total_skills": 15}'),

-- Social Achievements
('Connector', 'Match with 5 different peers', '🤝', 50, 'social', '{"unique_matches": 5}'),
('Community Builder', 'Match with 20 different peers', '🏘️', 200, 'social', '{"unique_matches": 20}'),
('Network Master', 'Match with 50 different peers', '🌐', 500, 'social', '{"unique_matches": 50}'),

-- Engagement Achievements
('Early Bird', 'Complete a session before 9 AM', '🌅', 25, 'engagement', '{"early_session": true}'),
('Night Owl', 'Complete a session after 10 PM', '🦉', 25, 'engagement', '{"late_session": true}'),
('Consistent Learner', 'Complete sessions on 7 consecutive days', '📅', 150, 'engagement', '{"consecutive_days": 7}'),
('Marathon Learner', 'Complete a 2+ hour learning session', '⏰', 100, 'engagement', '{"long_session": 120}'),

-- Contribution Achievements
('Resource Contributor', 'Add your first learning resource', '📖', 30, 'contribution', '{"resources_added": 1}'),
('Knowledge Curator', 'Add 5 learning resources', '📚', 100, 'contribution', '{"resources_added": 5}'),
('Community Helper', 'Add 15 learning resources', '🎁', 300, 'contribution', '{"resources_added": 15}'),

-- Special Achievements
('Perfect Match', 'Complete a session with 95%+ AI match score', '💯', 75, 'special', '{"high_match_score": 0.95}'),
('Speed Learner', 'Complete 3 sessions in one day', '⚡', 100, 'special', '{"sessions_per_day": 3}'),
('Feedback Champion', 'Receive 10 positive session ratings', '⭐', 200, 'special', '{"positive_ratings": 10}')

ON CONFLICT DO NOTHING;

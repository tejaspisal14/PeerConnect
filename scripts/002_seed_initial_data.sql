-- Seed initial data for PeerConnect

-- Insert common skills and categories
INSERT INTO public.skills (name, category, description) VALUES
-- Programming
('JavaScript', 'Programming', 'Modern JavaScript development and ES6+ features'),
('Python', 'Programming', 'Python programming for web development and data science'),
('React', 'Programming', 'React.js library for building user interfaces'),
('Node.js', 'Programming', 'Server-side JavaScript runtime environment'),
('TypeScript', 'Programming', 'Typed superset of JavaScript'),
('SQL', 'Programming', 'Database querying and management'),

-- Design
('UI/UX Design', 'Design', 'User interface and user experience design'),
('Figma', 'Design', 'Collaborative design tool and prototyping'),
('Adobe Photoshop', 'Design', 'Image editing and graphic design'),
('Web Design', 'Design', 'Designing websites and web applications'),

-- Business
('Digital Marketing', 'Business', 'Online marketing strategies and campaigns'),
('Project Management', 'Business', 'Planning and executing projects effectively'),
('Data Analysis', 'Business', 'Analyzing data to derive business insights'),
('Content Writing', 'Business', 'Creating engaging written content'),

-- Languages
('Spanish', 'Languages', 'Spanish language conversation and grammar'),
('French', 'Languages', 'French language learning and practice'),
('Mandarin', 'Languages', 'Mandarin Chinese language skills'),

-- Creative
('Photography', 'Creative', 'Digital photography techniques and editing'),
('Video Editing', 'Creative', 'Video production and post-processing'),
('Music Production', 'Creative', 'Creating and producing music digitally'),
('Writing', 'Creative', 'Creative writing and storytelling')

ON CONFLICT (name) DO NOTHING;

-- Insert initial achievements
INSERT INTO public.achievements (name, description, icon, points_required, achievement_type) VALUES
('First Session', 'Complete your first peer learning session', '🎯', 0, 'learning'),
('Helpful Mentor', 'Teach 5 successful sessions', '👨‍🏫', 50, 'teaching'),
('Knowledge Seeker', 'Learn from 10 different mentors', '🔍', 100, 'learning'),
('Week Warrior', 'Maintain a 7-day learning streak', '🔥', 70, 'streak'),
('Social Butterfly', 'Connect with 20 different peers', '🦋', 150, 'social'),
('Expert Teacher', 'Teach 25 sessions with high ratings', '⭐', 250, 'teaching'),
('Lifelong Learner', 'Complete 50 learning sessions', '📚', 500, 'learning'),
('Community Leader', 'Help 100 different learners', '👑', 1000, 'teaching')

ON CONFLICT (name) DO NOTHING;

-- Seed learning resources for PeerConnect

INSERT INTO public.resources (title, description, url, resource_type, skill_id, ai_generated) VALUES
-- JavaScript Resources
('MDN JavaScript Guide', 'Comprehensive guide to JavaScript fundamentals and advanced concepts', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', 'article', (SELECT id FROM skills WHERE name = 'JavaScript'), false),
('JavaScript.info', 'Modern JavaScript tutorial covering everything from basics to advanced topics', 'https://javascript.info/', 'course', (SELECT id FROM skills WHERE name = 'JavaScript'), false),
('You Don''t Know JS Book Series', 'Deep dive into JavaScript mechanics and core concepts', 'https://github.com/getify/You-Dont-Know-JS', 'book', (SELECT id FROM skills WHERE name = 'JavaScript'), false),

-- React Resources
('React Official Documentation', 'Official React documentation with tutorials and API reference', 'https://react.dev/', 'article', (SELECT id FROM skills WHERE name = 'React'), false),
('React Tutorial for Beginners', 'Step-by-step React tutorial for complete beginners', 'https://reactjs.org/tutorial/tutorial.html', 'course', (SELECT id FROM skills WHERE name = 'React'), false),
('React Hooks in Action', 'Comprehensive guide to React Hooks with practical examples', 'https://www.manning.com/books/react-hooks-in-action', 'book', (SELECT id FROM skills WHERE name = 'React'), false),

-- Python Resources
('Python.org Tutorial', 'Official Python tutorial covering language fundamentals', 'https://docs.python.org/3/tutorial/', 'article', (SELECT id FROM skills WHERE name = 'Python'), false),
('Automate the Boring Stuff', 'Practical Python programming for total beginners', 'https://automatetheboringstuff.com/', 'book', (SELECT id FROM skills WHERE name = 'Python'), false),
('Python Crash Course', 'Hands-on introduction to Python programming', 'https://nostarch.com/pythoncrashcourse2e', 'book', (SELECT id FROM skills WHERE name = 'Python'), false),

-- Design Resources
('Figma Academy', 'Official Figma tutorials and design courses', 'https://www.figma.com/academy/', 'course', (SELECT id FROM skills WHERE name = 'Figma'), false),
('UI/UX Design Fundamentals', 'Complete guide to user interface and experience design', 'https://www.interaction-design.org/', 'course', (SELECT id FROM skills WHERE name = 'UI/UX Design'), false),
('Design Systems Handbook', 'Comprehensive guide to building and maintaining design systems', 'https://www.designbetter.co/design-systems-handbook', 'book', (SELECT id FROM skills WHERE name = 'UI/UX Design'), false),

-- Business Resources
('Google Digital Marketing Course', 'Free comprehensive digital marketing certification', 'https://learndigital.withgoogle.com/', 'course', (SELECT id FROM skills WHERE name = 'Digital Marketing'), false),
('Project Management Professional Guide', 'Complete guide to project management best practices', 'https://www.pmi.org/pmbok-guide-standards', 'book', (SELECT id FROM skills WHERE name = 'Project Management'), false),
('Data Analysis with Excel', 'Practical data analysis techniques using Excel', 'https://support.microsoft.com/en-us/office/excel-help-center', 'course', (SELECT id FROM skills WHERE name = 'Data Analysis'), false)

ON CONFLICT DO NOTHING;

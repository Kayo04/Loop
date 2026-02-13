UPDATE profiles
SET subscription_tier = 'pro'
WHERE id = (SELECT id FROM auth.users WHERE email = 'tiago@gmail.com');
    
-- Adds an admin who can sign in at /admin.
-- Replace the three values below, then run in the Supabase SQL editor.
-- The password can be changed from /admin/account after the first sign-in.
do $$
declare
  v_email    text := 'danielle@example.com';
  v_password text := 'choose-a-strong-starting-password';
  v_name     text := 'Danielle Hough';
  uid uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
    lower(v_email), extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('display_name', v_name),
    now(), now(), '', '', '', '', false, false
  );
  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), uid, uid::text, 'email',
    jsonb_build_object('sub', uid::text, 'email', lower(v_email), 'email_verified', true, 'phone_verified', false),
    now(), now(), now()
  );
  insert into public.admins (user_id, email, display_name) values (uid, lower(v_email), v_name);
end $$;

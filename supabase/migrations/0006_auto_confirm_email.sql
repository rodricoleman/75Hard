-- Auto-confirma email em todo novo signup, tornando a flag "Confirm email" do
-- dashboard inofensiva. O usuário entra direto depois do signUp().
create or replace function public.h75_auto_confirm_email()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists h75_auto_confirm_email on auth.users;
create trigger h75_auto_confirm_email
  before insert on auth.users
  for each row execute function public.h75_auto_confirm_email();

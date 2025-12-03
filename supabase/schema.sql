-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  daily_water_goal int default 2000,
  step_goal int default 10000,
  timezone text default 'UTC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create metrics table
create table metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  steps int default 0,
  water_ml int default 0,
  sleep_hours int default 0,
  mood int default 5, -- 1-10 scale
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Create medications table
create table medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  dose text not null,
  schedule_time time not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create conversations table
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table metrics enable row level security;
alter table medications enable row level security;
alter table conversations enable row level security;

-- Create policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);

create policy "Users can view own metrics" on metrics for select using (auth.uid() = user_id);
create policy "Users can insert own metrics" on metrics for insert with check (auth.uid() = user_id);
create policy "Users can update own metrics" on metrics for update using (auth.uid() = user_id);

create policy "Users can view own medications" on medications for select using (auth.uid() = user_id);
create policy "Users can insert own medications" on medications for insert with check (auth.uid() = user_id);
create policy "Users can update own medications" on medications for update using (auth.uid() = user_id);
create policy "Users can delete own medications" on medications for delete using (auth.uid() = user_id);

create policy "Users can view own conversations" on conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on conversations for insert with check (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, user_id)
  values (new.id, new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

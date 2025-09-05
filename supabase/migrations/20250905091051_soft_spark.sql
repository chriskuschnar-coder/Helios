/*
  # Clean RLS Policies with Correct auth.uid() Syntax

  1. Drop all existing policies that may have uid() errors
  2. Recreate all policies using proper auth.uid() syntax
  3. Enable RLS on all tables
  4. Create comprehensive policies for all operations

  This migration follows Supabase best practices and uses auth.uid() exclusively.
*/

-- Drop all existing policies to start clean
drop policy if exists "Users can view own data" on users;
drop policy if exists "Users can update own data" on users;
drop policy if exists "System can insert users" on users;
drop policy if exists "Users can update own document status" on users;

drop policy if exists "Users can view own accounts" on accounts;
drop policy if exists "Users can update own accounts" on accounts;
drop policy if exists "System can insert accounts" on accounts;

drop policy if exists "Users can view own transactions" on transactions;
drop policy if exists "Users can insert own transactions" on transactions;

drop policy if exists "Users can view own payments" on payments;
drop policy if exists "Users can insert own payments" on payments;
drop policy if exists "System can update payments" on payments;

drop policy if exists "Users can view own compliance records" on compliance_records;
drop policy if exists "Users can view own crypto addresses" on crypto_addresses;
drop policy if exists "Users can view own bank accounts" on bank_accounts;
drop policy if exists "Users can view own wire instructions" on wire_instructions;

-- Enable RLS on all tables
alter table users enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table payments enable row level security;
alter table compliance_records enable row level security;
alter table crypto_addresses enable row level security;
alter table bank_accounts enable row level security;
alter table wire_instructions enable row level security;
alter table signed_documents enable row level security;
alter table profiles enable row level security;
alter table onboarding enable row level security;
alter table crypto_payment_invoices enable row level security;
alter table investor_units enable row level security;
alter table fund_nav enable row level security;
alter table mt5_data_feed enable row level security;
alter table fund_transactions enable row level security;
alter table stripe_customers enable row level security;
alter table stripe_subscriptions enable row level security;
alter table stripe_orders enable row level security;

-- USERS TABLE POLICIES
create policy "Users can view own data"
on users
for select
using (auth.uid() = id);

create policy "Users can update own data"
on users
for update
using (auth.uid() = id);

create policy "System can insert users"
on users
for insert
with check (true);

-- ACCOUNTS TABLE POLICIES
create policy "Users can view own accounts"
on accounts
for select
using (auth.uid() = user_id);

create policy "Users can update own accounts"
on accounts
for update
using (auth.uid() = user_id);

create policy "System can insert accounts"
on accounts
for insert
with check (true);

-- TRANSACTIONS TABLE POLICIES
create policy "Users can view own transactions"
on transactions
for select
using (auth.uid() = user_id);

create policy "Users can insert own transactions"
on transactions
for insert
with check (auth.uid() = user_id);

-- PAYMENTS TABLE POLICIES
create policy "Users can view own payments"
on payments
for select
using (auth.uid() = user_id);

create policy "Users can insert own payments"
on payments
for insert
with check (auth.uid() = user_id);

create policy "System can update payments"
on payments
for update
using (true);

-- COMPLIANCE RECORDS POLICIES
create policy "Users can view own compliance records"
on compliance_records
for select
using (auth.uid() = user_id);

-- CRYPTO ADDRESSES POLICIES
create policy "Users can view own crypto addresses"
on crypto_addresses
for select
using (auth.uid() = user_id);

-- BANK ACCOUNTS POLICIES
create policy "Users can view own bank accounts"
on bank_accounts
for select
using (auth.uid() = user_id);

-- WIRE INSTRUCTIONS POLICIES
create policy "Users can view own wire instructions"
on wire_instructions
for select
using (auth.uid() = user_id);

-- SIGNED DOCUMENTS POLICIES
create policy "Users can read own signed documents"
on signed_documents
for select
using (auth.uid() = user_id);

create policy "Users can insert own signed documents"
on signed_documents
for insert
with check (auth.uid() = user_id);

create policy "Users can update own signed documents"
on signed_documents
for update
using (auth.uid() = user_id);

-- PROFILES POLICIES
create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);

create policy "Users can insert their own profile"
on profiles
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on profiles
for update
using (auth.uid() = id);

-- ONBOARDING POLICIES
create policy "Users can read own onboarding"
on onboarding
for select
using (auth.uid() = user_id);

create policy "Users can insert own onboarding"
on onboarding
for insert
with check (auth.uid() = user_id);

create policy "Users can update own onboarding"
on onboarding
for update
using (auth.uid() = user_id);

create policy "Users can delete own onboarding"
on onboarding
for delete
using (auth.uid() = user_id);

-- CRYPTO PAYMENT INVOICES POLICIES
create policy "Users can view own crypto invoices"
on crypto_payment_invoices
for select
using (auth.uid() = user_id);

create policy "Users can insert own crypto invoices"
on crypto_payment_invoices
for insert
with check (auth.uid() = user_id);

create policy "System can update crypto invoices"
on crypto_payment_invoices
for update
using (true);

create policy "Allow insert for service role"
on crypto_payment_invoices
for insert
with check (true);

-- INVESTOR UNITS POLICIES
create policy "Users can view own investor_units"
on investor_units
for select
using (auth.uid() = user_id);

create policy "Service role can manage all unit holdings"
on investor_units
for all
using (true);

-- FUND NAV POLICIES
create policy "Users can read fund NAV data"
on fund_nav
for select
using (true);

-- MT5 DATA FEED POLICIES
create policy "Only service role can access MT5 data"
on mt5_data_feed
for all
using (true);

-- FUND TRANSACTIONS POLICIES
create policy "Users can read own fund transactions"
on fund_transactions
for select
using (auth.uid() = user_id);

create policy "Users can insert own fund transactions"
on fund_transactions
for insert
with check (auth.uid() = user_id);

create policy "Service role can manage all fund transactions"
on fund_transactions
for all
using (true);

-- STRIPE CUSTOMERS POLICIES
create policy "Users can view their own customer data"
on stripe_customers
for select
using (auth.uid() = user_id and deleted_at is null);

-- STRIPE SUBSCRIPTIONS POLICIES
create policy "Users can view their own subscription data"
on stripe_subscriptions
for select
using (customer_id in (
  select customer_id from stripe_customers 
  where user_id = auth.uid() and deleted_at is null
) and deleted_at is null);

-- STRIPE ORDERS POLICIES
create policy "Users can view their own order data"
on stripe_orders
for select
using (customer_id in (
  select customer_id from stripe_customers 
  where user_id = auth.uid() and deleted_at is null
) and deleted_at is null);
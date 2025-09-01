[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  VITE_STRIPE_PUBLISHABLE_KEY = "pk_live_51S2OIF3aD6OJYuckOW7RhBZ9xG0fHNkFSKCYVeRBjFMeusz0P9tSIvRyja7LY55HHhuhrgc5UZR6v78SrM9CE25300XPf5I5z4"
  VITE_SUPABASE_URL = "https://upevugqarcvxnekzddeh.supabase.co"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
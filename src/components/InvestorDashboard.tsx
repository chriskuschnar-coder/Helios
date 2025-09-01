[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  VITE_STRIPE_PUBLISHABLE_KEY = "pk_live_51S2OIF3aD6OJYuckOW7RhBZ9xG0fHNkFSKCYVeRBjFMeusz0P9tSIvRyja7LY55HHhuhrgc5UZR6v78SrM9CE25300XPf5I5z4"
  VITE_SUPABASE_URL = "https://upevugqarcvxnekzddeh.supabase.co"
                  <h4 className="font-medium text-navy-900 mb-4">Executed Documents</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-700">
                      Your signed onboarding documents are stored securely and available for download at any time.
                    </p>
                  </div>
                  {/* This will be populated with actual signed documents from Supabase */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900">Investment Management Agreement</div>
                          <div className="text-sm text-green-700">Signed during onboarding</div>
                        </div>
                      </div>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm px-3 py-1 rounded border border-green-300 hover:bg-green-100 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
                

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
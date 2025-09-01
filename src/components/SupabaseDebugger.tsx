import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SupabaseDebugger = () => {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, status, message, details = null) => {
    setResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toISOString() }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Check Environment Variables
    addResult("Environment Variables", "info", "Checking environment variables...");
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      addResult("VITE_SUPABASE_URL", "error", "Missing VITE_SUPABASE_URL environment variable");
    } else {
      addResult("VITE_SUPABASE_URL", "success", `Loaded: ${supabaseUrl}`);
    }
    
    if (!supabaseAnonKey) {
      addResult("VITE_SUPABASE_ANON_KEY", "error", "Missing VITE_SUPABASE_ANON_KEY environment variable");
    } else {
      addResult("VITE_SUPABASE_ANON_KEY", "success", `Loaded: ${supabaseAnonKey.substring(0, 50)}...`);
      
      // Check if key looks valid (JWT format)
      const jwtParts = supabaseAnonKey.split('.');
      if (jwtParts.length === 3) {
        addResult("JWT Format", "success", "Anon key has valid JWT structure (3 parts)");
      } else {
        addResult("JWT Format", "error", `Invalid JWT structure (${jwtParts.length} parts, should be 3)`);
      }
      
      // Check for corruption
      if (supabaseAnonKey.includes('QGhKOQ')) {
        addResult("Key Corruption", "error", "Anon key appears to be corrupted (contains repeated characters)");
      } else {
        addResult("Key Corruption", "success", "Anon key appears clean");
      }
    }

    // Test 2: Create Supabase Client
    if (supabaseUrl && supabaseAnonKey) {
      addResult("Client Creation", "info", "Creating Supabase client...");
      
      let client;
      try {
        client = createClient(supabaseUrl, supabaseAnonKey);
        addResult("Client Creation", "success", "Supabase client created successfully");
      } catch (error) {
        addResult("Client Creation", "error", `Failed to create client: ${error.message}`);
        setIsRunning(false);
        return;
      }

      // Test 3: Basic Connection Test
      addResult("Connection Test", "info", "Testing basic connection...");
      
      try {
        const { data, error } = await client.from('accounts').select('count').limit(1);
        
        if (error) {
          addResult("Connection Test", "error", `Database query failed: ${error.message}`, error);
        } else {
          addResult("Connection Test", "success", "Successfully connected to database", data);
        }
      } catch (fetchError) {
        addResult("Connection Test", "error", `Network error: ${fetchError.message}`, {
          name: fetchError.name,
          stack: fetchError.stack
        });
      }

      // Test 4: Try Different Table
      addResult("Alternative Table Test", "info", "Testing with 'users' table...");
      
      try {
        const { data, error } = await client.from('users').select('count').limit(1);
        
        if (error) {
          addResult("Alternative Table Test", "error", `Users table query failed: ${error.message}`, error);
        } else {
          addResult("Alternative Table Test", "success", "Users table accessible", data);
        }
      } catch (fetchError) {
        addResult("Alternative Table Test", "error", `Network error on users table: ${fetchError.message}`);
      }

      // Test 5: Network Info
      addResult("Network Info", "info", "Gathering network information...");
      addResult("Current Origin", "info", `Running from: ${window.location.origin}`);
      addResult("User Agent", "info", `Browser: ${navigator.userAgent.substring(0, 100)}...`);
      
      // Test 6: Manual Fetch Test
      addResult("Manual Fetch Test", "info", "Testing direct fetch to Supabase...");
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/accounts?select=count&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          addResult("Manual Fetch Test", "success", "Direct fetch successful", data);
        } else {
          addResult("Manual Fetch Test", "error", `HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        addResult("Manual Fetch Test", "error", `Fetch failed: ${fetchError.message}`, fetchError);
      }
    }

    setIsRunning(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🔍';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Supabase Connection Debugger</h1>
        <p className="text-gray-600">This tool will diagnose why your app shows "Supabase not configured"</p>
      </div>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-medium ${
            isRunning 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic Results:</h2>
          
          {results.map((result, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${getStatusColor(result.status)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStatusIcon(result.status)}</span>
                  <div>
                    <h3 className="font-medium">{result.test}</h3>
                    <p className="text-sm mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                          Show Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isRunning && results.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Summary:</h3>
          <div className="text-sm text-gray-600">
            <div>✅ Passed: {results.filter(r => r.status === 'success').length}</div>
            <div>❌ Failed: {results.filter(r => r.status === 'error').length}</div>
            <div>ℹ️ Info: {results.filter(r => r.status === 'info').length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseDebugger;
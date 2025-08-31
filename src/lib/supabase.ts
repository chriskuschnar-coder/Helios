// Main Supabase export - use this throughout the app
import { supabaseClient } from './supabase-client'
import { webContainerSupabase, isWebContainer } from './webcontainer-supabase-proxy'

// Use proxy in WebContainer, real client elsewhere
export const supabase = isWebContainer ? webContainerSupabase : supabaseClient

export const testSupabaseConnection = async () => {
  if (isWebContainer) {
    console.log('🧪 Testing WebContainer proxy connection...')
    return await webContainerSupabase.testConnection()
  } else {
    const { testSupabaseConnection: realTest } = await import('./supabase-client')
    return await realTest()
  }
}
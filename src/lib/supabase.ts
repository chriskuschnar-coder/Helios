// Use WebContainer proxy for all environments since we're in a sandboxed browser
import { webContainerSupabase } from './webcontainer-supabase-proxy'
export const supabase = webContainerSupabase
export const testSupabaseConnection = async () => {
  console.log('🧪 Testing WebContainer proxy connection...')
  return await webContainerSupabase.testConnection()
}
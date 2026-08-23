/**
 * Returns true when the app should use local mock data instead of Supabase.
 * Automatically enabled when Supabase env vars are missing, or when
 * NEXT_PUBLIC_USE_MOCK_DATA=true is set explicitly.
 */
export function isMockMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

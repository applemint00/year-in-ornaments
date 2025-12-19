import { createClient } from '@supabase/supabase-js';

// VITE 환경 변수에서 키를 가져옵니다.
// .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 있어야 합니다.
const env = (import.meta as any).env;
const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase Environment Variables are missing! App will run in Simulation Mode.");
}

// ⚠️ 중요: createClient에 빈 문자열('')을 넣으면 앱이 켜지기도 전에 에러가 발생합니다.
// 키가 없을 때는 더미 URL을 넣어주어 앱이 다운되지 않게 하고, 이후 ArcService에서 에러를 핸들링하도록 합니다.
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(safeUrl, safeKey);
// 진짜 URL과 키가 둘 다 있는지 확인해서 내보내는 변수입니다.
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
})

function defineNuxtConfig(arg0: { runtimeConfig: { public: { supabaseUrl: string | undefined; supabaseKey: string | undefined; }; }; }) {
    throw new Error("Function not implemented.");
}

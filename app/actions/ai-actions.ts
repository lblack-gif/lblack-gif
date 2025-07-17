// At the top of the file, find or add your SetupStatus type:
interface SetupStatus {
  services: {
    supabase: { configured: boolean }
    ai:       { configured: boolean }
  }
  // Change this from `never[]` to `string[]`:
  recommendations: string[]
}

// …later, when you initialize it:
const setupStatus: SetupStatus = {
  services: {
    supabase: { configured: false },
    ai:       { configured: false },
  },
  recommendations: [],    // ← now a string[]
}

// And further down, your push will type-check:
if (!setupStatus.services.supabase.configured) {
  setupStatus.recommendations.push(
    "Configure Supabase environment variables for database functionality"
  )
}

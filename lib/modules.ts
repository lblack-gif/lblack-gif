// Module Configuration - Enable/Disable Features
export const moduleConfig = {
  // Core Modules (Always Enabled)
  dashboard: { enabled: true, order: 1 },
  laborHours: { enabled: true, order: 2 },
  workerManagement: { enabled: true, order: 3 },
  contractorManagement: { enabled: true, order: 4 },

  // Advanced Modules (Configurable)
  aiIntegration: { enabled: true, order: 5 },
  emailTriage: { enabled: true, order: 6 },
  comprehensiveReporting: { enabled: true, order: 7 },
  automatedReporting: { enabled: true, order: 8 },

  // Optional Modules
  geographicMapping: { enabled: true, order: 9 },
  hudIntegration: { enabled: false, order: 10 }, // Disable if no HUD access
  payrollIntegration: { enabled: true, order: 11 },
  mobileInterface: { enabled: true, order: 12 },

  // Enterprise Modules
  auditAccountability: { enabled: true, order: 13 },
  securityManagement: { enabled: true, order: 14 },
  systemMonitoring: { enabled: true, order: 15 },

  // Support Modules
  trainingSupport: { enabled: true, order: 16 },
  notificationSystem: { enabled: true, order: 17 },
  qualitativeReporting: { enabled: true, order: 18 },
  performanceDashboard: { enabled: true, order: 19 },
}

// User Role Permissions
export const rolePermissions = {
  hud_admin: {
    canViewAll: true,
    canEditAll: true,
    canDeleteAll: true,
    modules: Object.keys(moduleConfig),
  },
  contractor_manager: {
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    modules: [
      "dashboard",
      "laborHours",
      "workerManagement",
      "comprehensiveReporting",
      "automatedReporting",
      "payrollIntegration",
      "mobileInterface",
    ],
  },
  project_supervisor: {
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    modules: ["dashboard", "laborHours", "workerManagement", "mobileInterface", "comprehensiveReporting"],
  },
  field_worker: {
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    modules: ["mobileInterface", "laborHours"],
  },
}

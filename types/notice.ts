export interface Notice {
    id: string
    title: string
    content: string
    author: string
    createdAt: string
    buildingId: string
    priority: "low" | "normal" | "high" | "urgent"
    requiresConfirmation: boolean
    requiresCompletion: boolean
    completionDeadline?: string
    confirmationRate: number
    completionRate: number
  }
  
  
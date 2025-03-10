export interface Invoice {
    id: string
    title: string
    type: string
    amount: number
    dueDate: string
    description?: string
    buildingId: string
    createdAt: string
    recipientCount: number
  }
  
  
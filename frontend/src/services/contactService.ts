import api from './api'
import type { ContactMessage, PaginatedResponse } from '@/types'

export const contactService = {
  async sendMessage(data: { name: string; email: string; message: string }): Promise<any> {
    const res = await api.post('/contacts', data)
    return res.data
  },

  async getMessages(page = 1, limit = 20): Promise<PaginatedResponse<ContactMessage>> {
    const skip = (page - 1) * limit
    const res = await api.get(`/contacts?skip=${skip}&limit=${limit}`)
    const payload = res.data
    return {
      data: payload.data,
      total: payload.meta?.total || 0,
      page,
      limit,
      has_more: skip + limit < (payload.meta?.total || 0),
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    const res = await api.patch(`/contacts/${id}/read`)
    return res.data.success
  }
}

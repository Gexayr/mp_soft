import authService from './authService'

const OrdersService = {
  async fetchOrders({ page = 1, per_page = 20, search = '', status = '', date_from = '', date_to = '', sort_by = 'created_at', sort_dir = 'desc' } = {}) {
    const params = new URLSearchParams()
    if (page) params.set('page', page)
    if (per_page) params.set('per_page', per_page)
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (date_from) params.set('date_from', date_from)
    if (date_to) params.set('date_to', date_to)
    if (sort_by) params.set('sort_by', sort_by)
    if (sort_dir) params.set('sort_dir', sort_dir)

    return await authService.request(`/orders?${params.toString()}`)
  },
}

export default OrdersService

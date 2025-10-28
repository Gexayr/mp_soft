import React, { useEffect, useMemo, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CPagination,
  CPaginationItem,
  CSpinner,
} from '@coreui/react'
import OrdersService from '../../services/ordersService'

const Orders = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const per_page = 20

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const [pagination, setPagination] = useState({ total: 0, per_page, current_page: 1, last_page: 1 })

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await OrdersService.fetchOrders({
        page,
        per_page,
        search,
        status,
        date_from: dateFrom,
        date_to: dateTo,
        sort_by: sortBy,
        sort_dir: sortDir,
      })
      if (res.success) {
        setItems(res.data.items)
        setPagination(res.data.pagination)
      } else {
        setError(res.message || 'Failed to load orders')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortDir])

  const onSubmitFilters = (e) => {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const headers = useMemo(
    () => [
      { key: 'barcode', label: 'Barcode', sortable: true },
      { key: 'mp_article', label: 'MP Article', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'warehouse', label: 'Warehouse', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'date', label: 'Date', sortable: true },
      { key: 'status_date', label: 'Status Date', sortable: true },
      { key: 'delivery', label: 'Delivery', sortable: true },
      { key: 'payout', label: 'Payout', sortable: true },
      { key: 'created_at', label: 'Created At', sortable: true },
    ],
    [],
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Orders</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3 mb-3" onSubmit={onSubmitFilters}>
              <div className="col-md-3">
                <CFormInput
                  type="text"
                  placeholder="Search by barcode, article, name or warehouse"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <CFormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </CFormSelect>
              </div>
              <div className="col-md-2">
                <CFormInput type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="col-md-2">
                <CFormInput type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <CButton type="submit" color="primary">
                  Apply
                </CButton>
                <CButton
                  type="button"
                  color="secondary"
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setStatus('')
                    setDateFrom('')
                    setDateTo('')
                    setPage(1)
                    fetchData()
                  }}
                >
                  Reset
                </CButton>
              </div>
            </CForm>

            <div className="table-responsive">
              <CTable hover align="middle" className="mb-0 border">
                <CTableHead color="light">
                  <CTableRow>
                    {headers.map((h) => (
                      <CTableHeaderCell
                        key={h.key}
                        role={h.sortable ? 'button' : undefined}
                        onClick={h.sortable ? () => toggleSort(h.key) : undefined}
                      >
                        {h.label}
                        {sortBy === h.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                      </CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <CTableRow>
                      <CTableDataCell colSpan={headers.length} className="text-center">
                        <CSpinner size="sm" /> Loading...
                      </CTableDataCell>
                    </CTableRow>
                  ) : error ? (
                    <CTableRow>
                      <CTableDataCell colSpan={headers.length} className="text-danger">
                        {error}
                      </CTableDataCell>
                    </CTableRow>
                  ) : items.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={headers.length} className="text-center">
                        No orders found.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    items.map((item) => (
                      <CTableRow key={item.id}>
                        <CTableDataCell>{item.barcode}</CTableDataCell>
                        <CTableDataCell>{item.mp_article}</CTableDataCell>
                        <CTableDataCell>{item.name}</CTableDataCell>
                        <CTableDataCell>{item.warehouse}</CTableDataCell>
                        <CTableDataCell className="text-capitalize">{item.status}</CTableDataCell>
                        <CTableDataCell>{item.date ? new Date(item.date).toLocaleDateString() : ''}</CTableDataCell>
                        <CTableDataCell>{item.status_date ? new Date(item.status_date).toLocaleDateString() : ''}</CTableDataCell>
                        <CTableDataCell>{item.delivery != null ? Number(item.delivery).toFixed(2) : ''}</CTableDataCell>
                        <CTableDataCell>{item.payout != null ? Number(item.payout).toFixed(2) : ''}</CTableDataCell>
                        <CTableDataCell>{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            </div>

            {pagination.last_page > 1 && (
              <div className="mt-3 d-flex justify-content-center">
                <CPagination align="center">
                  <CPaginationItem disabled={page === 1} onClick={() => setPage(1)}>
                    « First
                  </CPaginationItem>
                  <CPaginationItem disabled={page === 1} onClick={() => setPage(page - 1)}>
                    ‹ Prev
                  </CPaginationItem>
                  <CPaginationItem active>{page}</CPaginationItem>
                  <CPaginationItem
                    disabled={page === pagination.last_page}
                    onClick={() => setPage(page + 1)}
                  >
                    Next ›
                  </CPaginationItem>
                  <CPaginationItem
                    disabled={page === pagination.last_page}
                    onClick={() => setPage(pagination.last_page)}
                  >
                    Last »
                  </CPaginationItem>
                </CPagination>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Orders

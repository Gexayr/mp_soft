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
import SalesService from '../../services/salesService'

const Sales = () => {
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
      const res = await SalesService.fetchSales({
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
        setError(res.message || 'Failed to load sales')
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
            <strong>Sales</strong>
          </CCardHeader>
          <CCardBody>
            {/* Filters */}
            <CForm onSubmit={onSubmitFilters} className="mb-3">
              <CRow className="g-2 align-items-end">
                <CCol md={3}>
                  <CFormInput
                    type="text"
                    label="Search"
                    placeholder="Search by barcode, article, name, warehouse"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </CCol>
                <CCol md={2}>
                  <CFormSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="sold">Sold</option>
                    <option value="purchased">Purchased</option>
                    <option value="returned">Returned</option>
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CFormInput
                    type="date"
                    label="Date from"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </CCol>
                <CCol md={2}>
                  <CFormInput type="date" label="Date to" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </CCol>
                <CCol md={3}>
                  <div className="d-flex gap-2">
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
                </CCol>
              </CRow>
            </CForm>

            {/* Table */}
            <div className="table-responsive">
              <CTable hover align="middle" className="mb-0 border" responsive>
                <CTableHead color="light">
                  <CTableRow>
                    {headers.map((h) => (
                      <CTableHeaderCell
                        key={h.key}
                        role="button"
                        onClick={() => h.sortable && toggleSort(h.key)}
                        className={h.sortable ? 'user-select-none' : ''}
                      >
                        {h.label}
                        {sortBy === h.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                      </CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <CTableRow>
                      <CTableDataCell colSpan={headers.length} className="text-center py-5">
                        <CSpinner size="sm" className="me-2" /> Loading sales...
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
                        No sales found.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    items.map((item) => (
                      <CTableRow key={item.id}>
                        <CTableDataCell>{item.barcode}</CTableDataCell>
                        <CTableDataCell>{item.mp_article}</CTableDataCell>
                        <CTableDataCell>{item.name}</CTableDataCell>
                        <CTableDataCell>{item.warehouse}</CTableDataCell>
                        <CTableDataCell>{item.status}</CTableDataCell>
                        <CTableDataCell>{item.date}</CTableDataCell>
                        <CTableDataCell>{item.status_date}</CTableDataCell>
                        <CTableDataCell>{item.delivery}</CTableDataCell>
                        <CTableDataCell>{item.payout}</CTableDataCell>
                        <CTableDataCell>{item.created_at}</CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            </div>

            {/* Pagination */}

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Total: {pagination.total}
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
              <CPagination align="end" aria-label="Sales pagination">
                <CPaginationItem disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </CPaginationItem>
                <CPaginationItem active>{page}</CPaginationItem>
                <CPaginationItem disabled={page >= pagination.last_page} onClick={() => setPage(page + 1)}>
                  Next
                </CPaginationItem>
              </CPagination>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Sales

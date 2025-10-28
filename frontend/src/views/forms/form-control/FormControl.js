import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import { DocsExample } from 'src/components'
import authService from 'src/services/authService'

const FormControl = () => {
  // Orders section state
  const [ordersFile, setOrdersFile] = useState(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersMessage, setOrdersMessage] = useState(null)
  const [ordersError, setOrdersError] = useState(null)
  const [formKeyOrders, setFormKeyOrders] = useState(0)

  // Sales section state
  const [salesFile, setSalesFile] = useState(null)
  const [salesLoading, setSalesLoading] = useState(false)
  const [salesMessage, setSalesMessage] = useState(null)
  const [salesError, setSalesError] = useState(null)
  const [formKeySales, setFormKeySales] = useState(0)

  const resetOrders = () => {
    setOrdersFile(null)
    setOrdersMessage(null)
    setOrdersError(null)
    setFormKeyOrders((prev) => prev + 1)
  }

  const resetSales = () => {
    setSalesFile(null)
    setSalesMessage(null)
    setSalesError(null)
    setFormKeySales((prev) => prev + 1)
  }

  const handleOrdersSubmit = async (e) => {
    e.preventDefault()
    setOrdersMessage(null)
    setOrdersError(null)

    if (!ordersFile) {
      setOrdersError('Please select an orders document to process.')
      return
    }

    const formData = new FormData()
    formData.append('document1', ordersFile)

    try {
      setOrdersLoading(true)
      const res = await authService.uploadDocuments(formData)
      setOrdersMessage(res.message || 'Orders document uploaded successfully')
    } catch (err) {
      setOrdersError(err.message || 'Orders upload failed')
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleSalesSubmit = async (e) => {
    e.preventDefault()
    setSalesMessage(null)
    setSalesError(null)

    if (!salesFile) {
      setSalesError('Please select a sales document to process.')
      return
    }

    const formData = new FormData()
    formData.append('document2', salesFile)

    try {
      setSalesLoading(true)
      const res = await authService.uploadDocuments(formData)
      setSalesMessage(res.message || 'Sales document uploaded successfully')
    } catch (err) {
      setSalesError(err.message || 'Sales upload failed')
    } finally {
      setSalesLoading(false)
    }
  }

  return (
    <CRow>
      {/*<CCol xs={12}>*/}
      {/*  <CCard className="mb-4">*/}
      {/*    <CCardHeader>*/}
      {/*      <strong>React Form Control</strong>*/}
      {/*    </CCardHeader>*/}
      {/*    <CCardBody>*/}
      {/*      <DocsExample href="forms/form-control">*/}
      {/*        <CForm>*/}
      {/*          <div className="mb-3">*/}
      {/*            <CFormLabel htmlFor="exampleFormControlInput1">Email address</CFormLabel>*/}
      {/*            <CFormInput*/}
      {/*              type="email"*/}
      {/*              id="exampleFormControlInput1"*/}
      {/*              placeholder="name@example.com"*/}
      {/*            />*/}
      {/*          </div>*/}
      {/*          <div className="mb-3">*/}
      {/*            <CFormLabel htmlFor="exampleFormControlTextarea1">Example textarea</CFormLabel>*/}
      {/*            <CFormTextarea id="exampleFormControlTextarea1" rows={3}></CFormTextarea>*/}
      {/*          </div>*/}
      {/*        </CForm>*/}
      {/*      </DocsExample>*/}
      {/*    </CCardBody>*/}
      {/*  </CCard>*/}
      {/*</CCol>*/}
      {/*<CCol xs={12}>*/}
      {/*  <CCard className="mb-4">*/}
      {/*    <CCardHeader>*/}
      {/*      <strong>React Form Control</strong> <small>Sizing</small>*/}
      {/*    </CCardHeader>*/}
      {/*    <CCardBody>*/}
      {/*      <p className="text-body-secondary small">*/}
      {/*        Set heights using <code>size</code> property like <code>size=&#34;lg&#34;</code> and{' '}*/}
      {/*        <code>size=&#34;sm&#34;</code>.*/}
      {/*      </p>*/}
      {/*      <DocsExample href="forms/form-control#sizing">*/}
      {/*        <CFormInput*/}
      {/*          type="text"*/}
      {/*          size="lg"*/}
      {/*          placeholder="Large input"*/}
      {/*          aria-label="lg input example"*/}
      {/*        />*/}
      {/*        <br />*/}
      {/*        <CFormInput*/}
      {/*          type="text"*/}
      {/*          placeholder="Default input"*/}
      {/*          aria-label="default input example"*/}
      {/*        />*/}
      {/*        <br />*/}
      {/*        <CFormInput*/}
      {/*          type="text"*/}
      {/*          size="sm"*/}
      {/*          placeholder="Small input"*/}
      {/*          aria-label="sm input example"*/}
      {/*        />*/}
      {/*      </DocsExample>*/}
      {/*    </CCardBody>*/}
      {/*  </CCard>*/}
      {/*</CCol>*/}
      {/*<CCol xs={12}>*/}
      {/*  <CCard className="mb-4">*/}
      {/*    <CCardHeader>*/}
      {/*      <strong>React Form Control</strong> <small>Disabled</small>*/}
      {/*    </CCardHeader>*/}
      {/*    <CCardBody>*/}
      {/*      <p className="text-body-secondary small">*/}
      {/*        Add the <code>disabled</code> boolean attribute on an input to give it a grayed out*/}
      {/*        appearance and remove pointer events.*/}
      {/*      </p>*/}
      {/*      <DocsExample href="forms/form-control#disabled">*/}
      {/*        <CFormInput*/}
      {/*          type="text"*/}
      {/*          placeholder="Disabled input"*/}
      {/*          aria-label="Disabled input example"*/}
      {/*          disabled*/}
      {/*        />*/}
      {/*        <br />*/}
      {/*        <CFormInput*/}
      {/*          type="text"*/}
      {/*          placeholder="Disabled readonly input"*/}
      {/*          aria-label="Disabled input example"*/}
      {/*          disabled*/}
      {/*          readOnly*/}
      {/*        />*/}
      {/*        <br />*/}
      {/*      </DocsExample>*/}
      {/*    </CCardBody>*/}
      {/*  </CCard>*/}
      {/*</CCol>*/}
      {/*<CCol xs={12}>*/}
      {/*  <CCard className="mb-4">*/}
      {/*    <CCardHeader>*/}
      {/*      <strong>React Form Control</strong> <small>Readonly</small>*/}
      {/*    </CCardHeader>*/}
      {/*    <CCardBody>*/}
      {/*      <p className="text-body-secondary small">*/}
      {/*        Add the <code>readOnly</code> boolean attribute on an input to prevent modification of*/}
      {/*        the input&#39;s value. Read-only inputs appear lighter (just like disabled inputs),*/}
      {/*        but retain the standard cursor.*/}
      {/*      </p>*/}
      {/*      <DocsExample href="forms/form-control#readonly">*/}
      {/*        <CFormInput*/}
      {/*          type="text"*/}
      {/*          placeholder="Readonly input here..."*/}
      {/*          aria-label="readonly input example"*/}
      {/*          readOnly*/}
      {/*        />*/}
      {/*      </DocsExample>*/}
      {/*    </CCardBody>*/}
      {/*  </CCard>*/}
      {/*</CCol>*/}
      {/*<CCol xs={12}>*/}
      {/*  <CCard className="mb-4">*/}
      {/*    <CCardHeader>*/}
      {/*      <strong>React Form Control</strong> <small>Readonly plain text</small>*/}
      {/*    </CCardHeader>*/}
      {/*    <CCardBody>*/}
      {/*      <p className="text-body-secondary small">*/}
      {/*        If you want to have <code>&lt;input readonly&gt;</code> elements in your form styled*/}
      {/*        as plain text, use the <code>plainText</code> boolean property to remove the default*/}
      {/*        form field styling and preserve the correct margin and padding.*/}
      {/*      </p>*/}
      {/*      <DocsExample href="components/accordion">*/}
      {/*        <CRow className="mb-3">*/}
      {/*          <CFormLabel htmlFor="staticEmail" className="col-sm-2 col-form-label">*/}
      {/*            Email*/}
      {/*          </CFormLabel>*/}
      {/*          <div className="col-sm-10">*/}
      {/*            <CFormInput*/}
      {/*              type="text"*/}
      {/*              id="staticEmail"*/}
      {/*              defaultValue="email@example.com"*/}
      {/*              readOnly*/}
      {/*              plainText*/}
      {/*            />*/}
      {/*          </div>*/}
      {/*        </CRow>*/}
      {/*        <CRow className="mb-3">*/}
      {/*          <CFormLabel htmlFor="inputPassword" className="col-sm-2 col-form-label">*/}
      {/*            Password*/}
      {/*          </CFormLabel>*/}
      {/*          <div className="col-sm-10">*/}
      {/*            <CFormInput type="password" id="inputPassword" />*/}
      {/*          </div>*/}
      {/*        </CRow>*/}
      {/*      </DocsExample>*/}
      {/*      <DocsExample href="components/accordion">*/}
      {/*        <CForm className="row g-3">*/}
      {/*          <div className="col-auto">*/}
      {/*            <CFormLabel htmlFor="staticEmail2" className="visually-hidden">*/}
      {/*              Email*/}
      {/*            </CFormLabel>*/}
      {/*            <CFormInput*/}
      {/*              type="text"*/}
      {/*              id="staticEmail2"*/}
      {/*              defaultValue="email@example.com"*/}
      {/*              readOnly*/}
      {/*              plainText*/}
      {/*            />*/}
      {/*          </div>*/}
      {/*          <div className="col-auto">*/}
      {/*            <CFormLabel htmlFor="inputPassword2" className="visually-hidden">*/}
      {/*              Password*/}
      {/*            </CFormLabel>*/}
      {/*            <CFormInput type="password" id="inputPassword2" placeholder="Password" />*/}
      {/*          </div>*/}
      {/*          <div className="col-auto">*/}
      {/*            <CButton color="primary" type="submit" className="mb-3">*/}
      {/*              Confirm identity*/}
      {/*            </CButton>*/}
      {/*          </div>*/}
      {/*        </CForm>*/}
      {/*      </DocsExample>*/}
      {/*    </CCardBody>*/}
      {/*  </CCard>*/}
      {/*</CCol>*/}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Orders Documents</strong>
          </CCardHeader>
          <CCardBody>
            {ordersMessage && (
              <CAlert color="success" className="mb-3" dismissible onClose={() => setOrdersMessage(null)}>
                {ordersMessage}
              </CAlert>
            )}
            {ordersError && (
              <CAlert color="danger" className="mb-3" dismissible onClose={() => setOrdersError(null)}>
                {ordersError}
              </CAlert>
            )}

            <p className="text-body-secondary small">Upload only orders document (.xlsx)</p>

            <DocsExample href="forms/form-control#file-input">
              <CForm onSubmit={handleOrdersSubmit} key={formKeyOrders}>
                <div className="mb-3">
                  <CFormLabel htmlFor="ordersFile">Orders file</CFormLabel>
                  <CFormInput
                    type="file"
                    id="ordersFile"
                    onChange={(e) => setOrdersFile(e.target.files?.[0] || null)}
                    disabled={ordersLoading}
                  />
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <CButton
                    type="button"
                    color="danger"
                    variant="ghost"
                    className="me-md-2"
                    onClick={resetOrders}
                    disabled={ordersLoading}
                  >
                    Reset
                  </CButton>
                  <CButton type="submit" color="primary" variant="ghost" disabled={ordersLoading}>
                    {ordersLoading ? (
                      <>
                        <CSpinner size="sm" className="me-2" /> Processing
                      </>
                    ) : (
                      'Process Orders'
                    )}
                  </CButton>
                </div>
              </CForm>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Sales Documents</strong>
          </CCardHeader>
          <CCardBody>
            {salesMessage && (
              <CAlert color="success" className="mb-3" dismissible onClose={() => setSalesMessage(null)}>
                {salesMessage}
              </CAlert>
            )}
            {salesError && (
              <CAlert color="danger" className="mb-3" dismissible onClose={() => setSalesError(null)}>
                {salesError}
              </CAlert>
            )}

            <p className="text-body-secondary small">Upload only sales document (.xlsx)</p>

            <DocsExample href="forms/form-control#file-input">
              <CForm onSubmit={handleSalesSubmit} key={formKeySales}>
                <div className="mb-3">
                  <CFormLabel htmlFor="salesFile">Sales file</CFormLabel>
                  <CFormInput
                    type="file"
                    id="salesFile"
                    onChange={(e) => setSalesFile(e.target.files?.[0] || null)}
                    disabled={salesLoading}
                  />
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <CButton
                    type="button"
                    color="danger"
                    variant="ghost"
                    className="me-md-2"
                    onClick={resetSales}
                    disabled={salesLoading}
                  >
                    Reset
                  </CButton>
                  <CButton type="submit" color="primary" variant="ghost" disabled={salesLoading}>
                    {salesLoading ? (
                      <>
                        <CSpinner size="sm" className="me-2" /> Processing
                      </>
                    ) : (
                      'Process Sales'
                    )}
                  </CButton>
                </div>
              </CForm>
            </DocsExample>
          </CCardBody>
        </CCard>
      </CCol>
      {/*<CCol xs={12}>*/}
      {/*  <CCard className="mb-4">*/}
      {/*    <CCardHeader>*/}
      {/*      <strong>React Form Control</strong> <small>Color</small>*/}
      {/*    </CCardHeader>*/}
      {/*    <CCardBody>*/}
      {/*      <DocsExample href="forms/form-control#color">*/}
      {/*        <CFormLabel htmlFor="exampleColorInput">Color picker</CFormLabel>*/}
      {/*        <CFormInput*/}
      {/*          type="color"*/}
      {/*          id="exampleColorInput"*/}
      {/*          defaultValue="#563d7c"*/}
      {/*          title="Choose your color"*/}
      {/*        />*/}
      {/*      </DocsExample>*/}
      {/*    </CCardBody>*/}
      {/*  </CCard>*/}
      {/*</CCol>*/}
    </CRow>
  )
}

export default FormControl

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
  const [document1, setDocument1] = useState(null)
  const [document2, setDocument2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const resetForm = () => {
    setDocument1(null)
    setDocument2(null)
    setMessage(null)
    setError(null)
    // Also reset the actual input values by forcing re-render via key
    setFormKey((prev) => prev + 1)
  }

  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!document1 || !document2) {
      setError('Please select both files before processing.')
      return
    }

    const formData = new FormData()
    formData.append('document1', document1)
    formData.append('document2', document2)

    try {
      setLoading(true)
      const res = await authService.uploadDocuments(formData)
      setMessage(res.message || 'Documents uploaded successfully')
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setLoading(false)
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
            <strong>Upload Documents</strong>
          </CCardHeader>
          <CCardBody>
            {message && (
              <CAlert color="success" className="mb-3" dismissible onClose={() => setMessage(null)}>
                {message}
              </CAlert>
            )}
            {error && (
              <CAlert color="danger" className="mb-3" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}

            <p className="text-body-secondary small">
              Select two documents to send to backend for processing.
            </p>

            <DocsExample href="forms/form-control#file-input">
              <CForm onSubmit={handleSubmit} key={formKey}>
                <div className="mb-3">
                  <CFormLabel htmlFor="formFile1">1st file</CFormLabel>
                  <CFormInput
                    type="file"
                    id="formFile1"
                    onChange={(e) => setDocument1(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="formFile2">2nd file</CFormLabel>
                  <CFormInput
                    type="file"
                    id="formFile2"
                    onChange={(e) => setDocument2(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <CButton
                    type="button"
                    color="danger"
                    variant="ghost"
                    className="me-md-2"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Cancel
                  </CButton>
                  <CButton type="submit" color="primary" variant="ghost" disabled={loading}>
                    {loading ? (
                      <>
                        <CSpinner size="sm" className="me-2" /> Processing
                      </>
                    ) : (
                      'Process'
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

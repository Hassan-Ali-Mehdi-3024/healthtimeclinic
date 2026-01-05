'use client';

import React, { useState, useEffect } from 'react';

const InventoryForm = ({ initialData, onSubmit, submitLabel = 'Save' }) => {
  // Hardcoded list of 6 base medicines
  const baseMedicines = [
    { name: 'COBECWT', description: 'Cobalt Becal Weight' },
    { name: 'COBECWRT', description: 'Cobalt Becal Weight Reduced' },
    { name: 'COBECGT', description: 'Cobalt Becal Green Tea' },
    { name: 'COBECYT', description: 'Cobalt Becal Yellow Tea' },
    { name: 'COBECPT', description: 'Cobalt Becal Purple Tea' },
    { name: 'SLIM-X', description: 'Slim-X Formula' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_in: '',
    price_out: '',
    manufacturing_date: '',
    expiry_date: '',
    batch_number: '',
    batch_in_date: '',
    batch_qty_expected_cartons: '',
    batch_qty_expected_boxes: '',
    batch_qty_received_cartons: '',
    batch_qty_received_boxes: '',
    drapact_number: '',
    warranty_received: false,
    warranty_receive_date: '',
    bill_invoice_number: '',
    in_stock_qty_boxes: ''
  });

  const [dateDisplays, setDateDisplays] = useState({
    manufacturing_date: '',
    expiry_date: '',
    batch_in_date: '',
    warranty_receive_date: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price_in: initialData.price_in || '',
        price_out: initialData.price_out || '',
        manufacturing_date: initialData.manufacturing_date || '',
        expiry_date: initialData.expiry_date || '',
        batch_number: initialData.batch_number || '',
        batch_in_date: initialData.batch_in_date || '',
        batch_qty_expected_cartons: initialData.batch_qty_expected_cartons || '',
        batch_qty_expected_boxes: initialData.batch_qty_expected_boxes || '',
        batch_qty_received_cartons: initialData.batch_qty_received_cartons || '',
        batch_qty_received_boxes: initialData.batch_qty_received_boxes || '',
        drapact_number: initialData.drapact_number || '',
        warranty_received: Boolean(initialData.warranty_received),
        warranty_receive_date: initialData.warranty_receive_date || '',
        bill_invoice_number: initialData.bill_invoice_number || '',
        in_stock_qty_boxes: initialData.in_stock_qty_boxes || ''
      });

      // Convert ISO dates to dd/mm/yyyy for display
      const convertToDisplay = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      setDateDisplays({
        manufacturing_date: convertToDisplay(initialData.manufacturing_date),
        expiry_date: convertToDisplay(initialData.expiry_date),
        batch_in_date: convertToDisplay(initialData.batch_in_date),
        warranty_receive_date: convertToDisplay(initialData.warranty_receive_date)
      });
    }
  }, [initialData]);

  const handleDateChange = (fieldName, value) => {
    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as dd/mm/yyyy
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }

    setDateDisplays(prev => ({
      ...prev,
      [fieldName]: formatted
    }));

    // If we have a complete date (8 digits), convert to ISO format
    if (cleaned.length === 8) {
      const day = cleaned.slice(0, 2);
      const month = cleaned.slice(2, 4);
      const year = cleaned.slice(4, 8);
      
      // Validate date
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() === parseInt(year) && 
          date.getMonth() === parseInt(month) - 1 && 
          date.getDate() === parseInt(day)) {
        const isoDate = `${year}-${month}-${day}`;
        setFormData(prev => ({
          ...prev,
          [fieldName]: isoDate
        }));
      }
    } else {
      // Clear the ISO date if incomplete
      setFormData(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'name') {
      // Auto-set description based on medicine name
      const selected = baseMedicines.find(m => m.name === value);
      setFormData(prev => ({
        ...prev,
        name: value,
        description: selected ? selected.description : prev.description
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: 'var(--text-primary)'
  };

  const sectionStyle = {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  };

  const sectionTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: 'var(--primary-color)',
    borderBottom: '2px solid var(--primary-color)',
    paddingBottom: '0.5rem'
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Product Information */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Product Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Medicine Name *</label>
            <select
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select a medicine</option>
              {baseMedicines.map((med, index) => (
                <option key={index} value={med.name}>
                  {med.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Medicine description"
            />
          </div>
          <div>
            <label style={labelStyle}>Price IN (Per Batch)</label>
            <input
              type="number"
              name="price_in"
              value={formData.price_in}
              onChange={handleChange}
              step="0.01"
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={labelStyle}>Price OUT (Per Box)</label>
            <input
              type="number"
              name="price_out"
              value={formData.price_out}
              onChange={handleChange}
              step="0.01"
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Batch Details */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Batch Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Batch Number *</label>
            <input
              type="text"
              name="batch_number"
              value={formData.batch_number}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="e.g., BATCH-2026-A1"
            />
          </div>
          <div>
            <label style={labelStyle}>Batch IN Date</label>
            <input
              type="text"
              value={dateDisplays.batch_in_date}
              onChange={(e) => handleDateChange('batch_in_date', e.target.value)}
              style={inputStyle}
              placeholder="dd/mm/yyyy"
              maxLength="10"
            />
          </div>
          <div>
            <label style={labelStyle}>Manufacturing Date</label>
            <input
              type="text"
              value={dateDisplays.manufacturing_date}
              onChange={(e) => handleDateChange('manufacturing_date', e.target.value)}
              style={inputStyle}
              placeholder="dd/mm/yyyy"
              maxLength="10"
            />
          </div>
          <div>
            <label style={labelStyle}>Expiry Date</label>
            <input
              type="text"
              value={dateDisplays.expiry_date}
              onChange={(e) => handleDateChange('expiry_date', e.target.value)}
              style={inputStyle}
              placeholder="dd/mm/yyyy"
              maxLength="10"
            />
          </div>
          <div>
            <label style={labelStyle}>DRAPACT Number</label>
            <input
              type="text"
              name="drapact_number"
              value={formData.drapact_number}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter DRAPACT number"
            />
          </div>
        </div>
      </div>

      {/* Quantities */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Quantities</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Expected QTY - Cartons</label>
            <input
              type="number"
              name="batch_qty_expected_cartons"
              value={formData.batch_qty_expected_cartons}
              onChange={handleChange}
              style={inputStyle}
              placeholder="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Expected QTY - Boxes</label>
            <input
              type="number"
              name="batch_qty_expected_boxes"
              value={formData.batch_qty_expected_boxes}
              onChange={handleChange}
              style={inputStyle}
              placeholder="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Received QTY - Cartons</label>
            <input
              type="number"
              name="batch_qty_received_cartons"
              value={formData.batch_qty_received_cartons}
              onChange={handleChange}
              style={inputStyle}
              placeholder="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Received QTY - Boxes</label>
            <input
              type="number"
              name="batch_qty_received_boxes"
              value={formData.batch_qty_received_boxes}
              onChange={handleChange}
              style={inputStyle}
              placeholder="0"
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
              Initial stock will be set to received quantity
            </small>
          </div>
        </div>
      </div>

      {/* Warranty & Invoice */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Warranty & Invoice</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="warranty_received"
                checked={formData.warranty_received}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500' }}>Warranty Received</span>
            </label>
          </div>
          {formData.warranty_received && (
            <div>
              <label style={labelStyle}>Warranty Receive Date</label>
              <input
                type="text"
                value={dateDisplays.warranty_receive_date}
                onChange={(e) => handleDateChange('warranty_receive_date', e.target.value)}
                style={inputStyle}
                placeholder="dd/mm/yyyy"
                maxLength="10"
              />
            </div>
          )}
          <div>
            <label style={labelStyle}>Bill / Invoice Number</label>
            <input
              type="text"
              name="bill_invoice_number"
              value={formData.bill_invoice_number}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter invoice number"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default InventoryForm;

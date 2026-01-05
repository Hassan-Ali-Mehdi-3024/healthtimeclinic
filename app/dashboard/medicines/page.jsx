'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, AlertTriangle, Clock, Search, Pill, Tag, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import CombinationForm from '@/components/CombinationForm';

const MedicinesPage = () => {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'combinations'
  const [showComboForm, setShowComboForm] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [comboSearchQuery, setComboSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, comboRes] = await Promise.all([
        fetch('/api/medicines?type=batch'),
        fetch('/api/medicines?type=combination')
      ]);
      const invData = await invRes.json();
      const comboData = await comboRes.json();
      setInventory(invData);
      setCombinations(comboData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCombination = async (formData) => {
    try {
      const url = editingCombo ? `/api/medicines/${editingCombo.id}` : '/api/medicines';
      const method = editingCombo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, is_combination: true, is_predefined: 1 })
      });

      if (response.ok) {
        toast.success(editingCombo ? 'Combination updated' : 'Combination created');
        setShowComboForm(false);
        setEditingCombo(null);
        fetchData();
      } else {
        toast.error('Failed to save combination');
      }
    } catch (error) {
      console.error('Error saving combination:', error);
      toast.error('Failed to save combination');
    }
  };

  const handleEditCombination = (combo) => {
    setEditingCombo(combo);
    setShowComboForm(true);
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    if (daysUntilExpiry <= 90) return 'expiring_90';
    return 'good';
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out_of_stock';
    if (stock < 10) return 'low_stock';
    if (stock < 50) return 'medium_stock';
    return 'good_stock';
  };

  const getExpiryBadge = (status) => {
    const badges = {
      expired: { text: 'Expired', bg: '#fee2e2', color: '#dc2626' },
      expiring_soon: { text: 'Expiring Soon', bg: '#fef3c7', color: '#d97706' },
      expiring_90: { text: 'Expiring <90d', bg: '#dbeafe', color: '#2563eb' },
      good: { text: 'Good', bg: '#dcfce7', color: '#16a34a' }
    };
    return badges[status] || null;
  };

  const getStockBadge = (status) => {
    const badges = {
      out_of_stock: { text: 'Out of Stock', bg: '#fee2e2', color: '#dc2626' },
      low_stock: { text: 'Low Stock', bg: '#fef3c7', color: '#d97706' },
      medium_stock: { text: 'Medium', bg: '#dbeafe', color: '#2563eb' },
      good_stock: { text: 'In Stock', bg: '#dcfce7', color: '#16a34a' }
    };
    return badges[status];
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (['expiry_date', 'manufacturing_date', 'batch_in_date'].includes(sortBy)) {
      aVal = new Date(aVal || 0);
      bVal = new Date(bVal || 0);
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredInventory = sortedInventory.filter(item => {
    // Apply status filter
    let statusMatch = true;
    if (filterStatus === 'expired') statusMatch = getExpiryStatus(item.expiry_date) === 'expired';
    else if (filterStatus === 'expiring') statusMatch = ['expiring_soon', 'expiring_90'].includes(getExpiryStatus(item.expiry_date));
    else if (filterStatus === 'low_stock') statusMatch = getStockStatus(item.in_stock_qty_boxes) === 'low_stock' || getStockStatus(item.in_stock_qty_boxes) === 'out_of_stock';
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        item.name,
        item.description,
        item.batch_number,
        item.drapact_number,
        item.bill_invoice_number
      ].filter(Boolean).join(' ').toLowerCase();
      
      return statusMatch && searchableText.includes(query);
    }
    
    return statusMatch;
  });

  const filteredCombinations = combinations.filter(combo => {
    if (!comboSearchQuery) return true;
    
    const query = comboSearchQuery.toLowerCase();
    const searchableText = [
      combo.name,
      combo.description,
      combo.tags,
      combo.dosage_pattern,
      combo.medicines_included
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchableText.includes(query);
  });

  const sortedCombinations = [...filteredCombinations].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>Medicines & Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage all medicines, stock batches, and combinations.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => { setEditingCombo(null); setShowComboForm(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: 'var(--primary-color)',
              border: '1px solid var(--primary-color)',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Plus size={20} /> Add Combination
          </button>
          <button
            onClick={() => router.push('/dashboard/medicines/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Plus size={20} /> Add New Batch
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            background: 'none',
            color: activeTab === 'inventory' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: '600',
            borderBottom: activeTab === 'inventory' ? '2px solid var(--primary-color)' : 'none',
            cursor: 'pointer'
          }}
        >
          Stock Batches
        </button>
        <button
          onClick={() => setActiveTab('combinations')}
          style={{
            padding: '1rem 0.5rem',
            border: 'none',
            background: 'none',
            color: activeTab === 'combinations' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: '600',
            borderBottom: activeTab === 'combinations' ? '2px solid var(--primary-color)' : 'none',
            cursor: 'pointer'
          }}
        >
          Predefined Combinations
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filters and Search for Inventory */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by name, batch #, DRAPACT #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              <option value="created_at">Sort by: Date Added</option>
              <option value="name">Sort by: Name</option>
              <option value="expiry_date">Sort by: Expiry Date</option>
              <option value="in_stock_qty_boxes">Sort by: Stock</option>
              <option value="price_out">Sort by: Price</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              <option value="all">All Status</option>
              <option value="expired">Expired</option>
              <option value="expiring">Expiring Soon</option>
              <option value="low_stock">Low Stock</option>
            </select>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '1rem', fontWeight: '600' }}>Medicine Name</th>
                  <th style={{ padding: '1rem', fontWeight: '600' }}>Batch #</th>
                  <th style={{ padding: '1rem', fontWeight: '600' }}>Stock</th>
                  <th style={{ padding: '1rem', fontWeight: '600' }}>Expiry</th>
                  <th style={{ padding: '1rem', fontWeight: '600' }}>Price (Out)</th>
                  <th style={{ padding: '1rem', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                ) : filteredInventory.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No inventory batches found.</td></tr>
                ) : (
                  filteredInventory.map(item => {
                    const expiryStatus = getExpiryStatus(item.expiry_date);
                    const stockStatus = getStockStatus(item.in_stock_qty_boxes);
                    const expiryBadge = getExpiryBadge(expiryStatus);
                    const stockBadge = getStockBadge(stockStatus);

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => router.push(`/dashboard/medicines/${item.id}`)}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.drapact_number}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>{item.batch_number}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span>{item.in_stock_qty_boxes} boxes</span>
                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: stockBadge.bg, color: stockBadge.color, width: 'fit-content' }}>
                              {stockBadge.text}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</span>
                            {expiryBadge && (
                              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: expiryBadge.bg, color: expiryBadge.color, width: 'fit-content' }}>
                                {expiryBadge.text}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>Rs. {item.price_out}</td>
                        <td style={{ padding: '1rem' }}>
                          <button style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>View Details</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Search for Combinations */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', maxWidth: '500px' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search combinations by name or description..."
                value={comboSearchQuery}
                onChange={(e) => setComboSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {sortedCombinations.length === 0 ? (
            <p>{comboSearchQuery ? 'No combinations match your search.' : 'No predefined combinations found.'}</p>
          ) : (
            sortedCombinations.map(combo => {
              const tagList = combo.tags ? combo.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
              const medicinesList = combo.medicines_included ? JSON.parse(combo.medicines_included) : [];
              const dosages = combo.medicine_dosages ? JSON.parse(combo.medicine_dosages) : {};
              
              return (
              <div key={combo.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '10px', color: 'var(--primary-color)' }}>
                    <Pill size={24} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: '#dbeafe', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', height: 'fit-content' }}>
                    {medicinesList.length === 1 ? '1 Medicine' : `${medicinesList.length} Medicines`}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{combo.name}</h3>
                
                {medicinesList.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Medicines & Dosages:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {medicinesList.map((med, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {med}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '500', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--primary-color)', color: 'white' }}>
                            {dosages[med] || '0+0+0'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {combo.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{combo.description}</p>
                )}
                
                {tagList.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {tagList.map((tag, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Tag size={12} /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => handleEditCombination(combo)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--primary-color)', background: 'white', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: 'auto' }}
                >
                  <Edit size={16} /> Edit Combination
                </button>
              </div>
            );
            })
          )}
          </div>
        </>
      )}

      {/* Combination Form Modal */}
      {showComboForm && (
        <CombinationForm
          combination={editingCombo}
          onSave={handleSaveCombination}
          onCancel={() => {
            setShowComboForm(false);
            setEditingCombo(null);
          }}
        />
      )}
    </div>
  );
};

export default MedicinesPage;

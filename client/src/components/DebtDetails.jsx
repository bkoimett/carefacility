import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, User, Clock } from 'lucide-react';
import { dashboardApi } from '../utils/api';
import { showError } from './ToastNotifications';
import { useNavigate } from 'react-router-dom';

const DebtDetails = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [debtors, setDebtors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchDebtSummary();
    }
  }, [isOpen]);

  const fetchDebtSummary = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getClientsDebtSummary();
      // Response is: { data: { clients: [...], totalDebt: ... } }
      const rawData = response?.data || response || {};
      const clientsData = rawData.clients || rawData.debtors || rawData.data || [];
      const debtorsArray = Array.isArray(clientsData) ? clientsData : [];
      setDebtors(debtorsArray);
    } catch (error) {
      console.error('Failed to load debt data:', error);
      showError('Failed to load debt data');
      setDebtors([]);
    } finally {
      setLoading(false);
    }
  };

  const getOverdueStatus = (days) => {
    if (days > 30) return { color: 'text-[#EF4444]', bg: 'bg-[rgba(239,68,68,0.1)]', label: 'Critical' };
    if (days > 15) return { color: 'text-[#F59E0B]', bg: 'bg-[rgba(245,158,11,0.1)]', label: 'Overdue' };
    return { color: 'text-[#06B6D4]', bg: 'bg-[rgba(6,182,212,0.1)]', label: 'Due Soon' };
  };

  const totalDebt = Array.isArray(debtors) && debtors.length > 0
    ? debtors.reduce((sum, client) => sum + Math.abs(client.balance || 0), 0)
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0B1426] rounded-2xl border border-[#1A263D] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-[0_8px_32px_-8px_rgba(2,4,12,0.6),_0_0_0_1px_rgba(26,38,61,0.8)]">
        <div className="flex items-center justify-between p-6 border-b border-[#1A263D]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[rgba(239,68,68,0.1)]">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <h2 className="text-xl font-semibold text-[#F0F4FF]">Outstanding Debt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#1A263D] transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7FA3]" />
          </button>
        </div>

        <div className="p-6 border-b border-[#1A263D] bg-[#070D19]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7FA3]">Total Outstanding Debt</p>
              <p className="text-3xl font-bold text-[#EF4444] mt-1">
                KES {totalDebt.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B7FA3]">Clients with Debt</p>
              <p className="text-2xl font-semibold text-[#F0F4FF] mt-1">
                {debtors.length}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-[#070D19]/50 rounded-xl p-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-[#1A263D] rounded w-32"></div>
                  <div className="h-5 bg-[#1A263D] rounded w-24"></div>
                </div>
              </div>
            ))
          ) : debtors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B7FA3]">No outstanding debt</p>
            </div>
          ) : (
            debtors.map((client, idx) => {
              const balance = Math.abs(client.balance || 0);
              const daysOverdue = client.daysOverdue || 0;
              const status = getOverdueStatus(daysOverdue);
              
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onClose();
                    navigate(`/clients/${client._id}`);
                  }}
                  className="bg-[#070D19]/30 rounded-xl border border-[#1A263D] p-4 hover:bg-[#1A263D]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#1A263D] flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-[#6B7FA3]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#F0F4FF] group-hover:text-[#06B6D4] transition-colors">
                          {client.name}
                        </p>
                        <p className="text-xs text-[#6B7FA3] mt-0.5">
                          {client.sponsor?.name || client.sponsorId?.name || 'No sponsor'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="text-right">
                        <p className="text-sm text-[#6B7FA3]">Balance</p>
                        <p className="text-lg font-bold text-[#EF4444]">
                          KES {balance.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-[#6B7FA3]">Status</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <Clock className="w-3 h-3" />
                          {status.label}
                          {daysOverdue > 0 && ` (${daysOverdue}d)`}
                        </span>
                      </div>
                      
                      <div className="text-[#6B7FA3] group-hover:text-[#06B6D4] transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {client.lastPaymentDate && (
                    <div className="mt-3 pt-3 border-t border-[#1A263D] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#6B7FA3]" />
                      <p className="text-xs text-[#6B7FA3]">
                        Last payment: {new Date(client.lastPaymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-6 border-t border-[#1A263D] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#1A263D] text-[#F0F4FF] hover:bg-[#1A263D]/70 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebtDetails;
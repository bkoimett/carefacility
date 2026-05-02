import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { dashboardApi } from '../utils/api';
import { showError } from './ToastNotifications';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RevenueDetails = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchMonthlySummary();
    }
  }, [isOpen]);

  const fetchMonthlySummary = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getPaymentsMonthlySummary();
      // Response is: { data: [...] } or just []
      const rawData = response?.data || response || [];
      const data = Array.isArray(rawData) ? rawData : (rawData.data || rawData.payments || rawData.monthly || []);
      
      // Transform data to expected format
      const formattedData = data.map(item => ({
        month: item._id ? `${MONTHS[item._id.month - 1]} ${item._id.year}` : 'Unknown',
        total: item.total || 0,
        count: item.count || 0,
        payments: (item.payments || []).map(payment => ({
          clientName: payment.client?.name || payment.clientName || 'Unknown Client',
          amount: payment.amount || 0,
          date: payment.paymentDate || payment.date,
          method: payment.paymentMethod || payment.method || 'N/A',
          paymentType: payment.paymentType || 'payment'
        }))
      }));
      
      setMonthlyData(formattedData);
    } catch (error) {
      console.error('Failed to load revenue data:', error);
      showError('Failed to load revenue data');
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMonth = (index) => {
    setExpandedMonths(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const totalRevenue = monthlyData.reduce((sum, month) => sum + (month.total || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0B1426] rounded-2xl border border-[#1A263D] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-[0_8px_32px_-8px_rgba(2,4,12,0.6),_0_0_0_1px_rgba(26,38,61,0.8)]">
        <div className="flex items-center justify-between p-6 border-b border-[#1A263D]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[rgba(245,158,11,0.1)]">
              <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <h2 className="text-xl font-semibold text-[#F0F4FF]">Revenue Details</h2>
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
              <p className="text-sm text-[#6B7FA3]">Total Revenue (All Time)</p>
              <p className="text-3xl font-bold text-[#F59E0B] mt-1">
                KES {totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B7FA3]">Total Transactions</p>
              <p className="text-2xl font-semibold text-[#F0F4FF] mt-1">
                {monthlyData.reduce((sum, m) => sum + (m.count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6 space-y-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-[#070D19]/50 rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-[#1A263D] rounded w-48 mb-3"></div>
                <div className="h-4 bg-[#1A263D] rounded w-32"></div>
              </div>
            ))
          ) : monthlyData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B7FA3]">No payment data available</p>
            </div>
          ) : (
            monthlyData.map((month, idx) => (
              <div key={idx} className="bg-[#070D19]/30 rounded-xl border border-[#1A263D] overflow-hidden">
                <button
                  onClick={() => toggleMonth(idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#1A263D]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#06B6D4]" />
                    <span className="font-semibold text-[#F0F4FF]">{month.month}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[#F59E0B] font-semibold">
                      KES {month.total?.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#6B7FA3]">
                      {month.count} payment{month.count !== 1 ? 's' : ''}
                    </span>
                    <svg className={`w-5 h-5 text-[#6B7FA3] transition-transform ${expandedMonths[idx] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {expandedMonths[idx] && (
                  <div className="border-t border-[#1A263D]">
                    <table className="w-full text-left">
                      <thead className="bg-[#0B1426]/50">
                        <tr>
                          <th className="p-3 text-xs font-medium text-[#6B7FA3]">Client</th>
                          <th className="p-3 text-xs font-medium text-[#6B7FA3]">Amount</th>
                          <th className="p-3 text-xs font-medium text-[#6B7FA3]">Date</th>
                          <th className="p-3 text-xs font-medium text-[#6B7FA3]">Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {month.payments?.map((payment, pIdx) => (
                          <tr key={pIdx} className="border-b border-[#1A263D] last:border-0 hover:bg-[#1A263D]/30">
                            <td className="p-3 text-sm text-[#F0F4FF]">
                              {payment.clientName || 'Unknown'}
                            </td>
                            <td className="p-3 text-sm text-[#F59E0B] font-medium">
                              KES {payment.amount?.toLocaleString()}
                            </td>
                            <td className="p-3 text-sm text-[#6B7FA3]">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-sm text-[#6B7FA3]">
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {payment.method || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
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

export default RevenueDetails;
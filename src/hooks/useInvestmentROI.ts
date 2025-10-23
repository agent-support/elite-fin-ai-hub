import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Investment {
  id: string;
  plan_name: string;
  amount: number;
  daily_yield: number;
  start_date: string;
  status: string;
}

export const useInvestmentROI = (userId: string | undefined) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [totalROI, setTotalROI] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateROI = (investment: Investment) => {
    if (investment.status !== 'active') return 0;
    
    const startDate = new Date(investment.start_date);
    const now = new Date();
    const hoursElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    
    // Calculate hourly rate: daily_yield / 24
    const hourlyRate = investment.daily_yield / 24;
    
    // ROI = investment amount * hourly rate * hours elapsed / 100
    const roi = (investment.amount * hourlyRate * hoursElapsed) / 100;
    
    return roi;
  };

  const fetchInvestments = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      setInvestments(data || []);
      
      const invested = (data || []).reduce((sum, inv) => sum + Number(inv.amount), 0);
      setTotalInvested(invested);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch investments on mount and when userId changes
  useEffect(() => {
    fetchInvestments();
  }, [userId]);

  // Update ROI every second for real-time calculation
  useEffect(() => {
    const interval = setInterval(() => {
      const roi = investments.reduce((sum, inv) => sum + calculateROI(inv), 0);
      setTotalROI(roi);
    }, 1000);

    return () => clearInterval(interval);
  }, [investments]);

  return {
    investments,
    totalROI,
    totalInvested,
    loading,
    refetch: fetchInvestments,
  };
};

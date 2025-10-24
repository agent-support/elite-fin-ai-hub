import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  crypto_type: string | null;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface TransactionListProps {
  userId?: string;
  limit?: number;
}

export const TransactionList = ({ userId, limit }: TransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-muted-foreground">No transactions yet</div>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                transaction.type === "deposit"
                  ? "bg-green-500/20"
                  : "bg-red-500/20"
              }`}
            >
              {transaction.type === "deposit" ? (
                <ArrowDownRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div>
              <div className="font-semibold capitalize">
                {transaction.type}{" "}
                {transaction.crypto_type && `(${transaction.crypto_type})`}
              </div>
              <div className="text-sm text-muted-foreground">
                {transaction.description || "No description"}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(transaction.created_at).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">
              ${Number(transaction.amount).toLocaleString()}
            </div>
            {getStatusBadge(transaction.status)}
          </div>
        </div>
      ))}
    </div>
  );
};

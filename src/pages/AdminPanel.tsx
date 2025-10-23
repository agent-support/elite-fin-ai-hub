import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, Users, DollarSign, ArrowDownCircle, CheckCircle, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface UserAccount {
  id: string;
  user_id: string;
  balance: number;
  btc_balance: number;
  eth_balance: number;
  deposit_address: string | null;
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  crypto_type: string;
  wallet_address: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [depositAddress, setDepositAddress] = useState("");

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
      
      if (!isAuthenticated) {
        toast.error("Access denied: Admin authentication required");
        navigate("/admin-login");
        return;
      }

      setLoading(false);
      
      // Load data after authentication check
      try {
        await loadData();
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };

    init();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, []);

  const callAdminAPI = async (action: string, data?: any) => {
    try {
      const password = localStorage.getItem("adminPassword") || "65657667";
      
      console.log('Calling admin API:', action);
      
      const response = await supabase.functions.invoke('admin-api', {
        body: { action, password, data }
      });

      console.log('Admin API response:', response);

      if (response.error) {
        console.error('Admin API error:', response.error);
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('callAdminAPI error:', error);
      throw error;
    }
  };

  const loadData = async () => {
    try {
      const [accountsResponse, withdrawalsResponse] = await Promise.all([
        callAdminAPI('get_accounts'),
        callAdminAPI('get_withdrawals')
      ]);

      if (accountsResponse.data) {
        setUserAccounts(accountsResponse.data);
      }

      if (withdrawalsResponse.data) {
        setWithdrawalRequests(withdrawalsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Realtime subscriptions work with RLS, so we'll use polling instead
    const interval = setInterval(() => {
      loadData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  };

  const handleFundAccount = async () => {
    if (!selectedUserId || !fundAmount) {
      toast.error("Please select a user and enter an amount");
      return;
    }

    try {
      await callAdminAPI('fund_account', {
        user_id: selectedUserId,
        balance: parseFloat(fundAmount)
      });

      toast.success("Account funded successfully");
      setFundAmount("");
      setSelectedUserId("");
      loadData();
    } catch (error) {
      toast.error("Failed to fund account");
      console.error(error);
    }
  };

  const handleUpdateDepositAddress = async () => {
    if (!selectedUserId || !depositAddress) {
      toast.error("Please select a user and enter a deposit address");
      return;
    }

    try {
      await callAdminAPI('update_deposit_address', {
        user_id: selectedUserId,
        deposit_address: depositAddress
      });

      toast.success("Deposit address updated successfully");
      setDepositAddress("");
      setSelectedUserId("");
      loadData();
    } catch (error) {
      toast.error("Failed to update deposit address");
      console.error(error);
    }
  };

  const handleWithdrawalAction = async (requestId: string, action: "approved" | "rejected", notes: string = "") => {
    try {
      if (action === "approved") {
        await callAdminAPI('approve_withdrawal', {
          withdrawal_id: requestId,
          admin_notes: notes || `Approved by admin`
        });
      } else {
        await callAdminAPI('reject_withdrawal', {
          withdrawal_id: requestId,
          admin_notes: notes || `Rejected by admin`
        });
      }

      toast.success(`Withdrawal ${action} successfully`);
      loadData();
    } catch (error) {
      toast.error(`Failed to ${action} withdrawal`);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, funds, and withdrawal requests</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            localStorage.removeItem("adminAuthenticated");
            toast.success("Logged out successfully");
            navigate("/admin-login");
          }}
        >
          Logout
        </Button>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="accounts">
            <Users className="h-4 w-4 mr-2" />
            User Accounts
          </TabsTrigger>
          <TabsTrigger value="fund">
            <DollarSign className="h-4 w-4 mr-2" />
            Fund Account
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Withdrawals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Balance (USD)</TableHead>
                    <TableHead>BTC Balance</TableHead>
                    <TableHead>ETH Balance</TableHead>
                    <TableHead>Deposit Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono text-xs">{account.user_id.slice(0, 8)}...</TableCell>
                      <TableCell>${account.balance.toFixed(2)}</TableCell>
                      <TableCell>{account.btc_balance.toFixed(8)}</TableCell>
                      <TableCell>{account.eth_balance.toFixed(8)}</TableCell>
                      <TableCell className="font-mono text-xs">{account.deposit_address || "Not set"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fund" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Fund User Account</h2>
              <div className="space-y-4">
                <div>
                  <Label>Select User</Label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full mt-2 p-2 border rounded-md bg-background"
                  >
                    <option value="">Select a user...</option>
                    {userAccounts.map((account) => (
                      <option key={account.user_id} value={account.user_id}>
                        {account.user_id.slice(0, 8)}... (Balance: ${account.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Amount (USD)</Label>
                  <Input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleFundAccount} className="w-full">
                  Fund Account
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Update Deposit Address</h2>
              <div className="space-y-4">
                <div>
                  <Label>Select User</Label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full mt-2 p-2 border rounded-md bg-background"
                  >
                    <option value="">Select a user...</option>
                    {userAccounts.map((account) => (
                      <option key={account.user_id} value={account.user_id}>
                        {account.user_id.slice(0, 8)}...
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Deposit Address</Label>
                  <Input
                    type="text"
                    value={depositAddress}
                    onChange={(e) => setDepositAddress(e.target.value)}
                    placeholder="Enter wallet address"
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleUpdateDepositAddress} className="w-full">
                  Update Address
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Withdrawal Requests</h2>
            <div className="space-y-4">
              {withdrawalRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No withdrawal requests</p>
              ) : (
                withdrawalRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">User ID</p>
                        <p className="font-mono text-sm">{request.user_id.slice(0, 16)}...</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-bold">{request.amount} {request.crypto_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Wallet Address</p>
                        <p className="font-mono text-xs break-all">{request.wallet_address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className={`font-semibold ${
                          request.status === 'pending' ? 'text-yellow-500' :
                          request.status === 'approved' ? 'text-success' : 'text-destructive'
                        }`}>
                          {request.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleWithdrawalAction(request.id, "approved")}
                          className="flex-1 bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleWithdrawalAction(request.id, "rejected")}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {request.admin_notes && (
                      <div className="mt-4 p-3 bg-muted rounded">
                        <p className="text-sm text-muted-foreground">Admin Notes</p>
                        <p className="text-sm">{request.admin_notes}</p>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Users, DollarSign, ArrowDownCircle, Edit } from "lucide-react";
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
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [depositUserId, setDepositUserId] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editBtcBalance, setEditBtcBalance] = useState("");
  const [editEthBalance, setEditEthBalance] = useState("");
  const [editDepositAddress, setEditDepositAddress] = useState("");

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    const savedPassword = localStorage.getItem("adminPassword");
    
    if (!isAuthenticated || !savedPassword) {
      navigate("/admin-login");
      return;
    }

    setAdminPassword(savedPassword);
    loadData(savedPassword);
  }, [navigate]);

  const loadData = async (password: string) => {
    try {
      // Fetch user accounts
      const accountsResponse = await supabase.functions.invoke('admin-api', {
        body: {
          action: 'get_accounts',
          password: password
        }
      });

      if (accountsResponse.error) {
        throw new Error(accountsResponse.error.message);
      }

      setUserAccounts(accountsResponse.data.data || []);

      // Fetch withdrawal requests
      const withdrawalsResponse = await supabase.functions.invoke('admin-api', {
        body: {
          action: 'get_withdrawals',
          password: password
        }
      });

      if (withdrawalsResponse.error) {
        throw new Error(withdrawalsResponse.error.message);
      }

      setWithdrawalRequests(withdrawalsResponse.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  const handleFundAccount = async () => {
    if (!selectedUserId || !fundAmount) {
      toast.error("Please select a user and enter an amount");
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const currentAccount = userAccounts.find(acc => acc.user_id === selectedUserId);
      if (!currentAccount) {
        toast.error("User not found");
        return;
      }

      const newBalance = parseFloat(currentAccount.balance.toString()) + amount;

      const response = await supabase.functions.invoke('admin-api', {
        body: {
          action: 'fund_account',
          password: adminPassword,
          data: {
            user_id: selectedUserId,
            balance: newBalance
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Account funded successfully with $${amount}`);
      setFundAmount("");
      setSelectedUserId("");
      loadData(adminPassword);
    } catch (error) {
      console.error('Error funding account:', error);
      toast.error('Failed to fund account');
    }
  };

  const handleUpdateDepositAddress = async () => {
    if (!depositUserId || !depositAddress) {
      toast.error("Please select a user and enter a deposit address");
      return;
    }

    try {
      const response = await supabase.functions.invoke('admin-api', {
        body: {
          action: 'update_deposit_address',
          password: adminPassword,
          data: {
            user_id: depositUserId,
            deposit_address: depositAddress
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Deposit address updated successfully");
      setDepositAddress("");
      setDepositUserId("");
      loadData(adminPassword);
    } catch (error) {
      console.error('Error updating deposit address:', error);
      toast.error('Failed to update deposit address');
    }
  };

  const handleEditAccount = (account: UserAccount) => {
    setEditingAccount(account);
    setEditBalance(account.balance.toString());
    setEditBtcBalance(account.btc_balance.toString());
    setEditEthBalance(account.eth_balance.toString());
    setEditDepositAddress(account.deposit_address || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAccount) return;

    try {
      const response = await supabase.functions.invoke('admin-api', {
        body: {
          action: 'update_account',
          password: adminPassword,
          data: {
            user_id: editingAccount.user_id,
            balance: parseFloat(editBalance),
            btc_balance: parseFloat(editBtcBalance),
            eth_balance: parseFloat(editEthBalance),
            deposit_address: editDepositAddress || null
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Account updated successfully");
      setEditDialogOpen(false);
      setEditingAccount(null);
      loadData(adminPassword);
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
    try {
      const withdrawal = withdrawalRequests.find(w => w.id === withdrawalId);
      if (!withdrawal) return;

      const response = await supabase.functions.invoke('admin-api', {
        body: {
          action: action === 'approve' ? 'approve_withdrawal' : 'reject_withdrawal',
          password: adminPassword,
          data: {
            withdrawal_id: withdrawalId,
            admin_notes: action === 'approve' ? 'Approved by admin' : 'Rejected by admin'
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update transaction status
      await supabase
        .from('transactions')
        .update({ 
          status: action === 'approve' ? 'completed' : 'failed',
          description: `Withdrawal of ${withdrawal.amount} ${withdrawal.crypto_type} - ${action === 'approve' ? 'Completed' : 'Failed'}`
        })
        .eq('user_id', withdrawal.user_id)
        .eq('type', 'withdrawal')
        .eq('amount', withdrawal.amount)
        .eq('crypto_type', withdrawal.crypto_type)
        .eq('status', 'pending');

      toast.success(`Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      loadData(adminPassword);
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      toast.error(`Failed to ${action} withdrawal`);
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
            localStorage.removeItem("adminPassword");
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono text-xs">{account.user_id}</TableCell>
                      <TableCell>${account.balance.toFixed(2)}</TableCell>
                      <TableCell>{account.btc_balance.toFixed(8)}</TableCell>
                      <TableCell>{account.eth_balance.toFixed(8)}</TableCell>
                      <TableCell className="font-mono text-xs">{account.deposit_address || "Not set"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAccount(account)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User ID</Label>
                <Input value={editingAccount?.user_id || ""} disabled className="mt-2 font-mono text-xs" />
              </div>
              <div>
                <Label>Balance (USD)</Label>
                <Input 
                  type="number" 
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>BTC Balance</Label>
                <Input 
                  type="number" 
                  step="0.00000001"
                  value={editBtcBalance}
                  onChange={(e) => setEditBtcBalance(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>ETH Balance</Label>
                <Input 
                  type="number" 
                  step="0.00000001"
                  value={editEthBalance}
                  onChange={(e) => setEditEthBalance(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Deposit Address</Label>
                <Input 
                  value={editDepositAddress}
                  onChange={(e) => setEditDepositAddress(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSaveEdit} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="fund" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Fund User Account</h2>
              <div className="space-y-4">
                <div>
                  <Label>Select User</Label>
                  <select 
                    className="w-full mt-2 p-2 border rounded-md bg-background"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {userAccounts.map((account) => (
                      <option key={account.user_id} value={account.user_id}>
                        {account.user_id} (Balance: ${parseFloat(account.balance.toString()).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Amount (USD)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="mt-2"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
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
                    className="w-full mt-2 p-2 border rounded-md bg-background"
                    value={depositUserId}
                    onChange={(e) => setDepositUserId(e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {userAccounts.map((account) => (
                      <option key={account.user_id} value={account.user_id}>
                        {account.user_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>New Deposit Address</Label>
                  <Input 
                    placeholder="Enter wallet address" 
                    className="mt-2"
                    value={depositAddress}
                    onChange={(e) => setDepositAddress(e.target.value)}
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
            <h2 className="text-2xl font-bold mb-4">Pending Withdrawals</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Crypto</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-xs">{request.user_id}</TableCell>
                      <TableCell>${request.amount.toFixed(2)}</TableCell>
                      <TableCell>{request.crypto_type}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {request.wallet_address.slice(0, 10)}...
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                          request.status === "approved" ? "bg-green-500/20 text-green-500" :
                          request.status === "completed" ? "bg-green-500/20 text-green-500" :
                          request.status === "rejected" ? "bg-red-500/20 text-red-500" :
                          request.status === "failed" ? "bg-red-500/20 text-red-500" :
                          "bg-gray-500/20 text-gray-500"
                        }`}>
                          {request.status === "approved" ? "completed" : request.status === "rejected" ? "failed" : request.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleWithdrawalAction(request.id, "approve")}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleWithdrawalAction(request.id, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

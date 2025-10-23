import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, Users, DollarSign, ArrowDownCircle } from "lucide-react";

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

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    
    if (!isAuthenticated) {
      navigate("/admin-login");
      return;
    }

    setLoading(false);
    loadMockData();
  }, [navigate]);

  const loadMockData = () => {
    // Mock data for demonstration
    setUserAccounts([
      {
        id: "1",
        user_id: "user123",
        balance: 10000,
        btc_balance: 0.5,
        eth_balance: 5.2,
        deposit_address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
      }
    ]);

    setWithdrawalRequests([
      {
        id: "1",
        user_id: "user123",
        amount: 1000,
        crypto_type: "BTC",
        wallet_address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        status: "pending",
        admin_notes: null,
        created_at: new Date().toISOString()
      }
    ]);
  };

  const handleFundAccount = () => {
    toast.success("Account funded successfully (Demo Mode)");
  };

  const handleUpdateDepositAddress = () => {
    toast.success("Deposit address updated successfully (Demo Mode)");
  };

  const handleWithdrawalAction = (action: string) => {
    toast.success(`Withdrawal ${action} successfully (Demo Mode)`);
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
            <p className="text-muted-foreground">Demo Mode - Manage users, funds, and withdrawal requests</p>
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
                  <select className="w-full mt-2 p-2 border rounded-md bg-background">
                    <option value="">Select a user...</option>
                    {userAccounts.map((account) => (
                      <option key={account.user_id} value={account.user_id}>
                        {account.user_id} (Balance: ${account.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Amount (USD)</Label>
                  <Input type="number" placeholder="0.00" className="mt-2" />
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
                  <select className="w-full mt-2 p-2 border rounded-md bg-background">
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
                  <Input placeholder="Enter wallet address" className="mt-2" />
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
                          "bg-red-500/20 text-red-500"
                        }`}>
                          {request.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleWithdrawalAction("approved")}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleWithdrawalAction("rejected")}
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

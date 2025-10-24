import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, password, data } = await req.json();
    
    // Verify admin password
    if (password !== '65657667') {
      return new Response(
        JSON.stringify({ error: 'Invalid admin password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    let result;

    switch (action) {
      case 'get_accounts':
        result = await supabaseAdmin
          .from('user_accounts')
          .select('*')
          .order('created_at', { ascending: false });
        break;

      case 'get_withdrawals':
        result = await supabaseAdmin
          .from('withdrawal_requests')
          .select('*')
          .order('created_at', { ascending: false });
        break;

      case 'fund_account':
        result = await supabaseAdmin
          .from('user_accounts')
          .update({ balance: data.balance })
          .eq('user_id', data.user_id);
        break;

      case 'update_deposit_address':
        result = await supabaseAdmin
          .from('user_accounts')
          .update({ deposit_address: data.deposit_address })
          .eq('user_id', data.user_id);
        break;

      case 'update_account':
        result = await supabaseAdmin
          .from('user_accounts')
          .update({
            balance: data.balance,
            btc_balance: data.btc_balance,
            eth_balance: data.eth_balance,
            deposit_address: data.deposit_address,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', data.user_id);
        break;

      case 'approve_withdrawal':
        // Update withdrawal request
        result = await supabaseAdmin
          .from('withdrawal_requests')
          .update({ 
            status: 'approved',
            admin_notes: data.admin_notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.withdrawal_id);
        
        // Also update the transaction record
        if (!result.error && data.user_id && data.amount && data.crypto_type) {
          await supabaseAdmin
            .from('transactions')
            .update({ 
              status: 'completed',
              description: `Withdrawal of ${data.amount} ${data.crypto_type} - Completed`
            })
            .eq('user_id', data.user_id)
            .eq('type', 'withdrawal')
            .eq('amount', data.amount)
            .eq('crypto_type', data.crypto_type)
            .eq('status', 'pending');
        }
        break;

      case 'reject_withdrawal':
        // Update withdrawal request
        result = await supabaseAdmin
          .from('withdrawal_requests')
          .update({ 
            status: 'rejected',
            admin_notes: data.admin_notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.withdrawal_id);
        
        // Also update the transaction record
        if (!result.error && data.user_id && data.amount && data.crypto_type) {
          await supabaseAdmin
            .from('transactions')
            .update({ 
              status: 'failed',
              description: `Withdrawal of ${data.amount} ${data.crypto_type} - Failed`
            })
            .eq('user_id', data.user_id)
            .eq('type', 'withdrawal')
            .eq('amount', data.amount)
            .eq('crypto_type', data.crypto_type)
            .eq('status', 'pending');
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

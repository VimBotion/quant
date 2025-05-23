import React, { useState, useEffect } from 'react';
import {
  MaterialReactTable,
  MRT_ColumnDef,
} from 'material-react-table';
import {
  Button,
  TextField,
  Box,
  Paper,
  InputAdornment,
} from '@mui/material';

interface BankAccount {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  routing_number: string;
  deposit_amount: number;
  current_amount: number;
  maturity_date: string;
  current_rate: string;
  comments: string;
}

const BankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    bank_name: '',
    account_name: '',
    account_number: '',
    routing_number: '',
    deposit_amount: 0,
    current_amount: 0,
    maturity_date: '',
    current_rate: '',
    comments: '',
  });

  const [errors, setErrors] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    routing_number: '',
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/bank_accounts')
      .then((response) => response.json())
      .then((data: BankAccount[]) => {
        setAccounts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bank accounts:', err);
        setLoading(false);
      });
  }, []);

  const validateFields = () => {
    const newErrors = {
      bank_name: newAccount.bank_name ? '' : 'Bank name is required',
      account_name: newAccount.account_name ? '' : 'Account name is required',
      account_number:
        /^\d+$/.test(newAccount.account_number || '')
          ? ''
          : 'Account number must be numeric',
      routing_number:
        /^\d{9}$/.test(newAccount.routing_number || '')
          ? ''
          : 'Routing number must be exactly 9 digits',
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err !== '');
  };

  const addAccount = async () => {
    if (!validateFields()) return;

    const response = await fetch('http://localhost:5000/api/bank_accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount),
    });

    if (response.ok) {
      setNewAccount({
        bank_name: '',
        account_name: '',
        account_number: '',
        routing_number: '',
        deposit_amount: 0,
        current_amount: 0,
        maturity_date: '',
        current_rate: '',
        comments: '',
      });
      fetch('http://localhost:5000/api/bank_accounts')
        .then((res) => res.json())
        .then(setAccounts);
    }
  };

  // ✅ Fixed: No confirmation here
  const deleteAccount = async (id: number) => {
    await fetch(`http://localhost:5000/api/bank_accounts/${id}`, {
      method: 'DELETE',
    });
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  const columns: MRT_ColumnDef<BankAccount>[] = [
    { accessorKey: 'bank_name', header: 'Bank Name' },
    { accessorKey: 'account_name', header: 'Account Name' },
    { accessorKey: 'account_number', header: 'Account Number' },
    { accessorKey: 'routing_number', header: 'Routing Number' },
    { accessorKey: 'deposit_amount', header: 'Deposit Amount ($)' },
    { accessorKey: 'current_amount', header: 'Current Amount ($)' },
    { accessorKey: 'maturity_date', header: 'Maturity Date' },
    { accessorKey: 'current_rate', header: 'Current Rate (%)' },
    { accessorKey: 'comments', header: 'Comments' },
    {
      accessorKey: 'id',
      header: 'Actions',
      Cell: ({ cell }: { cell: any }) => (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this account?')) {
              deleteAccount(cell.getValue() as number);
            }
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Paper sx={{ padding: '20px' }}>
      <h2>Bank Accounts</h2>

      <Box sx={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <TextField
          label="Bank Name"
          value={newAccount.bank_name}
          onChange={(e) => {
            const value = e.target.value;
            setNewAccount({ ...newAccount, bank_name: value });
            setErrors((prev) => ({
              ...prev,
              bank_name: value ? '' : 'Bank name is required',
            }));
          }}
          error={!!errors.bank_name}
          helperText={errors.bank_name}
        />
        <TextField
          label="Account Name"
          value={newAccount.account_name}
          onChange={(e) => {
            const value = e.target.value;
            setNewAccount({ ...newAccount, account_name: value });
            setErrors((prev) => ({
              ...prev,
              account_name: value ? '' : 'Account name is required',
            }));
          }}
          error={!!errors.account_name}
          helperText={errors.account_name}
        />
        <TextField
          label="Account Number"
          type="text"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 20 }}
          value={newAccount.account_number}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setNewAccount({ ...newAccount, account_number: value });
              setErrors((prev) => ({
                ...prev,
                account_number: value ? '' : 'Account number is required',
              }));
            } else {
              setErrors((prev) => ({
                ...prev,
                account_number: 'Account number must be numeric',
              }));
            }
          }}
          error={!!errors.account_number}
          helperText={errors.account_number}
        />
        <TextField
          label="Routing Number"
          type="text"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 9 }}
          value={newAccount.routing_number}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d{0,9}$/.test(value)) {
              setNewAccount({ ...newAccount, routing_number: value });
              setErrors((prev) => ({
                ...prev,
                routing_number:
                  value.length === 9
                    ? ''
                    : 'Routing number must be exactly 9 digits',
              }));
            }
          }}
          error={!!errors.routing_number}
          helperText={errors.routing_number}
        />
        <TextField
          label="Deposit Amount"
          type="number"
          value={newAccount.deposit_amount}
          onChange={(e) =>
            setNewAccount({ ...newAccount, deposit_amount: Number(e.target.value) })
          }
        />
        <TextField
          label="Current Amount"
          type="number"
          value={newAccount.current_amount}
          onChange={(e) =>
            setNewAccount({ ...newAccount, current_amount: Number(e.target.value) })
          }
        />
        <TextField
          label="Maturity Date"
          type="date"
          value={newAccount.maturity_date}
          onChange={(e) => setNewAccount({ ...newAccount, maturity_date: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Current Rate"
          type="number"
          value={newAccount.current_rate}
          onChange={(e) =>
            setNewAccount({ ...newAccount, current_rate: e.target.value })
          }
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
        <TextField
          label="Comments"
          value={newAccount.comments}
          onChange={(e) => setNewAccount({ ...newAccount, comments: e.target.value })}
        />
        <Button variant="contained" color="primary" onClick={addAccount}>
          Add Account
        </Button>
      </Box>

      <MaterialReactTable columns={columns} data={accounts} state={{ isLoading: loading }} />
    </Paper>
  );
};

export default BankAccounts;

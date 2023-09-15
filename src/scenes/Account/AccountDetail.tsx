import React, { useEffect, useState } from 'react';
import { sendToken } from '../../utils/TransactionUtils';
import { goerli, mainnet, polygon } from '../../models/Chain';
import { Account } from '../../models/Account';
import AccountTransactions from './AccountTransactions';
import { ethers } from 'ethers';
import { toFixedIfNecessary } from '../../utils/AccountUtils';
import './Account.css';

interface AccountDetailProps {
  account: Account
}

const AccountDetail: React.FC<AccountDetailProps> = ({ account }) => {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(account.balance)

  const [networkResponse, setNetworkResponse] = useState<{ status: null | 'pending' | 'complete' | 'error', message: string | React.ReactElement }>({
    status: null,
    message: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const provider = new ethers.providers.JsonRpcProvider(polygon.rpcUrl);
      let accountBalance = await provider.getBalance(account.address);
      setBalance((String(toFixedIfNecessary(ethers.utils.formatEther(accountBalance)))));
    }
    fetchData();
  }, [account.address])

  function handleDestinationAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDestinationAddress(event.target.value);
  }

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAmount(Number.parseFloat(event.target.value));
  }

  async function transfer() {
    // Set the network response status to "pending"
    setNetworkResponse({
      status: 'pending',
      message: '',
    });

    try {
      const { receipt } = await sendToken(amount, account.address, destinationAddress, account.privateKey);

      if (receipt.status === 1) {
        // Set the network response status to "complete" and the message to the transaction hash
        setNetworkResponse({
          status: 'complete',
          message: <p>Transfer complete! <a href={`${polygon.blockExplorerUrl}/tx/${receipt.transactionHash}`} target="_blank" rel="noreferrer">
            View transaction
          </a></p>,
        });
        return receipt;
      } else {
        // Transaction failed
        console.log(`Failed to send ${receipt}`);
        // Set the network response status to "error" and the message to the receipt
        setNetworkResponse({
          status: 'error',
          message: JSON.stringify(receipt),
        });
        return { receipt };
      }
    } catch (error: any) {
      // An error occurred while sending the transaction
      console.error({ error });
      // Set the network response status to "error" and the message to the error
      setNetworkResponse({
        status: 'error',
        message: error.reason || JSON.stringify(error),
      });
    }
  }

  return (
    <div className='AccountDetail container'>
      <div>
        <p className="fw-bold mb-0">Address:</p>
        <p className="fst-italic"><a href={`https://polygon.etherscan.io/address/${account.address}`} target="_blank" rel="noreferrer">
          {account.address}
        </a></p>
        Balance: {balance} ETH
      </div>

      <div className="form-group">
        <label>Destination Address:</label>
        <input
          className="form-control"
          type="text"
          value={destinationAddress}
          onChange={handleDestinationAddressChange}
        />
      </div>

      <div className="form-group">
        <label>Amount:</label>
        <input
          className="form-control"
          type="number"
          value={amount}
          onChange={handleAmountChange}
        />
      </div>

      <button
        className="btn"
        type="button"
        style={{ backgroundColor: '#ff6f00', color: '#fff' }}
        onClick={transfer}
        disabled={!amount || networkResponse.status === 'pending'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
        </svg> {amount} ETH
      </button>

      {networkResponse.status &&
        <>
          {networkResponse.status === 'pending' && <p>Transfer is pending...</p>}
          {networkResponse.status === 'complete' && <p>{networkResponse.message}</p>}
          {networkResponse.status === 'error' && <p>Error occurred while transferring tokens: {networkResponse.message}</p>}
        </>
      }

      <AccountTransactions account={account} />
    </div>

  )
}

export default AccountDetail;

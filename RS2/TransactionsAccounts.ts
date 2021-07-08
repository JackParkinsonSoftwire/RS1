import Transaction from "./Transactions"
import Account from "./Accounts";

export default class TransactionsAndAccounts {
    transactions: Transaction[];
    accounts: Account[];
    constructor(transactions: Transaction[], accounts: Account[]) {
        this.transactions = transactions;
        this.accounts = accounts;
    }
}
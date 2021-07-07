import { readFileSync } from 'fs';
import Account from "./Accounts";
import Transaction from "./Transactions";

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class TransactionManager {
    allAccounts: Map<string, Account>;
    allTransactions: Transaction[];

    /**
     * parseAndApplyCSVTransactions
     * Parses and applies transactions from CSV.
     * @param csv String to compute from.
     */
    private parseAndApplyCSVTransactions(csv: string): void {
        var parsedCSVTransactions = this.parseCSVTransactions(csv);
        parsedCSVTransactions.forEach(transaction => this.applyTransaction(transaction));
    }

    /**
     * applyTransaction
     * Applies a single transaction, including editing account balance and creating associated accounts. 
     * @param transactionString a common formatted list [date, fromacc, toacc, narrative, amt]
     */
    private applyTransaction(transactionString: string[]): void  {

        //People are in cols 1 and 2 -- fetch and remove duplicates to determine accounts
        //CREATE ACCOUNTS
        let accountsInTransactions: string[] = [transactionString[1], transactionString[2]];
        for (var account in accountsInTransactions) {
            if (!this.allAccounts.has(account)){
                this.allAccounts.set(account, new Account(account));
            }
        }

        console.log(transactionString);
        console.log(this.allAccounts);

        //Credit and debit accounts based on transaction
        this.allAccounts.get(transactionString[1])?.credit(Number(transactionString[-1]));
        this.allAccounts.get(transactionString[2])?.debit(Number(transactionString[-1]));

        var transaction = new Transaction(transactionString, this.allAccounts);
        this.allTransactions.push(transaction);
    }

    /**
     * parseCSVTransactions
     * Parses a CSV string denoting many transactions into a list of the common format given in parseCSVTransactions
     * @param csv The CSV string to parse
     * @returns a common formatted list of lists [[date, fromacc, toacc, narrative, amt], ...]
     */
    private parseCSVTransactions(csv: string): string[][] {
        return csv.split("\n")
                  .slice(1)
                  .map(transaction => this.parseCSVTransaction(transaction));
    }


    /**
     * parseCSVTransaction
     * Parses a CSV string denoting a single transaction into a common formatted list [date, fromacc, toacc, narrative, amt] for applyTransactions()
     * @param csv CSV string input to be parsed.
     * @returns a common formatted list [date, fromacc, toacc, narrative, amt]
     */
    private parseCSVTransaction(csv: string): string[] {
        return csv.replace("\r", "").split(",");
    }











    constructor(){
        this.allAccounts = new Map<string, Account>();
        this.allTransactions = [];
        const file2014 = readFileSync("./RS2/Transactions2014.csv", 'utf-8');
        this.parseAndApplyCSVTransactions(file2014);
    }











    public listAll(): void {
        for (var entry in this.allAccounts.entries()){
            console.log("Name: ${entry[0]} \tBalance: ${entry[1]}");
        }
    }

    public listAccount(accountName: string){
        var accountTryToFetch: Account | undefined = this.allAccounts.get(accountName);
        if (accountTryToFetch === undefined) { return }
        else {var accountToFetch: Account = accountTryToFetch}
        var allTransactionsFromAccountSorted: Transaction[] = this.allTransactions
            .filter(transaction => transaction.from === accountToFetch || transaction.to === accountToFetch)
            .sort((a,b) => a.date.getTime() - b.date.getTime());
        allTransactionsFromAccountSorted.forEach((transaction) =>  
                console.log((transaction.from === undefined ? "?" : 
                    transaction.from.name === accountName ? "Credit": "Debit") 
                + String(transaction.amount)
                + transaction.date.toDateString()
                + transaction.description));
    }

    /**
     * start
     */
    public start() {
        const askForTransactionData = () => rl.question('How can I help you today? >', (response:string) => {
            if (response.toUpperCase() === "LIST ALL") {
                this.listAll();
            } else if (response.includes("LIST ")) {
                this.listAccount(response.split("LIST ")[1]);
            } else if (response.includes("QUIT")) {
                return;
            }
            rl.close();
          });
        while (true) {
            askForTransactionData()
        }
    }
}

var thing = new TransactionManager();
//thing.listAll;
//thing.listAccount("Tim L");
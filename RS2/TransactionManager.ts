import { readFileSync } from 'fs';
import Account from "./Accounts";
import Transaction from "./Transactions";
import { configure, getLogger } from "log4js";
import sxml = require("sxml");
import XML = sxml.XML;
import XMLList = sxml.XMLList;
import JSONTransaction from './TransactionJSONObject';

configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const logger = getLogger('RS2/TransactionManager.ts');

class TransactionManager {
    allAccounts: Map<string, Account>;
    allTransactions: Transaction[];

    /**
     * parseAndApplyCSVTransactions
     * Parses and applies transactions from CSV.
     * @param csv String to compute from.
     */
    private parseAndApplyCSVTransactions(csv: string): void {
        logger.info("Parsing all CSV transactions.")
        var parsedCSVTransactions = this.parseCSVTransactions(csv);
        logger.info("Applying all transactions.")
        parsedCSVTransactions.forEach(transaction => this.applyTransaction(transaction));
    }

    /**
     * applyTransaction
     * Applies a single transaction, including editing account balance and creating associated accounts. 
     * @param transactionString a common formatted list [date, fromacc, toacc, narrative, amt]
     */
    private applyTransaction(transactionString: string[]): void  {

        logger.debug("Application of transaction {" + transactionString + "}");

        //People are in cols 1 and 2 -- fetch and remove duplicates to determine accounts
        //CREATE ACCOUNTS
        let accountsInTransactions: string[] = [transactionString[1], transactionString[2]];
        for (var account of accountsInTransactions) {
            if (!this.allAccounts.has(account)){
                logger.trace("Account for person " + account + " does not exist - create one.");
                this.allAccounts.set(account, new Account(account));
            }
        }

        //Credit and debit accounts based on transaction
        if (Number(transactionString[4]) !== Number(transactionString[4])) {
            logger.error("Amount of transaction is invalid. Transaction ignored in credit/debit." + transactionString[4])
        } else{
            logger.trace("Credit user " + transactionString[1] + " amount " + transactionString[4]);
            this.allAccounts.get(transactionString[1])?.credit(Number(transactionString[4]));
            logger.trace("Debit user " + transactionString[2] + " amount " + transactionString[4]);
            this.allAccounts.get(transactionString[2])?.debit(Number(transactionString[4]));
        }
        
        logger.trace("Create new transaction object for above transaction.");
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
        logger.trace("CSV string read and split into transactions.");
        return csv.split("\n")
                  .slice(1)
                  .filter(transactionString => transactionString !== "")
                  .map(transaction => this.parseCSVTransaction(transaction));
    }


    /**
     * parseCSVTransaction
     * Parses a CSV string denoting a single transaction into a common formatted list [date, fromacc, toacc, narrative, amt] for applyTransactions()
     * @param csv CSV string input to be parsed.
     * @returns a common formatted list [date, fromacc, toacc, narrative, amt]
     */
    private parseCSVTransaction(csv: string): string[] {
        logger.trace("CSV transaction parsed -- " + csv.replace("\r", "").split(","));
        return csv.replace("\r", "").split(",");
    }



    private JSONTransactionToStringArr(JSONT: JSONTransaction) {
        return [JSONT.Date, JSONT.FromAccount, JSONT.ToAccount, JSONT.Narrative, String(JSONT.Amount)];
    }
    
    private parseAndApplyJSONTransactions(json:string): void {
        let transactionsParsed: JSONTransaction[] = JSON.parse(json);
        let transactionsArray: string[][] = transactionsParsed.map(transaction => this.JSONTransactionToStringArr(transaction));
        transactionsArray.forEach(transaction => this.applyTransaction(transaction));
    }

    private parseAndApplyXMLTransactions(xml:string): void {
        let transactionParsedXML: XML = new XML(xml);
        let transactionArrayArray: string[][] = [];
        for (var x = 0; x < transactionParsedXML.get("SupportTransaction").size(); x++){
            var transaction: XML = transactionParsedXML.get("SupportTransaction").at(x);
            let transactionArray: string[] = [
                (new Date("01-01-1900")) + (transaction.getProperty("Date")),
                transaction.get("Parties").at(0).get("From").at(0).getValue(),
                transaction.get("Parties").at(0).get("To").at(0).getValue(),
                transaction.get("Description").at(0).getValue(),
                transaction.get("Value").at(0).getValue()
            ]
            transactionArrayArray.push(transactionArray);
        }
        transactionArrayArray.forEach(transaction => this.applyTransaction(transaction));
    }








    constructor(){
        this.allAccounts = new Map<string, Account>();
        this.allTransactions = [];

        const file2014 = readFileSync("./RS2/Transactions2014.csv", 'utf-8');
        this.parseAndApplyCSVTransactions(file2014);

        const file2015 = readFileSync("./RS2/DodgyTransactions2015.csv", 'utf-8');
        this.parseAndApplyCSVTransactions(file2015);

        const file2013 = readFileSync("./RS2/Transactions2013.json", "utf-8");
        this.parseAndApplyJSONTransactions(file2013);

        const file2012 = readFileSync("./RS2/Transactions2012.xml", "utf-8");
        this.parseAndApplyXMLTransactions(file2012);
    }











    public listAll(): void {
        console.log("All accounts on file:");
        console.log();
        console.log("Name      Balance");
        logger.info("LIST ALL called.");
        Array.from(this.allAccounts.values()).forEach(acc => {console.log(
            acc.name.padEnd(10, " ")
            + "£" + acc.balance.toFixed(2)
        ); if (acc.balance !== acc.balance) {logger.warn("Account balance read for user " + acc.name + " is not valid.")}});
    }

    public listAccount(accountName: string){
        var accountTryToFetch: Account | undefined = this.allAccounts.get(accountName);
        logger.info("LIST " + accountName + " called.");
        if (accountTryToFetch === undefined) { 
            console.log("Sorry, that person does not exist"); 
            logger.warn("User entered a person " + accountName + " which does not exist in the account database.");
            return; 
        }
        else {var accountToFetch: Account = accountTryToFetch}
        console.log();
        console.log("All transactions for " + accountName + ":");

        var allTransactionsFromAccount: Transaction[] = this.allTransactions
            .filter(transaction => transaction.from === accountToFetch || transaction.to === accountToFetch);

        for (var transaction of allTransactionsFromAccount) {
            if (transaction.date.getTime() !== transaction.date.getTime()) {
                logger.error("Date of transaction {" + transaction + "} not valid.")
            }
        }

        var allTransactionsFromAccountSorted: Transaction[] = allTransactionsFromAccount
            .sort((a,b) => a.date.getTime() - b.date.getTime());
        
        console.log();
        console.log("Type    Amount  Date              Description")
        allTransactionsFromAccountSorted.forEach((transaction) => {
            if (transaction.amount !== transaction.amount) {
                logger.error("A transaction amount read is not a number. " + transaction.amount);
            }
            console.log((transaction.from === undefined ? "?" : 
                    transaction.from.name === accountName ? "Credit  ": "Debit   ") 
                + (transaction.amount === transaction.amount ? (new Intl.NumberFormat("en-GB", {style: "currency", currency: "GBP"}).format(transaction.amount).padEnd(6, " ")) : "NaN   ")
                + " "
                + transaction.date.toDateString().padEnd(17, " ")
                + " "
                + transaction.description);
        });
    }

    /**
     * start
     */
    public start() {
        const askForTransactionData = () => rl.question('How can I help you today? >', (response:string) => {
            if (response === "LIST ALL") {
                this.listAll();
            } else if (response.includes("LIST ")) {
                this.listAccount(response.split("LIST ")[1]);
            }
            console.log();
            askForTransactionData();
          });
        askForTransactionData();
    }
}

var TM = new TransactionManager();
TM.start()
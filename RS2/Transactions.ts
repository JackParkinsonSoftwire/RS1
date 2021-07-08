import Account from "./Accounts";
const moment = require("moment");
import { getLogger } from "log4js";
const logger = getLogger('RS2/TransactionManager.ts');

export default class Transaction {
    date: Date;
    from: Account | undefined;
    to: Account | undefined;
    description: string;
    amount: number;
    constructor(transactionStrings: string[], allAccounts: Map<string, Account>) {
        //Two different date formats we need to handle -- check which one we need to do here.
        var checkIfDDMMYYY = new RegExp("\d\d/\d\d/\d\d\d\d")
        if (checkIfDDMMYYY.test(transactionStrings[0])){
            this.date = moment(transactionStrings[0], "DD/MM/YYYY").toDate();
        } else {
            this.date = new Date(transactionStrings[0]);
        }
        //Invalid date since NaN !=== NaN
        if (this.date.getTime() !== this.date.getTime()) {
            logger.error("This time is invalid. " + transactionStrings[0]);
        }
        this.from = allAccounts.get(transactionStrings[1])
        this.to = allAccounts.get(transactionStrings[2])
        this.description = transactionStrings[3];
        this.amount = Number(transactionStrings[4])
        if (this.amount !== this.amount) {
            logger.error("This amount is invalid. " + transactionStrings);
        }
    }
}
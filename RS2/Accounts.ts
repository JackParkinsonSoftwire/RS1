export default class Account {
    name: string;
    balance: number;
    constructor(name: string){
        this.name = name;
        this.balance = 0;
    }

    /**
     * credit
     */
    public credit(amount: number) {
        this.balance -= amount;
    }

    /**
     * debit
     */
     public debit(amount: number) {
        this.balance += amount;
    }
}
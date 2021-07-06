const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function fizzBuzzLoop(noIters: number):void {
    for (var i: number = 1; i <= noIters; i++){ 
        fizzBuzz(i);
    }
}
function fizzBuzz(intToReturn: number):void {
    var fizzBuzzArr: string[] = [];
    if (intToReturn % 3 === 0){
        fizzBuzzArr.push("Fizz");
    } 
    if (intToReturn % 13 === 0){
        fizzBuzzArr.push("Fezz");
    }
    if (intToReturn % 5 === 0){
        fizzBuzzArr.push("Buzz");
    } 
    if (intToReturn % 7 === 0){
        fizzBuzzArr.push("Bang");
    } 
    if (intToReturn % 11 === 0){
        fizzBuzzArr.filter(value => value == "Fezz").push("Bong");
    }
    if (intToReturn % 17){
        fizzBuzzArr = fizzBuzzArr.reverse()
    }
    var fizzBuzzString: string = fizzBuzzArr.join("");
    console.log(fizzBuzzString || String(intToReturn));
}

const fizzBuzzAsk = () => rl.question('How many different FizzBuzz do you want me to compute? >', (response:number) => {
  fizzBuzzLoop(response);
  rl.close();
});

fizzBuzzAsk();
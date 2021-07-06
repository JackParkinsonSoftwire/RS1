function fizzBuzzLoop(noIters: number) {
    for (var i = 0; i <= noIters; i++){ 
        fizzBuzz(i);
    }
}
function fizzBuzz(intToReturn: number) {
    var fizzBuzzString = (intToReturn % 3 === 0 ? "Fizz" : "") + (intToReturn % 5 === 0 ? "Buzz" : "");
    console.log(fizzBuzzString || String(intToReturn));
}

fizzBuzzLoop(15);
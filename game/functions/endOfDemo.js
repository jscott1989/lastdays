function endOfDemo() {
    return new Promise(function(resolve, fail) {
        $("#game-container").hide();
        $("#end-of-demo").show();
        resolve();
    });
}
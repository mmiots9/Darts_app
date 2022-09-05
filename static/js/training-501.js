console.log("Starting 501 training game");

// USEFUL VARIABLES
var userDarts = [];
var score = null;
var handScore = null;
var handScoreCh = null;
var tempScore = null;
var numberOfDarts = 0;
var mean = 0;
var scored = 0;

// FUNCTIONS
function createTempScore(handScore) {
    score = $("#score").text();
    tempScore = score - handScore;
}

function game(handScore) {
// If no dart-score is empty, reset all them
    if ($(".empty").length === 0) {
        $(".dart-score").addClass("empty");  
            $(".dart-score").html("&nbsp");
    }

// Check if multiplier
    if (isMultiplierActive()) {
        var whichMultiplier = $(".multiplier-btn-active")[0].id
        switch (whichMultiplier) {
            case "double":
                $("#double").removeClass("multiplier-btn-active");
                handScoreCh = "d" + handScore;
                handScore *= 2;
                break;
            case "triple":
                $("#triple").removeClass("multiplier-btn-active");
                handScoreCh = "t" + handScore;
                handScore *= 3;
                break;
        }
    } else {
        handScoreCh = handScore;
    }

    // Add handScoreCh to userDarts
    userDarts.push(handScoreCh);
    console.log(userDarts);

    createTempScore(handScore);

    // Change number of used darts
    numberOfDarts += 1;
    $("#number-of-darts").text(numberOfDarts);


    // Check if busted
    if (tempScore < 0 || 
        tempScore === 1 ||
        (tempScore === 0 && !(/[d]/.test(handScoreCh)))) {
        // change backgorund color
        $("body").addClass("busted");
        // write busted in separator
        $("#separator-inner").text("BUSTED");

        // reset state
        setTimeout(function () {
            $("body").removeClass("busted");
            $("#separator-inner").text("Matteo's turn");
        }, 500);

        return;
    }
    
    // Add handScore to the right dart-score 
    $($(".empty")[0]).text(handScoreCh);
    $($(".empty")[0]).removeClass("empty");

    // Change mean score
    scored += Number(handScore);
    mean = calculateMean(scored, numberOfDarts).toFixed(2);
    $("#mean-score").text(mean);


    // Change score
    $("#score").text(tempScore);

    
    
    // TODO: If game is over, create a button to see results in separator, "hide" buttons (disable them all)
}

function isMultiplierActive() {
    return $(".multiplier-btn-active").length > 0;
}

function calculateMean(scored, numberOfDarts) {
    return Math.round((scored/numberOfDarts + Number.EPSILON) * 100) / 100;
}

// listen to sector-button
$(".sector-btn").on("click", function() {
    var handScore = this.id;
    if (handScore == 25 && $("#25").attr('disabled')) {
        return false;
    } else {
        game(handScore)
        $("#25").attr('disabled', false)
    }
});

// listen to multiplier-btn
$(".multiplier-btn").on("click", function() {  
    whichMultiplier = this.id;

    if (whichMultiplier === "triple") {
        // Remove click-listen if multiplier-btn is triple
        $("#25").attr('disabled', true);

        // Remove active on double
        if ($("#double").hasClass("multiplier-btn-active")) {
            $("#double").removeClass("multiplier-btn-active")
        }
    } else {
        $("#25").attr('disabled', false);

        // Remove active on triple
        if ($("#triple").hasClass("multiplier-btn-active")) {
            $("#triple").removeClass("multiplier-btn-active")
        }
    }

    // Toggle active class on that button
    $(this).toggleClass("multiplier-btn-active");
}); 



// TODO: Undo (everything)
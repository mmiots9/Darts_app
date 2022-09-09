// USEFUL VARIABLES
var userDarts = [];
var userScores = [501];
var score = null;
var handScore = null;
var handScoreCh = null;
var tempScore = null;
var numberOfDarts = 0;
var mean = 0;
var scored = 0;
var previousScore = 501;
var visitDart = 1;
var visitScore = 0;
var visitScores = [];
var startScore = 10;

$(document).ready(function() {

    console.log("Starting 501 training game");

    // SET INITIAL SCORE
    $("#score").text(startScore);

    // FUNCTIONS
    function calculateMean(scoreList, numberOfDarts) {
        scored = Number(startScore) - Number(scoreList[scoreList.length - 1]);

        if (numberOfDarts < 3) {
            mean = Math.round((scored/numberOfDarts + Number.EPSILON) * 100) / 100;
        } else {
            mean = Math.round((scored/numberOfDarts + Number.EPSILON) * 100 * 3) / 100;
        }
        return mean;
    }

    function createTempScore(handScore) {
        score = $("#score").text();
        tempScore = score - handScore;
    }

    function isMultiplierActive() {
        return $(".multiplier-btn-active").length > 0;
    }

    function gameOver() {
        $("#separator-inner").text("WINNER");
        $("#separator-inner").addClass("winner");
        
        // disable all buttons
        $(".sector-btn").attr("disabled", "true");
        $(".multiplier-btn").attr("disabled", "true");
        
        // Let appear restart button
        $("#restart").css("display", "inline");

        // TODO: let appear "stats" button to go to another page using flask
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

            // change hand score to 0 and change tempScore to return original score
            tempScore = visitScores[visitScores.length - 1];
            handScore = 0;
            visitDart = 3;
            visitScore = tempScore;

            $(".dart-score").addClass("empty");  
            $(".dart-score").html("&nbsp");
        } else {
        
        // Add handScore to the right dart-score 
        $($(".empty")[0]).text(handScoreCh);
        $($(".empty")[0]).removeClass("empty");
        }

        // Change score
        $("#score").text(tempScore);
        userScores.push(tempScore);

        console.log(visitDart);

        // Game over
        if (tempScore === 0) { gameOver();}

        // Change visitDart and visitScore
        visitScore = tempScore;

        if (visitDart === 3) {
            visitScores.push(visitScore);
            visitDart = 1;
            visitScore = 0;

            // Calculate mean
            mean = calculateMean(visitScores, numberOfDarts).toFixed(2);
        } else {
            visitDart++;
            
            // Calculate mean
            mean = calculateMean(userScores, numberOfDarts).toFixed(2);
            
        }

        // Change mean score
        $("#mean-score").text(mean);
    }



    // listen to sector-button
    $(".sector-btn").on("click", function() {
        handScore = this.id;
        // if (handScore == 25 && $("#25").attr('disabled')) {
        if ($(this).attr('disabled')) {
            return false;
        } else {
            $("#25").attr('disabled', false)
            game(handScore)
            
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
            // Re-add click-listen if multiplier-btn is double
            $("#25").attr('disabled', false);

            // Remove active on triple
            if ($("#triple").hasClass("multiplier-btn-active")) {
                $("#triple").removeClass("multiplier-btn-active")
            }
        }

        // Toggle active class on that button
        $(this).toggleClass("multiplier-btn-active");


        // Re-add click-listen if multiplier-btn-active is not a class anymore
        if (!($(this).hasClass("multiplier-btn-active"))) {
            $("#25").attr('disabled', false);
        }

    });

    // Add functionality to restart button
    $("#restart").on("click", function() {
        location.reload();
    });

    // Add functionality to undo button
    $("#undo").on("click", function() {

        // Change score
        userScores.pop();
        previousScore = userScores[userScores.length - 1];
        $("#score").text(previousScore);

        // Remove darts
        userDarts.pop();

        // Remove number of darts
        if (numberOfDarts > 0) {numberOfDarts -= 1;};
        $("#number-of-darts").text(numberOfDarts);

        // Change mean score
        mean = calculateMean(userScores, numberOfDarts).toFixed(2);
        $("#mean-score").text(mean);

        // TODO: Delete dart-score scores

    })

})


// USEFUL VARIABLES
const possibleClosures = [41, 42, 43, 44, 45, 46, 47];
const nClosures = 5;
var actualClosure = 1;


var whichMultiplier = null;
var nEmpty = 3;



var server_data = [];

$(document).ready(function() {

    console.log("Starting Five closures training session");

    //-------------------------- PLAYER CLASS ---------------------------//
    class Player {
        constructor(name, firstClosure) {
            this.name = name;
            this.darts = [];
            this.visit = [];
            this.score = firstClosure;
            this.tempScore = 0;
            this.askedClosures = [firstClosure];
            this.closedClosures = 0;
            this.dartScore = null;
            this.dartCh = null;
            this.precision = 0.00;
        }

        throwDart(dartScore, dartCh) {

            // 1. Change dartScore and dartCh
            this.dartScore = dartScore;
            this.dartCh = dartCh;

            // 2. Add dartCh to visit
            this.visit.push(this.dartCh);

            // 3. Update temporary score
            this.updateTempScore();

            // 4. Check if busted
            if (this.hasBusted()){

                // 4.1 Change backgorund color
                $("body").addClass("busted");
            
                // 4.2 Write busted in separator
                $("#separator-inner").text("BUSTED");

                // 4.3 Reset state
                setTimeout(function () {
                    $("body").removeClass("busted");
                    $("#separator-inner").text("Matteo's turn");
                }, 500);
                
                // 4.4 Add NaN to visit
                this.addNaN();

                // 4.5 Close visit
                this.closeVisit()

                // 4.6 Update asked closures
                this.updateAskedClosures()

                // 4.6 Return
                return false;
            }

            // 5. Insert dart into right dart-score
            $($(".empty")[0]).text(dartCh);
            $($(".empty")[0]).removeClass("empty");

            // 6. Change score
            this.score = this.tempScore;
            this.showScore();

            // 7. Check if closed, create function
            if (this.score === 0) {

                // 1. Add NaN
                this.addNaN();

                // 2. Set new closure
                this.nextClosure();

                console.log(this);

                // 3. Return 
                return false;
            }

            // 8. If last dart of visit push visit to darts and reset visit
            if (this.visit.length === 3) {

                // 1. Close visit
                this.closeVisit();

                // 2. Update asked closures
                this.updateAskedClosures()
            }

        }

        showScore() {
            $("#score").text(this.score);
        }

        showClosedClosures() {
            $("#number-of-success").text(this.closedClosures);
        }

        showPrecision() {
            $("#precision").text(Math.round(this.precision * 100) / 100);
        }

        updateTempScore() {
            this.tempScore = this.score - this.dartScore;
        }

        hasBusted() {
            return (this.tempScore < 0 || 
            this.tempScore === 1 ||
            (this.tempScore === 0 && !(/[d]/.test(this.dartCh))))
        }

        addNaN() {
            // 1. Add NaN if Visit has less than 3 darts
            while (this.visit.length < 3) { this.visit.push(NaN); }
        }

        resetScore() {
            this.score = this.askedClosures[this.askedClosures.length - 1];
            $("#score").text(this.score);
        }

        closeVisit() {
            // 1. Add visit to darts and reset it
            this.darts.push(this.visit);
            this.visit = [];

            // 2. Reset score and empty 
            this.resetScore();
            resetEmpty();

            // 3. Update precision
            this.precision = (this.closedClosures/this.darts.length + Number.EPSILON) * 100;
            
            this.showPrecision();
        }

        nextClosure() {
            // 1. Update closed closures
            this.closedClosures += 1;
            this.showClosedClosures();

            // 2. Close visit 
            this.closeVisit();

            // 3. If last closure, finish game
            if (this.closedClosures === nClosures) {
                gameOver();
                
                return false;
            }

            // 4. Update asked closures
            this.askedClosures.push(selectedClosures[this.closedClosures]);

            // 5. Update score
            this.score = selectedClosures[this.closedClosures];
            this.showScore();
        }

        updateAskedClosures() {
            this.askedClosures.push(this.askedClosures[this.askedClosures.length - 1]);
        };
        

    };

    //---------------------------- FUNCTIONS ----------------------------//
    function getClosures(arr, num) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    function isMultiplierActive() {
        return $(".multiplier-btn-active").length > 0;
    }

    function resetEmpty() {
        $(".dart-score").addClass("empty");  
        $(".dart-score").html("&nbsp");
    }

    function gameOver() {
        // 1. Show winner in banner
        $("#separator-inner").text("WINNER");
        $("#separator-inner").addClass("winner");
        
        // 2. Disable all buttons
        $(".sector-btn").attr("disabled", "true");
        $(".multiplier-btn").attr("disabled", "true");
        
        // 3. Let appear restart button
        $("#restart").css("display", "inline");

        // 4. add server data
        server_data = [{"player1": player1}];

        $.ajax({
        type: "POST",
        url: "/training/five-closures/results",
        data: JSON.stringify(server_data),
        contentType: "application/json",
        dataType: 'json',
        success: function(result) {
            console.log("Result:");
            console.log(result);
        } });
    }

    //---------------------- SELECT RANDOM CLOSURES ---------------------//
    selectedClosures = getClosures(possibleClosures, nClosures);

    //------------------------ INITIALIZE PLAYER ------------------------//
    let player1 = new Player("Matteo", selectedClosures[0]);

    //------------------------- SHOW PLAYER STAT ------------------------//
    player1.showScore();
    player1.showClosedClosures();
    player1.showPrecision();

    //----------------------------- BUTTONS -----------------------------//
    // listen to sector-button
    $(".sector-btn").on("click", function() {

        // If disabled, return False
        if ($(this).attr('disabled')) { return false; }

        // If enabled
        // 1. Set dartScore and dartCh
        dartScore = dartCh = this.id;
        
        // 2. Enable 25
        $("#25").attr('disabled', false)

        // 3. If no dart-score is empty, reset all them
        if ($(".empty").length === 0) { resetEmpty() }

        // 4. Check if multiplier is active and change dartScore and dartCh
        if (isMultiplierActive()) {
            whichMultiplier = $(".multiplier-btn-active")[0].id
            switch (whichMultiplier) {
                case "double":
                    $("#double").removeClass("multiplier-btn-active");
                    dartCh = "d" + dartCh;
                    dartScore *= 2;
                    break;
                case "triple":
                    $("#triple").removeClass("multiplier-btn-active");
                    dartCh = "t" + dartCh;
                    dartScore *= 3;
                    break;
                }}

        // 5. Throw dart for player
        player1.throwDart(dartScore, dartCh);
            
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
        if (userScores.length > 1) {
            userScores.pop();
        }
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

        // Delete dart-score scores
        nEmpty = $(".empty").length;
        if (nEmpty == 2 & userScores.length > 2) {
            $($(".dart-score")[0]).html(userDarts[userDarts.length - 3])
            $($(".dart-score")[1]).removeClass("empty");
            $($(".dart-score")[1]).html(userDarts[userDarts.length - 2])
            $($(".dart-score")[2]).removeClass("empty");
            $($(".dart-score")[2]).html(userDarts[userDarts.length - 1])
        } else if (nEmpty < 3) {
            $($(".dart-score")[2 - nEmpty]).addClass("empty");  
            $($(".dart-score")[2 - nEmpty]).html("&nbsp");
        } 
        
        // Reset back number visit dart and visit score
        if (visitDart == 1) {
            visitDart = 3;
            visitScores.pop();
        } else {visitDart -= 1}

    })

})


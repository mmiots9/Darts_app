// USEFUL VARIABLES

// TODO: Set difficulty
const possibleCheckouts = [41, 42, 43, 44, 45, 46, 47];
const nCheckouts = 5;


var whichMultiplier = null;
var nEmpty = 3;



var server_data = [];

$(document).ready(function() {

    console.log("Starting Five checkouts training session");

    //-------------------------- PLAYER CLASS ---------------------------//
    class Player {
        constructor(name, firstCheckout) {
            this.name = name;
            this.darts = [];
            this.visit = [];
            this.score = firstCheckout;
            this.tempScore = 0;
            this.askedCheckouts = [firstCheckout];
            this.closedCheckouts = [];
            this.dartCh = null;
            this.precision = 0.00;
        }

        throwDart(dartCh) {

            // 1. Change dartCh
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
                this.closeVisit(0)

                // 4.6 Update asked checkouts
                this.updateAskedCheckouts()

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

                // 2. Set new checkout
                this.nextCheckout();

                console.log(this);

                // 3. Return 
                return false;
            }

            // 8. If last dart of visit push visit to darts and reset visit
            if (this.visit.length === 3) {

                // 1. Close visit
                this.closeVisit(0);

                // 2. Update asked checkouts
                this.updateAskedCheckouts()
            }

        }

        showScore() {
            $("#score").text(this.score);
        }

        showClosedCheckouts() {
            $("#number-of-success").text(this.calculateClosedCheckouts());
        }

        showPrecision() {
            $("#precision").text(Math.round(this.precision * 100) / 100);
        }

        updateTempScore() {
            this.tempScore = this.askedCheckouts[this.askedCheckouts.length - 1] - this.calculateVisitScore();
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
            this.score = this.askedCheckouts[this.askedCheckouts.length - 1];
            $("#score").text(this.score);
        }

        closeVisit(hasClosed) {
            // 1. Add visit to darts and reset it
            this.darts.push(this.visit);
            this.visit = [];

            // 2. Reset score and empty 
            this.resetScore();
            resetEmpty();

            // 3. Add hasClosed to closedCheckouts
            this.closedCheckouts.push(Number(hasClosed));
            
            // 4. Update closedCheckouts 
            this.showClosedCheckouts()

            // 5. Update precision
            this.precision = this.calculatePrecision();
            
            this.showPrecision();
        }

        nextCheckout() {

            // 1. Close visit 
            this.closeVisit(1);

            // 2. If last checkout, finish game
            if (this.closedCheckouts === nCheckouts) {
                gameOver();
                
                return false;
            }

            // 3. Update asked checkouts
            this.askedCheckouts.push(selectedCheckouts[this.calculateClosedCheckouts()]);

            // 4. Update score
            this.score = selectedCheckouts[this.calculateClosedCheckouts()];
            this.showScore();
        }

        updateAskedCheckouts() {
            this.askedCheckouts.push(this.askedCheckouts[this.askedCheckouts.length - 1]);
        };

        calculateClosedCheckouts() { return this.closedCheckouts.reduce((a, b) => a + b, 0);}

        calculatePrecision() {
            return (this.calculateClosedCheckouts()/this.darts.length + Number.EPSILON) * 100;}

        calculateVisitScore() {
            return this.visit.reduce((a, b) => this.calculateDartValue(a) + this.calculateDartValue(b), 0);
        }

        calculateDartValue(dart) {
            if (/[d]/.test(dart)) {return (dart.replace('d', '') * 2);}
            if (/[t]/.test(dart)) {return (dart.replace('t', '') * 3);}
            return dart * 1;
        }

        undo() {

            // 1. Check if visit is already over
            if (this.visit.length === 0) {
                // 1.1 Check if it is the beginning, return false
                if (this.darts.length === 0) { return false; }  

                // 1.2 Set last darts as visit and pop it
                this.visit = this.darts.pop();

                // 1.3 Pop last asked checkout
                this.askedCheckouts.pop();

                // 1.4 Pop last closed checkout
                this.closedCheckouts.pop();

                // 1.5 Update precision
                if (this.darts.length === 0) { 
                    this.precision = 0;
                } else {
                    this.precision = this.calculatePrecision();
                }
                
                this.showPrecision();

                // 1.6 Update closed checkouts
                this.showClosedCheckouts();
            }
            
            // 3. Remove NaN in visit
            this.visit = this.visit.filter( value => !Number.isNaN(value) );

            // 4. Remove last dart in visit (repeat if is NaN)
            this.visit.pop();

            // 5. Update score
            this.updateTempScore();
            this.score = this.tempScore;
            this.showScore();

            
            
            // 6. Update shown darts
            // 6.1 Get number of empty
            nEmpty = $(".empty").length;
            console.log(nEmpty);
            console.log(this.visit);

            // 6.2 If number of empty < 3 remove last dart and return
            if (nEmpty < 3) {
                $($(".dart-score")[2 - nEmpty]).addClass("empty");  
                $($(".dart-score")[2 - nEmpty]).html("&nbsp");

                return false;
            }

            // 6.3 Reset first dart in any case
            $($(".dart-score")[0]).html(this.visit[0]);
            $($(".dart-score")[0]).removeClass("empty");
            
            // 6.4 Return if last visit has only two darts
            if (this.visit.length == 1) {
                return false;
            }

            // 6.3 Reset second dart
            $($(".dart-score")[1]).html(this.visit[1]);
            $($(".dart-score")[1]).removeClass("empty");
            
        }
        

    };

    //---------------------------- FUNCTIONS ----------------------------//
    function getCheckouts(arr, num) {
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
        url: "/training/five-checkouts/results",
        data: JSON.stringify(server_data),
        contentType: "application/json",
        dataType: 'json',
        success: function(result) {
            console.log("Result:");
            console.log(result);
        } });
    }

    //---------------------- SELECT RANDOM CHECKOUTS ---------------------//
    selectedCheckouts = getCheckouts(possibleCheckouts, nCheckouts);

    //------------------------ INITIALIZE PLAYER ------------------------//
    let player1 = new Player("Matteo", selectedCheckouts[0]);

    //------------------------- SHOW PLAYER STAT ------------------------//
    player1.showScore();
    player1.showClosedCheckouts();
    player1.showPrecision();

    //----------------------------- BUTTONS -----------------------------//
    // listen to sector-button
    $(".sector-btn").on("click", function() {

        // If disabled, return False
        if ($(this).attr('disabled')) { return false; }

        // If enabled
        // 1. Set dartCh
        dartCh = this.id;
        
        // 2. Enable 25
        $("#25").attr('disabled', false)

        // 3. If no dart-score is empty, reset all them
        if ($(".empty").length === 0) { resetEmpty() }

        // 4. Check if multiplier is active and change dartCh
        if (isMultiplierActive()) {
            whichMultiplier = $(".multiplier-btn-active")[0].id
            switch (whichMultiplier) {
                case "double":
                    $("#double").removeClass("multiplier-btn-active");
                    dartCh = "d" + dartCh;
                    break;
                case "triple":
                    $("#triple").removeClass("multiplier-btn-active");
                    dartCh = "t" + dartCh;
                    break;
                }}

        // 5. Throw dart for player
        player1.throwDart(dartCh);
            
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
        player1.undo();

    })

})


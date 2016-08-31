'use strict';

angular.module("taskApp").factory("Timer", function ($interval) {
    /**
     * Constructor, with class name
     */

    function Timer(state, runTime, cardId) {
        // Public properties, assigned to the instance ('this')
        this.state = state;
        this.runTime = runTime;
        this.cardId = cardId;
        this.timeManager = "";
    }

    Timer.prototype.taskTimer = function (runTime) {
        runTime[2]++;
        //runTime[2]<10?runTime[2]="0"+runTime[2]:runTime[2];
        //runTime[1]<10?runTime[1]="0"+runTime[1]:runTime[1];
        //runTime[0]<10?runTime[0]="0"+runTime[0]:runTime[0];
        if (runTime[2] % 60 === 0) {
            runTime[1]++;
            runTime[2] = 0;
            if (runTime[1] % 60 === 0) {
                runTime[0]++;
                runTime[1] = 0;
            }
        }
        return runTime;
    };

    Timer.prototype.startTask = function() {
        self.timeManager = $interval(function () {
            self.runTime = TrelloRepo.taskTimer(self.runTime);
        }, 1000);

        return self.runTime;
    }
    /**
     * Return the constructor function
     */
    return Timer;

});
'use strict';

angular.module("taskApp").factory("Timer", function ($interval) {
    /**
     * Constructor, with class name
     */

    function Timer(state, runTime) {
        // Public properties, assigned to the instance ('this')
        this.state = state;
        this.runTime = runTime;
        //this.cardId = cardId;
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

    Timer.prototype.startTask = function () {
        var self = this;
        self.state = "start";
        self.timeManager = $interval(function () {
            self.runTime = self.taskTimer(self.runTime);
        }, 1000);

        return self.runTime;
    }

    Timer.prototype.cancelTimer = function () {
        var self = this;
        $interval.cancel(self.timeManager);
    }
    /**
     * Return the constructor function
     */
    return Timer;

});
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

    Timer.prototype.changeTime = function(amount) {
        var self = this;
        var temp = self.runTime[1]+amount;
        if(temp>0) {
            if(temp>60) {
                self.runTime[1] = temp%60;
                self.runTime[0]++;
            } else {
                self.runTime[1] = temp;
            }
        } else {
            if(self.runTime[0]>0) {
                self.runTime[0]--;
                self.runTime[1] = 60 - Math.abs(temp);
            }
        }
    }

    return Timer;

});
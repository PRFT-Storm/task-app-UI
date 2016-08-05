myApp = angular.module('APP', ['ngAnimate']);
myApp.controller('theController', ['$scope','$filter','$timeout', function ($scope,$filter,$timeout) {
    $scope.running = false;
    $scope.state = 0;
    $scope.states = [true, false, false, false];
                    //new, running, paused, done

    $scope.time = [0, 0, 0]; //hr, min, sec
    $scope.date = new Date();

    $scope.task = {
        title: "",
        start: "",
        comments: [{
            time: "start",
            current: $scope.date,
            description: "",
        }]
    }
    $scope.comment = "";
    
    $scope.task.comments = [
        {
            time: "start",
            current: $scope.date,
            description : "",
        }
    ];

    $scope.commentAdd = function () {
        var tempTime = $scope.time[0] + " hr " + $scope.time[1] + " min";
        var cmtDate = new Date();
        console.log(cmtDate);

        var tempCmt = {
                time: tempTime,
                current: cmtDate,
                description : $scope.comment,
            };
        $scope.task.comments.unshift(tempCmt);
        $scope.comment = "";

    }

    $scope.taskTimer = function () {
        if ($scope.running === true) {
            $scope.time[2]++;
            if ($scope.time[2] % 60 === 0) {
                $scope.time[1]++;
                $scope.time[2] = 0;
                if ($scope.time[1] % 60 === 0) {
                    $scope.time[0]++;
                    $scope.time[1] = 0;
                }
            }            
            taskTimer = $timeout($scope.taskTimer, 1000);
        }
    }

    var stateManager = function (state) {
        angular.forEach($scope.states, function (key, value) {
            state === value ? $scope.states[value] = true : $scope.states[value] = false;
        });
    };

    var testStart = $timeout($scope.taskTimer, 1000);

    $scope.start = function () {
        console.log('start');
        $scope.state = 1;
        stateManager($scope.state);

        $scope.running = true;
        testStart = $timeout($scope.taskTimer, 1000);
    }    

    $scope.taskBreak = function () {
        $scope.state = 2;
        stateManager($scope.state);
        var brkTime = $scope.time[0] + " hr " + $scope.time[1] + " min";
        var brkDate = new Date();
        var brkCmt = {
            time: brkTime,
            current: brkDate,
            description: "took a break :)",
        };
        $scope.task.comments.unshift(brkCmt);

        $scope.running = false;
        $timeout.cancel(testStart);
    }

    $scope.taskDone = function () {
        console.log('task done');
        $scope.state = 3;
        stateManager($scope.state);

        $scope.running = false;
        $timeout.cancel(testStart);
        $scope.task.start = $scope.task.comments[0].current;
    }

}]);

//myApp.directive('watchScope', [function () {
//    return {
//        scope: {
//            comment: '=watchScope'
//        },
//        link: function (scope, element, attrs) {
//            //scope is similar to scope we use in controller
//            //element on which the directive is applied
//            //attrs contains additional info like class, etc.
//            console.log('comment: ' + scope.comment.description);
//        }
//    };
//}]);

$(window, document, undefined).ready(function () {
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    $('input').blur(function () {
        var $this = $(this);
        if ($this.val())
            $this.addClass('used');
        else
            $this.removeClass('used');
    });

    var $ripples = $('.ripples');

    $ripples.on('click.Ripples', function (e) {

        var $this = $(this);
        var $offset = $this.parent().offset();
        var $circle = $this.find('.ripplesCircle');

        var x = e.pageX - $offset.left;
        var y = e.pageY - $offset.top;

        $circle.css({
            top: y + 'px',
            left: x + 'px'
        });

        $this.addClass('is-active');

    });

    $ripples.on('animationend webkitAnimationEnd mozAnimationEnd oanimationend MSAnimationEnd', function (e) {
        $(this).removeClass('is-active');
    });

});
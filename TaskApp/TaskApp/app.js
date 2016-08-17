'use strict';
var taskApp = angular.module("taskApp", ["ngAnimate"]);

taskApp.controller("theController",
    ["$scope", "$filter", "$timeout","$routeParams",
        function ($scope, $filter, $timeout) {

    $scope.running = false;
    $scope.state = 0;
    $scope.states = [true, false, false, false];
    //new, running, paused, done

    $scope.time = [0, 0, 0]; //hr, min, sec
    $scope.date = new Date();

    $scope.task = {
        title: "",
        description: "",
        start: "",
        list: "",
        comments: [{
            time: "start",
            current: $scope.date,
            description: ""
        }]
    };

    $scope.comment = "";

    $scope.commentAdd = function () {
    };

    $scope.taskTimer = function () {
    };

    var stateManager = function (state) {
    };

    var testStart = $timeout($scope.taskTimer, 1000);

    $scope.start = function () {
    }

    $scope.taskBreak = function () {
    }

    $scope.taskDone = function () {
        console.log("task done");
        $scope.state = 3;
        stateManager($scope.state);

        $scope.running = false;
        $timeout.cancel(testStart);

        var newCard = {
            name: $scope.task.title,
            desc: $scope.task.description,
            // Place this card at the top of our list
            idList: $scope.listSelect,
            pos: "top"
        };
        console.log("posting to: " + $scope.listSelect);
        Trello.post("/cards/", newCard, $scope.creationSuccess);
    }

    /////////////////////// everything below is associated with pulling trello data

    $scope.creationSuccess = function (data) {
        console.log("Card created successfully. Data returned");
        var cardId = data.id;
        var trelloCmt = "";
        var trelloUrl = "/cards/" + cardId + "/actions/comments";
        trelloCmt += "date worked: **" + $filter("date")(new Date(), "MM/dd/yyyy") + "**";
        for (var i = 0; i < $scope.task.comments.length; i++) {
            trelloCmt += "\n----------------\n **" + $scope.task.comments[i].time + "** - " + $filter("date")($scope.task.comments[i].current, "hh:mm a") +
                "\n" + $scope.task.comments[i].description + "\n\n";
        }
        Trello.post(trelloUrl, { text: trelloCmt }, function () { console.log("successful cmt") });
    }

    $scope.selected = "";
    
}]);

$(window, document, undefined).ready(function () {
    var $listSelect = $("#list-select");
    $listSelect.trigger("contentChanged");
    $listSelect.on("contentChanged", function () {
        $(this).material_select();
    })

    //Trello.get("/member/me/boards", success, error);

    $(".datepicker").pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    $("input").blur(function () {
        var $this = $(this);
        if ($this.val())
            $this.addClass("used");
        else
            $this.removeClass("used");
    });

    var $ripples = $(".ripples");

    $ripples.on("click.Ripples", function (e) {

        var $this = $(this);
        var $offset = $this.parent().offset();
        var $circle = $this.find(".ripplesCircle");

        var x = e.pageX - $offset.left;
        var y = e.pageY - $offset.top;

        $circle.css({
            top: y + "px",
            left: x + "px"
        });

        $this.addClass("is-active");

    });

    $ripples.on("animationend webkitAnimationEnd mozAnimationEnd oanimationend MSAnimationEnd", function (e) {
        $(this).removeClass("is-active");
    });

});



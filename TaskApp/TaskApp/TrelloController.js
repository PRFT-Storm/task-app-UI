'use strict';

angular.module("taskApp").controller("TrelloController", TrelloController);

function TrelloController(Trello, $scope, $interval, $filter, Board, List, Card, Task) {
    //Trello variables
    $scope.boards = [];
    $scope.lists = [];
    $scope.cards = [];
    
    $scope.boardSelect = "";
    $scope.listSelect = "";

    //Task variables
    $scope.task = {
        title: "",
        desc: "",        
        listId:"",
        comment: {
            time:"",
            runTime:"",
            startTime:"",
            endTime:"",
            desc: "",
            type: "",
        }        
    }
    $scope.newTask;

    $scope.runTime = [0, 0, 0]; //hr, min, sec
    $scope.timeTracker;



    Trello.authenticate();

    $scope.setBoards = function () {
        Trello.initialize().then(function(data) {
            $scope.boards = data.$$state.value;
            $scope.$apply();
            $("#board-select").material_select();
        }); 
    }

    $scope.boardChange = function () {
        if ($scope.boardSelect !== null) {
            $scope.boardSelect.getLists().then(function (data) {
                $scope.lists = data;
                $scope.$apply();
                $("#list-select").material_select();
            });
        }        
    }

    $scope.listChange = function () {
        if ($scope.listSelect !== null) {
            $scope.listSelect.getCards().then(function (data) {
                $scope.task.id = data.length;

                $scope.cards = data;
                $scope.$apply();
                $("#list-select").material_select();
            });
        }
    }

    //task functions 

    $scope.startTask = function () {
        if ($scope.listSelect.id != "") {
            $scope.newTask = Trello.taskInit($scope.task.title, $scope.task.desc, $scope.listSelect.id);
            console.log($scope.newTask);
            $scope.timeTracker = $interval(function () {
                $scope.runTime = Trello.taskTimer($scope.runTime);
            }, 1000);
        }
        console.log("no list selected");
        
    }
    
    $scope.addComment = function () {
        var addedCmt = Trello.commentManager($scope.runTime, $scope.task.comment.desc)
        $scope.task.comment.desc = "";
        $scope.newTask.comments.unshift(addedCmt);
    }

    $scope.taskBreak = function (state) {
        if (state === "break") {
            $interval.cancel($scope.timeTracker);
            $scope.task.comment.startTime = new Date();
        }
        if (state === "resume") {
            $scope.task.comment.endTime = new Date();
            var breakTimeDesc ="Took a break: "+ $filter("date")($scope.task.comment.startTime, "hh:mm a")+ " - "+ $filter("date")($scope.task.comment.endTime, "hh:mm a");

            var addedCmt = Trello.commentManager($scope.runTime, breakTimeDesc)
            $scope.task.comment.desc = "";
            $scope.newTask.comments.unshift(addedCmt);
            $scope.timeTracker = $interval(function () {
                $scope.runTime = Trello.taskTimer($scope.runTime);
            }, 1000);

        }
    }
    
}
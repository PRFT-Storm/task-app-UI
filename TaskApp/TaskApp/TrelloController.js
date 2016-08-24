'use strict';

angular.module("taskApp").controller("TrelloController", TrelloController);

function TrelloController(TrelloRepo, $scope, $interval, $filter, Board, List, Card, Task) {
    //Trello variables
    $scope.boards = [];
    $scope.lists = [];
    $scope.cards = [];
    
    $scope.boardSelect = "";
    $scope.listSelect = "";
    $scope.cardSelect = "";

    //Task variables that need to be tested
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

    TrelloRepo.authenticate();

    $scope.setBoards = function () {
        TrelloRepo.initialize().then(function (data) {
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
        console.log($scope.cardSelect);
        $scope.state = "started";
        if ($scope.cardSelect === "") {
            $scope.newTask = TrelloRepo.taskInit($scope.task.title, $scope.task.desc, $scope.listSelect.id);
        }
        $scope.timeTracker = $interval(function () {
            $scope.runTime = TrelloRepo.taskTimer($scope.runTime);
        }, 1000);
        
    }
    
    $scope.addComment = function () {
        var addedCmt = TrelloRepo.commentManager($scope.runTime, $scope.task.comment.desc);
        $scope.task.comment.desc = "";
        $scope.newTask.comments.unshift(addedCmt);
    }

    $scope.state = "";
    $scope.taskAction = function (state, card) {

        if (state === "break" && $scope.state != "break") {
            $scope.state = state;
            $interval.cancel($scope.timeTracker);
            $scope.task.comment.startTime = new Date();
        }
        if (state === "resume" && $scope.state == "break") {
            $scope.state = state;
            $scope.task.comment.endTime = new Date();
            var breakTimeDesc ="Took a break: "+ $filter("date")($scope.task.comment.startTime, "hh:mm a")+ " - "+ $filter("date")($scope.task.comment.endTime, "hh:mm a");

            var addedCmt = TrelloRepo.commentManager($scope.runTime, breakTimeDesc)
            $scope.task.comment.desc = "";
            $scope.newTask.comments.unshift(addedCmt);
            $scope.timeTracker = $interval(function () {
                $scope.runTime = TrelloRepo.taskTimer($scope.runTime);
            }, 1000);
        }
        if (state === "done") {
            $scope.state = state;
            $scope.newTask.postComments($scope.runTime);
            $scope.listChange();
            $interval.cancel($scope.timeTracker);
            $scope.runTime = [0, 0, 0];
            $scope.state = '';
            $scope.task.title = '';
            $scope.task.desc = '';
        }
        if (state === "set") {
            $scope.cardSelect = card;          
            $scope.task.title = card.name;
            $scope.task.desc = card.desc;
            $scope.task.listId = card.listId;
            $(".tLabel").addClass("active");
            $scope.newTask = new Task(
                 card.id,
                 $scope.task.title,
                 $scope.task.desc,
                 "new",
                 $filter("date")(new Date(), "MM/dd/yy hh:mm a"),
                 $scope.listSelect.id
                );
            $scope.listChange();
        }
    }
    
}
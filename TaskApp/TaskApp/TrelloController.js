'use strict';

angular.module("taskApp").controller("TrelloController", TrelloController);

function TrelloController(TrelloRepo, $scope, $interval, $filter, $showdown, Board, List, Card, Task) {
    //Trello variables
    $scope.boards = [];
    $scope.lists = [];
    $scope.tasks = [];
    $scope.comments = [];
    $scope.labels = [];

    $scope.commentString = "";

    $scope.boardSelect = "";
    $scope.listSelect = "";
    $scope.taskSelect = "";
    $scope.taskComment = "";
    $scope.taskLabel = "";

    $scope.desc = false;
    //Task variables that need to be tested

    $scope.task = new Task("","test","","","","");

    $scope.runTime = [0, 0, 0]; //hr, min, sec
    $scope.state = "";
    $scope.timeTracker;

    TrelloRepo.authenticate();

    $scope.setBoards = function () {
        TrelloRepo.initialize().then(function (data) {
            $scope.boards = data.$$state.value;
            $scope.$apply();
            $("#board-select").material_select();
        }); 
    };

    $scope.boardChange = function () {
        if ($scope.boardSelect !== null) {
            $scope.boardSelect.getLists().then(function (data) {
                $scope.lists = data;
                $scope.$apply();
                $("#list-select").material_select();
                $scope.boardSelect.getLabels().then(function (data) {
                    $scope.labels = data;
                    $scope.$apply();
                });
            });
        }        
    };

    $scope.listChange = function () {
        if ($scope.listSelect !== null) {
            console.log($scope.labels);
            $scope.listSelect.getCards($scope.labels).then(function (tasks) {
                $scope.tasks = tasks;
                $scope.$apply();
                $("#list-select").material_select();
                $(".cmt-button").sideNav({
                    menuWidth: 440, // Default is 240
                    edge: 'right'
                });
            });
        }
    };

    //task functions 

    $scope.startTask = function (task) {
        $scope.state = "started";
        if (!task) {
            $scope.task = TrelloRepo.taskInit($scope.task.name, $scope.task.desc, $scope.listSelect.id);
        } else {
            $scope.task = task;
            $("#taskLabelSelect").material_select();
        }
        $("#label-select").material_select();
        $scope.timeTracker = $interval(function () {
            $scope.runTime = TrelloRepo.taskTimer($scope.runTime);
        }, 1000);
    };

    $scope.reset = function() {
        $interval.cancel($scope.timeTracker);
        $scope.runTime = [0, 0, 0];
        $scope.state = '';
        $scope.task = new Task("","test","","","","");
    }
    
    $scope.addComment = function () {
        var addedCmt = TrelloRepo.commentManager($scope.runTime, $scope.task.commentFields.desc);
        $scope.task.commentFields.desc = "";
        $scope.task.comments.unshift(addedCmt);
    };

    $scope.deleteTask = function(task) {

    }

    $scope.taskAction = function (state, card) {

        if (state === "break" && $scope.state != "break") {
            $scope.state = state;
            $interval.cancel($scope.timeTracker);
            $scope.task.commentFields.startTime = new Date();
        }
        if (state === "resume" && $scope.state == "break") {
            $scope.state = state;
            $scope.task.commentFields.endTime = new Date();
            var breakTimeDesc ="Took a break: "+ $filter("date")($scope.task.commentFields.startTime, "hh:mm a")+ " - "+ $filter("date")($scope.task.commentFields.endTime, "hh:mm a");

            var addedCmt = TrelloRepo.commentManager($scope.runTime, breakTimeDesc)
            $scope.task.commentFields.desc = "";
            $scope.task.comments.unshift(addedCmt);
            $scope.timeTracker = $interval(function () {$scope.runTime = TrelloRepo.taskTimer($scope.runTime);}, 1000);
        }
        if (state === "done") {
            $scope.state = state;
            $scope.task.postComments($scope.runTime);
            $scope.listChange();
            $interval.cancel($scope.timeTracker);
            $scope.runTime = [0, 0, 0];
            $scope.state = '';
            $scope.task = new Task("","test","","","","");
        }

        if(state === "comments") {
            $scope.taskComment = new Card(card.id, card.name, card.desc, card.listId);
            $scope.taskComment.getComments().then( function(data) {
                if(data != "") {
                    $scope.commentString = $showdown.makeHtml(data);
                } else {
                    Materialize.toast('No comments available', 4000)
                }
                $scope.$apply();
            });
        }
    }
    
}
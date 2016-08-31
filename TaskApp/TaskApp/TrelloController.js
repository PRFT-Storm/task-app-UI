﻿'use strict';

angular.module("taskApp").controller("TrelloController", TrelloController);

function TrelloController(TrelloRepo, $scope, $interval, $timeout, $filter, $showdown, Task, Timer) {
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

    $scope.task = new Task("","","","","","");
    $scope.newTask = new Task("","","","","","");

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
        console.log("list change");
        if ($scope.listSelect !== null) {
            $scope.listSelect.getCards($scope.labels).then(function (tasks) {
                console.log("pulled list data");
                $scope.$apply(function () {
                    $scope.tasks = tasks;
                    $("#list-select").material_select();
                    $(".cmt-button").sideNav({
                        menuWidth: 440, // Default is 240
                        edge: 'left'
                    });
                });

            });
        }
    };

    //task functions 

    $scope.selectTask = function (task) {
        if (!task) {
            $scope.task = TrelloRepo.newTask($scope.newTask.name, $scope.newTask.desc, $scope.listSelect.id);
        } else {
            $scope.task = task;
        }
        $scope.task.newList = $scope.listSelect;
        $scope.state = "view";
        $timeout(function() {
            $("#taskListSelect").material_select();
            $("#taskLabelSelect").material_select();
        });

        //$scope.timeTracker = $interval(function () {
        //    $scope.runTime = TrelloRepo.taskTimer($scope.runTime);
        //}, 1000);
    };

    $scope.resetTask = function(task) {
        if($scope.timerTracker) {
            $interval.cancel($scope.timeTracker);
        }
        $scope.runTime = [0, 0, 0];
        $scope.state = '';
        $scope.task = task?task:new Task("","","","","","");
    }
    
    $scope.addComment = function () {
        var addedCmt = TrelloRepo.commentManager($scope.runTime, $scope.task.commentFields.desc);
        $scope.task.commentFields.desc = "";
        $scope.task.comments.unshift(addedCmt);
    };

    $scope.deleteTask = function(task) {

    }

    $scope.taskAction = function (state, task) {

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
            $scope.task = new Task("","","","","","");
        }

    };

    $scope.getComments = function (task) {
        task.getComments().then( function(data) {
            if(data != "") {
                $scope.commentString = $showdown.makeHtml(data);
            } else {
                Materialize.toast('No comments available', 4000)
            }
            $scope.$apply();
        });
    }

    $scope.taskChange = function (task, label) {

        if(task.newLabel) {
            //we have a new label
            console.log('two');
            task.setLabel().then(function(data) {
                console.log(data);
            });
        }
        if(label) {
            console.log('three');
            $timeout(function() {
                $scope.task = task.removeLabel(label);
            });

        }
        if(task.newList && task.listId) {
            //we have both
            console.log('four');
            if(task.newList.id != task.listId) {
                console.log('five');
                //they changed
                task.changeList().then(function(data) {
                    console.log(data);
                    $timeout(function() {
                        $scope.resetTask();
                        $scope.listChange();
                    });
                });
            }
        }
    }

}
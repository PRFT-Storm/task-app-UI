'use strict';

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
    $scope.taskChanged = false;

    $scope.desc = false;
    //Task variables that need to be tested

    $scope.task = new Task("","","","","","");
    $scope.newTask = new Task("","","","","","");

    $scope.runTime = [0, 0, 0]; //hr, min, sec
    $scope.timeTracker;

    TrelloRepo.authenticate();

    $(".cmt-button").sideNav({
        menuWidth: 440, // Default is 240
        edge: 'left'
    });

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

    $scope.listChange = function (task) {
        console.log("list change");
        if ($scope.listSelect !== null) {
            $scope.listSelect.getCards($scope.labels).then(function (tasks) {
                console.log("pulled list data");
                $scope.$apply(function () {
                    $scope.tasks = tasks;                   
                    $("#list-select").material_select();                    
                });                
            });
        }
        if (task) {
            
        };
    };

    //task functions 

    $scope.selectTask = function (task) {
        if (!task) {
            $scope.task = TrelloRepo.newTask($scope.newTask.name, $scope.newTask.desc, $scope.listSelect.id);
        } else {
            $scope.task = task;
        }

        console.log($scope.task);
        $scope.task.newList = $scope.listSelect;
        if($scope.task.state === "") {
            //no timer started on this task
            $scope.task.state = "view";
        }
        $timeout(function() {
            $("#taskListSelect").material_select();
            $("#taskLabelSelect").material_select();
        });
    };

    $scope.resetTask = function(task) {

        $scope.task.timer.cancelTimer();
        $scope.task.state = '';
        $scope.task.timer = new Timer("", [0, 0, 0]);
        $scope.task = new Task("","","","","","");
    }
    
    $scope.addComment = function () {
        var addedCmt = TrelloRepo.commentManager($scope.task.timer.runTime, $scope.task.commentFields.desc);
        $scope.task.commentFields.desc = "";
        $scope.task.comments.unshift(addedCmt);
    };

    $scope.deleteTask = function(task) {

    }

    $scope.taskAction = function (state, task) {
        if (state === "break" && $scope.task.timer.state != "break") {
            $scope.task.timer.state = state;
            $scope.task.timer.cancelTimer();
            $scope.task.commentFields.startTime = new Date();
        }
        if (state === "resume" && $scope.task.timer.state == "break") {
            $scope.task.timer.state = state;
            $scope.task.commentFields.endTime = new Date();
            var breakTimeDesc ="Took a break: "+ $filter("date")($scope.task.commentFields.startTime, "hh:mm a")+ " - "+ $filter("date")($scope.task.commentFields.endTime, "hh:mm a");
            var addedCmt = TrelloRepo.commentManager($scope.task.timer.runTime, breakTimeDesc)

            $scope.task.commentFields.desc = "";
            $scope.task.comments.unshift(addedCmt);
            $scope.task.timer.startTask();
        }
        if (state === "done") {
            $scope.task.postComments($scope.task.timer.runTime);
            //$scope.listChange();
            $scope.task.timer.cancelTimer();
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
        console.log(task.newLabel);
        if(task.newLabel && task.newLabel != "") {
            task.setLabel().then(function (data) {
                $timeout(function () {
                    $scope.resetTask();
                    $scope.listChange();
                    $scope.tasks.forEach(function (item) {
                        if (item.id === task.id) {
                            $scope.task = item;                            
                            $scope.$apply();
                        };
                    });
                });
            });
        }
        if(label) {
            $scope.task = task.removeLabel(label).then(function(data) {
                $scope.resetTask();
                $scope.listChange();
                //$timeout(function () {
                //    $scope.tasks.forEach(function (item) {
                //        if (item.id === task.id) {
                //            $scope.task = item;
                //            $scope.$apply();
                //        };
                //    });
                //});
            });
        }
        if(task.newList && task.listId) {
            if(task.newList.id != task.listId) {
                task.changeList().then(function(data) {
                    $timeout(function() {
                        $scope.resetTask();
                        $scope.listChange();
                    });
                });
            }
        }
        $scope.taskChanged = false;
    }

    $scope.moreTime = function() {
        $scope.task.timer.changeTime(15);
    }

    $scope.lessTime = function() {
        $scope.task.timer.changeTime(-15);
    }
}
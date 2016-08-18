'use strict';

angular.module("taskApp").factory("TrelloRepo", function (Board, Card, List, Task, $q, $rootScope, $filter) {

    return new function () {

        this.authenticate = function () {
            console.log("authenticate")
            Trello.authorize(
            {
                type: "popup",
                name: "Task Tracker App",
                scope: {
                    read: true,
                    write: true
                },
                expiration: "never",
                success: function () { console.log("auth success"); },
                error: this.authFail,
            })

        };

        this.initialize = function (request) {
            var deferred = $q.defer();
            var boardArr = [];
            return Trello.get("/member/me/boards").then(function (boards) {
                boards.forEach(function (board) {
                    var newBoard = new Board(board.id, board.name);
                    //$("#board-select").append($("<option>").text(board.name).attr("value", board.id));
                    boardArr.push(newBoard);                    
                });
                deferred.resolve(boardArr);
                $rootScope.$$phase || $rootScope.$apply
                return deferred.promise;
                //$("#board-select").material_select();
            });
        }

         this.authFail = function () {
            console.log('auth failed');
         }
         
        // below functions handle new task properties

         this.taskTimer = function (runTime) {
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

         this.taskInit = function (title, desc, listId) {
             var newTask = new Task(
                 "123",
                 title,
                 desc,
                 "new",
                 $filter("date")(new Date(), "MM/dd/yy hh:mm a"),
                 listId
                 );
             newTask.createTask();
             return newTask;
         }
         
         this.commentManager = function (time, comment) {
             var tempTime = time[0] + " hr " + time[1] + " min";
             var cmtDate = new Date();
             var tempCmt = {
                time: tempTime,
                current: cmtDate,
                desc: comment
             };
             return tempCmt;
         }

    };
});
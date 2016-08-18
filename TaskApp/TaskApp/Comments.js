'use strict';

angular.module("taskApp").factory("Comment", function ($filter) {
    /**
   * Constructor, with class name
   */

    function Comment(desc, startTime, cardId) {
        // Public properties, assigned to the instance ('this')
        this.desc = desc;
        this.startTime = startTime;
        this.runTime = null;
        this.endTime = null;
        this.cardId = cardId;
        this.type = null;
    }

    /**
     * Public method, assigned to prototype
     */
    Comment.prototype.submitComment = function () {
        /* call the trello API in here */
        console.log("Card created successfully. Data returned");
        var self = this;
        var cardId = self.cardId;

        var trelloCmt = self.desc;
        var trelloUrl = "/cards/" + cardId + "/actions/comments";
        trelloCmt += "date worked: **" + $filter("date")(new Date(), "MM/dd/yyyy") + "**";
        for (var i = 0; i < $scope.task.comments.length; i++) {
            trelloCmt += "\n----------------\n **" + $scope.task.comments[i].time + "** - " + $filter("date")($scope.task.comments[i].current, "hh:mm a") +
                "\n" + $scope.task.comments[i].description + "\n\n";
        }
        Trello.post(trelloUrl, { text: trelloCmt },
            function () {
                console.log("successful cmt")
            });
    };

    

    /**
     * Return the constructor function
     */
    return Comment;

});
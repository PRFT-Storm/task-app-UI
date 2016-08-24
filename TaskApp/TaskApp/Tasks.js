'use strict';

angular.module("taskApp").factory("Task", function ($interval, $filter) {
    /**
   * Constructor, with class name
   */

    function Task(id, title, desc, state, startTime, listId) {
        // Public properties, assigned to the instance ('this')
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.state = state;
        this.startTime = startTime;
        this.listId = listId;
        this.comments = [];
        this.endTime = null;
    }

    Task.prototype.createTask = function () {
        /* call the trello API in here */
        var self = this;
        var newCard = {
            name: self.title,
            desc: self.desc,
            // Place this card at the top of our list
            idList: self.listId,
            pos: "top"
        };
        return Trello.post("/cards/", newCard).then(function (data) {
            var cardId = data.id;
            console.log("task created!: "+cardId);
            self.id = cardId;
            return cardId;
        });
    };

    Task.prototype.postComments = function (runTime) {
        /* call the trello API in here */
        console.log("Card created successfully. Data returned");
        var self = this;
        var trelloCmt = "";
        var trelloUrl = "/cards/" + self.id + "/actions/comments";
        trelloCmt += "**date worked:** " + $filter("date")(new Date(), "MM/dd/yyyy") + " ";
        trelloCmt += " **total time:** " + runTime[0] + " hrs " + runTime[1] + " mins " + runTime[2] + " secs";
        for (var i = 0; i < self.comments.length; i++) {
            trelloCmt += "\n----------------\n **" + self.comments[i].time + "** - " + $filter("date")(self.comments[i].current, "hh:mm a") +
                "\n" + self.comments[i].desc + "\n\n";
        }
        return Trello.post(trelloUrl, { text: trelloCmt }, function () { console.log("successful cmt") });
    };

    /**
     * Return the constructor function
     */
    return Task;

});
'use strict';

angular.module("taskApp").factory("Task", function ($interval, $filter, Card) {
    /**
   * Constructor, with class name
   */

    function Task(id, title, desc, state, startTime, listId) {
        // Public properties, assigned to the instance ('this')
        this.id = id;
        this.name = title;
        this.desc = desc;
        this.state = state;
        this.startTime = startTime;
        this.listId = listId;
        this.endTime = null;
        this.labels = [];
        this.boardLabels = [];
        this.comments = [];
        this.commentFields = {
            time:"",
            runTime:"",
            startTime:"",
            endTime:"",
            desc: "",
            type: "",
            cmtCount : 0
        };

    };

    var TaskObj = function () {
        Card.apply(this,arguments);
    };



    Task.prototype.createTask = function () {
        /* call the trello API in here */
        var self = this;
        var newCard = {
            name: self.name,
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
        trelloCmt += "\n\n";
        trelloCmt += "##### **" + $filter("date")(new Date(), "MM/dd/yyyy") + "**";
        trelloCmt += " *" + runTime[0] + " hrs " + runTime[1] + " mins " + runTime[2] + " secs* \n";
        for (var i = 0; i < self.comments.length; i++) {
            trelloCmt += " **" + self.comments[i].time + "** - " + $filter("date")(self.comments[i].current, "hh:mm a") +
                "\n>" + self.comments[i].desc + "\n\n ";
        }
        return Trello.post(trelloUrl, { text: trelloCmt }, function () { console.log("successful cmt") });
    };

    Task.prototype.setLabel = function () {
        var self = this;
        //var trelloUrl = "/cards/" + self.id + "/labels";
        //var trelloConfig = { color: self.color, name: self.label };

        var trelloUrl = "/cards/" + self.id + "/idLabels";
        var trelloConfig = { value: "label id value" };


        return Trello.post(trelloUrl,trelloConfig).then(function (data) {
            var cardId = data.id;
            console.log("task created!: "+cardId);
            self.id = cardId;
            return cardId;
        });
    }

    Task.prototype.deleteTask = function () {
        /* call the trello API in here */
        var self = this;
        var newCard = {
            name: self.name,
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

    /**
     * Return the constructor function
     */
    return Task;

});
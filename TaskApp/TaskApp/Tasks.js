'use strict';

angular.module("taskApp").factory("Task", function ($interval, $filter, Card, Timer) {
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
        this.taskTimer = "";
        this.newList = "";
        this.newLabel = "";
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
        var trelloUrl = "/cards/" + self.id + "/idLabels";
        var trelloConfig = {value: self.newLabel};
        return Trello.post(trelloUrl,trelloConfig).then(function (response) {
            console.log("label set!");
            return self;
        });
    }

    Task.prototype.removeLabel = function(label) {
        var self = this;
        var trelloUrl;

        trelloUrl = "/cards/" + self.id + "/idLabels/" + label;
        console.log(label+" to delete");
        Trello.delete(trelloUrl).then(function (data) {
            console.log(label+" deleted!");
        });

        return self;
    }

    Task.prototype.changeList = function () {
        console.log('we get in here');
        var self = this;
        var trelloUrl = "/cards/" + self.id + "/idList";
        var trelloConfig;
        if(self.newList.id != self.listId) {
            trelloConfig = {value: self.newList.id};
            return Trello.put(trelloUrl,trelloConfig).then(function (data) {
                console.log("list changed!");
                console.log(data);
                return data;
            });
        }
        return null;
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

    Task.prototype.getComments = function() {
        var self = this;
        var cmtString = "";
        var trelloUrl = "/cards/"+self.id+"/actions";
        return Trello.get(trelloUrl).then(function (response) {
            response.forEach(function (comment) {
                cmtString += comment.data.text;
                cmtString += "<br>";
            });

            return cmtString;
        });
    }

    /**
     * Return the constructor function
     */
    return Task;

});
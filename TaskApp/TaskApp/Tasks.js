'use strict';

angular.module("taskApp").factory("Task", function ($interval) {
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

    /**
     * Private property
     */
    var states = ['new', 'running', 'paused', 'done'];

    /**
     * Private function
     */
    function checkState(state) {
        return possibleRoles.indexOf(state) !== -1;
    }

    Task.prototype.createTask = function () {
        /* call the trello API in here */
        var self = this;
        var cardArr = [];
        var trelloListUrl = "/cards/" + self.listId + "/cards";
        return Trello.get(trelloListUrl).then(function (response) {
            response.forEach(function (card) {
                var newCard = new Card(card.id, card.name, card.desc, card.badges.comments);
                cardArr.push(newCard);
            });
            return cardArr;
        });
    };

    Task.prototype.getComments = function (id) {
        /* call the trello API in here */
    };

    /**
     * Return the constructor function
     */
    return Task;

});
'use strict';

angular.module("taskApp").factory("Card", function () {
    /**
   * Constructor, with class name
   */

    function Card(id, name, desc, listId) {
        // Public properties, assigned to the instance ('this')
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.listId = listId;
    }

    Card.prototype.getComments = function() {
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
    return Card;

});
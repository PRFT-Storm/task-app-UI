'use strict';

angular.module("taskApp").factory("Board", function (List) {
    /**
   * Constructor, with class name
   */
    function Board(id, name, lists) {
        // Public properties, assigned to the instance ('this')
        this.id = id;
        this.name = name;
        this.lists = null;
    }

    /**
     * Public method, assigned to prototype
     */
    Board.prototype.getLists = function () {
        /* call the trello API in here */
        console.log("get lists");
        var self = this;
        var listArr = [];
        var trelloListUrl = "/boards/" + self.id + "/lists";
        return Trello.get(trelloListUrl).then(function (response) {
            //self.lists = new List(response.id, response.name);
            response.forEach(function (list) {
                var newList = new List(list.id, list.name);
                listArr.push(newList);
            });
            self.lists = listArr;
            return listArr;
        });
    };

    /**
     * Return the constructor function
     */
    return Board;

});
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
        this.labels = [];
    }

    /**
     * Public method, assigned to prototype
     */
    Board.prototype.getLists = function () {
        var self = this;
        var listArr = [];
        var trelloListUrl = "/boards/" + self.id + "/lists";
        return Trello.get(trelloListUrl).then(function (response) {
            response.forEach(function (list) {
                var newList = new List(list.id, list.name);
                listArr.push(newList);
            });
            self.lists = listArr;
            return listArr;
        });
    };

    Board.prototype.getLabels = function () {
        var self = this;
        var labelArr = [];
        var trelloListUrl = "/boards/" + self.id + "/labels";
        return Trello.get(trelloListUrl).then(function (response) {
            response.forEach(function (label) {
                if(label.name != "") {
                    labelArr.push(label);
                }
            })
            self.labels = labelArr;
            return labelArr;
        });
    };

    /**
     * Return the constructor function
     */
    return Board;

});
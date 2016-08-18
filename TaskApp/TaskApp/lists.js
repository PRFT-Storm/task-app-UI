'use strict';

angular.module("taskApp").factory("List", function (Card) {

    /**
   * Constructor, with class name
   */
    function List(id, name, lists) {
        // Public properties, assigned to the instance ('this')
        this.id = id;
        this.name = name;
        this.cards = null;
    }

    /**
     * Public method, assigned to prototype
     */
    List.prototype.getCards = function () {
        /* call the trello API in here */
        var self = this;
        var cardArr = [];
        var trelloListUrl = "/lists/" + self.id + "/cards";
        return Trello.get(trelloListUrl).then(function (response) {
            response.forEach(function (card) {
                var newCard = new Card(card.id, card.name, card.desc, card.badges.comments, card.idList);
                cardArr.push(newCard);
            });
            return cardArr;
        });
    };

    /**
     * Return the constructor function
     */
    return List;

});
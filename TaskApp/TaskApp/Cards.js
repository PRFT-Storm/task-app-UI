'use strict';

angular.module("taskApp").factory("Card", function () {
    /**
   * Constructor, with class name
   */

    function Card(id, name, desc, cmtCount) {
        // Public properties, assigned to the instance ('this')
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.cmtCount = cmtCount;        
    }

    /**
     * Public method, assigned to prototype
     */
    Card.prototype.getComments = function (id) {
        /* call the trello API in here */
    };

    /**
     * Static method, assigned to class
     * Instance ('this') is not available in static context
     */
    Card.build = function (data) {
        //if (!checkRole(data.role)) {
        //    return;
        //}
        return new Card(
          data.id,
          data.name,
          data.desc,
          data.cmtCount // another model / adjust for JSON object returned
        );
    };

    /**
     * Return the constructor function
     */
    return Card;

});
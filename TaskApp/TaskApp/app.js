myApp = angular.module("APP", ["ngAnimate"]);

myApp.controller("theController", ["$scope", "$filter", "$timeout", function ($scope, $filter, $timeout) {

    $scope.running = false;
    $scope.state = 0;
    $scope.states = [true, false, false, false];
    //new, running, paused, done

    $scope.time = [0, 0, 0]; //hr, min, sec
    $scope.date = new Date();

    $scope.task = {
        title: "",
        description: "",
        start: "",
        list: "",
        comments: [{
            time: "start",
            current: $scope.date,
            description: ""
        }]
    };

    $scope.comment = "";

    $scope.commentAdd = function () {
        var tempTime = $scope.time[0] + " hr " + $scope.time[1] + " min";
        var cmtDate = new Date();
        console.log(cmtDate);

        var tempCmt = {
            time: tempTime,
            current: cmtDate,
            description: $scope.comment
        };
        $scope.task.comments.unshift(tempCmt);
        $scope.comment = "";

    };

    $scope.taskTimer = function () {
        if ($scope.running === true) {
            $scope.time[2]++;
            if ($scope.time[2] % 60 === 0) {
                $scope.time[1]++;
                $scope.time[2] = 0;
                if ($scope.time[1] % 60 === 0) {
                    $scope.time[0]++;
                    $scope.time[1] = 0;
                }
            }
            taskTimer = $timeout($scope.taskTimer, 1000);
        }
    };

    var stateManager = function (state) {
        angular.forEach($scope.states, function (key, value) {
            state === value ? $scope.states[value] = true : $scope.states[value] = false;
        });
    };

    var testStart = $timeout($scope.taskTimer, 1000);

    $scope.start = function () {
        console.log("start");
        $scope.state = 1;
        stateManager($scope.state);

        $scope.running = true;
        testStart = $timeout($scope.taskTimer, 1000);
    }

    $scope.taskBreak = function () {
        $scope.state = 2;
        stateManager($scope.state);
        var brkTime = $scope.time[0] + " hr " + $scope.time[1] + " min";
        var brkDate = new Date();
        var brkCmt = {
            time: brkTime,
            current: brkDate,
            description: "took a break :)",
        };
        $scope.task.comments.unshift(brkCmt);

        $scope.running = false;
        $timeout.cancel(testStart);
    }

    $scope.taskDone = function () {
        console.log("task done");
        $scope.state = 3;
        stateManager($scope.state);

        $scope.running = false;
        $timeout.cancel(testStart);

        var newCard = {
            name: $scope.task.title,
            desc: $scope.task.description,
            // Place this card at the top of our list
            idList: $scope.listSelect,
            pos: "top"
        };
        console.log("posting to: " + $scope.listSelect);
        Trello.post("/cards/", newCard, $scope.creationSuccess);
    }

    $scope.creationSuccess = function (data) {
        console.log("Card created successfully. Data returned");
        var cardId = data.id;
        var trelloCmt = "";
        var trelloUrl = "/cards/" + cardId + "/actions/comments";
        trelloCmt += "date worked: **" + $filter("date")(new Date(), "MM/dd/yyyy") + "**";
        for (var i = 0; i < $scope.task.comments.length; i++) {
            trelloCmt += "\n----------------\n **" + $scope.task.comments[i].time + "** - " + $filter("date")($scope.task.comments[i].current, "hh:mm a") +
                "\n" + $scope.task.comments[i].description + "\n\n";
        }
        Trello.post(trelloUrl, { text: trelloCmt }, function () { console.log("successful cmt") });
    }

    $scope.init = function () {
        console.log("scope init");

        Trello.get("/member/me/boards", $scope.setBoards, error);

    };

    $scope.selected = "";
    $scope.boardSelect = "";
    $scope.listSelect = "";

    $scope.boardChange = function () {
        var listClear = document.getElementById("list-select");
        var i;
        for (i = listClear.options.length - 1 ; i >= 0 ; i--) {
            listClear.remove(i);
        }
        if ($scope.boardSelect !== "") {
            var trelloCmt = "";
            var trelloListUrl = "/boards/" + $scope.boardSelect + "/lists";
            Trello.get(trelloListUrl, $scope.setLists, error);
        } else {
            console.log("didnt have a board ID set");
        }
    }

    $scope.setLists = function (listData) {
        listData.forEach(function (data) {
            $("#list-select").append($("<option>").text(data.name).attr("value", data.id));
        });
        $("#list-select").material_select();
    }

    $scope.setBoards = function (successMsg) {
        successMsg.forEach(function (data) {
            $("#board-select").append($("<option>").text(data.name).attr("value", data.id));
        });
        $("#board-select").material_select();
    }

}]);

var init = function () {
    console.log("normal init");
    // check if there is query in url
    // and fire search in case its value is not empty
};

var success = function (successMsg) {
    console.log("success called");
    successMsg.forEach(function (data) {
        console.log("name: " + data.name + " id: " + data.id);
        $("#board-select").append($("<option>").text(data.name).attr("value", data.id));
        var board = {
            "value": data.id, "text": data.name
        }
        //$scope.boards.push(board);
        //console.log("length: " + $scope.boards.length);
    });
    $("#board-select").material_select();
};

var error = function (errorMsg) {
    console.log("error Msg");
};


var myList = "57a417a2f82c0f49e3bfcc86";

//var creationSuccess = function (data) {
//    console.log("Card created successfully. Data returned");
//    var cardId = data.id;
//    Trello.post("/cards/", newCard, creationSuccess);

//};

var authenticationSuccess = function () {
    init();
};
var authenticationFailure = function () { console.log("Failed authentication"); };

function fix_selects() {
    document.getElementById("board-select").selectedIndex = 0;
    //Or
    // document.getElementById("MySelect").value = "#";

}

$(window, document, undefined).ready(function () {
    var $listSelect = $("#list-select");
    $listSelect.trigger("contentChanged");
    $listSelect.on("contentChanged", function () {
        $(this).material_select();
    })
    Trello.authorize(
        {
            type: "popup",
            name: "Task Tracker App",
            scope: {
                read: true,
                write: true
            },
            expiration: "never",
            success: authenticationSuccess,
            error: authenticationFailure,
        }
    );

    Trello.get("/member/me/boards", success, error);

    $(".datepicker").pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    $("input").blur(function () {
        var $this = $(this);
        if ($this.val())
            $this.addClass("used");
        else
            $this.removeClass("used");
    });

    var $ripples = $(".ripples");

    $ripples.on("click.Ripples", function (e) {

        var $this = $(this);
        var $offset = $this.parent().offset();
        var $circle = $this.find(".ripplesCircle");

        var x = e.pageX - $offset.left;
        var y = e.pageY - $offset.top;

        $circle.css({
            top: y + "px",
            left: x + "px"
        });

        $this.addClass("is-active");

    });

    $ripples.on("animationend webkitAnimationEnd mozAnimationEnd oanimationend MSAnimationEnd", function (e) {
        $(this).removeClass("is-active");
    });

});



#!/usr/bin/node
var Twit = require('twit');
var moment = require('moment');

var config = require('./config.js');
var publisher = require('./publisher.js');

var twitterPublisher = {

    type: "TWITTER",

    init: function() {
        // Create Twit config
        this.twitter = new Twit(config.twitter);
    },

    keywords: "traffic",

    getTimeOneMinuteAgoUTC: function() {
        var momentUTC = moment.utc().subtract(1, "minutes");

        return momentUTC.format('YYYY-MM-DD HH:ss');
    },

    fetchTwitterUpdates: function(callback) {
        var app = this;

        // Initialise
        app.init();

        // Fetch tweets for configured params
        app.twitter.get(
            'search/tweets',
            {
                q: app.keywords,
                since: app.getTimeOneMinuteAgoUTC(),
                lang: "en",
                geocode: "36.8485 174.7633 100km",
                count: 1
            },
            function(err, data, response) {
                if (err || !data.statuses || data.statuses.length < 1) {
                    console.log("Did not recieve any data!");
                    callback(null);
                } else {
                    console.log("Recieved data:");
                    console.log(JSON.stringify(data));

                    var parsedTwitterResponse = app.parse(data);
                    console.log("Parsed to:");
                    console.log(JSON.stringify(parsedTwitterResponse));
                    callback(parsedTwitterResponse);
                }
            }
        );
    },

    parse: function(data) {
        parsedUpdates = [];

        for (var index in data.statuses) {
            var currentUpdate = data.statuses[index];
            var parsedUpdate = {};

            parsedUpdate.id = currentUpdate.id.toString();
            parsedUpdate.title = currentUpdate.user.name + " (@" + currentUpdate.user.screen_name + ")";
            parsedUpdate.content = currentUpdate.text;
            parsedUpdate.type = "TWITTER";
            parsedUpdate.timestamp = currentUpdate.created_at;

            parsedUpdates.push(parsedUpdate)
        }

        return parsedUpdates;
    }
};

// Call function with fetcher as parameter
publisher.fetchAndExportUpdates(function(callback) {
    twitterPublisher.fetchTwitterUpdates(callback);
});
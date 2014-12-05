'use strict';

var btoa = require('btoa'),
    request = require('request');

request.debug = false;

// use when you want a empty callback
var noop = function() {};

var Api = function(config) {
    this.host = config.host;
    this.port = config.port;
    this.username = config.username;
    this.password = config.password;
};

Api.prototype.getURL = function() {
    return 'http://' + this.host + ':' + this.port;
};

Api.prototype.send = function(method, params, callback) {
    params = params || [];
    callback = callback || noop;

    var options = {
        url: this.getURL(),
        headers: {
            'Authorization': btoa(this.username + ':' + this.password)
        },
        method: 'POST',
        json: true,
        body: {
            params: params,
            id: 10,
            method: method,
            jsonrpc: '2.0',
            remote: 'PTR-0.3.5-3'
        }
    };

    request(options, callback);
};

Api.prototype.parseAndSend = function(value) {
    if (/^rc4pt:(.*)$/.test(value)) {
        var aux = value.split(':');
        var cmd = aux[1];
        var self = this;

        // verifica qual a tela em que o usuário está, e o controle
        // se adapta de acordo com a visão
        this.send('getviewstack', [], function(error, response, data) {
            if (!error && response.statusCode === 200) {
                var currentView;
                // Check if the client is an old version of popcorntime (pre 0.3.4).
                if (typeof(data.result.popcornVersion) === 'undefined') {
                    currentView = data.result[0][data.result[0].length - 1];
                }
                // The popcorntime client is version 0.3.4 or higher.
                else {
                    currentView = data.result.viewstack[data.result.viewstack.length - 1];
                }

                switch (currentView) {
                    case 'main-browser':
                        self.handleMainBrowser(cmd);
                        break;
                    case 'player':
                        self.handlePlayer(cmd);
                        break;
                }
            } else {
                console.log(error);
            }
        });
    } else {
        console.log('ignored value:', value);
    }
};

Api.prototype.handleMainBrowser = function(cmd) {
    switch (cmd) {
        case 'left':
        case 'previous':
            this.send('left');
            break;
        case 'right':
        case 'next':
            this.send('right');
            break;
        case 'up':
        case 'volume-up':
            this.send('up');
            break;
        case 'down':
        case 'volume-down':
            this.send('down');
            break;
        case 'enter':
        case 'toggleplaying':
            this.send('enter');
            break;
        case 'showfavourites':
            this.send('showfavourites');
            break;
        case 'next-tab':
            this.send('toggletab');
            break;
    }
};

Api.prototype.handlePlayer = function(cmd) {
    switch (cmd) {
        case 'toggleplaying':
            this.send('toggleplaying');
            break;
        case 'togglefullscreen':
            this.send('togglefullscreen');
            break;
        case 'down':
            this.send('back');
            break;
    }
};

var config = require('./config');
module.exports = new Api(config);

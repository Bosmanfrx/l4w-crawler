var Crawler = require("simplecrawler");
var chalk = require('chalk');
var moment = require('moment');
var fs = require('fs');
var mkdirp = require('mkdirp');


module.exports = function (options) {
    "use strict";

    class CrawlerWrapper {

        constructor(options) {
            this.l4wCrawler = new Crawler(options.domain, "", options.port, 100);

            this.l4wCrawler.addFetchCondition(function (parsedURL) {
                return !parsedURL.path.match(/\.css|js|less|ttf|eot|woff$/i);
            });

            this.l4wCrawler.parseScriptTags = options.parseScriptTags;
            this.l4wCrawler.parseHTMLComments = options.parseHTMLComments;
            this.l4wCrawler.stripQuerystring = options.stripQuerystring;
            this.l4wCrawler.acceptCookies = options.acceptCookies;
            this.l4wCrawler.filterByDomain = options.filterByDomain;
            this.startTime = moment();
            this.isSilent = options.silent;
            this.fetchErrors = [];

            this.bindEvents();
        }

        displayFetchError(code, status, referrer, url) {
            let error = chalk.bold.red;

            console.log(error('%d (%s)' + chalk.reset(' %s ' + chalk.bold.blue('on') + ' %s')), code, status, url, referrer);
        }

        displayFetchSuccess(url) {
            let success = chalk.bold.green;
            if (!this.isSilent) {
                console.log(success('200 (OK)') + ': ' + url);
            }
        }

        dumpErrorsToFile() {
            let time = moment().format('YYYY-MM-DD-HH:mm:ss');
            let domain = this.l4wCrawler.host;
            var filePath = `logs/${domain}-${time}.log`;
            var fetchErrors = this.fetchErrors;

            mkdirp(__dirname + '/logs', function (err) {
                if(err) {
                    return console.log(err);
                }

                fs.writeFile(filePath, fetchErrors.join('\n'),  function(err) {
                    if(err) {
                        return console.error(err);
                    }
                    console.log(`Dumped errors to ${filePath}`);
                });
            });
        }

        bindEvents() {
            this.l4wCrawler.on('queueadd', function (queueItem) {
                    if (queueItem.path.match(/%29;$/)) {
                        queueItem.path = queueItem.path.slice(0, queueItem.path.length - 4);
                    }
                    if (queueItem.path.match(/%\d\d$/)) {
                        queueItem.path = queueItem.path.slice(0, queueItem.path.length - 3);
                    }
                    if (queueItem.path.match(/%5D%5D$/)) {
                        queueItem.path = queueItem.path.slice(0, queueItem.path.length - 6);
                    }
                }.bind(this))
                .on('fetchcomplete', function (queueItem) {
                    this.displayFetchSuccess(queueItem.url);
                }.bind(this))
                .on('fetcherror', function (queueItem) {
                    this.fetchErrors.push(`${queueItem.stateData.code} (${queueItem.status}) ${queueItem.url} on ${queueItem.referrer}`);
                    this.displayFetchError(queueItem.stateData.code, queueItem.status, queueItem.referrer, queueItem.url);
                }.bind(this))
                .on('fetch404', function (queueItem) {
                    this.fetchErrors.push(`${queueItem.stateData.code} (${queueItem.status}) ${queueItem.url} on ${queueItem.referrer}`);
                    this.displayFetchError(queueItem.stateData.code, queueItem.status, queueItem.referrer, queueItem.url);
                }.bind(this))
                .on('complete', function () {
                    console.log('Crawl started: %s', moment(this.startTime).fromNow());
                    if(this.fetchErrors.length > 0) {
                        this.dumpErrorsToFile();
                    } else {
                        console.log('This site has no errors, congratulations!');
                    }
                }.bind(this));
        }

        startCrawler() {
            this.l4wCrawler.start();
        }
    }

    return new CrawlerWrapper(options);
};
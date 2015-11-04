/**
 * Created by bosman on 01.11.15.
 */


var Crawler = require("simplecrawler");
var options = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var moment = require('moment');


var domain = options.d;
var port = options.p || 80;


var l4wCrawler = new Crawler(domain, "", 80, 100);

l4wCrawler.addFetchCondition(function (parsedURL) {
    return !parsedURL.path.match(/\.css|js|less|ttf|eot|woff$/i);
});

l4wCrawler.parseScriptTags = options.j || false;
l4wCrawler.parseHTMLComments = options.h || false;
l4wCrawler.stripQuerystring = options.q || true;
l4wCrawler.acceptCookies = options.c || true;
l4wCrawler.filterByDomain = options.f || true;

var error = chalk.bold.red;
var success = chalk.bold.green;

function displayError(code, status, referrer, url) {
    console.log(error('%d (%s)' + chalk.reset(' %s ' + chalk.bold.blue('on') + ' %s')), code, status, url, referrer);
}

var crawlerStart = moment();

l4wCrawler
    .on('queueadd', function (queueItem) {
        if (queueItem.path.match(/%29;$/)) {
            queueItem.path = queueItem.path.slice(0, queueItem.path.length - 4);
        }
        if (queueItem.path.match(/%\d\d$/)) {
            queueItem.path = queueItem.path.slice(0, queueItem.path.length - 3);

        }
        if (queueItem.path.match(/%5D%5D$/)) {
            queueItem.path = queueItem.path.slice(0, queueItem.path.length - 6);
        }
    })
    .on('fetchcomplete', function (queueItem) {
        if (!options.s) {
            console.log(success('200 (OK)') + ': ' + queueItem.url);
        }
    })
    .on('fetcherror', function (queueItem) {
        displayError(queueItem.stateData.code, queueItem.status, queueItem.referrer, queueItem.url);
    })
    .on('fetch404', function (queueItem) {
        displayError(queueItem.stateData.code, queueItem.status, queueItem.referrer, queueItem.url);
    })
    .on('complete', function () {
        console.log('Crawl started: %s', moment(crawlerStart).fromNow());
    });

l4wCrawler.start();
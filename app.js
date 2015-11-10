/**
 * Created by bosman on 01.11.15.
 */

var options = require('./arguments-parser')(process.argv);
var crawler = require('./crawler-wrapper')(options);

crawler.startCrawler();

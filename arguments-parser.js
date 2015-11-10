var minimist = require('minimist');

module.exports = function(args) {
    "use strict";

    class ArgumentParser {

        constructor(args) {
            this.args = minimist(args.slice(2), {
                alias: {
                    h: 'help',
                    d: 'domain',
                    p: 'port',
                    j: 'parseJs',
                    m: 'parseComments',
                    q: 'queryStrings',
                    c: 'disallowCookies',
                    f: 'disableFilter',
                    s: 'silent'
                },
                string: ['d', 'p'],
                boolean: ['h', 'j', 'm', 'q', 'c', 'f', 's']
            });

        }

        parseArguments() {
            if(this.args.help) {
                console.log(this.showHelp());
                process.exit(0);
            }
            if(typeof  this.args.domain === 'undefined') {
                console.error('You need to specify a domain');
                process.exit(1);
            }
            return {
                domain: this.args.domain,
                port: parseInt(this.args.port || 80),
                parseScriptTags: this.args.parseJs,
                parseHTMLComments: this.args.parseComments,
                stripQuerystring: !this.args.queryStrings,
                acceptCookies: !this.args.disallowCookies,
                filterByDomain: !this.args.disableFilter
            }
        }

        showHelp() {
            return `This is help for this crawler. Commands are as follows:
            -h  --help              Displays this help
            -d  --domain [domain]   Domain for crawling. Ommit http/https [required]
            -p  --port  [port]      Use non-standard port [default is 80]
            -j  --parseJs           Look for links in scripts
            -h  --parseComments     Look for links in HTML comments
            -q  --queryStrings      Leave query strings
            -c  --disallowCookies   Disallow cookies for crawler
            -f  --disableFilter     Disables domain filter`
        }
    }

    let parser = new ArgumentParser(args);

    return parser.parseArguments();
};


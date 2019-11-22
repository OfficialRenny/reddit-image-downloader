const fs = require('fs');
const http = require('http');
require('dotenv').config();
const Snoowrap = require('snoowrap');
const minimist = require('minimist');
var sanitize = require("sanitize-filename");
var wget = require('node-wget');
var re = /(?:\.([^.]+))?$/;
var validFiletypes = ["png", "jpg", "jpeg", "bmp"];

//Subreddit name has to be without the 'r/'
//Timeperiod must be one of these: hour, day, week, month, year, all
let args = minimist(process.argv.slice(2), {
    default: {
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
        user: process.env.REDDIT_USER,
        pass: process.env.REDDIT_PASS,
        time: 'all',
        subreddit: 'pics',
        limit: 1000,
        location: './images/',
        timeout: 60,
    },
    alias: {
		t: 'time',
		s: 'subreddit',
		l: 'limit',
		o: 'location',
		h: 'help',
	},
});

const r = new Snoowrap({
    userAgent: 'Image Downloader',
    clientId: args.id,
    clientSecret: args.secret,
    username: args.user,
    password: args.pass
});

if (args.help) {
	return console.log(args);
}

if (!fs.existsSync(`${args.location}/${args.subreddit}`)) {
	fs.mkdirSync(`${args.location}/${args.subreddit}`, { recursive: true });
}

r.getSubreddit(args.subreddit).getTop({time: args.time}).fetchAll().then((res) => {
	console.log(`There is a total of ${res.length} submissions.`);
	function download(index) {
		if (index > res.length) return;
		if (index > args.limit -1) return;
		curPost = res[index];
		if (curPost == null || undefined) return download(index + 1);
		var ext = re.exec(curPost.url);
		if ((curPost['is_self'] == false) && !(curPost['is_self'] == null || undefined) && validFiletypes.includes(ext[1])) {
			wget({
					url: curPost['url'],
					dest: `${args.location}/${args.subreddit}/${sanitize(curPost.title + '.' + ext[1])}`,
					timeout: args.timeout * 1000
				}, function (error, response, body) {
					if (error) {
						console.log(`Could not download ${curPost.title}`);
						download(index + 1);
					} else {
						console.log(`Downloaded ${curPost.title}, ${index + 1}/${res.length}`);
						download(index + 1);
					}
					});
		} else {
			download(index + 1);
		}
	}
	download(0);
});

var subreddit = 'pics';
var timeperiod = 'all'; //

const fs = require('fs');
const http = require('http');
require('dotenv').config();
const Snoowrap = require('snoowrap');
var wget = require('node-wget');

const r = new Snoowrap({
    userAgent: 'Post downloader bot by /u/xlet_cobra',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

r.getSubreddit(subreddit).getTop({time: timeperiod}).fetchAll().then((res) => {
	console.log(`There is a total of ${res.length} submissions.`);
	function download(index) {
		curPost = res[index];
		if (curPost == null || undefined) return download(index + 1);
		if ((curPost['is_self'] == false) && !(curPost['is_self'] == null || undefined)) {
			wget({
					url: curPost['url'],
					dest: './images/',
					timeout: 60000
				}, function (error, response, body) {
					if (error) {
						console.log(`Could not download ${curPost.title}`);
						download(index + 1);
					} else {
						console.log(`Downloaded ${curPost.title}, ${index + 1}/${res.length}`);
						download(index + 1);
					}
					});
		}
	}
	//download(0);
});

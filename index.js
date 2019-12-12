let Parser = require('rss-parser');
let parser = new Parser();
const data = require('./data.json');
const https = require('https');
var request = require('request');
var progress = require('request-progress');
const fs = require('fs');
const cliProgress = require('cli-progress');
const chalk = require('chalk');
const dir = './OUTPUT/';

function processItems(item, podcastFolder) {
	return new Promise(async (resolve, reject) => {
		// Display details
		console.log(chalk.bold.blue('Episode Title: '), item.title);
		console.log(chalk.bold.blue('Audio URL: '), item.enclosure.url);
		console.log('\n');

		// Make episode folder
		const episodeFolder = podcastFolder + '/' + item.title; //'Episode '+ index +' - '+
		// console.log("FOLDER",episodeFolder);
		if (!fs.existsSync(episodeFolder)){
			await fs.mkdirSync(episodeFolder);
		}
		
		console.log(chalk.blue('Starting episode download...'))
		
		const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
		bar.start(100, 0);

	    const response = await progress(request(item.enclosure.url))
	    .on('progress', function (state) {
			// console.log("Progress :: ", (state.percent*100).toFixed(2) + '%')
			bar.update((state.percent*100).toFixed(0));
		})
		.on('error', function (err) {
			console.log(chalk.red(err));
			reject("ERROR");
		})
		.on('end', function () {
			bar.update(100); // set bar to 100 to indicate completeness
			bar.stop();
			resolve("Download Complete!");
		})
		.pipe(fs.createWriteStream(episodeFolder + '/' + item.title+'.mp3'));
	});
};

(async () => {
	for (var i = 0; i < data.podcasts.length; i++) {
		
		// console.log("PODCAST TITLE - x1b[32m%s\x1b[0m", data.podcasts[i].title);
		console.log(chalk.white.dim('STARTING...'));
		let feed = await parser.parseURL(data.podcasts[i].rss);
		
		// Make OUTPUT folder if it doesn't exist
		if (!fs.existsSync(dir)){
			await fs.mkdirSync(dir);
		}

		// Make directory with podcast title
		const podcastFolder = dir + data.podcasts[i].title;
		if (!fs.existsSync(podcastFolder)){
			await fs.mkdirSync(podcastFolder);
		}

		console.log('Podcast Title : ', feed.title);
		console.log('\n');

		for (const item of feed.items) {
			try { 
				const status = await processItems(item, podcastFolder);
				console.log(chalk.bold.green(status));
				console.log('\n');
			} catch(e) {
				console.log(e);
				console.log(chalk.bold.red(e));
			}
		}

		console.log(chalk.white.dim('...END PODCAST'));

	}

})();
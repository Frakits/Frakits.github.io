import fs, { readFile } from 'fs'
import get from './httpsPromise.js';
import https from 'https'
import saveMedia from './mediaSaving.js'
let listOptions = JSON.parse(fs.readFileSync("./generator script/list_options.json").toString());
export default(list) => {
	let fixedList = Array.from(list);
	//clear duplicates before applying the algorithm
	fixedList = fixedList.filter((game, i) => fixedList.findIndex(function(el) {return el.id == game.id;}) == i);
	console.log("removed duplicates");

	//give "NEW" tags
	let tempList = JSON.parse(fs.readFileSync("./final_listv2-old.json"));
	let recomendlist = [];
	Object.entries(listOptions.games_for_recommendation).forEach(([key, value]) => recomendlist.push(value));
	let oldList = [];
	Object.entries(tempList).forEach(([key, game]) => {
		for (let i of game) oldList.push(i);
	});
	for (let game of fixedList) {
		if (oldList.findIndex(el => {return game.id == el.id}) == -1) {
			game.new = true;
			console.log("NEW");
		}
		if (recomendlist.includes(game.uid)) game.recommended = true;
	}


	//ELIMINATION & SCORING PHASE
	let cloneCopy = Array.from(fixedList);
	loop1:for (let game of cloneCopy) {
		//ELIMINATION PHASE
		loop2:for (let word of listOptions.elimination_phase.blacklist) {
			if (game.n.toLowerCase().indexOf(word) != -1 || game.d.toLowerCase().indexOf(word) != -1) {
				for (let exception of listOptions.elimination_phase.exceptions) {
					if (game.n.toLowerCase().indexOf(exception) != -1 || game.d.toLowerCase().indexOf(exception) != -1) break loop2;
				}
				let indexToRemove = fixedList.findIndex(function(el) {
					return el.id == game.id;
				});
				fixedList.splice(indexToRemove, 1);
				console.log(`deleted ${game.n}`);
				continue loop1;
			}
		}

		//SCORING PHASE
		let score = 0
		for (let word of listOptions.scoring_phase.up_scored) {
			let regex = new RegExp('\\b' + word + '\\b');
			let scoreIncrease = (game.n.toLowerCase().match(regex)?.length ?? 0) + ((game.d.toLowerCase().match(regex)?.length ?? 0) / 2)
			score += scoreIncrease;
		}
		for (let word of listOptions.scoring_phase.down_scored) {
			let regex = new RegExp('\\b' + word + '\\b');
			let scoreDecreased = ((game.n.toLowerCase().match(regex)?.length ?? 0) * 2) + ((game.d.toLowerCase().match(regex)?.length ?? 0) / 2)
			score -= scoreDecreased;
		}
		let emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
		let emojiCount = (game.d.match(emojiRegex)?.length ?? 0) + (game.n.match(emojiRegex)?.length ?? 0);
		score -= (10 * emojiCount) / ((game.d.length + game.n.length) / 5);

		console.log(score);

		fixedList[fixedList.findIndex(function(el) {
			return el.id === game.id;
		})].scr = score;
	}

	fixedList.sort((a, b) => b.scr - a.scr);

	//CATEGORIZING AND SAVING PHASE 
	let cloneCopy2 = Array.from(fixedList);
	fixedList = {};
	fixedList["Main Games"] = [];
	Object.entries(listOptions.categorizing_phase).forEach(([key, category]) => {
		fixedList[key] = [];
	});
	console.log(fixedList);
	let tickingtime = 0;
	cloneCopy2.forEach((game, key) => {
		game.media = [];
		tickingtime = key;
		console.log("saving thumbnails");
		setTimeout(() => {
			get(`https://games.roblox.com/v2/games/${game.uid}/media`)
			.then((value) => {
				value = JSON.parse(value.body);
				for (let media of value.data) {
					if (media.assetType == "Image") {
						console.log("Image");
						game.media.push(media.imageId);
					}
					else game.media.push(media.videoHash);
				}
				console.log(game.media);
				if (key == cloneCopy2.length - 1) {
					fs.writeFileSync("./final_listv2.json", JSON.stringify(fixedList, null, 2));
					saveMedia(fixedList);
				}
			})
		}, 350 * key);
		let isCategorized = false;
		Object.entries(listOptions.categorizing_phase).forEach(([key, category]) => {
			for (let word of category) {
				let regex = new RegExp('\\b' + word + '\\b');
				let wordExists = ((game.n.toLowerCase().match(regex)?.length ?? 0) + (game.d.toLowerCase().match(regex)?.length ?? 0)) > 0;
				if (!isCategorized && wordExists) {
					isCategorized = true;
					fixedList[key].push(game);
				}
				if (isCategorized) break;
			}
		});
		if (!isCategorized) fixedList["Main Games"].push(game);
	});
}
function pause(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) { /* Do nothing */ }
}
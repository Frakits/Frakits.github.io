import fs from 'fs'
import get from './httpsPromise.js';
import https from 'https'
let listOptions = JSON.parse(fs.readFileSync("./generator script/list_options.json").toString());
export default(list) => {
	let fixedList = Array.from(list);
	//clear duplicates before applying the algorithm
	fixedList = fixedList.filter((game, i) => fixedList.findIndex(function(el) {return el.id == game.id;}) == i);
	console.log("removed duplicates");

	//ELIMINATION & SCORING PHASE
	let cloneCopy = Array.from(fixedList);
	loop1:for (let game of cloneCopy) {
		//ELIMINATION PHASE
		for (let word of listOptions.elimination_phase.blacklist) {
			if (game.n.toLowerCase().indexOf(word) != -1 || game.d.toLowerCase().indexOf(word) != -1) {
				let indexToRemove = fixedList.findIndex(function(el) {
					return el.id == game.id;
				});
				fixedList.splice(indexToRemove, 1);
				console.log(`deleted ${indexToRemove}`);
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
	//CATEGORIZING PHASE
	let cloneCopy2 = Array.from(fixedList);
	fixedList = {};
	fixedList["Main Games"] = [];
	Object.entries(listOptions.categorizing_phase).forEach(([key, category]) => {
		fixedList[key] = [];
	});
	console.log(fixedList);
	cloneCopy2.forEach((game, key) => {
		setTimeout(() => {
			get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${game.uid}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`)
			.then((value) => {
				value = JSON.parse(value.body);
				let file = fs.createWriteStream(`./roblox icons/${game.uid}.png`)
				https.get(value.data[0].imageUrl, response => {
					response.pipe(file);
				})
			})
		}, 200 * key);
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
	return fixedList;
}
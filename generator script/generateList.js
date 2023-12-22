import fixList from './algorithm.js'
import get from './httpsPromise.js';
import fs from 'fs'
let games = [];
let progress = 0;
let timer = 0;

let listOptions = JSON.parse(fs.readFileSync("./generator script/list_options.json"));
let progressCap = Object.entries(listOptions.games_for_recommendation).length * 2;

if (fs.existsSync("./final_listv2-old.json")) {
	fs.unlinkSync("./final_listv2-old.json")
	fs.renameSync("./final_listv2.json", "./final_listv2-old.json")
}
Object.entries(listOptions.games_for_recommendation).forEach(([key, universeId]) => {
	for (let i = 0; i < 2; i++) {
		timer = timer + 1;
		setTimeout(() => {
			get({ host: `games.roblox.com`, agent: false, path: `/v1/games/recommendations/game/${universeId}?PaginationKey=startRowIndex_${i * 20}%2Cversion_&MaxRows=5000&IsTruncatedResultsEnabled=false` })
				.then(res2 => {
					let jsonFromRoblox = JSON.parse(res2.body).games;
					if (jsonFromRoblox == null) {
						progress++;
						if (progress.toFixed(0) == progressCap) {
							fixList(games)
						}
						return;
					}
					Object.entries(jsonFromRoblox).forEach(([key2, value]) => {
						let properGameJson = {
							uid: value.universeId,
							n: value.name,
							l: value.totalUpVotes,
							dl: value.totalDownVotes,
							id: value.placeId,
							pls: value.playerCount,
							cid: value.creatorId,
							cn: value.creatorName,
							ct: value.creatorType,
							d: value.gameDescription
						}
						games.push(properGameJson);
						progress += 1 / Object.entries(jsonFromRoblox).length;
						console.log(`${progress.toFixed(0)}/${progressCap}`);
					});
					if (progress.toFixed(0) == progressCap) {
						fixList(games);
					}
				})
		}, 350 * timer);
	}
})
export function chunk(arr, size) {
	return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
		arr.slice(i * size, i * size + size)
	  );
}